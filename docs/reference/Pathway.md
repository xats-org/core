# `Pathway`

**Type:** `object`

---

### Description

A `Pathway` defines a set of conditional routing rules for creating adaptive, non-linear learning experiences. For a full explanation, see the [Pathway System Specification](./pathway-system.md).

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `trigger` | `object` | **Yes** | Defines the event that initiates the pathway check. Contains `triggerType` (URI) and an optional `sourceId` (string). |
| `rules` | `array` of rule objects | **Yes** | An ordered list of routing rules. Each rule contains a `condition` (string), a `destinationId` (string), and an optional `pathwayType` (URI). |