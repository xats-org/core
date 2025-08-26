#!/usr/bin/env node

/**
 * Schema Validation Script
 * Validates all xats schema versions against JSON Schema specifications
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// Schema cache for external schemas
const schemaCache = new Map();

/**
 * Fetch external schema with caching
 */
async function fetchExternalSchema(uri) {
  if (schemaCache.has(uri)) {
    return schemaCache.get(uri);
  }

  return new Promise((resolve, reject) => {
    const url = new URL(uri);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'User-Agent': 'xats-schema-validator/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.get(options, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchExternalSchema(res.headers.location)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${uri}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const schema = JSON.parse(data);
          schemaCache.set(uri, schema);
          resolve(schema);
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${uri}: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.abort();
      reject(new Error(`Timeout fetching ${uri}`));
    });
  });
}

/**
 * Validate a schema file
 */
async function validateSchema(schemaPath, version) {
  console.log(`\nValidating schema version: ${version}`);
  console.log('─'.repeat(40));

  try {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(schemaContent);

    // Basic structural validation
    const errors = [];

    // Check required top-level properties
    if (!schema.$schema) {
      errors.push('Missing $schema declaration');
    }
    if (!schema.$id) {
      errors.push('Missing $id property');
    }
    if (!schema.title) {
      errors.push('Missing title property');
    }
    if (!schema.type) {
      errors.push('Missing type property');
    }

    // Check if CSL reference URL is correct
    const schemaStr = JSON.stringify(schema);
    if (schemaStr.includes('raw.githubusercontent.com/citation-style-language')) {
      errors.push('Schema contains outdated CSL reference URL');
    }

    // Verify CSL reference URL is accessible
    if (schemaStr.includes('resource.citationstyles.org')) {
      console.log('  Checking CSL reference URL...');
      try {
        const cslUrl = 'https://resource.citationstyles.org/schema/v1.0/input/json/csl-data.json';
        await fetchExternalSchema(cslUrl);
        console.log('  ✅ CSL reference URL is accessible');
      } catch (e) {
        errors.push(`CSL reference URL is not accessible: ${e.message}`);
      }
    }

    // Report results
    if (errors.length === 0) {
      console.log(`  ✅ Schema ${version} is valid`);
      return true;
    } else {
      console.log(`  ❌ Schema ${version} has validation errors:`);
      errors.forEach(err => console.log(`     - ${err}`));
      return false;
    }

  } catch (error) {
    console.log(`  ❌ Failed to process schema: ${error.message}`);
    return false;
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('XATS Schema Validation');
  console.log('='.repeat(60));

  const schemasDir = path.join(__dirname, '..', 'schemas');
  const versions = ['0.1.0', '0.2.0', '0.3.0', '0.5.0', 'latest'];
  const results = [];

  for (const version of versions) {
    const schemaPath = path.join(schemasDir, version, 'xats.json');
    if (fs.existsSync(schemaPath)) {
      const isValid = await validateSchema(schemaPath, version);
      results.push({ version, isValid });
    } else {
      console.log(`\n⚠️  Schema file not found for version ${version}`);
      results.push({ version, isValid: false });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Validation Summary');
  console.log('='.repeat(60));

  let allValid = true;
  results.forEach(({ version, isValid }) => {
    console.log(`  ${isValid ? '✅' : '❌'} ${version}`);
    if (!isValid) allValid = false;
  });

  if (!allValid) {
    console.log('\n❌ Schema validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All schemas are valid!');
    process.exit(0);
  }
}

// Run validation
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});