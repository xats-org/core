/**
 * Analytics Tracking Extension Implementation
 * Comprehensive learner analytics and interaction tracking for xats content
 */

export interface AnalyticsConfiguration {
  enabled?: boolean;
  trackingId: string;
  provider: 'google-analytics' | 'mixpanel' | 'amplitude' | 'segment' | 'xapi' | 'caliper' | 'custom';
  providerConfig: {
    apiKey?: string;
    endpoint?: string;
    projectId?: string;
    customProperties?: Record<string, any>;
  };
  privacySettings?: {
    requireConsent?: boolean;
    consentTypes?: string[];
    anonymizeIp?: boolean;
    respectDNT?: boolean;
    dataProcessingRegion?: string;
  };
  learnerIdentification?: {
    method?: 'anonymous' | 'pseudonymous' | 'authenticated' | 'lti';
    hashUserIds?: boolean;
    cookieExpiry?: number;
  };
  realTimeTracking?: {
    enabled?: boolean;
    batchSize?: number;
    flushInterval?: number;
  };
  globalEventTracking?: string[];
}

export interface InteractionEvent {
  eventId: string;
  timestamp: string;
  eventType: string;
  userId?: string;
  sessionId: string;
  contentId: string;
  documentId: string;
  containerPath?: string[];
  eventData?: Record<string, any>;
  context?: {
    userAgent?: string;
    screenResolution?: string;
    language?: string;
    referrer?: string;
    platform?: string;
    device?: string;
  };
  performance?: {
    loadTime?: number;
    renderTime?: number;
    responseTime?: number;
  };
}

export interface ContentAnalytics {
  trackingEnabled?: boolean;
  contentId?: string;
  contentType?: string;
  learningObjectives?: string[];
  difficulty?: string;
  estimatedDuration?: number;
  trackingEvents?: string[];
  customDimensions?: Record<string, any>;
  performanceMetrics?: {
    loadTime?: boolean;
    renderTime?: boolean;
    interactionLatency?: boolean;
  };
}

// Analytics Provider Interface
export interface AnalyticsProvider {
  name: string;
  endpoint?: string;
  initialize(config: any): Promise<void>;
  sendEvent(event: InteractionEvent): Promise<void>;
  sendBatch(events: InteractionEvent[]): Promise<void>;
  clearData(): void;
}

// Google Analytics 4 Provider
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'google-analytics';
  private measurementId: string;
  private apiSecret?: string;

  constructor(config: any) {
    this.measurementId = config.projectId || config.measurementId;
    this.apiSecret = config.apiSecret;
  }

  async initialize(config: any): Promise<void> {
    // Load gtag if not already loaded
    if (!(window as any).gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(arguments);
      }
      (window as any).gtag = gtag;

      gtag('js', new Date());
      gtag('config', this.measurementId, {
        anonymize_ip: config.privacySettings?.anonymizeIp !== false,
        respect_dnt: config.privacySettings?.respectDNT !== false
      });
    }
  }

  async sendEvent(event: InteractionEvent): Promise<void> {
    if ((window as any).gtag) {
      (window as any).gtag('event', event.eventType, {
        event_category: 'xats_interaction',
        event_label: event.contentId,
        custom_map: {
          content_id: event.contentId,
          document_id: event.documentId,
          session_id: event.sessionId,
          user_id: event.userId
        },
        ...event.eventData
      });
    }
  }

  async sendBatch(events: InteractionEvent[]): Promise<void> {
    // GA4 doesn't support batch sending via gtag, so send individually
    for (const event of events) {
      await this.sendEvent(event);
    }
  }

  clearData(): void {
    // Clear GA cookies and data
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim().startsWith('_ga')) {
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  }
}

// xAPI Provider
export class XAPIProvider implements AnalyticsProvider {
  name = 'xapi';
  endpoint: string;
  private auth: string;
  private version: string = '1.0.3';

  constructor(config: any) {
    this.endpoint = config.endpoint;
    this.auth = btoa(`${config.username || ''}:${config.password || ''}`);
  }

  async initialize(): Promise<void> {
    // Test connection to LRS
    try {
      const response = await fetch(`${this.endpoint}/about`, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'X-Experience-API-Version': this.version
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to Learning Record Store');
      }
    } catch (error) {
      console.warn('xAPI LRS connection failed:', error);
    }
  }

  async sendEvent(event: InteractionEvent): Promise<void> {
    const statement = this.convertToXAPIStatement(event);
    
    const response = await fetch(`${this.endpoint}/statements`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'X-Experience-API-Version': this.version,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statement)
    });

    if (!response.ok) {
      throw new Error(`xAPI send failed: ${response.status}`);
    }
  }

  async sendBatch(events: InteractionEvent[]): Promise<void> {
    const statements = events.map(event => this.convertToXAPIStatement(event));
    
    const response = await fetch(`${this.endpoint}/statements`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'X-Experience-API-Version': this.version,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statements)
    });

    if (!response.ok) {
      throw new Error(`xAPI batch send failed: ${response.status}`);
    }
  }

  private convertToXAPIStatement(event: InteractionEvent): any {
    return {
      id: event.eventId,
      timestamp: event.timestamp,
      actor: {
        account: {
          homePage: window.location.origin,
          name: event.userId || 'anonymous'
        }
      },
      verb: {
        id: this.getVerbIRI(event.eventType),
        display: { 'en-US': event.eventType }
      },
      object: {
        id: `${window.location.origin}/content/${event.contentId}`,
        definition: {
          name: { 'en-US': event.contentId },
          type: 'http://adlnet.gov/expapi/activities/lesson'
        }
      },
      context: {
        platform: 'xats',
        language: event.context?.language || 'en-US',
        extensions: {
          'http://id.tincanapi.com/extension/session-id': event.sessionId,
          'http://id.tincanapi.com/extension/document-id': event.documentId,
          ...event.eventData
        }
      }
    };
  }

  private getVerbIRI(eventType: string): string {
    const verbMap: Record<string, string> = {
      'content_view': 'http://id.tincanapi.com/verb/viewed',
      'content_interaction': 'http://adlnet.gov/expapi/verbs/interacted',
      'assessment_start': 'http://adlnet.gov/expapi/verbs/attempted',
      'assessment_complete': 'http://adlnet.gov/expapi/verbs/completed',
      'progress_update': 'http://adlnet.gov/expapi/verbs/progressed'
    };
    
    return verbMap[eventType] || 'http://adlnet.gov/expapi/verbs/experienced';
  }

  clearData(): void {
    // xAPI doesn't store client-side data
  }
}

// Custom Provider for generic HTTP endpoints
export class CustomProvider implements AnalyticsProvider {
  name = 'custom';
  endpoint: string;
  private headers: Record<string, string>;

  constructor(config: any) {
    this.endpoint = config.endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };

    if (config.apiKey) {
      this.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
  }

  async initialize(): Promise<void> {
    // Test endpoint connectivity
    try {
      await fetch(`${this.endpoint}/health`, {
        method: 'GET',
        headers: this.headers
      });
    } catch (error) {
      console.warn('Custom analytics endpoint health check failed:', error);
    }
  }

  async sendEvent(event: InteractionEvent): Promise<void> {
    const response = await fetch(`${this.endpoint}/events`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`Custom analytics send failed: ${response.status}`);
    }
  }

  async sendBatch(events: InteractionEvent[]): Promise<void> {
    const response = await fetch(`${this.endpoint}/events/batch`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ events })
    });

    if (!response.ok) {
      throw new Error(`Custom analytics batch send failed: ${response.status}`);
    }
  }

  clearData(): void {
    // Implementation depends on custom endpoint
    fetch(`${this.endpoint}/user/data`, {
      method: 'DELETE',
      headers: this.headers
    }).catch(error => console.warn('Failed to clear custom analytics data:', error));
  }
}

// Main Analytics Manager
export class AnalyticsManager {
  private config: AnalyticsConfiguration;
  private provider: AnalyticsProvider;
  private eventQueue: InteractionEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private consentGiven: boolean = false;
  private initialized: boolean = false;
  private startTime: number = Date.now();

  constructor(config: AnalyticsConfiguration) {
    this.config = { enabled: true, ...config };
    this.sessionId = this.generateSessionId();
    
    // Check Do Not Track
    if (config.privacySettings?.respectDNT && navigator.doNotTrack === '1') {
      this.config.enabled = false;
      return;
    }

    this.provider = this.createProvider(config.provider, config.providerConfig);
    
    if (config.privacySettings?.requireConsent) {
      this.checkConsent();
    } else {
      this.consentGiven = true;
      this.initialize();
    }
  }

  private createProvider(type: string, config: any): AnalyticsProvider {
    switch (type) {
      case 'google-analytics':
        return new GoogleAnalyticsProvider(config);
      case 'xapi':
        return new XAPIProvider(config);
      case 'custom':
        return new CustomProvider(config);
      default:
        throw new Error(`Unsupported analytics provider: ${type}`);
    }
  }

  private async initialize(): Promise<void> {
    if (!this.config.enabled || !this.consentGiven || this.initialized) return;

    try {
      // Set up user identification
      await this.setupUserIdentification();

      // Initialize provider
      await this.provider.initialize(this.config);

      // Set up global event listeners
      this.setupGlobalTracking();

      // Start real-time tracking if enabled
      if (this.config.realTimeTracking?.enabled) {
        this.startRealTimeTracking();
      }

      this.initialized = true;
      console.log(`Analytics initialized with ${this.provider.name} provider`);
      
      // Track initialization
      this.trackEvent({
        eventType: 'analytics_initialized',
        contentId: 'system',
        eventData: {
          provider: this.provider.name,
          config: {
            realTimeEnabled: this.config.realTimeTracking?.enabled,
            globalEvents: this.config.globalEventTracking?.length || 0
          }
        }
      });
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  // Event tracking methods
  trackEvent(event: Partial<InteractionEvent>): void {
    if (!this.config.enabled || !this.consentGiven) return;

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
      device: this.detectDevice(),
      ...event.context
    };

    // Queue or send immediately
    if (this.config.realTimeTracking?.enabled) {
      this.eventQueue.push(fullEvent);
      this.maybeFlushEvents();
    } else {
      this.provider.sendEvent(fullEvent).catch(error => {
        console.warn('Failed to send analytics event:', error);
      });
    }
  }

  trackContentView(contentId: string, analytics?: ContentAnalytics): void {
    if (!analytics?.trackingEnabled) return;

    const startTime = performance.now();

    this.trackEvent({
      eventType: 'content_view',
      contentId,
      containerPath: this.getContentPath(contentId),
      eventData: {
        contentType: analytics.contentType,
        difficulty: analytics.difficulty,
        estimatedDuration: analytics.estimatedDuration,
        learningObjectives: analytics.learningObjectives,
        customDimensions: analytics.customDimensions
      }
    });

    // Track performance metrics if enabled
    if (analytics.performanceMetrics?.loadTime) {
      requestAnimationFrame(() => {
        const loadTime = performance.now() - startTime;
        this.trackEvent({
          eventType: 'performance_metric',
          contentId,
          eventData: { metric: 'content_load_time', value: loadTime },
          performance: { loadTime }
        });
      });
    }
  }

  trackContentInteraction(contentId: string, interactionType: string, data?: any): void {
    this.trackEvent({
      eventType: 'content_interaction',
      contentId,
      eventData: {
        interactionType,
        timestamp: Date.now(),
        ...data
      }
    });
  }

  trackContentComplete(contentId: string, completionData?: any): void {
    this.trackEvent({
      eventType: 'content_complete',
      contentId,
      eventData: {
        timeSpent: Date.now() - this.startTime,
        completionTimestamp: Date.now(),
        ...completionData
      }
    });
  }

  trackAssessmentStart(assessmentId: string, assessmentData?: any): void {
    this.trackEvent({
      eventType: 'assessment_start',
      contentId: assessmentId,
      eventData: {
        startTime: Date.now(),
        ...assessmentData
      }
    });
  }

  trackAssessmentAnswer(assessmentId: string, questionId: string, answerData: any): void {
    this.trackEvent({
      eventType: 'assessment_answer',
      contentId: assessmentId,
      eventData: {
        questionId,
        answer: answerData.answer,
        isCorrect: answerData.isCorrect,
        timeSpent: answerData.timeSpent,
        attemptNumber: answerData.attemptNumber || 1,
        hintsUsed: answerData.hintsUsed || 0
      }
    });
  }

  trackAssessmentComplete(assessmentId: string, results: any): void {
    this.trackEvent({
      eventType: 'assessment_complete',
      contentId: assessmentId,
      eventData: {
        score: results.score,
        maxScore: results.maxScore,
        percentage: results.percentage,
        timeSpent: results.timeSpent,
        questionsAnswered: results.questionsAnswered,
        questionsCorrect: results.questionsCorrect,
        completionTimestamp: Date.now()
      }
    });
  }

  trackProgress(contentId: string, progressData: any): void {
    this.trackEvent({
      eventType: 'progress_update',
      contentId,
      eventData: {
        progressPercentage: progressData.percentage,
        milestonesReached: progressData.milestones || [],
        timeSpent: progressData.timeSpent,
        completedSections: progressData.completedSections || [],
        currentSection: progressData.currentSection
      }
    });
  }

  trackSearchQuery(query: string, results?: any): void {
    this.trackEvent({
      eventType: 'search',
      contentId: 'search_system',
      eventData: {
        query,
        resultsCount: results?.count || 0,
        selectedResult: results?.selected,
        searchTimestamp: Date.now()
      }
    });
  }

  trackNavigationEvent(fromContent: string, toContent: string, navigationType: string): void {
    this.trackEvent({
      eventType: 'navigation',
      contentId: toContent,
      eventData: {
        fromContentId: fromContent,
        toContentId: toContent,
        navigationType, // 'click', 'keyboard', 'back', 'forward', 'bookmark'
        navigationTimestamp: Date.now()
      }
    });
  }

  // Consent management
  private checkConsent(): void {
    const savedConsent = localStorage.getItem('xats_analytics_consent');
    if (savedConsent) {
      const consent = JSON.parse(savedConsent);
      if (consent.granted && new Date(consent.expires) > new Date()) {
        this.consentGiven = true;
        this.initialize();
        return;
      }
    }

    this.requestConsent();
  }

  private async requestConsent(): Promise<void> {
    const consentTypes = this.config.privacySettings?.consentTypes || ['analytics'];
    
    // In a real implementation, this would show a proper consent dialog
    const consent = await this.showConsentDialog(consentTypes);
    
    if (consent) {
      this.grantConsent();
    }
  }

  private async showConsentDialog(types: string[]): Promise<boolean> {
    // This would integrate with a consent management platform
    // For now, using a simple confirm dialog
    return new Promise((resolve) => {
      const message = `This content collects ${types.join(', ')} data to improve your learning experience. Do you consent?`;
      const consent = confirm(message);
      resolve(consent);
    });
  }

  grantConsent(consentTypes?: string[]): void {
    this.consentGiven = true;
    
    // Save consent
    const consent = {
      granted: true,
      types: consentTypes || this.config.privacySettings?.consentTypes || ['analytics'],
      timestamp: new Date().toISOString(),
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    
    localStorage.setItem('xats_analytics_consent', JSON.stringify(consent));
    
    if (!this.initialized) {
      this.initialize();
    }
  }

  revokeConsent(): void {
    this.consentGiven = false;
    this.initialized = false;
    
    // Clear stored data
    localStorage.removeItem('xats_analytics_consent');
    localStorage.removeItem('xats_analytics_user_id');
    
    // Clear provider data
    this.provider.clearData();
    
    // Clear event queue
    this.eventQueue = [];
    
    console.log('Analytics consent revoked and data cleared');
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
    const key = 'xats_analytics_user_id';
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

  private async getPseudonymousId(): Promise<string> {
    // Create pseudonymous ID based on browser fingerprint
    const fingerprint = await this.generateBrowserFingerprint();
    return 'pseudo_' + fingerprint;
  }

  private async getAuthenticatedUserId(): Promise<string> {
    // This would integrate with authentication system
    // For now, check for common auth patterns
    const authUser = (window as any).currentUser?.id || 
                     (window as any).user?.id ||
                     localStorage.getItem('user_id');
    
    return authUser ? `auth_${authUser}` : this.getOrCreateAnonymousId();
  }

  private async getLTIUserId(): Promise<string> {
    // Extract LTI user ID from context
    const ltiContext = (window as any).ltiContext;
    if (ltiContext && ltiContext.user && ltiContext.user.id) {
      return `lti_${ltiContext.user.id}`;
    }
    
    return this.getOrCreateAnonymousId();
  }

  private async hashUserId(userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + this.config.trackingId);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async generateBrowserFingerprint(): Promise<string> {
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.platform,
      navigator.cookieEnabled.toString()
    ].join('|');
    
    return this.hashUserId(data);
  }

  // Real-time tracking
  private startRealTimeTracking(): void {
    const flushInterval = (this.config.realTimeTracking?.flushInterval || 30) * 1000;
    
    const intervalId = setInterval(() => {
      this.flushEvents();
    }, flushInterval);

    // Flush on page unload
    const handleUnload = () => {
      this.flushEvents(true);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // Store interval ID for cleanup
    (this as any).realTimeIntervalId = intervalId;
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
      if (immediate && navigator.sendBeacon && this.provider.endpoint) {
        // Use sendBeacon for reliable sending on page unload
        const data = JSON.stringify({ events: eventsToSend });
        const sent = navigator.sendBeacon(this.provider.endpoint + '/batch', data);
        
        if (!sent) {
          console.warn('Failed to send analytics events via sendBeacon');
        }
      } else {
        await this.provider.sendBatch(eventsToSend);
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry (up to a limit)
      if (this.eventQueue.length < 100) {
        this.eventQueue.unshift(...eventsToSend);
      }
    }
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
          title: document.title,
          loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart
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

    window.addEventListener('scroll', this.throttle(trackScroll, 1000));
  }

  private setupTimeTracking(): void {
    let startTime = Date.now();
    let totalTime = 0;
    let isVisible = !document.hidden;

    const trackTime = () => {
      if (isVisible) {
        totalTime += Date.now() - startTime;
      }
      startTime = Date.now();

      this.trackEvent({
        eventType: 'time_on_page',
        contentId: 'document_root',
        eventData: { totalTime: Math.round(totalTime / 1000) }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden !== isVisible) {
        if (isVisible) {
          totalTime += Date.now() - startTime;
        }
        isVisible = !document.hidden;
        startTime = Date.now();
      }
    };

    // Track time every 30 seconds
    setInterval(trackTime, 30000);
    
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track final time on unload
    window.addEventListener('beforeunload', trackTime);
  }

  private setupNavigationTracking(): void {
    // Track hash changes (SPA navigation)
    window.addEventListener('hashchange', () => {
      this.trackEvent({
        eventType: 'navigation',
        contentId: 'hash_change',
        eventData: {
          from: document.referrer,
          to: window.location.href,
          type: 'hash_change'
        }
      });
    });

    // Track back/forward navigation
    window.addEventListener('popstate', () => {
      this.trackEvent({
        eventType: 'navigation',
        contentId: 'browser_navigation',
        eventData: {
          to: window.location.href,
          type: 'browser_back_forward'
        }
      });
    });
  }

  // Utility methods
  private generateId(): string {
    // Use cryptographically secure random number generation
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(2);
      crypto.getRandomValues(array);
      return Date.now().toString(36) + array[0].toString(36) + array[1].toString(36);
    }
    // Fallback for environments without crypto API (should be rare in modern browsers)
    console.warn('Cryptographically secure randomness not available, falling back to Math.random()');
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
    // In a real implementation, this would traverse the DOM or content tree
    // to find the hierarchical path to the content
    const element = document.querySelector(`[data-content-id="${contentId}"]`);
    const path: string[] = [];
    
    let current = element?.parentElement;
    while (current && current !== document.body) {
      const pathId = current.getAttribute('data-container-id') || 
                     current.getAttribute('data-content-id');
      if (pathId) {
        path.unshift(pathId);
      }
      current = current.parentElement;
    }
    
    return path;
  }

  private throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Public API for external access
  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getConfig(): AnalyticsConfiguration {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled === true && this.consentGiven;
  }

  destroy(): void {
    // Clean up event listeners and intervals
    if ((this as any).realTimeIntervalId) {
      clearInterval((this as any).realTimeIntervalId);
    }

    // Flush any remaining events
    this.flushEvents(true);

    // Clear data
    this.eventQueue = [];
    this.initialized = false;
  }
}

// Factory function for easy initialization
export function createAnalyticsManager(config: AnalyticsConfiguration): AnalyticsManager {
  return new AnalyticsManager(config);
}

// Auto-initialization for documents with analytics configuration
export function initializeDocumentAnalytics(): AnalyticsManager | null {
  // Look for analytics configuration in the document
  const configElement = document.querySelector('[data-analytics-config]');
  if (configElement) {
    try {
      const config = JSON.parse(configElement.getAttribute('data-analytics-config') || '{}');
      return new AnalyticsManager(config);
    } catch (error) {
      console.error('Failed to parse analytics configuration:', error);
    }
  }

  // Look for global analytics configuration
  if ((window as any).xatsAnalyticsConfig) {
    return new AnalyticsManager((window as any).xatsAnalyticsConfig);
  }

  return null;
}

// Auto-initialize if configuration is available
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const manager = initializeDocumentAnalytics();
    if (manager) {
      (window as any).xatsAnalytics = manager;
      console.log('xats Analytics auto-initialized');
    }
  });
}