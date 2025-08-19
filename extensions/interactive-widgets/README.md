# Interactive Widgets Extension

The Interactive Widgets extension enables embedding of interactive simulations, diagrams, and visualizations within xats educational content. This extension supports various educational widget providers and allows for rich, engaging learning experiences.

## Overview

- **Extension ID**: `https://xats.org/extensions/interactive-widgets/schema.json`
- **Version**: 1.0.0
- **Compatibility**: xats v0.2.0+

## Features

### Widget Types
- **Simulations**: PhET simulations, virtual labs, physics/chemistry simulations
- **Diagrams**: Interactive diagrams, flowcharts, concept maps
- **Charts & Graphs**: Data visualizations, plotting tools
- **3D Models**: Three-dimensional interactive models
- **Maps**: Geographic and conceptual maps
- **Calculators**: Mathematical and scientific calculators
- **Games**: Educational games and gamified learning
- **Timelines**: Interactive historical and process timelines

### Supported Providers
- **PhET Simulations**: University of Colorado's interactive simulations
- **GeoGebra**: Mathematical visualization and graphing
- **Desmos**: Graphing calculator and mathematical modeling
- **Plotly**: Interactive data visualization
- **D3.js**: Custom data visualizations
- **Three.js**: 3D graphics and modeling
- **Unity WebGL**: Game-based learning experiences
- **Custom**: Self-hosted or custom widget implementations

## Usage Examples

### Basic Physics Simulation

```json
{
  "id": "pendulum-sim",
  "blockType": "https://xats.org/core/blocks/interactive",
  "content": {
    "title": "Simple Pendulum Simulation",
    "description": "Explore how length and gravity affect pendulum motion"
  },
  "extensions": {
    "interactiveWidget": {
      "widgetType": "simulation",
      "title": "Simple Pendulum",
      "description": "Interactive simulation showing pendulum motion with adjustable parameters",
      "provider": "phet-simulations",
      "src": "https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_en.html",
      "version": "1.0.0",
      "dimensions": {
        "width": "800px",
        "height": "600px",
        "responsive": true
      },
      "parameters": {
        "pendulumLength": 1.0,
        "gravity": 9.8,
        "damping": 0.1,
        "showGrid": true,
        "showRuler": true
      },
      "interactivity": {
        "allowUserInput": true,
        "resetable": true,
        "fullscreenEnabled": true
      },
      "learningObjectives": [
        "Understand relationship between pendulum length and period",
        "Observe effects of gravity on pendulum motion",
        "Analyze energy transformations in oscillatory motion"
      ],
      "accessibility": {
        "keyboardNavigable": true,
        "screenReaderSupport": "basic",
        "alternativeDescription": "Interactive pendulum simulation with controls for length, gravity, and damping. Shows real-time motion and measurements."
      },
      "fallback": {
        "type": "image",
        "content": "/images/pendulum-diagram.png",
        "altText": "Diagram showing pendulum motion with length and angle labels"
      }
    }
  }
}
```

### Interactive Mathematical Graph

```json
{
  "id": "quadratic-explorer",
  "blockType": "https://xats.org/core/blocks/interactive",
  "content": {
    "title": "Quadratic Function Explorer",
    "description": "Visualize how coefficients affect quadratic function graphs"
  },
  "extensions": {
    "interactiveWidget": {
      "widgetType": "graph",
      "title": "Quadratic Function Explorer",
      "description": "Interactive graphing tool for exploring quadratic functions",
      "provider": "desmos",
      "src": "https://www.desmos.com/calculator/embed",
      "parameters": {
        "expressions": [
          "y = ax^2 + bx + c",
          "a = 1",
          "b = 0", 
          "c = 0"
        ],
        "sliders": [
          {"variable": "a", "min": -5, "max": 5, "step": 0.1},
          {"variable": "b", "min": -10, "max": 10, "step": 0.5},
          {"variable": "c", "min": -10, "max": 10, "step": 0.5}
        ],
        "graphSettings": {
          "xAxisLabel": "x",
          "yAxisLabel": "y", 
          "gridLines": true
        }
      },
      "dimensions": {
        "width": "100%",
        "height": "400px",
        "aspectRatio": "4:3"
      },
      "dataCollection": {
        "enabled": true,
        "events": ["parameter-change", "reset"],
        "privacyLevel": "anonymous"
      }
    }
  }
}
```

### 3D Molecular Model

```json
{
  "id": "water-molecule",
  "blockType": "https://xats.org/core/blocks/interactive",
  "content": {
    "title": "Water Molecule Structure",
    "description": "3D interactive model of H₂O showing molecular geometry"
  },
  "extensions": {
    "interactiveWidget": {
      "widgetType": "3d-model",
      "title": "Water Molecule 3D Model",
      "provider": "custom",
      "src": "https://education-widgets.com/molecules/water.html",
      "parameters": {
        "molecule": "H2O",
        "showBonds": true,
        "showElectrons": false,
        "rotationEnabled": true,
        "labelAtoms": true,
        "backgroundStyle": "gradient"
      },
      "dimensions": {
        "width": "400px",
        "height": "400px",
        "responsive": true
      },
      "interactivity": {
        "allowUserInput": true,
        "resetable": true,
        "saveState": false
      },
      "accessibility": {
        "alternativeDescription": "3D model of water molecule showing two hydrogen atoms bonded to one oxygen atom at 104.5 degree angle",
        "keyboardNavigable": true
      },
      "security": {
        "sandbox": ["allow-scripts", "allow-same-origin"],
        "trustedDomains": ["education-widgets.com"]
      }
    }
  }
}
```

### Widget Collection for Cell Biology Unit

```json
{
  "extensions": {
    "widgetCollection": {
      "collectionId": "cell-biology-widgets",
      "title": "Cell Biology Interactive Collection",
      "description": "Series of interactive widgets for exploring cell structure and function",
      "widgets": [
        {
          "widgetType": "diagram",
          "title": "Cell Structure Explorer",
          "provider": "custom",
          "src": "/widgets/cell-structure.html",
          "parameters": {
            "cellType": "animal",
            "labelMode": "interactive",
            "zoomEnabled": true
          }
        },
        {
          "widgetType": "simulation", 
          "title": "Osmosis Simulator",
          "provider": "phet-simulations",
          "src": "https://phet.colorado.edu/sims/html/membrane/latest/membrane_en.html"
        },
        {
          "widgetType": "virtual-lab",
          "title": "Cell Division Lab",
          "provider": "custom",
          "src": "/labs/mitosis-lab.html"
        }
      ],
      "sequence": [
        {
          "widgetIndex": 0,
          "instructions": "Start by exploring the basic structure of an animal cell",
          "duration": 10
        },
        {
          "widgetIndex": 1, 
          "instructions": "Investigate how cell membranes regulate what enters and leaves cells",
          "duration": 15
        },
        {
          "widgetIndex": 2,
          "instructions": "Observe the process of cell division in the virtual lab",
          "duration": 20
        }
      ],
      "assessmentIntegration": {
        "collectResponses": true,
        "completionCriteria": [
          "Identify all major organelles",
          "Demonstrate understanding of osmosis",
          "Successfully complete mitosis simulation"
        ]
      }
    }
  }
}
```

## Implementation Examples

### TypeScript Integration

```typescript
// interactive-widget-renderer.ts
export interface WidgetRenderer {
  render(widget: InteractiveWidget, container: HTMLElement): Promise<void>;
  destroy(): void;
}

export class PhETRenderer implements WidgetRenderer {
  private iframe: HTMLIFrameElement | null = null;

  async render(widget: InteractiveWidget, container: HTMLElement): Promise<void> {
    this.iframe = document.createElement('iframe');
    this.iframe.src = widget.src;
    this.iframe.width = widget.dimensions?.width || '800';
    this.iframe.height = widget.dimensions?.height || '600';
    this.iframe.title = widget.title;
    
    // Apply security settings
    if (widget.security?.sandbox) {
      this.iframe.sandbox = widget.security.sandbox.join(' ');
    }

    // Add accessibility attributes
    if (widget.accessibility?.alternativeDescription) {
      this.iframe.setAttribute('aria-label', widget.accessibility.alternativeDescription);
    }

    container.appendChild(this.iframe);
  }

  destroy(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
  }
}

export class WidgetManager {
  private renderers = new Map<string, WidgetRenderer>();

  registerRenderer(provider: string, renderer: WidgetRenderer): void {
    this.renderers.set(provider, renderer);
  }

  async renderWidget(widget: InteractiveWidget, container: HTMLElement): Promise<void> {
    const renderer = this.renderers.get(widget.provider);
    if (!renderer) {
      throw new Error(`No renderer found for provider: ${widget.provider}`);
    }

    try {
      await renderer.render(widget, container);
      this.trackWidgetLoad(widget);
    } catch (error) {
      this.handleWidgetError(widget, error, container);
    }
  }

  private trackWidgetLoad(widget: InteractiveWidget): void {
    if (widget.dataCollection?.enabled) {
      // Track widget load event
      this.sendAnalytics({
        event: 'widget_load',
        widgetType: widget.widgetType,
        provider: widget.provider,
        timestamp: Date.now()
      });
    }
  }

  private handleWidgetError(widget: InteractiveWidget, error: Error, container: HTMLElement): void {
    console.error('Widget rendering failed:', error);
    
    // Show fallback content
    if (widget.fallback) {
      this.renderFallback(widget.fallback, container);
    } else {
      container.innerHTML = `<p>Unable to load interactive content: ${widget.title}</p>`;
    }
  }

  private renderFallback(fallback: any, container: HTMLElement): void {
    switch (fallback.type) {
      case 'image':
        const img = document.createElement('img');
        img.src = fallback.content;
        img.alt = fallback.altText || '';
        container.appendChild(img);
        break;
      case 'text':
        container.innerHTML = fallback.content;
        break;
      case 'link':
        const link = document.createElement('a');
        link.href = fallback.content;
        link.textContent = `Open ${widget.title} in new window`;
        link.target = '_blank';
        container.appendChild(link);
        break;
    }
  }

  private sendAnalytics(data: any): void {
    // Implementation depends on analytics provider
    console.log('Widget analytics:', data);
  }
}
```

### React Component Example

```tsx
// InteractiveWidget.tsx
import React, { useEffect, useRef, useState } from 'react';
import { InteractiveWidget as WidgetConfig } from './types';

interface Props {
  widget: WidgetConfig;
  onInteraction?: (event: string, data?: any) => void;
}

export const InteractiveWidget: React.FC<Props> = ({ widget, onInteraction }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWidget = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (containerRef.current) {
          await renderWidget(widget, containerRef.current);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load widget');
      } finally {
        setIsLoading(false);
      }
    };

    loadWidget();
  }, [widget]);

  if (error) {
    return (
      <div className="widget-error">
        <h3>Unable to load interactive content</h3>
        <p>{error}</p>
        {widget.fallback && <FallbackContent fallback={widget.fallback} />}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="widget-loading">
        <p>Loading {widget.title}...</p>
      </div>
    );
  }

  return (
    <div className="interactive-widget">
      <div className="widget-header">
        <h3>{widget.title}</h3>
        <p>{widget.description}</p>
      </div>
      <div 
        ref={containerRef} 
        className="widget-container"
        style={{
          width: widget.dimensions?.width,
          height: widget.dimensions?.height
        }}
      />
      {widget.learningObjectives && (
        <div className="widget-objectives">
          <h4>Learning Objectives:</h4>
          <ul>
            {widget.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FallbackContent: React.FC<{ fallback: any }> = ({ fallback }) => {
  switch (fallback.type) {
    case 'image':
      return <img src={fallback.content} alt={fallback.altText} />;
    case 'link':
      return <a href={fallback.content} target="_blank" rel="noopener noreferrer">Open in new window</a>;
    default:
      return <div dangerouslySetInnerHTML={{ __html: fallback.content }} />;
  }
};
```

## Widget Presets

Common widget configurations for quick implementation:

### PhET Physics Simulations
- Pendulum Lab
- Projectile Motion  
- Wave Interference
- Circuit Construction Kit
- Energy Conservation

### GeoGebra Mathematics
- Graphing Calculator
- Geometry Construction
- 3D Calculator
- Probability Simulations
- Statistics Tools

### Chemistry Visualizations
- Molecular Models
- Periodic Table Explorer
- Chemical Reaction Simulator
- pH Scale
- States of Matter

## Best Practices

### Accessibility
- Always provide fallback content for screen readers
- Include keyboard navigation support when possible
- Use high contrast modes for visual accessibility
- Provide alternative text descriptions
- Respect reduced motion preferences

### Performance
- Use responsive dimensions for mobile compatibility
- Implement lazy loading for widgets not immediately visible
- Provide loading states and error handling
- Cache widget configurations when possible

### Security
- Always specify sandbox attributes for iframe-based widgets
- Validate trusted domains for external content
- Use HTTPS sources for all widget content
- Implement Content Security Policy where applicable

### Data Privacy
- Default to anonymous data collection
- Clearly communicate data collection practices
- Provide opt-out mechanisms for analytics
- Follow educational privacy regulations (COPPA, FERPA)

## Testing

### Unit Tests
Test widget configuration validation, rendering logic, and error handling.

### Integration Tests  
Verify widgets work correctly within the xats document structure.

### Accessibility Tests
Ensure widgets meet WCAG 2.1 guidelines and work with assistive technologies.

### Cross-Browser Tests
Test widgets across different browsers and devices.

## Contributing

To contribute new widget types or providers:

1. Extend the `widgetType` enum in the schema
2. Add provider-specific configuration options
3. Create example implementations
4. Update documentation with usage examples
5. Add accessibility guidelines for the new widget type

## Support

For issues and questions:
- GitHub Issues: [Report bugs or request features](https://github.com/xats-org/core/issues)
- Documentation: [Extension Development Guide](../../docs/guides/extension-guide.md)
- Community: [xats Discussions](https://github.com/xats-org/core/discussions)