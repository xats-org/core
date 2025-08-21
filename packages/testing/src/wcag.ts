/**
 * WCAG compliance testing framework for rendered content
 */

import * as axe from 'axe-core';
import { JSDOM } from 'jsdom';

import type {
  WcagCompliance,
  WcagResult,
  WcagViolation,
  WcagWarning,
  AccessibilityAudit,
  AccessibilityRecommendation,
} from '@xats-org/types';

/**
 * WCAG compliance tester using axe-core
 */
export class WcagTester implements WcagCompliance {
  private axeConfig: axe.RunOptions;

  constructor(config: axe.RunOptions = {}) {
    this.axeConfig = {
      // Default configuration
      resultTypes: ['violations', 'incomplete', 'passes'],
      reporter: 'v2',
      ...config,
    };
  }

  /**
   * Test WCAG compliance for rendered content
   */
  async testCompliance(content: string, level: 'A' | 'AA' | 'AAA' = 'AA'): Promise<WcagResult> {
    try {
      // Create a DOM environment for testing
      const dom = this.createTestEnvironment(content);

      // Configure axe for the specified WCAG level
      const config = this.getWcagConfig(level);

      // Run axe analysis
      const results = await this.runAxeAnalysis(dom, config);

      // Convert results to our format
      const violations = this.convertViolations(results.violations, level);
      const warnings = this.convertWarnings(results.incomplete, level);
      const score = this.calculateComplianceScore(violations, warnings);

      return {
        level,
        compliant: violations.length === 0,
        violations,
        warnings,
        score,
      };
    } catch (error) {
      return {
        level,
        compliant: false,
        violations: [
          {
            criterion: 'test-error',
            level,
            description: `Failed to run WCAG test: ${error}`,
            recommendation: 'Fix testing environment issues',
            impact: 'critical',
          },
        ],
        warnings: [],
        score: 0,
      };
    }
  }

  /**
   * Get comprehensive accessibility audit
   */
  async auditAccessibility(content: string): Promise<AccessibilityAudit> {
    const levelA = await this.testCompliance(content, 'A');
    const levelAA = await this.testCompliance(content, 'AA');
    const levelAAA = await this.testCompliance(content, 'AAA');

    const overallScore = Math.min(levelA.score, levelAA.score, levelAAA.score);
    const compliant = levelA.compliant && levelAA.compliant;

    const recommendations = this.generateRecommendations(levelA, levelAA, levelAAA);

    return {
      compliant,
      overallScore,
      levelA,
      levelAA,
      levelAAA,
      recommendations,
      testedAt: new Date(),
    };
  }

  /**
   * Create a test DOM environment from HTML content
   */
  private createTestEnvironment(content: string): Document {
    // Use jsdom to create a DOM environment in Node.js
    const dom = new JSDOM(content);
    return dom.window.document;
  }

  /**
   * Get axe configuration for specific WCAG level
   */
  private getWcagConfig(level: 'A' | 'AA' | 'AAA'): axe.RunOptions {
    const tags = ['wcag2a'];

    if (level === 'AA' || level === 'AAA') {
      tags.push('wcag2aa');
    }

    if (level === 'AAA') {
      tags.push('wcag2aaa');
    }

    return {
      ...this.axeConfig,
      runOnly: {
        type: 'tag',
        values: tags,
      },
    };
  }

  /**
   * Run axe analysis on DOM
   */
  private async runAxeAnalysis(dom: Document, config: axe.RunOptions): Promise<axe.AxeResults> {
    // Configure axe for the DOM
    axe.configure({
      reporter: 'v2',
    });

    // Run analysis
    return new Promise((resolve, reject) => {
      axe.run(dom, config, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * Convert axe violations to our format
   */
  private convertViolations(violations: axe.Result[], level: 'A' | 'AA' | 'AAA'): WcagViolation[] {
    return violations.map((violation) => ({
      criterion: this.extractCriterion(violation.id),
      level,
      description: violation.description,
      element: this.formatElement(violation.nodes[0]),
      recommendation: violation.help,
      impact: this.mapImpact(violation.impact),
    }));
  }

  /**
   * Convert axe incomplete results to warnings
   */
  private convertWarnings(incomplete: axe.Result[], level: 'A' | 'AA' | 'AAA'): WcagWarning[] {
    return incomplete.map((item) => ({
      criterion: this.extractCriterion(item.id),
      level,
      description: item.description,
      element: this.formatElement(item.nodes[0]),
      suggestion: item.help,
    }));
  }

  /**
   * Extract WCAG criterion from axe rule ID
   */
  private extractCriterion(ruleId: string): string {
    // Map common axe rule IDs to WCAG criteria
    const criteriaMap: Record<string, string> = {
      'color-contrast': '1.4.3',
      'image-alt': '1.1.1',
      keyboard: '2.1.1',
      'focus-order': '2.4.3',
      'heading-order': '1.3.1',
      label: '3.3.2',
      'link-name': '2.4.4',
      list: '1.3.1',
      'page-has-heading-one': '1.3.1',
      'skip-link': '2.4.1',
    };

    return criteriaMap[ruleId] || ruleId;
  }

  /**
   * Format element selector for display
   */
  private formatElement(node?: axe.NodeResult): string {
    if (!node) return 'unknown';
    const selector = node.target[0];
    return typeof selector === 'string' ? selector : String(selector) || 'unknown';
  }

  /**
   * Map axe impact levels to our format
   */
  private mapImpact(impact?: string | null): WcagViolation['impact'] {
    switch (impact) {
      case 'critical':
        return 'critical';
      case 'serious':
        return 'serious';
      case 'moderate':
        return 'moderate';
      case 'minor':
        return 'minor';
      default:
        return 'moderate';
    }
  }

  /**
   * Calculate compliance score from violations and warnings
   */
  private calculateComplianceScore(violations: WcagViolation[], warnings: WcagWarning[]): number {
    if (violations.length === 0 && warnings.length === 0) {
      return 100;
    }

    const violationPenalties = {
      critical: 25,
      serious: 15,
      moderate: 8,
      minor: 3,
    };

    let totalPenalty = 0;

    for (const violation of violations) {
      totalPenalty += violationPenalties[violation.impact];
    }

    // Warnings count as minor penalties
    totalPenalty += warnings.length * 2;

    return Math.max(0, 100 - totalPenalty);
  }

  /**
   * Generate accessibility recommendations
   */
  private generateRecommendations(
    levelA: WcagResult,
    levelAA: WcagResult,
    levelAAA: WcagResult
  ): AccessibilityRecommendation[] {
    const recommendations: AccessibilityRecommendation[] = [];

    // Process violations from all levels
    const allViolations = [...levelA.violations, ...levelAA.violations, ...levelAAA.violations];

    // Group by category and generate recommendations
    const categoryViolations = this.groupViolationsByCategory(allViolations);

    for (const [category, violations] of categoryViolations.entries()) {
      if (violations.length > 0) {
        const recommendation = this.createRecommendation(category, violations);
        recommendations.push(recommendation);
      }
    }

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Group violations by category
   */
  private groupViolationsByCategory(
    violations: WcagViolation[]
  ): Map<AccessibilityRecommendation['category'], WcagViolation[]> {
    const groups = new Map<AccessibilityRecommendation['category'], WcagViolation[]>();

    for (const violation of violations) {
      const category = this.categorizeViolation(violation);
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(violation);
    }

    return groups;
  }

  /**
   * Categorize a violation by its nature
   */
  private categorizeViolation(violation: WcagViolation): AccessibilityRecommendation['category'] {
    const criterion = violation.criterion;

    if (criterion.startsWith('1.1') || criterion.startsWith('1.3')) {
      return 'content';
    }
    if (criterion.startsWith('2.1') || criterion.startsWith('2.2')) {
      return 'interaction';
    }
    if (criterion.startsWith('2.4')) {
      return 'navigation';
    }
    if (criterion.startsWith('1.4')) {
      return 'visual';
    }

    return 'structure';
  }

  /**
   * Create recommendation for a category of violations
   */
  private createRecommendation(
    category: AccessibilityRecommendation['category'],
    violations: WcagViolation[]
  ): AccessibilityRecommendation {
    const highPriorityCount = violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    ).length;
    const priority = highPriorityCount > 0 ? 'high' : violations.length > 3 ? 'medium' : 'low';

    const categoryDescriptions = {
      structure: 'Improve document structure and semantic markup',
      navigation: 'Enhance navigation and focus management',
      content: 'Fix content accessibility and alternative text',
      interaction: 'Improve keyboard and interaction accessibility',
      visual: 'Address visual design and color contrast issues',
    };

    const categoryImplementations = {
      structure: 'Use proper heading hierarchy, semantic HTML elements, and ARIA roles',
      navigation: 'Implement skip links, logical tab order, and clear focus indicators',
      content: 'Add alt text for images, meaningful link text, and proper labels',
      interaction: 'Ensure keyboard navigation, proper focus management, and timing controls',
      visual: 'Improve color contrast, use relative units, and support zoom up to 200%',
    };

    return {
      priority,
      category,
      description: categoryDescriptions[category],
      implementation: categoryImplementations[category],
      wcagCriteria: [...new Set(violations.map((v) => v.criterion))],
    };
  }
}

/**
 * Factory for creating WCAG testers with different configurations
 */
export class WcagTestFactory {
  /**
   * Create a standard WCAG tester
   */
  static createStandardTester(): WcagTester {
    return new WcagTester({
      resultTypes: ['violations', 'incomplete', 'passes'],
      reporter: 'v2',
    });
  }

  /**
   * Create a strict WCAG tester (includes best practices)
   */
  static createStrictTester(): WcagTester {
    return new WcagTester({
      resultTypes: ['violations', 'incomplete', 'passes'],
      reporter: 'v2',
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'best-practice'],
      },
    });
  }

  /**
   * Create a performance-focused tester (faster but less comprehensive)
   */
  static createFastTester(): WcagTester {
    return new WcagTester({
      resultTypes: ['violations'],
      reporter: 'v2',
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  }
}
