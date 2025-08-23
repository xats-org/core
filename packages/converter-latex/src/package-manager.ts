/**
 * @fileoverview LaTeX package management
 */

import type { LaTeXPackage } from './types';

/**
 * Manages LaTeX packages and dependencies
 */
export class PackageManager {
  private readonly defaultPackages: LaTeXPackage[];
  private readonly packageDatabase: Record<string, LaTeXPackage>;

  constructor(defaultPackages: LaTeXPackage[] = []) {
    this.defaultPackages = [...this.getStandardPackages(), ...defaultPackages];
    this.packageDatabase = this.buildPackageDatabase();
  }

  /**
   * Get packages needed for document
   */
  getRequiredPackages(documentContent: string, customPackages: LaTeXPackage[] = []): LaTeXPackage[] {
    const required = new Set<LaTeXPackage>();
    
    // Add default packages
    this.defaultPackages.forEach(pkg => required.add(pkg));
    
    // Add custom packages
    customPackages.forEach(pkg => required.add(pkg));
    
    // Analyze content for required packages
    const detectedPackages = this.detectRequiredPackages(documentContent);
    detectedPackages.forEach(pkg => required.add(pkg));
    
    // Resolve dependencies
    const withDependencies = this.resolveDependencies([...required]);
    
    return withDependencies;
  }

  /**
   * Generate package import statements
   */
  generatePackageImports(packages: LaTeXPackage[]): string {
    const imports: string[] = [];
    
    for (const pkg of packages) {
      let importLine = '\\usepackage';
      
      if (pkg.options && pkg.options.length > 0) {
        importLine += `[${pkg.options.join(',')}]`;
      }
      
      importLine += `{${pkg.name}}`;
      imports.push(importLine);
    }
    
    return imports.join('\n');
  }

  /**
   * Validate package configuration
   */
  validatePackages(packages: LaTeXPackage[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for conflicts
    const conflicts = this.checkPackageConflicts(packages);
    errors.push(...conflicts);
    
    // Check for missing dependencies
    const missingDeps = this.checkMissingDependencies(packages);
    errors.push(...missingDeps);
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get standard packages for xats documents
   */
  private getStandardPackages(): LaTeXPackage[] {
    return [
      { name: 'inputenc', options: ['utf8'], required: true },
      { name: 'fontenc', options: ['T1'], required: true },
      { name: 'babel', options: ['english'], required: true },
      { name: 'amsmath', required: true },
      { name: 'amsfonts', required: true },
      { name: 'amssymb', required: true },
      { name: 'graphicx', required: true },
      { name: 'xcolor', required: true },
      { name: 'hyperref', required: true }
    ];
  }

  /**
   * Build package database with dependencies
   */
  private buildPackageDatabase(): Record<string, LaTeXPackage> {
    const packages: Record<string, LaTeXPackage> = {
      // Math packages
      'amsmath': { name: 'amsmath', required: true },
      'amsfonts': { name: 'amsfonts', required: true },
      'amssymb': { name: 'amssymb', required: true },
      'amsthm': { name: 'amsthm' },
      
      // Graphics packages
      'graphicx': { name: 'graphicx', required: true },
      'tikz': { name: 'tikz' },
      'pgfplots': { name: 'pgfplots' },
      
      // Text packages
      'inputenc': { name: 'inputenc', options: ['utf8'], required: true },
      'fontenc': { name: 'fontenc', options: ['T1'], required: true },
      'babel': { name: 'babel', options: ['english'], required: true },
      
      // Layout packages
      'geometry': { name: 'geometry' },
      'fancyhdr': { name: 'fancyhdr' },
      'titling': { name: 'titling' },
      
      // Bibliography packages
      'natbib': { name: 'natbib' },
      'biblatex': { name: 'biblatex' },
      
      // Educational packages
      'tcolorbox': { name: 'tcolorbox' },
      'mdframed': { name: 'mdframed' },
      'enumitem': { name: 'enumitem' },
      
      // Utility packages
      'xcolor': { name: 'xcolor', required: true },
      'hyperref': { name: 'hyperref', required: true },
      'url': { name: 'url' },
      'verbatim': { name: 'verbatim' }
    };
    
    return packages;
  }

  /**
   * Detect required packages from content analysis
   */
  private detectRequiredPackages(content: string): LaTeXPackage[] {
    const required: LaTeXPackage[] = [];
    
    // Math environments
    if (/\\begin\{align|equation|gather|multline\}/.test(content)) {
      required.push(this.packageDatabase['amsmath']);
    }
    
    // Graphics
    if (/\\includegraphics/.test(content)) {
      required.push(this.packageDatabase['graphicx']);
    }
    
    // TikZ graphics
    if (/\\begin\{tikzpicture\}/.test(content)) {
      required.push(this.packageDatabase['tikz']);
    }
    
    // Bibliography
    if (/\\cite/.test(content) && /\\bibliography/.test(content)) {
      required.push(this.packageDatabase['natbib']);
    }
    
    if (/\\printbibliography/.test(content)) {
      required.push(this.packageDatabase['biblatex']);
    }
    
    // Colors
    if (/\\textcolor|\\color\{/.test(content)) {
      required.push(this.packageDatabase['xcolor']);
    }
    
    // Hyperlinks
    if (/\\href|\\url/.test(content)) {
      required.push(this.packageDatabase['hyperref']);
    }
    
    // Educational content boxes
    if (/\\begin\{tcolorbox\}/.test(content)) {
      required.push(this.packageDatabase['tcolorbox']);
    }
    
    return required.filter(pkg => pkg); // Remove undefined entries
  }

  /**
   * Resolve package dependencies
   */
  private resolveDependencies(packages: LaTeXPackage[]): LaTeXPackage[] {
    const resolved = new Map<string, LaTeXPackage>();
    
    // Add all requested packages
    packages.forEach(pkg => resolved.set(pkg.name, pkg));
    
    // Add dependencies (simplified logic)
    if (resolved.has('biblatex')) {
      resolved.set('url', this.packageDatabase['url']);
    }
    
    if (resolved.has('tikz')) {
      resolved.set('xcolor', this.packageDatabase['xcolor']);
    }
    
    if (resolved.has('hyperref') && !resolved.has('url')) {
      resolved.set('url', this.packageDatabase['url']);
    }
    
    return [...resolved.values()];
  }

  /**
   * Check for package conflicts
   */
  private checkPackageConflicts(packages: LaTeXPackage[]): string[] {
    const errors: string[] = [];
    const packageNames = packages.map(pkg => pkg.name);
    
    // Known conflicts
    const conflicts = [
      ['natbib', 'biblatex'],
      ['amsmath', 'amstex']
    ];
    
    for (const [pkg1, pkg2] of conflicts) {
      if (packageNames.includes(pkg1) && packageNames.includes(pkg2)) {
        errors.push(`Package conflict: ${pkg1} and ${pkg2} cannot be used together`);
      }
    }
    
    return errors;
  }

  /**
   * Check for missing dependencies
   */
  private checkMissingDependencies(packages: LaTeXPackage[]): string[] {
    const errors: string[] = [];
    const packageNames = packages.map(pkg => pkg.name);
    
    // Check specific dependencies
    if (packageNames.includes('biblatex') && !packageNames.includes('url')) {
      errors.push('biblatex requires url package');
    }
    
    if (packageNames.includes('tikz') && !packageNames.includes('xcolor')) {
      errors.push('tikz requires xcolor package');
    }
    
    return errors;
  }
}