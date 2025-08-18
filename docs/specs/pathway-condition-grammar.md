# xats Pathway Condition Grammar Specification

**Version:** 0.1.0  
**Canonical URL:** `https://xats.org/specs/pathway-condition-grammar`  
**Status:** Draft

---

## 1. Introduction

The xats Pathway Condition Grammar defines a formal, machine-evaluatable expression language for conditional routing in adaptive learning paths. This specification provides:

- A formal EBNF grammar definition
- Validation rules and constraints
- Execution semantics
- Implementation guidelines
- Comprehensive examples

## 2. Design Principles

1. **Human Readable**: Conditions should be understandable by content authors
2. **Machine Parsable**: Unambiguous grammar suitable for automated parsing
3. **Safe Execution**: No arbitrary code execution or side effects
4. **Extensible**: Support for future variable types and operators
5. **Platform Agnostic**: Not tied to any specific programming language

## 3. Formal Grammar (EBNF)

```ebnf
(* Top-level condition *)
condition          ::= logical_or

(* Logical operators - left associative *)
logical_or         ::= logical_and ( "OR" logical_and )*
logical_and        ::= logical_not ( "AND" logical_not )*
logical_not        ::= "NOT" logical_not | comparison

(* Comparison expressions *)
comparison         ::= primary ( comparison_op primary )?
comparison_op      ::= "==" | "!=" | "<" | "<=" | ">" | ">=" | "IN" | "NOT IN"

(* Primary expressions *)
primary            ::= literal | variable | function_call | "(" logical_or ")"

(* Literals *)
literal            ::= number | string | boolean | array
number             ::= integer | decimal
integer            ::= "-"? digit+
decimal            ::= "-"? digit+ "." digit+
string             ::= '"' ( escape_char | non_quote_char )* '"'
boolean            ::= "true" | "false"
array              ::= "[" ( literal ( "," literal )* )? "]"

(* Variables *)
variable           ::= identifier ( "." identifier )*
identifier         ::= letter ( letter | digit | "_" )*

(* Function calls *)
function_call      ::= function_name "(" ( argument ( "," argument )* )? ")"
function_name      ::= "min" | "max" | "avg" | "count" | "exists" | "all" | "any"
argument           ::= logical_or

(* Character classes *)
digit              ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
letter             ::= "A".."Z" | "a".."z"
escape_char        ::= "\\" ( '"' | "\\" | "n" | "r" | "t" )
non_quote_char     ::= any character except '"' or '\'
```

## 4. Variable Namespace

### 4.1 Assessment Variables

Variables available after an assessment trigger:

| Variable | Type | Description |
|----------|------|-------------|
| `score` | number | Percentage score (0-100) |
| `score_raw` | number | Raw points earned |
| `score_max` | number | Maximum possible points |
| `attempts` | integer | Number of attempts made |
| `time_spent` | number | Time in seconds |
| `passed` | boolean | Whether passing threshold met |
| `completed` | boolean | Whether assessment was completed |
| `questions_correct` | integer | Number of correct answers |
| `questions_total` | integer | Total number of questions |

### 4.2 Progress Variables

Variables tracking learner progress:

| Variable | Type | Description |
|----------|------|-------------|
| `chapter_completed` | boolean | Current chapter completion status |
| `section_completed` | boolean | Current section completion status |
| `objectives_met` | array | IDs of met learning objectives |
| `objectives_total` | integer | Total learning objectives in context |
| `completion_percentage` | number | Overall completion (0-100) |

### 4.3 User Variables

Variables about the learner:

| Variable | Type | Description |
|----------|------|-------------|
| `user_level` | string | Proficiency level (e.g., "beginner", "intermediate", "advanced") |
| `user_choice` | string | User's selected option in choice points |
| `user_preference` | string | Learning style preference |
| `user_pace` | string | Learning pace ("slow", "normal", "fast") |

### 4.4 Context Variables

System and context information:

| Variable | Type | Description |
|----------|------|-------------|
| `current_id` | string | ID of current structural container |
| `source_id` | string | ID of trigger source (e.g., assessment) |
| `timestamp` | number | Unix timestamp of evaluation |
| `session_time` | number | Total session time in seconds |

## 5. Operator Semantics

### 5.1 Comparison Operators

| Operator | Description | Valid Types | Example |
|----------|-------------|-------------|---------|
| `==` | Equal to | all | `score == 80` |
| `!=` | Not equal to | all | `user_level != "beginner"` |
| `<` | Less than | number | `attempts < 3` |
| `<=` | Less than or equal | number | `score <= 70` |
| `>` | Greater than | number | `time_spent > 300` |
| `>=` | Greater than or equal | number | `completion_percentage >= 90` |
| `IN` | Contains (for arrays) | all | `"obj-1" IN objectives_met` |
| `NOT IN` | Does not contain | all | `"remedial" NOT IN user_preference` |

### 5.2 Logical Operators

| Operator | Description | Evaluation |
|----------|-------------|------------|
| `AND` | Logical conjunction | Both operands must be true |
| `OR` | Logical disjunction | At least one operand must be true |
| `NOT` | Logical negation | Inverts boolean value |

### 5.3 Operator Precedence (highest to lowest)

1. Parentheses `()`
2. Function calls
3. `NOT`
4. Comparison operators
5. `AND`
6. `OR`

## 6. Built-in Functions

### 6.1 Aggregate Functions

| Function | Description | Example |
|----------|-------------|---------|
| `min(a, b, ...)` | Minimum value | `min(score, 80) == score` |
| `max(a, b, ...)` | Maximum value | `max(attempts, 1) <= 3` |
| `avg(a, b, ...)` | Average value | `avg(score, prev_score) > 75` |
| `count(array)` | Array length | `count(objectives_met) >= 3` |

### 6.2 Predicate Functions

| Function | Description | Example |
|----------|-------------|---------|
| `exists(variable)` | Checks if variable is defined | `exists(user_choice)` |
| `all(array, condition)` | All elements match | `all(scores, score > 70)` |
| `any(array, condition)` | Any element matches | `any(attempts, attempt == 1)` |

## 7. Type Coercion Rules

1. **Number to Boolean**: 0 is `false`, all other numbers are `true`
2. **String to Boolean**: Empty string is `false`, all others are `true`
3. **Boolean to Number**: `false` is 0, `true` is 1
4. **Comparison with Different Types**: No implicit coercion; returns `false`

## 8. Validation Rules

### 8.1 Syntactic Validation

- Conditions MUST conform to the EBNF grammar
- String literals MUST be properly escaped
- Parentheses MUST be balanced
- Function names MUST be from the allowed set

### 8.2 Semantic Validation

- Variables SHOULD be from the documented namespace
- Type operations MUST be compatible
- Array operations require array types
- Numeric operations require numeric types

### 8.3 JSON Schema Pattern

For basic validation in the schema, use this regex pattern:

```regex
^(NOT\s+)?(\w+(\.\w+)*|\d+(\.\d+)?|"[^"]*"|true|false|\[[^\]]*\])(\s*(==|!=|<=?|>=?|IN|NOT\s+IN)\s*(\w+(\.\w+)*|\d+(\.\d+)?|"[^"]*"|true|false|\[[^\]]*\]))?((\s+(AND|OR)\s+.+)?|\s*\(.+\)\s*)?$
```

Note: This pattern provides basic validation. Full parsing requires a proper parser implementation.

## 9. Examples

### 9.1 Simple Comparisons

```javascript
// Score-based routing
score >= 80                  // Pass with distinction
score < 70                   // Needs remediation
score >= 70 AND score < 80   // Standard pass

// Attempt-based routing
attempts >= 3                // Maximum attempts reached
attempts == 1 AND score >= 90 // First attempt mastery
```

### 9.2 Complex Conditions

```javascript
// Multiple criteria for remediation
score < 70 OR time_spent < 60 OR NOT completed

// Advanced track eligibility
score >= 85 AND attempts <= 2 AND time_spent < 300

// Comprehensive mastery check
score >= 90 AND count(objectives_met) == objectives_total

// User preference with fallback
(user_choice == "advanced" AND score >= 80) OR 
(NOT exists(user_choice) AND score >= 85)
```

### 9.3 Array Operations

```javascript
// Check specific objectives
"obj-calc-1" IN objectives_met AND "obj-calc-2" IN objectives_met

// Check learning path
"remedial" NOT IN user_preference AND score < 70

// Count-based progression
count(objectives_met) >= 3
```

### 9.4 Function Usage

```javascript
// Average performance check
avg(score, prev_score) >= 75

// Minimum threshold with attempts
min(score, 100) >= 70 AND max(attempts, 1) <= 3

// Existence checks
exists(user_choice) AND user_choice == "challenge"

// Complex aggregation
count(objectives_met) >= objectives_total * 0.8
```

## 10. Implementation Guidelines

### 10.1 Parser Implementation

Implementations SHOULD:
1. Use a proper parsing library (e.g., PEG, ANTLR, or recursive descent)
2. Provide clear error messages with position information
3. Validate variable types against the schema
4. Support extension through custom functions

### 10.2 Security Considerations

Implementations MUST:
1. Never execute arbitrary code
2. Validate all variable references
3. Prevent infinite loops in evaluation
4. Limit expression complexity
5. Sanitize string values

### 10.3 Performance Considerations

Implementations SHOULD:
1. Cache parsed expressions
2. Optimize common patterns
3. Short-circuit logical operations
4. Limit recursion depth

## 11. Error Handling

### 11.1 Parse Errors

| Error | Description | Example |
|-------|-------------|---------|
| `SYNTAX_ERROR` | Invalid syntax | `score == = 80` |
| `UNBALANCED_PARENS` | Mismatched parentheses | `(score > 70))` |
| `INVALID_OPERATOR` | Unknown operator | `score ?? 80` |
| `INVALID_FUNCTION` | Unknown function | `random()` |

### 11.2 Runtime Errors

| Error | Description | Example |
|-------|-------------|---------|
| `UNDEFINED_VARIABLE` | Variable not in context | `undefined_var > 0` |
| `TYPE_ERROR` | Invalid type for operation | `"text" > 5` |
| `DIVISION_BY_ZERO` | Mathematical error | `score / 0` |
| `NULL_REFERENCE` | Accessing property of null | `null.property` |

## 12. Future Extensions

### 12.1 Planned for v0.2.0

- Regular expression matching: `user_input MATCHES "^[A-Z]+$"`
- Date/time operations: `timestamp > "2024-01-01T00:00:00Z"`
- String operations: `length()`, `substring()`, `contains()`
- Mathematical functions: `round()`, `floor()`, `ceil()`, `abs()`

### 12.2 Under Consideration

- Custom function registration
- External data source queries
- Statistical functions
- Machine learning score integration

## 13. Conformance

### 13.1 Minimal Conformance

A minimal implementation MUST support:
- Basic comparisons (`==`, `!=`, `<`, `>`, `<=`, `>=`)
- Logical operators (`AND`, `OR`, `NOT`)
- Number and boolean literals
- Simple variable references

### 13.2 Full Conformance

A fully conformant implementation MUST support:
- All operators and functions defined in this specification
- Complete type system
- Array operations
- Nested expressions with proper precedence

## 14. References

- [xats Pathway System Specification](./pathway-system.md)
- [JSON Schema Draft-07](https://json-schema.org/draft-07/json-schema-release-notes.html)
- [EBNF ISO/IEC 14977](https://www.iso.org/standard/26153.html)

## Appendix A: Quick Reference Card

### Common Patterns

```javascript
// Basic threshold
score >= 70

// Range check
score >= 70 AND score < 90

// Multiple attempts with improvement
attempts > 1 AND score > prev_score

// Time-based routing
time_spent < 120 AND score >= 80

// Objective-based progression
count(objectives_met) >= objectives_total * 0.75

// User choice with condition
user_choice == "advanced" AND score >= 85

// Fallback chain
(score >= 90) OR (score >= 80 AND attempts == 1) OR (score >= 70 AND time_spent > 300)
```

### Variable Quick Reference

| Category | Common Variables |
|----------|-----------------|
| Assessment | `score`, `attempts`, `passed`, `time_spent` |
| Progress | `completed`, `objectives_met`, `completion_percentage` |
| User | `user_choice`, `user_level`, `user_preference` |
| Context | `current_id`, `source_id`, `timestamp` |