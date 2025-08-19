# xats Extensions

This directory contains official extensions to the xats schema that provide additional functionality for specific use cases. Extensions allow xats to remain focused on core educational content while supporting specialized integrations and features.

## Extension Philosophy

xats extensions follow these principles:

- **Backward Compatibility**: Extensions never break existing xats documents
- **Optional Enhancement**: Core xats functionality works without extensions
- **Domain-Specific**: Extensions address specific integration or functionality needs
- **Standard Compliance**: Extensions follow established standards where applicable

## Available Extensions

### LTI 1.3 Integration Extension

**File**: `lti-1.3.json`  
**Schema ID**: `https://xats.org/extensions/lti-1.3/schema.json`  
**Status**: Stable (v0.2.0)

The LTI 1.3 extension enables seamless integration with Learning Management Systems (LMS) through the IMS Global Learning Tools Interoperability standard.

#### Features

- **LTI 1.3 Core**: Secure tool launches with OpenID Connect authentication
- **Assignment and Grade Services (AGS)**: Automatic grade passback to LMS gradebooks
- **Deep Linking 2.0**: Allow instructors to select and embed specific content
- **Names and Role Provisioning Services (NRPS)**: Access to course roster and user roles
- **Platform-Specific Configurations**: Pre-built settings for Canvas, Blackboard, Moodle, and D2L

#### Usage

Add LTI configuration to the root document:

```json
{
  "schemaVersion": "0.2.0",
  "bibliographicEntry": { /* ... */ },
  "subject": "Biology",
  "bodyMatter": { /* ... */ },
  "extensions": {
    "ltiConfiguration": {
      "toolTitle": "Biology Interactive Textbook",
      "toolDescription": "Comprehensive biology textbook with interactive assessments",
      "toolVersion": "1.0.0",
      "launchUrl": "https://your-tool.com/lti/launch",
      "loginInitiationUrl": "https://your-tool.com/lti/login",
      "redirectUris": [
        "https://your-tool.com/lti/callback"
      ],
      "jwksUrl": "https://your-tool.com/.well-known/jwks.json",
      "supportedMessageTypes": [
        "LtiResourceLinkRequest",
        "LtiDeepLinkingRequest"
      ],
      "claims": [
        "iss",
        "sub", 
        "aud",
        "exp",
        "iat",
        "nonce"
      ],
      "gradePassbackConfig": {
        "enabled": true,
        "maxScore": 100,
        "gradingMethod": "automatic",
        "scoreGiven": "points",
        "scoreMaximum": "points"
      }
    }
  }
}
```

#### Assessment-Level LTI Configuration

For individual assessments with grade passback:

```json
{
  "id": "quiz-chapter-1",
  "blockType": "https://xats.org/core/blocks/multipleChoice",
  "content": {
    "question": { /* ... */ },
    "options": [ /* ... */ ]
  },
  "extensions": {
    "ltiLaunchMetadata": {
      "resourceLinkId": "quiz-ch1-001",
      "resourceLinkTitle": "Chapter 1 Quiz",
      "resourceLinkDescription": "Assessment covering basic cell structure"
    },
    "ltiGradePassback": {
      "lineItemId": "assignment-123",
      "scoreMaximum": 20,
      "label": "Chapter 1 Quiz",
      "tag": "chapter-1",
      "resourceId": "quiz-chapter-1"
    }
  }
}
```

#### Platform-Specific Configurations

The extension includes pre-built configurations for major LMS platforms:

**Canvas:**
```json
{
  "platformConfiguration": {
    "platform": "canvas",
    "clientId": "your-canvas-client-id",
    "authenticationRequestUrl": "https://canvas.instructure.com/api/lti/authorize_redirect",
    "accessTokenUrl": "https://canvas.instructure.com/login/oauth2/token",
    "authTokenUrl": "https://canvas.instructure.com/api/lti/authorize_redirect"
  }
}
```

**Blackboard Learn:**
```json
{
  "platformConfiguration": {
    "platform": "blackboard",
    "clientId": "your-blackboard-client-id",
    "authenticationRequestUrl": "https://your-instance.blackboard.com/learn/api/public/v1/oauth2/authorizationcode",
    "accessTokenUrl": "https://your-instance.blackboard.com/learn/api/public/v1/oauth2/token"
  }
}
```

#### Security and Privacy

The LTI 1.3 extension implements:

- **JWT-based Security**: All messages signed with RS256 or ES256
- **OIDC Authentication**: Secure login flows with nonce validation
- **Privacy Controls**: Configurable data sharing and retention policies
- **Platform Verification**: Validation of platform registration and key rotation

#### Compliance

- **IMS Global Certified**: Follows IMS Global LTI 1.3 Advantage specification
- **FERPA Compliant**: Supports educational privacy requirements
- **GDPR Ready**: Includes data processing and consent mechanisms

### Future Extensions

Planned extensions for future releases:

- **SCORM/xAPI Extension** (v0.3.0): Learning analytics and experience tracking
- **QTI Extension** (v0.3.0): Question and Test Interoperability support
- **Accessibility Extension** (v0.4.0): Enhanced accessibility metadata and tools
- **Rights Management Extension** (v0.4.0): Digital rights management for commercial content

## Creating Custom Extensions

To create a custom extension:

1. **Define Schema**: Create a JSON Schema file following the pattern `your-extension.json`
2. **Set Schema ID**: Use the format `https://your-domain.com/extensions/your-extension/schema.json`
3. **Document Usage**: Provide comprehensive documentation and examples
4. **Test Compatibility**: Ensure the extension doesn't break core xats functionality
5. **Submit for Review**: Consider contributing back to the community

### Extension Guidelines

- Use the `extensions` property on any `XatsObject`
- Follow JSON Schema draft-07 specification
- Provide clear property descriptions and examples
- Include validation rules and constraints
- Document security and privacy implications

### Community Extensions

Community-contributed extensions can be found in the [xats Community Extensions](https://github.com/xats-org/community-extensions) repository.

## Support

For extension support:

- **Documentation**: See the [Extension Development Guide](../docs/guides/extension-guide.md)
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/xats-org/core/issues)
- **Discussions**: Join the conversation on [GitHub Discussions](https://github.com/xats-org/core/discussions)
- **Community**: Connect with other developers in the xats community
