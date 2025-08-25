#!/bin/bash

# Build script for pub.xats.org local development and testing
# This script mirrors the GitHub Actions workflow for local testing

set -e

echo "🚀 Building pub.xats.org assets locally..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf pub-site storybook-static

# Install dependencies if needed
echo "📦 Installing dependencies..."
pnpm install

# Build all packages
echo "🔨 Building packages..."
pnpm run build

# Build Storybook for pub site
echo "📖 Building Storybook..."
export DEPLOY_TARGET=pub-site
export NODE_ENV=production
pnpm run storybook:build

# Create pub-site directory structure
echo "📁 Creating directory structure..."
mkdir -p pub-site/{docs,schemas,examples,storybook}

# Copy Storybook
echo "📚 Copying Storybook..."
cp -r storybook-static/* pub-site/storybook/

# Copy schemas
echo "🔗 Copying schemas..."
cp -r packages/schema/schemas/* pub-site/schemas/

# Copy examples
echo "💾 Copying examples..."
cp -r examples/* pub-site/examples/

# Copy documentation
echo "📄 Copying documentation..."
cp -r docs/* pub-site/docs/

# Copy CNAME for custom domain
echo "🌐 Setting up domain..."
cp static/CNAME pub-site/

# Generate index pages (simplified versions of what's in the workflow)
echo "🏠 Creating landing pages..."

# Main index page
cat > pub-site/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>xats Public Resources</title>
    <meta name="description" content="JSON Schemas, documentation, examples, and component library for the eXtensible Academic Text Standard">
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 2rem; 
            background: #f6f8fa;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 3rem; }
        .header h1 { color: #24292f; margin-bottom: 0.5rem; }
        .header p { color: #57606a; font-size: 1.2em; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .card { 
            background: white; 
            border-radius: 8px; 
            padding: 2rem; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: box-shadow 0.2s;
        }
        .card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .card h2 { margin-top: 0; color: #0969da; }
        .card p { color: #57606a; margin-bottom: 1.5rem; }
        .btn { 
            display: inline-block; 
            background: #238636; 
            color: white; 
            padding: 0.75rem 1.5rem; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 600;
            transition: background 0.2s;
        }
        .btn:hover { background: #2ea043; }
        .btn-primary { background: #0969da; }
        .btn-primary:hover { background: #0860ca; }
        .footer { 
            text-align: center; 
            margin-top: 3rem; 
            padding-top: 2rem; 
            border-top: 1px solid #d0d7de; 
            color: #57606a;
        }
        .footer a { color: #0969da; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>xats Public Resources</h1>
            <p>JSON Schemas, documentation, examples, and component library for the eXtensible Academic Text Standard</p>
        </header>
        
        <div class="grid">
            <div class="card">
                <h2>🧩 Component Library</h2>
                <p>Interactive Storybook showcasing xats renderer components with live examples and documentation.</p>
                <a href="storybook/" class="btn btn-primary">Browse Components</a>
            </div>
            
            <div class="card">
                <h2>📋 JSON Schemas</h2>
                <p>Official JSON Schema definitions for all versions of the xats standard. Use these for validation and tooling.</p>
                <a href="schemas/" class="btn">Download Schemas</a>
            </div>
            
            <div class="card">
                <h2>📚 Documentation</h2>
                <p>Complete guides, API reference, and specifications for implementing and using the xats standard.</p>
                <a href="docs/" class="btn">Read Documentation</a>
            </div>
            
            <div class="card">
                <h2>💾 Example Documents</h2>
                <p>Real-world examples demonstrating xats features, from minimal documents to complex textbooks.</p>
                <a href="examples/" class="btn">View Examples</a>
            </div>
        </div>
        
        <footer class="footer">
            <p>Part of the <a href="https://xats.org">xats.org</a> ecosystem • 
            <a href="https://github.com/xats-org/core">Source on GitHub</a></p>
        </footer>
    </div>
</body>
</html>
EOF

# Schemas index page
cat > pub-site/schemas/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>xats JSON Schemas</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 2rem; }
        .nav { background: #f6f8fa; padding: 1rem; border-radius: 6px; margin-bottom: 2rem; }
        .nav a { margin-right: 1rem; color: #0969da; text-decoration: none; }
        .nav a:hover { text-decoration: underline; }
        .version-card { border: 1px solid #d0d7de; border-radius: 6px; padding: 1rem; margin: 1rem 0; }
        .version-card h3 { margin-top: 0; color: #24292f; }
        .schema-link { display: inline-block; background: #238636; color: white; padding: 0.5rem 1rem; border-radius: 4px; text-decoration: none; margin-right: 0.5rem; }
        .schema-link:hover { background: #2ea043; }
        .latest { background: #0969da; }
        .latest:hover { background: #0860ca; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="../">← Back to Home</a>
        <a href="../storybook/">Storybook</a>
        <a href="../docs/">Documentation</a>
        <a href="../examples/">Examples</a>
    </div>
    <h1>xats JSON Schemas</h1>
    <p>JSON Schema definitions for all versions of the xats standard.</p>
    
    <div class="version-card">
        <h3>Latest Version</h3>
        <p>Always points to the most current stable release.</p>
        <a href="latest/xats.json" class="schema-link latest">Download latest/xats.json</a>
    </div>
    
    <div class="version-card">
        <h3>Version 0.5.0 (Current)</h3>
        <p>Enhanced rendering, collaborative features, and registry system.</p>
        <a href="0.5.0/xats.json" class="schema-link">Download v0.5.0/xats.json</a>
        <a href="0.5.0/registry/registry.schema.json" class="schema-link">Registry Schema</a>
        <a href="0.5.0/registry/cache.schema.json" class="schema-link">Cache Schema</a>
    </div>
    
    <div class="version-card">
        <h3>Version 0.3.0</h3>
        <p>Extended features and ecosystem integrations.</p>
        <a href="0.3.0/xats.json" class="schema-link">Download v0.3.0/xats.json</a>
    </div>
    
    <div class="version-card">
        <h3>Version 0.2.0</h3>
        <p>Assessment framework and enhanced pedagogy features.</p>
        <a href="0.2.0/xats.json" class="schema-link">Download v0.2.0/xats.json</a>
    </div>
    
    <div class="version-card">
        <h3>Version 0.1.0</h3>
        <p>Initial stable release with core functionality.</p>
        <a href="0.1.0/xats.json" class="schema-link">Download v0.1.0/xats.json</a>
    </div>
    
    <h2>Usage</h2>
    <p>To validate a xats document, reference the appropriate schema URL:</p>
    <pre><code>https://pub.xats.org/schemas/latest/xats.json</code></pre>
    <p>For version-specific validation, use:</p>
    <pre><code>https://pub.xats.org/schemas/v0.5.0/xats.json</code></pre>
</body>
</html>
EOF

echo "✅ Build complete!"
echo ""
echo "🌐 To test locally, run:"
echo "   pnpm run serve:pub-site"
echo "   or:"
echo "   npx http-server pub-site -p 8080"
echo ""
echo "📁 Built assets are in the 'pub-site' directory"