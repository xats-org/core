# `SkipNavigationContent`

**Type:** `object`

---

## Description

Content structure for skip navigation blocks that provide keyboard shortcuts to important page sections. Essential for WCAG 2.4.1 compliance, allowing users (especially those using screen readers or keyboard navigation) to quickly bypass repetitive content and navigate directly to main content areas.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `skipLinks` | `array` of skip link objects | **Yes** | Array of skip links for keyboard navigation to important page sections. |
| `visible` | `boolean` | No | Whether skip links should be visible by default (false = show on focus). Default: false. |

### Skip Link Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier for this skip link. |
| `label` | `string` | **Yes** | Text shown for the skip link (e.g., "Skip to main content", "Skip to navigation"). |
| `destinationId` | `string` | **Yes** | ID of the target element to skip to when activated. |
| `accessKey` | `string` | No | Optional access key (single character) for keyboard shortcut activation. |

---

## Usage Example

```json
{
  "skipLinks": [
    {
      "id": "skip-main",
      "label": "Skip to main content",
      "destinationId": "main-content-area",
      "accessKey": "1"
    },
    {
      "id": "skip-nav",
      "label": "Skip to navigation",
      "destinationId": "primary-navigation",
      "accessKey": "2"
    },
    {
      "id": "skip-search",
      "label": "Skip to search",
      "destinationId": "search-section",
      "accessKey": "3"
    }
  ],
  "visible": false
}
```

---

## Related Objects

- [NavigationContent](./NavigationContent.md) - Complementary navigation feature for structured navigation
- [ContentBlock](./ContentBlock.md) - Contains skip navigation content when blockType is skipNavigation
- [AccessibilityMetadata](./AccessibilityMetadata.md) - Related accessibility configuration

---

## Notes

- Skip links are typically hidden by default and shown when they receive keyboard focus
- **WCAG 2.4.1 compliance**: Skip links must be among the first interactive elements on a page
- Common skip targets include main content, navigation menus, search functionality, and sidebar content
- Access keys provide additional keyboard shortcuts but should be used carefully to avoid conflicts
- Skip links should be styled to be clearly visible when focused
- Destination IDs must reference existing elements that can receive focus or have tabindex attributes
- Skip navigation is particularly important for users with motor disabilities or who rely on keyboard navigation