/**
 * Interactive Widgets Extension Implementation
 * Provides rendering and management capabilities for educational widgets
 */

export interface InteractiveWidget {
  widgetType: 'simulation' | 'diagram' | 'chart' | 'graph' | 'timeline' | 'map' | '3d-model' | 'calculator' | 'game' | 'virtual-lab';
  title: string;
  description?: string;
  provider: 'phet-simulations' | 'geogebra' | 'desmos' | 'plotly' | 'd3' | 'threejs' | 'unity-webgl' | 'custom';
  src: string;
  version?: string;
  dimensions?: {
    width?: string;
    height?: string;
    aspectRatio?: string;
    responsive?: boolean;
  };
  parameters?: Record<string, any>;
  interactivity?: {
    allowUserInput?: boolean;
    saveState?: boolean;
    resetable?: boolean;
    sharable?: boolean;
    fullscreenEnabled?: boolean;
  };
  learningObjectives?: string[];
  dataCollection?: {
    enabled?: boolean;
    events?: ('load' | 'play' | 'pause' | 'reset' | 'parameter-change' | 'user-input' | 'completion' | 'error')[];
    privacyLevel?: 'anonymous' | 'pseudonymous' | 'identified';
  };
  fallback?: {
    type: 'image' | 'video' | 'text' | 'link';
    content: string;
    altText?: string;
  };
  accessibility?: {
    keyboardNavigable?: boolean;
    screenReaderSupport?: 'none' | 'basic' | 'full';
    alternativeDescription?: string;
    captionsAvailable?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
  };
  security?: {
    sandbox?: string[];
    csp?: string;
    trustedDomains?: string[];
  };
}

export interface WidgetRenderer {
  render(widget: InteractiveWidget, container: HTMLElement): Promise<void>;
  destroy(): void;
}

export class PhETRenderer implements WidgetRenderer {
  private iframe: HTMLIFrameElement | null = null;

  async render(widget: InteractiveWidget, container: HTMLElement): Promise<void> {
    this.iframe = document.createElement('iframe');
    
    // Build URL with parameters
    const url = new URL(widget.src);
    if (widget.parameters) {
      Object.entries(widget.parameters).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }
    
    this.iframe.src = url.toString();
    this.iframe.width = widget.dimensions?.width || '800';
    this.iframe.height = widget.dimensions?.height || '600';
    this.iframe.title = widget.title;
    
    // Apply security settings
    if (widget.security?.sandbox) {
      this.iframe.sandbox = widget.security.sandbox.join(' ');
    }

    // Add accessibility attributes
    if (widget.accessibility?.alternativeDescription) {
      this.iframe.setAttribute('aria-label', widget.accessibility.alternativeDescription);
    }

    // Handle responsive design
    if (widget.dimensions?.responsive) {
      this.iframe.style.width = '100%';
      this.iframe.style.height = 'auto';
      this.iframe.style.aspectRatio = widget.dimensions.aspectRatio || '4:3';
    }

    container.appendChild(this.iframe);
  }

  destroy(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }
}

export class GeoGebraRenderer implements WidgetRenderer {
  private applet: any = null;

  async render(widget: InteractiveWidget, container: HTMLElement): Promise<void> {
    // Load GeoGebra API if not already loaded
    if (!(window as any).GGBApplet) {
      await this.loadGeoGebraAPI();
    }

    const parameters = {
      width: parseInt(widget.dimensions?.width || '800'),
      height: parseInt(widget.dimensions?.height || '600'),
      showToolBar: widget.parameters?.showToolBar ?? true,
      showAlgebraInput: widget.parameters?.showAlgebraInput ?? true,
      showMenuBar: widget.parameters?.showMenuBar ?? false,
      ...widget.parameters
    };

    this.applet = new (window as any).GGBApplet(parameters, true);
    this.applet.inject(container);
  }

  private async loadGeoGebraAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.geogebra.org/apps/deployggb.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load GeoGebra API'));
      document.head.appendChild(script);
    });
  }

  destroy(): void {
    if (this.applet) {
      // GeoGebra cleanup
      this.applet = null;
    }
  }
}

export class DesmoRenderer implements WidgetRenderer {
  private calculator: any = null;

  async render(widget: InteractiveWidget, container: HTMLElement): Promise<void> {
    // Load Desmos API if not already loaded
    if (!(window as any).Desmos) {
      await this.loadDesmosAPI();
    }

    const options = {
      keypad: widget.parameters?.keypad ?? true,
      graphpaper: widget.parameters?.graphpaper ?? true,
      expressions: widget.parameters?.expressions ?? true,
      settingsMenu: widget.parameters?.settingsMenu ?? true,
      zoomButtons: widget.parameters?.zoomButtons ?? true,
      ...widget.parameters
    };

    this.calculator = (window as any).Desmos.GraphingCalculator(container, options);

    // Add initial expressions if provided
    if (widget.parameters?.expressions && Array.isArray(widget.parameters.expressions)) {
      widget.parameters.expressions.forEach((expr: string) => {
        this.calculator.setExpression({ latex: expr });
      });
    }
  }

  private async loadDesmosAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.desmos.com/api/v1.7/calculator.js?apikey=dcb31709b452b1cf9dc26972add0fda6';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Desmos API'));
      document.head.appendChild(script);
    });
  }

  destroy(): void {
    if (this.calculator) {
      this.calculator.destroy();
      this.calculator = null;
    }
  }
}

export class CustomWidgetRenderer implements WidgetRenderer {
  private element: HTMLElement | null = null;
  private trustedDomains: Set<string> = new Set([
    'localhost',
    '127.0.0.1',
    '::1',
    window.location.hostname
  ]);

  async render(widget: InteractiveWidget, container: HTMLElement): Promise<void> {
    if (widget.src.startsWith('http')) {
      // External widget - use iframe
      const iframe = document.createElement('iframe');
      iframe.src = widget.src;
      iframe.width = widget.dimensions?.width || '800';
      iframe.height = widget.dimensions?.height || '600';
      iframe.title = widget.title;
      
      if (widget.security?.sandbox) {
        iframe.sandbox = widget.security.sandbox.join(' ');
      }

      container.appendChild(iframe);
      this.element = iframe;
    } else {
      // Local widget - load as module or HTML
      // WARNING: This loads external content. Only use with trusted sources.
      const response = await fetch(widget.src);
      const content = await response.text();
      
      // Validate that the src is from a trusted domain before loading HTML
      const srcUrl = new URL(widget.src, window.location.href);
      if (!this.isTrustedDomain(srcUrl.origin)) {
        throw new Error(`Untrusted domain for widget source: ${srcUrl.origin}`);
      }
      
      const div = document.createElement('div');
      // Only set innerHTML for trusted domains and with CSP protection
      div.innerHTML = content;
      div.className = 'custom-widget';
      
      if (widget.dimensions) {
        div.style.width = widget.dimensions.width || 'auto';
        div.style.height = widget.dimensions.height || 'auto';
      }

      container.appendChild(div);
      this.element = div;
    }
  }

  private isTrustedDomain(origin: string): boolean {
    try {
      const url = new URL(origin);
      return this.trustedDomains.has(url.hostname);
    } catch {
      return false;
    }
  }

  destroy(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}

export class WidgetManager {
  private renderers = new Map<string, WidgetRenderer>();
  private activeWidgets = new Map<string, WidgetRenderer>();

  constructor() {
    // Register default renderers
    this.registerRenderer('phet-simulations', new PhETRenderer());
    this.registerRenderer('geogebra', new GeoGebraRenderer());
    this.registerRenderer('desmos', new DesmoRenderer());
    this.registerRenderer('custom', new CustomWidgetRenderer());
  }

  registerRenderer(provider: string, renderer: WidgetRenderer): void {
    this.renderers.set(provider, renderer);
  }

  async renderWidget(widgetId: string, widget: InteractiveWidget, container: HTMLElement): Promise<void> {
    try {
      // Clear any existing widget in this container
      this.destroyWidget(widgetId);

      // Get appropriate renderer
      const rendererClass = this.renderers.get(widget.provider);
      if (!rendererClass) {
        throw new Error(`No renderer found for provider: ${widget.provider}`);
      }

      // Create new renderer instance
      const renderer = Object.create(Object.getPrototypeOf(rendererClass));
      Object.assign(renderer, rendererClass);

      // Render the widget
      await renderer.render(widget, container);
      
      // Store renderer for cleanup
      this.activeWidgets.set(widgetId, renderer);

      // Track analytics
      this.trackWidgetEvent(widget, 'load');

      // Set up event listeners for interactions
      this.setupWidgetInteractionTracking(widgetId, widget, container);

    } catch (error) {
      console.error('Widget rendering failed:', error);
      this.handleWidgetError(widget, error as Error, container);
    }
  }

  destroyWidget(widgetId: string): void {
    const renderer = this.activeWidgets.get(widgetId);
    if (renderer) {
      renderer.destroy();
      this.activeWidgets.delete(widgetId);
    }
  }

  destroyAllWidgets(): void {
    this.activeWidgets.forEach((renderer, widgetId) => {
      renderer.destroy();
    });
    this.activeWidgets.clear();
  }

  private setupWidgetInteractionTracking(
    widgetId: string, 
    widget: InteractiveWidget, 
    container: HTMLElement
  ): void {
    if (!widget.dataCollection?.enabled) return;

    const trackableEvents = widget.dataCollection.events || [];
    
    // Add event listeners for trackable interactions
    if (trackableEvents.includes('user-input')) {
      container.addEventListener('click', () => this.trackWidgetEvent(widget, 'user-input'));
      container.addEventListener('keydown', () => this.trackWidgetEvent(widget, 'user-input'));
    }

    // Add reset button if widget is resetable
    if (widget.interactivity?.resetable) {
      const resetButton = document.createElement('button');
      resetButton.textContent = 'Reset';
      resetButton.className = 'widget-reset-button';
      resetButton.onclick = () => {
        this.trackWidgetEvent(widget, 'reset');
        // Re-render widget to reset state
        const renderer = this.activeWidgets.get(widgetId);
        if (renderer) {
          renderer.destroy();
          renderer.render(widget, container);
        }
      };
      
      container.appendChild(resetButton);
    }

    // Add fullscreen button if supported
    if (widget.interactivity?.fullscreenEnabled) {
      const fullscreenButton = document.createElement('button');
      fullscreenButton.textContent = 'Fullscreen';
      fullscreenButton.className = 'widget-fullscreen-button';
      fullscreenButton.onclick = () => {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        }
      };
      
      container.appendChild(fullscreenButton);
    }
  }

  private trackWidgetEvent(widget: InteractiveWidget, event: string, data?: any): void {
    if (!widget.dataCollection?.enabled) return;

    const eventData = {
      event,
      widgetType: widget.widgetType,
      provider: widget.provider,
      timestamp: Date.now(),
      privacyLevel: widget.dataCollection.privacyLevel || 'anonymous',
      ...data
    };

    // Send to analytics service
    this.sendAnalytics(eventData);
  }

  private handleWidgetError(widget: InteractiveWidget, error: Error, container: HTMLElement): void {
    console.error('Widget error:', error);
    
    // Clear container
    container.innerHTML = '';
    
    // Show fallback content
    if (widget.fallback) {
      this.renderFallback(widget.fallback, container);
    } else {
      // Default error message - safely create elements to prevent XSS
      const errorDiv = document.createElement('div');
      errorDiv.className = 'widget-error';
      
      const heading = document.createElement('h3');
      heading.textContent = 'Unable to load interactive content';
      
      const titleParagraph = document.createElement('p');
      const titleStrong = document.createElement('strong');
      titleStrong.textContent = widget.title;
      titleParagraph.appendChild(titleStrong);
      
      const errorParagraph = document.createElement('p');
      errorParagraph.textContent = `Error: ${error.message}`;
      
      errorDiv.appendChild(heading);
      errorDiv.appendChild(titleParagraph);
      errorDiv.appendChild(errorParagraph);
      
      container.appendChild(errorDiv);
    }

    // Track error event
    this.trackWidgetEvent(widget, 'error', { errorMessage: error.message });
  }

  private renderFallback(fallback: InteractiveWidget['fallback'], container: HTMLElement): void {
    if (!fallback) return;

    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'widget-fallback';

    switch (fallback.type) {
      case 'image':
        const img = document.createElement('img');
        img.src = fallback.content;
        img.alt = fallback.altText || '';
        img.style.maxWidth = '100%';
        fallbackDiv.appendChild(img);
        break;
        
      case 'video':
        const video = document.createElement('video');
        video.src = fallback.content;
        video.controls = true;
        video.style.maxWidth = '100%';
        if (fallback.altText) {
          video.title = fallback.altText;
        }
        fallbackDiv.appendChild(video);
        break;
        
      case 'text':
        // Safely set text content to prevent XSS
        fallbackDiv.textContent = fallback.content;
        break;
        
      case 'link':
        const link = document.createElement('a');
        link.href = fallback.content;
        link.textContent = fallback.altText || 'Open interactive content in new window';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        fallbackDiv.appendChild(link);
        break;
    }

    container.appendChild(fallbackDiv);
  }

  private sendAnalytics(data: any): void {
    // Implementation depends on analytics provider
    // This could integrate with Google Analytics, xAPI, or custom analytics
    console.log('Widget analytics:', data);
    
    // Example: Send to analytics endpoint
    if (typeof fetch !== 'undefined') {
      fetch('/api/widget-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(error => console.warn('Analytics send failed:', error));
    }
  }
}

// Utility function for secure ID generation
function generateSecureId(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36);
  }
  // Fallback for environments without crypto API
  console.warn('Cryptographically secure randomness not available for widget ID generation');
  return Math.random().toString(36).substr(2);
}

// Usage example
export function initializeWidgets(): WidgetManager {
  const manager = new WidgetManager();
  
  // Find all widget containers in the document
  document.querySelectorAll('[data-widget]').forEach((container) => {
    const widgetData = container.getAttribute('data-widget');
    if (widgetData) {
      try {
        const widget: InteractiveWidget = JSON.parse(widgetData);
        const widgetId = container.id || `widget-${Date.now()}-${generateSecureId()}`;
        manager.renderWidget(widgetId, widget, container as HTMLElement);
      } catch (error) {
        console.error('Failed to parse widget data:', error);
      }
    }
  });

  return manager;
}

// Auto-initialize on DOM content loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeWidgets();
  });
}