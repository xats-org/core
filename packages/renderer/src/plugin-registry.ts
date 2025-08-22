/**
 * Plugin Registry - Management system for renderer plugins
 */

import type {
  RendererPlugin,
  PluginRegistry as IPluginRegistry,
  BidirectionalRenderer,
  RenderFormat,
} from '@xats-org/types';

/**
 * Plugin registration entry with lifecycle state
 */
interface PluginRegistration<T extends BidirectionalRenderer = BidirectionalRenderer> {
  plugin: RendererPlugin<T>;
  initialized: boolean;
  rendererInstances: Set<T>;
  registeredAt: Date;
}

/**
 * Plugin registry for managing renderer extensions
 */
export class PluginRegistry implements IPluginRegistry {
  private plugins = new Map<string, PluginRegistration>();
  private formatIndex = new Map<RenderFormat, Set<string>>();

  /**
   * Register a new plugin
   */
  async register<T extends BidirectionalRenderer>(plugin: RendererPlugin<T>): Promise<void> {
    // Validate plugin
    this.validatePlugin(plugin);

    // Check if already registered
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin '${plugin.id}' is already registered`);
    }

    // Create registration entry
    const registration: PluginRegistration<T> = {
      plugin,
      initialized: false,
      rendererInstances: new Set(),
      registeredAt: new Date(),
    };

    // Store registration
    this.plugins.set(plugin.id, registration);

    // Update format index
    for (const format of plugin.compatibleFormats) {
      if (!this.formatIndex.has(format)) {
        this.formatIndex.set(format, new Set());
      }
      this.formatIndex.get(format)!.add(plugin.id);
    }

    // Log registration
    // eslint-disable-next-line no-console
    console.log(`Plugin registered: ${plugin.name} v${plugin.version} (${plugin.id})`);
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    
    if (!registration) {
      throw new Error(`Plugin '${pluginId}' is not registered`);
    }

    // Cleanup plugin from all renderer instances
    for (const renderer of registration.rendererInstances) {
      await this.detachFromRenderer(registration.plugin, renderer);
    }

    // Cleanup plugin itself
    if (registration.plugin.cleanup) {
      await registration.plugin.cleanup();
    }

    // Remove from format index
    for (const format of registration.plugin.compatibleFormats) {
      const formatPlugins = this.formatIndex.get(format);
      if (formatPlugins) {
        formatPlugins.delete(pluginId);
        if (formatPlugins.size === 0) {
          this.formatIndex.delete(format);
        }
      }
    }

    // Remove registration
    this.plugins.delete(pluginId);

    // Log unregistration
    // eslint-disable-next-line no-console
    console.log(`Plugin unregistered: ${registration.plugin.name} (${pluginId})`);
  }

  /**
   * Get registered plugin by ID
   */
  getPlugin(pluginId: string): RendererPlugin | undefined {
    return this.plugins.get(pluginId)?.plugin;
  }

  /**
   * List all registered plugins
   */
  listPlugins(): RendererPlugin[] {
    return Array.from(this.plugins.values()).map(reg => reg.plugin);
  }

  /**
   * Find plugins compatible with a format
   */
  findCompatiblePlugins(format: RenderFormat): RendererPlugin[] {
    const pluginIds = this.formatIndex.get(format);
    
    if (!pluginIds) {
      return [];
    }

    const plugins: RendererPlugin[] = [];
    for (const pluginId of pluginIds) {
      const registration = this.plugins.get(pluginId);
      if (registration) {
        plugins.push(registration.plugin);
      }
    }

    return plugins;
  }

  /**
   * Initialize a plugin with a renderer instance
   */
  async initializePlugin<T extends BidirectionalRenderer>(
    pluginId: string, 
    renderer: T
  ): Promise<void> {
    const registration = this.plugins.get(pluginId) as PluginRegistration<T> | undefined;
    
    if (!registration) {
      throw new Error(`Plugin '${pluginId}' is not registered`);
    }

    // Check format compatibility
    if (!registration.plugin.compatibleFormats.includes(renderer.format)) {
      throw new Error(
        `Plugin '${pluginId}' is not compatible with format '${renderer.format}'`
      );
    }

    // Initialize plugin if not already done
    if (!registration.initialized) {
      await registration.plugin.initialize(renderer);
      registration.initialized = true;
    }

    // Track renderer instance
    registration.rendererInstances.add(renderer);

    // Log initialization
    // eslint-disable-next-line no-console
    console.log(`Plugin '${pluginId}' initialized for ${renderer.format} renderer`);
  }

  /**
   * Get plugins attached to a specific renderer
   */
  getPluginsForRenderer<T extends BidirectionalRenderer>(renderer: T): RendererPlugin<T>[] {
    const attachedPlugins: RendererPlugin<T>[] = [];

    for (const registration of this.plugins.values()) {
      if (registration.rendererInstances.has(renderer as BidirectionalRenderer)) {
        attachedPlugins.push(registration.plugin as RendererPlugin<T>);
      }
    }

    return attachedPlugins;
  }

  /**
   * Auto-discover and register plugins from a directory
   */
  async discoverPlugins(pluginDirectory: string): Promise<void> {
    try {
      // This would typically scan a directory for plugin files
      // For now, we'll implement a simple approach that looks for known plugin packages
      
      const knownPlugins = [
        '@xats-org/plugin-math-renderer',
        '@xats-org/plugin-citation-formatter',
        '@xats-org/plugin-accessibility-enhancer',
        '@xats-org/plugin-custom-styles',
      ];

      for (const pluginPackage of knownPlugins) {
        try {
          // Dynamically import plugin
          const pluginModule = await import(pluginPackage);
          const plugin = pluginModule.default || pluginModule.plugin;
          
          if (plugin && this.isValidPlugin(plugin)) {
            await this.register(plugin);
          }
        } catch (error) {
          // Plugin not available - this is okay
          // eslint-disable-next-line no-console
          console.debug(`Plugin ${pluginPackage} not available: ${String(error)}`);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Plugin discovery failed: ${String(error)}`);
    }
  }

  /**
   * Get registry statistics
   */
  getStatistics(): {
    totalPlugins: number;
    initializedPlugins: number;
    pluginsByFormat: Record<RenderFormat, number>;
    oldestPlugin: Date | null;
    newestPlugin: Date | null;
  } {
    const stats = {
      totalPlugins: this.plugins.size,
      initializedPlugins: 0,
      pluginsByFormat: {} as Record<RenderFormat, number>,
      oldestPlugin: null as Date | null,
      newestPlugin: null as Date | null,
    };

    // Count initialized plugins and track registration dates
    for (const registration of this.plugins.values()) {
      if (registration.initialized) {
        stats.initializedPlugins++;
      }

      if (!stats.oldestPlugin || registration.registeredAt < stats.oldestPlugin) {
        stats.oldestPlugin = registration.registeredAt;
      }

      if (!stats.newestPlugin || registration.registeredAt > stats.newestPlugin) {
        stats.newestPlugin = registration.registeredAt;
      }
    }

    // Count plugins by format
    for (const [format, pluginIds] of this.formatIndex.entries()) {
      stats.pluginsByFormat[format] = pluginIds.size;
    }

    return stats;
  }

  /**
   * Clear all plugins (mainly for testing)
   */
  async clear(): Promise<void> {
    const pluginIds = Array.from(this.plugins.keys());
    
    for (const pluginId of pluginIds) {
      await this.unregister(pluginId);
    }
  }

  /**
   * Validate plugin structure and required properties
   */
  private validatePlugin(plugin: RendererPlugin): void {
    const requiredProperties = ['id', 'name', 'version', 'compatibleFormats', 'initialize'];
    
    for (const prop of requiredProperties) {
      if (!(prop in plugin)) {
        throw new Error(`Plugin is missing required property: ${prop}`);
      }
    }

    if (!plugin.id || typeof plugin.id !== 'string') {
      throw new Error('Plugin id must be a non-empty string');
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error('Plugin name must be a non-empty string');
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new Error('Plugin version must be a non-empty string');
    }

    if (!Array.isArray(plugin.compatibleFormats) || plugin.compatibleFormats.length === 0) {
      throw new Error('Plugin must specify at least one compatible format');
    }

    if (typeof plugin.initialize !== 'function') {
      throw new Error('Plugin must provide an initialize function');
    }
  }

  /**
   * Check if an object is a valid plugin
   */
  private isValidPlugin(obj: unknown): obj is RendererPlugin {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    try {
      this.validatePlugin(obj as RendererPlugin);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detach plugin from a renderer instance
   */
  private async detachFromRenderer<T extends BidirectionalRenderer>(
    plugin: RendererPlugin<T>, 
    renderer: T
  ): Promise<void> {
    try {
      // Call plugin cleanup hooks if available
      if (plugin.cleanup) {
        await plugin.cleanup();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error during plugin cleanup: ${String(error)}`);
    }
  }
}

/**
 * Global plugin registry instance
 */
export const pluginRegistry = new PluginRegistry();