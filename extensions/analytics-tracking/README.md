# Analytics Tracking Extension

The Analytics Tracking extension provides comprehensive learner analytics and interaction tracking for xats educational content. It supports multiple analytics providers, privacy compliance, and detailed learning analytics with real-time data collection.

## Overview

- **Extension ID**: `https://xats.org/extensions/analytics-tracking/schema.json`
- **Version**: 1.0.0
- **Compatibility**: xats v0.2.0+

## Features

### Analytics Providers
- **Google Analytics**: Web analytics and user behavior tracking
- **Mixpanel**: Event-based analytics for detailed user journeys
- **Amplitude**: Product analytics with advanced cohort analysis
- **Segment**: Customer data platform for unified analytics
- **xAPI (Tin Can API)**: Learning analytics standard for e-learning
- **IMS Caliper**: Learning analytics framework for educational data
- **Custom**: Integration with custom analytics solutions

### Learning Analytics
- **Progress Tracking**: Monitor learner progress through content
- **Performance Analytics**: Track assessment scores and improvement
- **Engagement Metrics**: Measure time on task and interaction patterns
- **Learning Pathways**: Analyze navigation and content consumption
- **Knowledge Tracing**: Bayesian models for skill assessment
- **Adaptive Analytics**: Data-driven content recommendations

### Privacy & Compliance
- **GDPR Compliance**: European data protection regulation support
- **COPPA Compliance**: Children's privacy protection
- **FERPA Compliance**: Educational privacy requirements
- **Consent Management**: Granular consent collection and management
- **Data Anonymization**: IP anonymization and user ID hashing
- **Right to Erasure**: Data deletion and user opt-out support

## Usage Examples

### Basic Analytics Configuration

```json
{
  "schemaVersion": "0.3.0",
  "bibliographicEntry": { /* ... */ },
  "subject": "Mathematics",
  "bodyMatter": { /* ... */ },
  "extensions": {
    "analyticsConfiguration": {
      "enabled": true,
      "trackingId": "xats-math-101",
      "provider": "google-analytics",
      "providerConfig": {
        "apiKey": "GA4-MEASUREMENT-ID",
        "projectId": "math-textbook-analytics"
      },
      "privacySettings": {
        "requireConsent": true,
        "consentTypes": ["analytics", "performance"],
        "anonymizeIp": true,
        "respectDNT": true,
        "dataProcessingRegion": "eu"
      },
      "globalEventTracking": [
        "document_load",
        "scroll_depth", 
        "time_on_page",
        "navigation"
      ],
      "learnerIdentification": {
        "method": "pseudonymous",
        "hashUserIds": true,
        "cookieExpiry": 365
      },
      "realTimeTracking": {
        "enabled": true,
        "batchSize": 5,
        "flushInterval": 30
      }
    }
  }
}
```

### Content-Level Analytics

```json
{
  "id": "quadratic-equations-section",
  "containerType": "section",
  "title": {
    "runs": [{ "type": "text", "content": "Quadratic Equations" }]
  },
  "contents": [
    {
      "id": "quadratic-intro",
      "blockType": "https://xats.org/vocabularies/blocks/paragraph",
      "content": {
        "text": {
          "runs": [
            { "type": "text", "content": "A quadratic equation is a polynomial equation of degree 2..." }
          ]
        }
      },
      "extensions": {
        "contentAnalytics": {
          "trackingEnabled": true,
          "contentId": "quadratic-intro-para",
          "contentType": "text",
          "learningObjectives": [
            "Understand the definition of quadratic equations",
            "Recognize the standard form ax² + bx + c = 0"
          ],
          "difficulty": "intermediate",
          "estimatedDuration": 3,
          "trackingEvents": ["view", "complete"],
          "customDimensions": {
            "subject": "Algebra",
            "topic": "Quadratic Equations",
            "gradeLevel": "Grade 9-10",
            "language": "en"
          },
          "performanceMetrics": {
            "loadTime": true,
            "renderTime": true
          }
        }
      }
    },
    {
      "id": "quadratic-interactive",
      "blockType": "https://xats.org/vocabularies/blocks/interactive",
      "content": {
        "title": { "runs": [{ "type": "text", "content": "Interactive Quadratic Explorer" }] }
      },
      "extensions": {
        "interactiveWidget": { /* widget config */ },
        "contentAnalytics": {
          "contentId": "quadratic-explorer",
          "contentType": "interactive",
          "trackingEvents": ["start", "interact", "complete", "pause", "resume"],
          "customDimensions": {
            "interactionType": "simulation",
            "widgetProvider": "desmos"
          },
          "performanceMetrics": {
            "interactionLatency": true,
            "memoryUsage": true
          },
          "adaptiveMetrics": {
            "masteryThreshold": 0.8,
            "difficultyAdjustment": "suggested"
          }
        }
      }
    }
  ],
  "extensions": {
    "progressTracking": {
      "enabled": true,
      "progressType": "completion-based",
      "completionCriteria": {
        "minTimeSpent": 180,
        "requiredEvents": ["view", "complete"],
        "minInteractions": 1
      },
      "milestones": [
        {
          "id": "quadratic-intro-complete",
          "name": "Introduction Complete",
          "threshold": 50
        },
        {
          "id": "quadratic-mastery",
          "name": "Quadratic Mastery",
          "threshold": 100,
          "reward": {
            "type": "badge",
            "value": "Quadratic Solver"
          }
        }
      ]
    }
  }
}
```

### Assessment Analytics

```json
{
  "id": "quadratic-quiz",
  "blockType": "https://xats.org/vocabularies/blocks/multipleChoice",
  "content": {
    "question": {
      "runs": [{ "type": "text", "content": "What is the discriminant of x² + 3x - 4 = 0?" }]
    },
    "options": [
      { "content": { "runs": [{ "type": "text", "content": "25" }] } },
      { "content": { "runs": [{ "type": "text", "content": "9" }] } },
      { "content": { "runs": [{ "type": "text", "content": "-7" }] } },
      { "content": { "runs": [{ "type": "text", "content": "1" }] } }
    ],
    "correctAnswers": [0],
    "explanation": {
      "runs": [
        { "type": "text", "content": "The discriminant is b² - 4ac = 3² - 4(1)(-4) = 9 + 16 = 25" }
      ]
    }
  },
  "extensions": {
    "assessmentAnalytics": {
      "assessmentId": "quadratic-discriminant-q1",
      "assessmentType": "formative",
      "gradingMetrics": {
        "trackAttempts": true,
        "trackTimePerQuestion": true,
        "trackAnswerChanges": true,
        "trackHintUsage": true
      },
      "learningAnalytics": {
        "knowledgeTracing": true,
        "skillMapping": [
          {
            "questionId": "quadratic-discriminant-q1",
            "skills": ["quadratic-formula", "discriminant-calculation", "basic-algebra"]
          }
        ],
        "misconceptionDetection": true
      }
    },
    "contentAnalytics": {
      "contentId": "quadratic-discriminant-q1",
      "contentType": "assessment",
      "trackingEvents": ["start", "answer", "submit", "retry", "hint"],
      "customDimensions": {
        "questionType": "multiple-choice",
        "cognitiveLevel": "apply",
        "blooms": "application"
      }
    }
  }
}
```

### xAPI Integration

```json
{
  "extensions": {
    "analyticsConfiguration": {
      "provider": "xapi",
      "providerConfig": {
        "endpoint": "https://lrs.example.com/xapi/",
        "apiKey": "your-xapi-key",
        "version": "1.0.3"
      },
      "xapiProfile": {
        "actorIdentification": "account",
        "verbSet": "http://adlnet.gov/expapi/verbs/",
        "activityType": "http://adlnet.gov/expapi/activities/lesson",
        "extensions": {
          "contextExtensions": {
            "http://id.tincanapi.com/extension/platform": "xats",
            "http://id.tincanapi.com/extension/version": "0.3.0"
          }
        }
      }
    }
  }
}
```

### Privacy-Compliant Configuration

```json
{
  "extensions": {
    "analyticsConfiguration": {
      "privacySettings": {
        "requireConsent": true,
        "consentTypes": ["analytics", "performance"],
        "anonymizeIp": true,
        "respectDNT": true,
        "dataProcessingRegion": "eu"
      },
      "dataRetention": {
        "period": 730,
        "anonymizeAfter": 90,
        "autoDelete": true
      },
      "learnerIdentification": {
        "method": "pseudonymous",
        "hashUserIds": true,
        "cookieExpiry": 365
      }
    }
  }
}
```

## Implementation Examples

### TypeScript Analytics Manager

```typescript
// analytics-manager.ts
import { AnalyticsConfiguration, InteractionEvent, ContentAnalytics } from './types';

export class AnalyticsManager {
  private config: AnalyticsConfiguration;
  private provider: AnalyticsProvider;
  private eventQueue: InteractionEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private consentGiven: boolean = false;

  constructor(config: AnalyticsConfiguration) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.provider = this.createProvider(config.provider, config.providerConfig);
    
    if (config.privacySettings?.requireConsent) {
      this.requestConsent();
    } else {
      this.consentGiven = true;
      this.initialize();
    }
  }

  async initialize(): Promise<void> {
    if (!this.consentGiven) return;

    // Set up user identification
    await this.setupUserIdentification();

    // Initialize provider
    await this.provider.initialize();

    // Set up global event listeners
    this.setupGlobalTracking();

    // Start real-time tracking if enabled
    if (this.config.realTimeTracking?.enabled) {
      this.startRealTimeTracking();
    }

    console.log('Analytics initialized successfully');
  }

  trackEvent(event: Partial<InteractionEvent>): void {
    if (!this.consentGiven || !this.config.enabled) return;

    const fullEvent: InteractionEvent = {
      eventId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      documentId: this.config.trackingId,
      ...event
    } as InteractionEvent;

    // Add context information
    fullEvent.context = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      referrer: document.referrer,
      platform: navigator.platform,
      device: this.detectDevice()
    };

    // Queue or send immediately
    if (this.config.realTimeTracking?.enabled) {
      this.eventQueue.push(fullEvent);
      this.maybeFlushEvents();
    } else {
      this.provider.sendEvent(fullEvent);
    }
  }

  trackContentView(contentId: string, analytics: ContentAnalytics): void {
    if (!analytics.trackingEnabled) return;

    this.trackEvent({
      eventType: 'content_view',
      contentId,
      containerPath: this.getContentPath(contentId),
      eventData: {
        contentType: analytics.contentType,
        difficulty: analytics.difficulty,
        estimatedDuration: analytics.estimatedDuration,
        learningObjectives: analytics.learningObjectives
      }
    });

    // Track performance metrics if enabled
    if (analytics.performanceMetrics?.loadTime) {
      this.measureLoadTime(contentId);
    }
  }

  trackContentInteraction(
    contentId: string, 
    interactionType: string, 
    data?: any
  ): void {
    this.trackEvent({
      eventType: 'content_interaction',
      contentId,
      eventData: {
        interactionType,
        ...data
      }
    });
  }

  trackAssessmentEvent(
    assessmentId: string,
    eventType: string,
    data: any
  ): void {
    this.trackEvent({
      eventType: 'assessment_event',
      contentId: assessmentId,
      eventData: {
        assessmentEventType: eventType,
        ...data
      }
    });
  }

  trackProgress(
    contentId: string,
    progressPercentage: number,
    milestones?: string[]
  ): void {
    this.trackEvent({
      eventType: 'progress_update',
      contentId,
      eventData: {
        progressPercentage,
        milestonesReached: milestones || []
      }
    });
  }

  // Privacy and consent management
  private async requestConsent(): Promise<void> {
    const consentTypes = this.config.privacySettings?.consentTypes || ['analytics'];
    
    // Show consent dialog (implementation would depend on UI framework)
    const consent = await this.showConsentDialog(consentTypes);
    
    if (consent) {
      this.consentGiven = true;
      this.initialize();
    }
  }

  private async showConsentDialog(types: string[]): Promise<boolean> {
    // This would integrate with a consent management platform or show custom UI
    return new Promise((resolve) => {
      // Simple implementation - in reality this would be a proper UI
      const consent = confirm(
        `This content uses analytics to improve your learning experience. ` +
        `We collect ${types.join(', ')} data. Do you consent?`
      );
      resolve(consent);
    });
  }

  revokeConsent(): void {
    this.consentGiven = false;
    this.provider.clearData();
    localStorage.removeItem('xats_analytics_consent');
    this.eventQueue = [];
  }

  // Real-time tracking
  private startRealTimeTracking(): void {
    const flushInterval = (this.config.realTimeTracking?.flushInterval || 30) * 1000;
    
    setInterval(() => {
      this.flushEvents();
    }, flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents(true);
    });
  }

  private maybeFlushEvents(): void {
    const batchSize = this.config.realTimeTracking?.batchSize || 10;
    if (this.eventQueue.length >= batchSize) {
      this.flushEvents();
    }
  }

  private async flushEvents(immediate: boolean = false): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (immediate && navigator.sendBeacon) {
        // Use sendBeacon for reliable sending on page unload
        const data = JSON.stringify(eventsToSend);
        navigator.sendBeacon(this.provider.endpoint + '/batch', data);
      } else {
        await this.provider.sendBatch(eventsToSend);
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  // User identification
  private async setupUserIdentification(): Promise<void> {
    const method = this.config.learnerIdentification?.method || 'anonymous';

    switch (method) {
      case 'anonymous':
        this.userId = this.getOrCreateAnonymousId();
        break;
      case 'pseudonymous':
        this.userId = await this.getPseudonymousId();
        break;
      case 'authenticated':
        this.userId = await this.getAuthenticatedUserId();
        break;
      case 'lti':
        this.userId = await this.getLTIUserId();
        break;
    }

    // Hash user ID if required for privacy
    if (this.config.learnerIdentification?.hashUserIds && this.userId) {
      this.userId = await this.hashUserId(this.userId);
    }
  }

  private getOrCreateAnonymousId(): string {
    const key = 'xats_anonymous_id';
    let id = localStorage.getItem(key);
    
    if (!id) {
      id = 'anon_' + this.generateId();
      const expiry = this.config.learnerIdentification?.cookieExpiry || 365;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiry);
      
      localStorage.setItem(key, id);
      localStorage.setItem(key + '_expiry', expiryDate.toISOString());
    }
    
    return id;
  }

  private async hashUserId(userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + this.config.trackingId);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Global event tracking
  private setupGlobalTracking(): void {
    const events = this.config.globalEventTracking || [];

    if (events.includes('document_load')) {
      this.trackEvent({
        eventType: 'document_load',
        contentId: 'document_root',
        eventData: {
          url: window.location.href,
          title: document.title
        }
      });
    }

    if (events.includes('scroll_depth')) {
      this.setupScrollTracking();
    }

    if (events.includes('time_on_page')) {
      this.setupTimeTracking();
    }

    if (events.includes('navigation')) {
      this.setupNavigationTracking();
    }
  }

  private setupScrollTracking(): void {
    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const reached = new Set<number>();

    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        thresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !reached.has(threshold)) {
            reached.add(threshold);
            this.trackEvent({
              eventType: 'scroll_depth',
              contentId: 'document_root',
              eventData: { depth: threshold }
            });
          }
        });
      }
    };

    window.addEventListener('scroll', throttle(trackScroll, 1000));
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateEventId(): string {
    return 'event_' + this.generateId();
  }

  private generateSessionId(): string {
    return 'session_' + this.generateId();
  }

  private detectDevice(): string {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  private getContentPath(contentId: string): string[] {
    // Implementation would traverse DOM or content tree to find path
    return [contentId]; // Simplified
  }

  private measureLoadTime(contentId: string): void {
    const navigationStart = performance.timing.navigationStart;
    const loadComplete = performance.timing.loadEventEnd;
    const loadTime = loadComplete - navigationStart;

    this.trackEvent({
      eventType: 'performance_metric',
      contentId,
      eventData: {
        metric: 'load_time',
        value: loadTime
      },
      performance: {
        loadTime
      }
    });
  }
}

// Analytics provider interface
interface AnalyticsProvider {
  endpoint: string;
  initialize(): Promise<void>;
  sendEvent(event: InteractionEvent): Promise<void>;
  sendBatch(events: InteractionEvent[]): Promise<void>;
  clearData(): void;
}

// Utility function
function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function(this: any) {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Usage example
export function initializeAnalytics(config: AnalyticsConfiguration): AnalyticsManager {
  return new AnalyticsManager(config);
}
```

### React Integration

```tsx
// AnalyticsProvider.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AnalyticsManager } from './analytics-manager';

interface AnalyticsContextType {
  analytics: AnalyticsManager | null;
  trackEvent: (event: any) => void;
  trackContentView: (contentId: string, analytics: any) => void;
  trackInteraction: (contentId: string, type: string, data?: any) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  analytics: null,
  trackEvent: () => {},
  trackContentView: () => {},
  trackInteraction: () => {}
});

export const AnalyticsProvider: React.FC<{
  config: any;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const analyticsRef = useRef<AnalyticsManager | null>(null);

  useEffect(() => {
    if (config && !analyticsRef.current) {
      analyticsRef.current = new AnalyticsManager(config);
    }
  }, [config]);

  const trackEvent = (event: any) => {
    analyticsRef.current?.trackEvent(event);
  };

  const trackContentView = (contentId: string, analytics: any) => {
    analyticsRef.current?.trackContentView(contentId, analytics);
  };

  const trackInteraction = (contentId: string, type: string, data?: any) => {
    analyticsRef.current?.trackContentInteraction(contentId, type, data);
  };

  return (
    <AnalyticsContext.Provider value={{
      analytics: analyticsRef.current,
      trackEvent,
      trackContentView,
      trackInteraction
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);

// Content component with analytics
export const AnalyticsAwareContent: React.FC<{
  contentId: string;
  analytics: any;
  children: React.ReactNode;
}> = ({ contentId, analytics, children }) => {
  const { trackContentView, trackInteraction } = useAnalytics();
  const elementRef = useRef<HTMLDivElement>(null);
  const viewTracked = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !viewTracked.current) {
            trackContentView(contentId, analytics);
            viewTracked.current = true;
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [contentId, analytics, trackContentView]);

  const handleInteraction = (type: string, data?: any) => {
    trackInteraction(contentId, type, data);
  };

  return (
    <div 
      ref={elementRef}
      data-content-id={contentId}
      onClick={() => handleInteraction('click')}
      onFocus={() => handleInteraction('focus')}
    >
      {children}
    </div>
  );
};
```

## Best Practices

### Privacy & Compliance
- Always obtain explicit consent when required by law
- Implement data minimization - collect only necessary data
- Provide clear privacy policies and data usage explanations
- Support user rights (access, rectification, erasure)
- Use pseudonymous identifiers when possible
- Regularly audit and clean old data

### Performance
- Use batch processing to reduce network requests
- Implement event throttling for high-frequency events
- Use web workers for complex analytics calculations
- Cache analytics data locally with periodic sync
- Minimize impact on content loading and rendering

### Data Quality
- Validate events before sending to ensure data integrity
- Implement retry mechanisms for failed requests
- Use structured event schemas for consistency
- Monitor for unusual patterns that might indicate errors
- Implement client-side data validation

### Educational Effectiveness
- Focus on learning-relevant metrics over vanity metrics
- Provide actionable insights to educators and learners
- Respect learner agency and avoid excessive surveillance
- Use analytics to enhance rather than replace human judgment
- Ensure analytics support diverse learning styles and needs

## Testing

### Unit Tests

```typescript
// analytics.test.ts
import { AnalyticsManager } from '../src/analytics-manager';

describe('AnalyticsManager', () => {
  let analytics: AnalyticsManager;
  const mockConfig = {
    enabled: true,
    trackingId: 'test-doc',
    provider: 'custom',
    providerConfig: {},
    privacySettings: {
      requireConsent: false
    }
  };

  beforeEach(() => {
    analytics = new AnalyticsManager(mockConfig);
  });

  test('should track content view events', () => {
    const spy = jest.spyOn(analytics, 'trackEvent');
    
    analytics.trackContentView('test-content', {
      trackingEnabled: true,
      contentType: 'text'
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'content_view',
        contentId: 'test-content'
      })
    );
  });

  test('should respect privacy settings', () => {
    const privateAnalytics = new AnalyticsManager({
      ...mockConfig,
      privacySettings: { requireConsent: true }
    });

    const spy = jest.spyOn(privateAnalytics, 'trackEvent');
    privateAnalytics.trackContentView('test', { trackingEnabled: true });

    expect(spy).not.toHaveBeenCalled();
  });

  test('should batch events when real-time tracking is enabled', () => {
    const rtAnalytics = new AnalyticsManager({
      ...mockConfig,
      realTimeTracking: {
        enabled: true,
        batchSize: 2
      }
    });

    // Track events and verify batching
    rtAnalytics.trackEvent({ eventType: 'test1' });
    rtAnalytics.trackEvent({ eventType: 'test2' });

    // Verify batch was sent
    expect(rtAnalytics['eventQueue']).toHaveLength(0);
  });
});
```

### Integration Tests

```typescript
// analytics-integration.test.ts
describe('Analytics Integration', () => {
  test('should integrate with Google Analytics', async () => {
    // Test GA4 integration
  });

  test('should send xAPI statements correctly', async () => {
    // Test xAPI Learning Record Store integration
  });

  test('should handle consent management', async () => {
    // Test consent flow
  });
});
```

### Privacy Testing

```typescript
// privacy.test.ts
describe('Privacy Compliance', () => {
  test('should anonymize IP addresses when configured', () => {
    // Test IP anonymization
  });

  test('should hash user IDs when required', async () => {
    // Test user ID hashing
  });

  test('should respect DNT headers', () => {
    // Test Do Not Track compliance
  });
});
```

## Contributing

To extend the analytics system:

1. **Add New Providers**: Implement provider interfaces for additional analytics services
2. **Create Custom Metrics**: Define domain-specific learning analytics metrics
3. **Enhance Privacy Features**: Add support for additional privacy regulations
4. **Improve Dashboards**: Create visualization components for analytics data
5. **Add ML Features**: Implement predictive analytics and recommendation engines

## Support

For issues and questions:
- GitHub Issues: [Report bugs or request features](https://github.com/xats-org/core/issues)
- Documentation: [Extension Development Guide](../../docs/guides/extension-guide.md)
- Community: [xats Discussions](https://github.com/xats-org/core/discussions)