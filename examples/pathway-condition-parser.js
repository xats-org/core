/**
 * Example Implementation of xats Pathway Condition Parser
 * 
 * This is a reference implementation showing how to parse and evaluate
 * pathway conditions according to the xats Pathway Condition Grammar.
 * 
 * Note: This is a simplified example for demonstration purposes.
 * Production implementations should use proper parsing libraries.
 */

class PathwayConditionParser {
  constructor() {
    // Define operator precedence (higher number = higher precedence)
    this.precedence = {
      'OR': 1,
      'AND': 2,
      'NOT': 3,
      '==': 4,
      '!=': 4,
      '<': 4,
      '<=': 4,
      '>': 4,
      '>=': 4,
      'IN': 4,
      'NOT IN': 4
    };

    // Define available functions
    this.functions = {
      min: (...args) => Math.min(...args),
      max: (...args) => Math.max(...args),
      avg: (...args) => args.reduce((a, b) => a + b, 0) / args.length,
      count: (arr) => Array.isArray(arr) ? arr.length : 0,
      exists: (val) => val !== undefined && val !== null,
      all: (arr, condition) => arr.every(item => this.evaluateCondition(condition, { item })),
      any: (arr, condition) => arr.some(item => this.evaluateCondition(condition, { item }))
    };
  }

  /**
   * Tokenize the condition string into tokens
   * @param {string} condition - The condition string to tokenize
   * @returns {Array} Array of tokens
   */
  tokenize(condition) {
    const tokens = [];
    const regex = /("(?:[^"\\]|\\.)*")|(\d+\.?\d*)|([a-zA-Z_]\w*(?:\.\w+)*)|(\(|\))|(\[|\]|,)|(==|!=|<=|>=|<|>|NOT\s+IN|IN|AND|OR|NOT)/g;
    let match;

    while ((match = regex.exec(condition)) !== null) {
      const token = match[0];
      if (token && token.trim()) {
        tokens.push(token.trim());
      }
    }

    return tokens;
  }

  /**
   * Parse tokens into an Abstract Syntax Tree (AST)
   * @param {Array} tokens - Array of tokens
   * @returns {Object} AST representation
   */
  parse(tokens) {
    let index = 0;

    const parseExpression = (minPrecedence = 0) => {
      let left = parsePrimary();

      while (index < tokens.length) {
        const op = tokens[index];
        const prec = this.precedence[op];

        if (!prec || prec < minPrecedence) break;

        index++;
        const right = parseExpression(prec + 1);
        left = { type: 'binary', operator: op, left, right };
      }

      return left;
    };

    const parsePrimary = () => {
      const token = tokens[index];

      // Handle NOT operator
      if (token === 'NOT') {
        index++;
        return { type: 'unary', operator: 'NOT', operand: parsePrimary() };
      }

      // Handle parentheses
      if (token === '(') {
        index++;
        const expr = parseExpression();
        if (tokens[index] === ')') index++;
        return expr;
      }

      // Handle functions
      if (tokens[index + 1] === '(') {
        const funcName = token;
        index += 2; // Skip function name and opening paren
        const args = [];
        
        while (tokens[index] !== ')') {
          args.push(parseExpression());
          if (tokens[index] === ',') index++;
        }
        index++; // Skip closing paren
        
        return { type: 'function', name: funcName, arguments: args };
      }

      // Handle arrays
      if (token === '[') {
        index++;
        const elements = [];
        
        while (tokens[index] !== ']') {
          elements.push(parsePrimary());
          if (tokens[index] === ',') index++;
        }
        index++; // Skip closing bracket
        
        return { type: 'array', elements };
      }

      // Handle literals and variables
      index++;

      // String literal
      if (token.startsWith('"')) {
        return { type: 'string', value: token.slice(1, -1) };
      }

      // Boolean literal
      if (token === 'true' || token === 'false') {
        return { type: 'boolean', value: token === 'true' };
      }

      // Number literal
      if (/^-?\d+\.?\d*$/.test(token)) {
        return { type: 'number', value: parseFloat(token) };
      }

      // Variable
      return { type: 'variable', name: token };
    };

    return parseExpression();
  }

  /**
   * Evaluate an AST node with given context
   * @param {Object} node - AST node
   * @param {Object} context - Variable context
   * @returns {*} Evaluation result
   */
  evaluate(node, context) {
    switch (node.type) {
      case 'number':
      case 'string':
      case 'boolean':
        return node.value;

      case 'array':
        return node.elements.map(el => this.evaluate(el, context));

      case 'variable':
        const parts = node.name.split('.');
        let value = context;
        for (const part of parts) {
          value = value?.[part];
        }
        return value;

      case 'function':
        const func = this.functions[node.name];
        if (!func) throw new Error(`Unknown function: ${node.name}`);
        const args = node.arguments.map(arg => this.evaluate(arg, context));
        return func(...args);

      case 'unary':
        if (node.operator === 'NOT') {
          return !this.evaluate(node.operand, context);
        }
        throw new Error(`Unknown unary operator: ${node.operator}`);

      case 'binary':
        const left = this.evaluate(node.left, context);
        const right = this.evaluate(node.right, context);

        switch (node.operator) {
          case '==': return left == right;
          case '!=': return left != right;
          case '<': return left < right;
          case '<=': return left <= right;
          case '>': return left > right;
          case '>=': return left >= right;
          case 'AND': return left && right;
          case 'OR': return left || right;
          case 'IN': 
            return Array.isArray(right) ? right.includes(left) : false;
          case 'NOT IN':
            return Array.isArray(right) ? !right.includes(left) : true;
          default:
            throw new Error(`Unknown binary operator: ${node.operator}`);
        }

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  /**
   * Parse and evaluate a condition string
   * @param {string} condition - Condition string
   * @param {Object} context - Variable context
   * @returns {boolean} Evaluation result
   */
  evaluateCondition(condition, context = {}) {
    try {
      const tokens = this.tokenize(condition);
      const ast = this.parse(tokens);
      return this.evaluate(ast, context);
    } catch (error) {
      console.error(`Error evaluating condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Validate a condition string
   * @param {string} condition - Condition to validate
   * @returns {Object} Validation result
   */
  validate(condition) {
    try {
      // Check for empty condition
      if (!condition || condition.trim() === '') {
        return { valid: false, error: 'Empty condition' };
      }

      const tokens = this.tokenize(condition);
      
      // Check for invalid operators
      const invalidOps = tokens.filter(t => t === '<>' || t === '==' && tokens[tokens.indexOf(t) + 1] === '=');
      if (invalidOps.length > 0) {
        return { valid: false, error: `Invalid operator: ${invalidOps[0]}` };
      }

      // Check parentheses balance
      let parenCount = 0;
      for (const token of tokens) {
        if (token === '(') parenCount++;
        if (token === ')') parenCount--;
        if (parenCount < 0) {
          return { valid: false, error: 'Unbalanced parentheses' };
        }
      }
      if (parenCount !== 0) {
        return { valid: false, error: 'Unbalanced parentheses' };
      }

      // Parse and check for unknown functions
      const ast = this.parse(tokens);
      const checkFunctions = (node) => {
        if (node.type === 'function' && !this.functions[node.name]) {
          throw new Error(`Unknown function: ${node.name}`);
        }
        if (node.left) checkFunctions(node.left);
        if (node.right) checkFunctions(node.right);
        if (node.operand) checkFunctions(node.operand);
        if (node.arguments) node.arguments.forEach(checkFunctions);
      };
      checkFunctions(ast);
      
      // Validation passed
      return {
        valid: true,
        ast,
        tokens
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

// Example usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PathwayConditionParser;
}

// Demonstration
const parser = new PathwayConditionParser();

// Example conditions from the specification
const examples = [
  {
    condition: 'score >= 70',
    context: { score: 85 },
    expected: true
  },
  {
    condition: 'score < 70 AND attempts >= 3',
    context: { score: 65, attempts: 3 },
    expected: true
  },
  {
    condition: 'score >= 80 OR time_spent > 600',
    context: { score: 75, time_spent: 700 },
    expected: true
  },
  {
    condition: 'user_choice == "advanced" AND score >= 85',
    context: { user_choice: 'advanced', score: 90 },
    expected: true
  },
  {
    condition: 'count(objectives_met) >= 3',
    context: { objectives_met: ['obj-1', 'obj-2', 'obj-3', 'obj-4'] },
    expected: true
  },
  {
    condition: '"obj-1" IN objectives_met',
    context: { objectives_met: ['obj-1', 'obj-2'] },
    expected: true
  },
  {
    condition: 'NOT passed AND attempts < 3',
    context: { passed: false, attempts: 2 },
    expected: true
  },
  {
    condition: 'exists(user_choice) AND user_choice == "challenge"',
    context: { user_choice: 'challenge' },
    expected: true
  },
  {
    condition: 'min(score, 100) >= 70 AND max(attempts, 1) <= 3',
    context: { score: 85, attempts: 2 },
    expected: true
  }
];

console.log('xats Pathway Condition Parser - Test Results\n');
console.log('=' .repeat(60));

examples.forEach(({ condition, context, expected }) => {
  const result = parser.evaluateCondition(condition, context);
  const status = result === expected ? '✓' : '✗';
  
  console.log(`\nCondition: ${condition}`);
  console.log(`Context: ${JSON.stringify(context)}`);
  console.log(`Result: ${result} ${status}`);
  
  if (result !== expected) {
    console.log(`ERROR: Expected ${expected}, got ${result}`);
  }
});

console.log('\n' + '=' .repeat(60));
console.log('\nValidation Examples:');

const validationTests = [
  'score >= 70',
  'score == = 80',  // Invalid: double equals
  '(score > 70))',  // Invalid: unbalanced parens
  'unknown_func()',  // Invalid: unknown function
  'score <> 70'      // Invalid: unknown operator
];

validationTests.forEach(condition => {
  const result = parser.validate(condition);
  console.log(`\n"${condition}": ${result.valid ? 'Valid' : `Invalid - ${result.error}`}`);
});