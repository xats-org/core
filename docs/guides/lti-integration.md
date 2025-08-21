# LTI 1.3 Integration Guide

## Overview

This guide explains how to integrate xats content with Learning Management Systems (LMS) using the Learning Tools Interoperability (LTI) 1.3 standard. xats provides native support for LTI 1.3, enabling seamless integration with Canvas, Blackboard, Moodle, and other LTI-compliant platforms.

## Table of Contents

- [What is LTI 1.3?](#what-is-lti-13)
- [Quick Start](#quick-start)
- [Platform Registration](#platform-registration)
- [Configuration](#configuration)
- [Grade Passback](#grade-passback)
- [Deep Linking](#deep-linking)
- [Security](#security)
- [Platform-Specific Guides](#platform-specific-guides)
- [Troubleshooting](#troubleshooting)

## What is LTI 1.3?

LTI 1.3 is the latest version of the IMS Global Learning Tools Interoperability standard. It provides:

- **Secure Authentication**: OAuth 2.0 and OpenID Connect
- **Grade Passback**: Assignment and Grade Services (AGS)
- **Deep Linking**: Content selection and import
- **Names and Roles**: Roster provisioning
- **Rich Platform Integration**: Seamless user experience

## Quick Start

### Step 1: Add LTI Extension to Your Document

```json
{
  "schemaVersion": "0.3.0",
  "extensions": {
    "https://xats.org/extensions/lti": {
      "configuration": {
        "platformId": "canvas.instructure.com",
        "clientId": "10000000000001",
        "deploymentId": "1:abc123",
        "authorizationUrl": "https://canvas.instructure.com/api/lti/authorize",
        "tokenUrl": "https://canvas.instructure.com/login/oauth2/token",
        "jwksUrl": "https://canvas.instructure.com/api/lti/security/jwks"
      }
    }
  }
}
```

### Step 2: Configure Tool Registration

Register your xats tool with the LMS platform. You'll need:

- **Redirect URIs**: Your tool's callback URLs
- **Public Key**: For message signature verification
- **Tool Configuration**: Capabilities and permissions

### Step 3: Launch Integration

The LMS will launch your tool with an LTI Resource Link Request. Your tool should:

1. Validate the JWT token
2. Extract user and context information
3. Display the appropriate xats content
4. Enable grade passback if configured

## Platform Registration

### Tool Configuration JSON

```json
{
  "title": "xats Content Provider",
  "description": "Interactive educational content powered by xats",
  "oidc_initiation_url": "https://your-tool.com/lti/initiate",
  "target_link_uri": "https://your-tool.com/lti/launch",
  "scopes": [
    "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem",
    "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly",
    "https://purl.imsglobal.org/spec/lti-ags/scope/score",
    "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly"
  ],
  "extensions": [
    {
      "platform": "canvas.instructure.com",
      "settings": {
        "text": "xats Content",
        "icon_url": "https://your-tool.com/icon.png",
        "placements": [
          {
            "text": "xats Content",
            "placement": "assignment_selection",
            "message_type": "LtiDeepLinkingRequest"
          },
          {
            "text": "View xats Content",
            "placement": "resource_selection",
            "message_type": "LtiResourceLinkRequest"
          }
        ]
      }
    }
  ],
  "public_jwk": {
    "kty": "RSA",
    "e": "AQAB",
    "n": "your-public-key-modulus",
    "kid": "your-key-id",
    "alg": "RS256",
    "use": "sig"
  }
}
```

## Configuration

### Document-Level Configuration

Configure LTI at the document level for all content:

```json
{
  "schemaVersion": "0.2.0",
  "extensions": {
    "https://xats.org/extensions/lti": {
      "configuration": {
        "platformId": "canvas.instructure.com",
        "clientId": "10000000000001",
        "deploymentId": "1:abc123",
        "authorizationUrl": "https://canvas.instructure.com/api/lti/authorize",
        "tokenUrl": "https://canvas.instructure.com/login/oauth2/token",
        "jwksUrl": "https://canvas.instructure.com/api/lti/security/jwks",
        "customParameters": {
          "course_id": "$Canvas.course.id",
          "user_id": "$Canvas.user.id"
        }
      }
    }
  }
}
```

### Chapter/Section-Level Configuration

Override configuration for specific content:

```json
{
  "id": "ch-1",
  "title": "Chapter 1: Introduction",
  "extensions": {
    "https://xats.org/extensions/lti": {
      "deepLinking": {
        "url": "https://your-tool.com/chapters/1",
        "title": "Chapter 1: Introduction to Biology",
        "description": "Learn the fundamentals of biological science",
        "thumbnail": "https://your-tool.com/thumbnails/ch1.jpg",
        "custom": {
          "chapter_id": "ch-1",
          "estimated_time": "45 minutes"
        }
      }
    }
  }
}
```

## Grade Passback

### Assessment Configuration

Configure assessments for automatic grade synchronization:

```json
{
  "id": "quiz-1",
  "blockType": "https://xats.org/extensions/assessment/quiz",
  "content": {
    "title": "Chapter 1 Quiz",
    "totalPoints": 100,
    "questions": [/* ... */]
  },
  "extensions": {
    "https://xats.org/extensions/lti": {
      "gradePassback": {
        "lineItemUrl": "https://canvas.instructure.com/api/lti/courses/123/line_items/456",
        "scoreMaximum": 100,
        "label": "Chapter 1 Quiz",
        "resourceId": "quiz-ch1-biology",
        "tag": "quiz",
        "submissionType": "online_quiz"
      }
    }
  }
}
```

### Sending Scores

Example score submission:

```javascript
// After quiz completion
const score = {
  userId: ltiContext.user.id,
  scoreGiven: 85,
  scoreMaximum: 100,
  activityProgress: "Completed",
  gradingProgress: "FullyGraded",
  timestamp: new Date().toISOString(),
  comment: "Good work on the cell structure questions!"
};

// Send to LMS via AGS
await sendScoreToLMS(score, gradePassback.lineItemUrl);
```

## Deep Linking

### Content Selection

Enable instructors to select specific xats content:

```json
{
  "extensions": {
    "https://xats.org/extensions/lti": {
      "deepLinking": {
        "acceptTypes": ["link", "file", "html", "ltiResourceLink"],
        "acceptPresentationDocumentTargets": ["iframe", "window"],
        "returnUrl": "https://canvas.instructure.com/courses/123/deep_linking_return",
        "contentItems": [
          {
            "type": "ltiResourceLink",
            "url": "https://your-tool.com/content/ch1",
            "title": "Chapter 1: Introduction",
            "text": "Introduction to Biology",
            "icon": {
              "url": "https://your-tool.com/icons/biology.png",
              "width": 100,
              "height": 100
            },
            "thumbnail": {
              "url": "https://your-tool.com/thumbnails/ch1.jpg",
              "width": 300,
              "height": 200
            },
            "lineItem": {
              "scoreMaximum": 100,
              "label": "Chapter 1 Activities"
            }
          }
        ]
      }
    }
  }
}
```

### Pathway Integration

Link adaptive pathways to LTI contexts:

```json
{
  "id": "pathway-1",
  "type": "adaptive",
  "trigger": {
    "triggerType": "https://xats.org/pathways/triggers/lti-role",
    "value": "Learner"
  },
  "rules": [
    {
      "condition": "lti.custom.skill_level == 'beginner'",
      "destinationId": "sec-basics"
    },
    {
      "condition": "lti.custom.skill_level == 'advanced'",
      "destinationId": "sec-advanced"
    }
  ]
}
```

## Security

### JWT Validation

Always validate incoming JWT tokens:

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Create JWKS client
const client = jwksClient({
  jwksUri: configuration.jwksUrl
});

// Get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Verify token
jwt.verify(token, getKey, {
  algorithms: ['RS256'],
  issuer: configuration.platformId,
  audience: configuration.clientId
}, (err, decoded) => {
  if (err) {
    // Handle error
  } else {
    // Process valid token
  }
});
```

### Required Claims Validation

Ensure all required claims are present:

```javascript
const requiredClaims = [
  'iss',  // Issuer
  'aud',  // Audience
  'exp',  // Expiration
  'iat',  // Issued at
  'nonce',  // Nonce
  'https://purl.imsglobal.org/spec/lti/claim/deployment_id',
  'https://purl.imsglobal.org/spec/lti/claim/target_link_uri',
  'https://purl.imsglobal.org/spec/lti/claim/resource_link',
  'https://purl.imsglobal.org/spec/lti/claim/roles'
];

requiredClaims.forEach(claim => {
  if (!decodedToken[claim]) {
    throw new Error(`Missing required claim: ${claim}`);
  }
});
```

## Platform-Specific Guides

### Canvas

```json
{
  "extensions": {
    "https://xats.org/extensions/lti": {
      "configuration": {
        "platformId": "canvas.instructure.com",
        "authorizationUrl": "https://[your-domain].instructure.com/api/lti/authorize",
        "tokenUrl": "https://[your-domain].instructure.com/login/oauth2/token",
        "jwksUrl": "https://[your-domain].instructure.com/api/lti/security/jwks",
        "canvas": {
          "domain": "your-domain.instructure.com",
          "apiUrl": "https://your-domain.instructure.com/api/v1"
        }
      }
    }
  }
}
```

### Blackboard

```json
{
  "extensions": {
    "https://xats.org/extensions/lti": {
      "configuration": {
        "platformId": "blackboard.com",
        "authorizationUrl": "https://[your-domain].blackboard.com/learn/api/public/v1/lti/authorize",
        "tokenUrl": "https://[your-domain].blackboard.com/learn/api/public/v1/lti/token",
        "jwksUrl": "https://[your-domain].blackboard.com/learn/api/public/v1/lti/jwks",
        "blackboard": {
          "domain": "your-domain.blackboard.com",
          "apiUrl": "https://your-domain.blackboard.com/learn/api/public/v1"
        }
      }
    }
  }
}
```

### Moodle

```json
{
  "extensions": {
    "https://xats.org/extensions/lti": {
      "configuration": {
        "platformId": "moodle.org",
        "authorizationUrl": "https://[your-domain]/mod/lti/auth.php",
        "tokenUrl": "https://[your-domain]/mod/lti/token.php",
        "jwksUrl": "https://[your-domain]/mod/lti/certs.php",
        "moodle": {
          "domain": "your-domain.edu",
          "apiUrl": "https://your-domain.edu/webservice/rest/server.php"
        }
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Invalid Token Error

**Problem**: JWT validation fails
**Solution**: 
- Verify the JWKS URL is correct
- Check token expiration
- Ensure clock synchronization between servers

#### 2. Grade Passback Fails

**Problem**: Scores not appearing in LMS
**Solution**:
- Verify AGS scope permissions
- Check line item URL is valid
- Ensure score format matches AGS specification

#### 3. Deep Linking Returns Empty

**Problem**: Content selection not working
**Solution**:
- Verify deep linking claim is present
- Check return URL is valid
- Ensure content items format is correct

### Debug Mode

Enable debug logging:

```json
{
  "extensions": {
    "https://xats.org/extensions/lti": {
      "debug": true,
      "logLevel": "verbose"
    }
  }
}
```

### Validation Tools

- [IMS LTI Reference Implementation](https://lti-ri.imsglobal.org/)
- [LTI 1.3 Debugger](https://lti-debugger.herokuapp.com/)
- [Canvas LTI Testing Tool](https://github.com/instructure/lti_tool_provider_example)

## Best Practices

1. **Always Use HTTPS**: All LTI endpoints must use HTTPS
2. **Validate Everything**: Never trust incoming data without validation
3. **Handle Errors Gracefully**: Provide meaningful error messages
4. **Log Security Events**: Track authentication attempts and failures
5. **Implement Rate Limiting**: Prevent abuse of your endpoints
6. **Cache JWKS Keys**: Reduce latency and API calls
7. **Support Multiple Deployments**: Allow same tool in multiple contexts

## Resources

### Specifications

- [LTI 1.3 Core Specification](https://www.imsglobal.org/spec/lti/v1p3/)
- [LTI Assignment and Grade Services](https://www.imsglobal.org/spec/lti-ags/v2p0/)
- [LTI Deep Linking](https://www.imsglobal.org/spec/lti-dl/v2p0/)
- [LTI Names and Role Provisioning](https://www.imsglobal.org/spec/lti-nrps/v2p0/)

### Libraries and Tools

- [LTI 1.3 PHP Library](https://github.com/IMSGlobal/lti-1-3-php-library)
- [PyLTI1.3](https://github.com/dmitry-viskov/pylti1.3)
- [LTI.js](https://github.com/Cvmcosta/ltijs)

### Platform Documentation

- [Canvas LTI Documentation](https://canvas.instructure.com/doc/api/file.lti_dev_key_config.html)
- [Blackboard LTI Documentation](https://help.blackboard.com/Learn/Administrator/SaaS/Integrations/Learning_Tools_Interoperability)
- [Moodle LTI Documentation](https://docs.moodle.org/en/External_tool)

## Getting Help

- **LTI Issues**: [github.com/xats-org/core/issues](https://github.com/xats-org/core/issues) (tag with 'lti')
- **IMS Global Forum**: [imsglobal.org/forums](https://www.imsglobal.org/forums)
- **xats Community**: [github.com/xats-org/core/discussions](https://github.com/xats-org/core/discussions)

---

*For complete examples, see the [LTI integration example](../../examples/lti-integration-example.json) in the examples directory.*