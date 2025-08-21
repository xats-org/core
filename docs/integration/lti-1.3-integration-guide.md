# LTI 1.3 Integration Guide for xats

This guide explains how to integrate xats content with Learning Management Systems using LTI 1.3, enabling seamless deployment in educational environments with grade passback, deep linking, and secure authentication.

## Overview

xats v0.2.0 provides comprehensive LTI 1.3 support through schema extensions, enabling:

- **LTI 1.3 Core**: Secure launches using OpenID Connect and JWT
- **Assignment and Grade Services (AGS) 2.0**: Automatic grade passback from assessments  
- **Deep Linking 2.0**: Content selection and assignment creation
- **Platform Registration**: Multi-platform deployment support
- **Pathway Integration**: Adaptive learning using LTI grade data

## Key Benefits

- **Seamless LMS Integration**: Deploy xats content in Canvas, Blackboard, Moodle, D2L Brightspace
- **Automatic Grade Passback**: Assessment scores flow directly to LMS gradebooks
- **Enhanced Security**: OAuth 2.0, JWT, and public key cryptography
- **Content Selection**: Instructors can pick specific content through Deep Linking
- **Adaptive Learning**: Pathways can respond to LTI assessment data
- **Commercial Viability**: Enterprise-ready with proper rights management

## Schema Structure

### Document-Level Configuration

Add LTI configuration to the document root `extensions` property:

```json
{
  "schemaVersion": "0.3.0",
  "extensions": {
    "ltiConfiguration": {
      "toolTitle": "xats Chemistry Textbook",
      "toolDescription": "Interactive chemistry textbook with assessments",
      "launchUrl": "https://textbooks.example.edu/lti/launch",
      "loginInitiationUrl": "https://textbooks.example.edu/lti/login",
      "jwksUrl": "https://textbooks.example.edu/.well-known/jwks.json",
      "supportedServices": [
        "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
        "https://purl.imsglobal.org/spec/lti-ags/scope/score",
        "https://purl.imsglobal.org/spec/lti-dl/scope/deeplinking"
      ]
    }
  }
}
```

### Assessment Grade Passback

Configure grade passback on assessment content blocks:

```json
{
  "id": "chemistry-quiz-1",
  "blockType": "https://xats.org/vocabularies/blocks/multipleChoice",
  "extensions": {
    "ltiGradePassback": {
      "enabled": true,
      "lineItemConfig": {
        "scoreMaximum": 100,
        "label": "Chemistry Quiz - Chapter 1",
        "tag": "chem-ch1-quiz"
      },
      "scoreFormat": "percentage"
    }
  },
  "content": {
    "question": {...},
    "scoring": {
      "points": 100,
      "scoringMethod": "automatic"
    }
  }
}
```

### Deep Linking Configuration

Enable content selection on structural containers:

```json
{
  "id": "chapter-1",
  "title": "Atomic Structure",
  "extensions": {
    "ltiDeepLinking": {
      "enabled": true,
      "acceptTypes": ["ltiResourceLink"],
      "title": "Select Chemistry Content",
      "contentItems": [
        {
          "type": "ltiResourceLink",
          "title": "Bonding Assessment",
          "lineItem": {
            "scoreMaximum": 100,
            "label": "Chemical Bonding Quiz"
          },
          "xatsResourceId": "bonding-assessment"
        }
      ]
    }
  }
}
```

### Pathway Integration with LTI Data

Use LTI grade data in adaptive pathways:

```json
{
  "pathways": [
    {
      "trigger": {
        "triggerType": "https://xats.org/vocabularies/triggers/onAssessment",
        "sourceId": "bonding-assessment"
      },
      "extensions": {
        "ltiPathwayIntegration": {
          "useGradeData": true,
          "gradeVariables": {
            "scorePercentage": "lti_score_percentage",
            "attempts": "lti_attempts"
          }
        }
      },
      "rules": [
        {
          "condition": "lti_score_percentage >= 85 AND lti_attempts == 1",
          "destinationId": "advanced-content",
          "pathwayType": "https://xats.org/vocabularies/pathways/enrichment"
        },
        {
          "condition": "lti_score_percentage < 70",
          "destinationId": "remedial-content", 
          "pathwayType": "https://xats.org/vocabularies/pathways/remedial"
        }
      ]
    }
  ]
}
```

## Platform Registration

### Canvas LMS Setup

1. **Create External App**:
   - Navigate to Settings > Apps
   - Click "View App Configurations" > "+ App"
   - Choose "By Client ID" configuration type

2. **Enter Configuration**:
   ```json
   {
     "client_id": "125900000000000001",
     "deployment_id": "1:dce74908-8e4a-4cc7-8a94-4b4b7d8b8f8f",
     "target_link_uri": "https://textbooks.example.edu/lti/launch",
     "oidc_initiation_url": "https://textbooks.example.edu/lti/login"
   }
   ```

3. **Configure Placements**:
   - Course Navigation: Full textbook access
   - Assignment Selection: Deep linking for assignments
   - Rich Content Editor: Embed specific content

### Blackboard Learn Setup

1. **Create LTI 1.3 Tool**:
   - System Admin > LTI Tool Providers
   - Register LTI 1.3 Tool

2. **Configure Tool**:
   - Tool Status: Approved
   - Institution Policies: Grade passback enabled
   - Privacy: Send user data per xats configuration

### Moodle Setup

1. **Add External Tool**:
   - Site Administration > Plugins > External tool
   - Manage tools > Configure a tool manually

2. **LTI Advantage Services**:
   - Enable Assignment and Grade Services
   - Enable Content-Item Message
   - Configure privacy settings

## Security Implementation

### JWT Signature Verification

Tools must verify platform JWT signatures:

```javascript
// Verify JWT from platform
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: platformConfig.keySetUrl
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

jwt.verify(token, getKey, {
  audience: platformConfig.clientId,
  issuer: platformConfig.platformId
}, (err, decoded) => {
  // Process verified LTI launch
});
```

### Service Authentication

For AGS and Deep Linking service calls:

```javascript
// Get OAuth 2.0 access token
const tokenResponse = await fetch(platformConfig.authTokenUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    'grant_type': 'client_credentials',
    'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    'client_assertion': signedJWT,
    'scope': 'https://purl.imsglobal.org/spec/lti-ags/scope/score'
  })
});

const { access_token } = await tokenResponse.json();
```

## Grade Passback Implementation

### Mapping xats Assessments to AGS

xats assessment scoring maps to LTI AGS as follows:

| xats Property | AGS Property | Description |
|---------------|--------------|-------------|
| `scoring.points` | `scoreMaximum` | Maximum possible score |
| Calculated score | `scoreGiven` | Actual score achieved |
| Completion status | `activityProgress` | Initialized, InProgress, Completed |
| Auto vs manual | `gradingProgress` | NotReady, Pending, PendingManual, FullyGraded |
| Timestamp | `timestamp` | When score was generated |

### Score Posting Example

```javascript
// Post score to LMS gradebook
const scoreData = {
  timestamp: new Date().toISOString(),
  scoreGiven: userScore,
  scoreMaximum: assessment.scoring.points,
  activityProgress: 'Completed',
  gradingProgress: 'FullyGraded',
  userId: ltiLaunch.sub
};

await fetch(`${agsEndpoint}/scores`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/vnd.ims.lis.v1.score+json'
  },
  body: JSON.stringify(scoreData)
});
```

## Deep Linking Implementation

### Content Selection Flow

1. **Platform sends Deep Linking Request**:
   - Message type: `LtiDeepLinkingRequest`
   - Tool presents content selection interface

2. **User selects xats content**:
   - Browse chapters, sections, assessments
   - Preview content and configure parameters

3. **Tool returns Deep Linking Response**:
   - Selected content items with metadata
   - Assignment creation data if applicable

### Response Example

```javascript
const deepLinkingResponse = {
  iss: toolConfig.clientId,
  aud: [platformId],
  exp: Math.floor(Date.now() / 1000) + 600,
  iat: Math.floor(Date.now() / 1000),
  'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
  'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
  'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': [
    {
      type: 'ltiResourceLink',
      title: 'Chemistry Quiz - Chapter 1',
      url: 'https://textbooks.example.edu/chemistry/ch1-quiz',
      lineItem: {
        scoreMaximum: 100,
        label: 'Chemistry Quiz - Chapter 1',
        resourceId: 'ch1-quiz'
      }
    }
  ]
};
```

## Testing and Validation

### LTI Compliance Testing

1. **Use 1EdTech Conformance Suite**:
   - Test LTI 1.3 Core launches
   - Verify JWT signature handling
   - Test service authentication

2. **Validate AGS Implementation**:
   - Test line item creation
   - Verify score posting
   - Check gradebook integration

3. **Test Deep Linking**:
   - Content selection workflows
   - Assignment creation
   - Parameter passing

### Integration Testing Checklist

- [ ] LTI launch from multiple platforms
- [ ] Grade passback for all assessment types
- [ ] Deep linking content selection
- [ ] Pathway integration with LTI data
- [ ] Error handling and logging
- [ ] Security validation
- [ ] Performance under load

## Deployment Considerations

### Production Requirements

1. **SSL/TLS Configuration**:
   - HTTPS required for all endpoints
   - Valid SSL certificates
   - Secure key storage

2. **Scalability**:
   - Load balancing for launch endpoints
   - Database optimization for grade data
   - CDN for static content delivery

3. **Monitoring**:
   - LTI launch success rates
   - Grade passback failures
   - Authentication errors
   - Service availability

### Privacy and Compliance

1. **Data Protection**:
   - Implement privacy level controls
   - Secure user data handling
   - FERPA/GDPR compliance

2. **Rights Management**:
   - Respect content licensing
   - Institutional usage tracking
   - Commercial licensing support

## Troubleshooting

### Common Issues

1. **Launch Failures**:
   - Check JWT signatures and expiration
   - Verify platform registration data
   - Validate redirect URIs

2. **Grade Passback Problems**:
   - Confirm AGS service scopes
   - Check line item configuration
   - Verify access token validity

3. **Deep Linking Issues**:
   - Validate content item format
   - Check return URL configuration
   - Verify message signing

### Debug Resources

- Enable detailed logging for LTI messages
- Use browser developer tools for JWT inspection
- Monitor network requests for service calls
- Validate JSON schema compliance

## References

- [LTI 1.3 Core Specification](https://www.imsglobal.org/spec/lti/v1p3/)
- [Assignment and Grade Services 2.0](https://www.imsglobal.org/spec/lti-ags/v2p0/)
- [Deep Linking 2.0](https://www.imsglobal.org/spec/lti-dl/v2p0/)
- [1EdTech Security Framework](https://www.imsglobal.org/spec/security/v1p0/)
- [xats Schema Reference](../reference/index.md)