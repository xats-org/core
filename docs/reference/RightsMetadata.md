# `RightsMetadata`

**Type:** `object`

---

## Description

Comprehensive rights and intellectual property metadata for content and resources. Supports commercial adoption through clear licensing, copyright, and usage permissions. Essential for educational institutions, publishers, and content creators who need to manage and communicate usage rights effectively.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `license` | `string` (URI) | **Yes** | Primary license governing the use of this content. Must be a valid URI from the xats license vocabulary. |
| `copyrightHolder` | `string` | No | Primary copyright holder or owner of the intellectual property. |
| `copyrightYear` | `string` | No | Year or range of years for the copyright (e.g., '2023', '2020-2023'). |
| `additionalCopyrightHolders` | `array` of copyright holder objects | No | Additional copyright holders or contributors with specific rights. |
| `permissions` | permissions object | No | Specific permissions granted for this content. |
| `restrictions` | restrictions object | No | Specific restrictions or conditions on usage. |
| `attribution` | attribution object | No | Required attribution information and format. |
| `expirationDate` | `string` (date) | No | Optional expiration date after which rights may change (ISO 8601 format). |
| `licenseUrl` | `string` (URI) | No | URL to the full license text or legal document. |
| `rightsStatement` | `string` | No | Human-readable rights statement or additional legal information. |
| `contactInfo` | contact info object | No | Contact information for licensing inquiries or permissions. |

### Additional Copyright Holder Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Name of the copyright holder. |
| `year` | `string` | **Yes** | Year or range of years for this holder's copyright. |
| `contribution` | `string` | No | Description of this holder's specific contribution. |

### Permissions Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `redistribute` | `boolean` | No | Whether redistribution is permitted. |
| `modify` | `boolean` | No | Whether modification/adaptation is permitted. |
| `commercialUse` | `boolean` | No | Whether commercial use is permitted. |
| `createDerivatives` | `boolean` | No | Whether derivative works may be created. |
| `shareAlike` | `boolean` | No | Whether derivative works must be shared under the same license. |

### Restrictions Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `noCommercialUse` | `boolean` | No | Commercial use is explicitly prohibited. |
| `noDerivatives` | `boolean` | No | Creating derivative works is prohibited. |
| `educationalUseOnly` | `boolean` | No | Content may only be used for educational purposes. |
| `institutionalUseOnly` | `boolean` | No | Content may only be used within specific institutions. |
| `geographicRestrictions` | `array` of `string`s | No | Geographic regions where usage restrictions apply. |

### Attribution Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `required` | `boolean` | No | Whether attribution is required. |
| `format` | `string` | No | Specific format or text required for attribution. |
| `includeUrl` | `boolean` | No | Whether the source URL must be included in attribution. |
| `includeLicense` | `boolean` | No | Whether the license must be mentioned in attribution. |

### Contact Info Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` (email) | No | Email address for licensing inquiries. |
| `organization` | `string` | No | Organization name for licensing contact. |
| `url` | `string` (URI) | No | Website URL for licensing information. |

---

## Usage Example

```json
{
  "license": "https://xats.org/licenses/cc-by-sa-4.0",
  "copyrightHolder": "State University Educational Content Team",
  "copyrightYear": "2023",
  "additionalCopyrightHolders": [
    {
      "name": "Dr. Sarah Johnson",
      "year": "2023",
      "contribution": "Primary author of Chapter 3-5"
    }
  ],
  "permissions": {
    "redistribute": true,
    "modify": true,
    "commercialUse": true,
    "createDerivatives": true,
    "shareAlike": true
  },
  "attribution": {
    "required": true,
    "format": "Copyright © 2023 State University Educational Content Team. Licensed under CC BY-SA 4.0.",
    "includeUrl": true,
    "includeLicense": true
  },
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "contactInfo": {
    "email": "licensing@stateuniversity.edu",
    "organization": "State University Press",
    "url": "https://press.stateuniversity.edu/licensing"
  }
}
```

---

## Related Objects

- [XatsObject](./XatsObject.md) - Can include rights metadata for individual objects
- [Resource](./Resource.md) - Can include specific rights metadata that overrides document-level rights
- Document root - Can include default rights metadata for the entire document

---

## Notes

- Rights metadata can be specified at the document level and overridden for specific resources or objects
- **License URIs** should use the xats license vocabulary for consistency and interoperability
- **Commercial use permissions** are essential for publishers and educational technology companies
- **Attribution requirements** help ensure proper credit while enabling content reuse
- **Geographic restrictions** may be necessary for content with regional licensing agreements
- Rights metadata supports both open educational resources (OER) and proprietary content models
- Clear rights information facilitates legal compliance and reduces licensing uncertainty