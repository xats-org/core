import { BaseAncillaryGenerator } from '../base-generator';

import type { ExtractedContent, GenerationResult, OutputFormat, SlideDeckOptions } from '../types';
import type { SemanticText } from '@xats-org/types';

// Internal types for slide structure
interface Slide {
  type: string;
  title: string;
  subtitle?: string;
  date?: string;
  points?: string[];
  content?: string;
  visual?: string;
  speakerNotes?: string;
  animation?: string;
}

/**
 * Generator for creating presentation slides from xats documents
 */
export class SlideDeckGenerator extends BaseAncillaryGenerator {
  supportedFormats: OutputFormat[] = ['pptx', 'html', 'markdown'];

  /**
   * Generate slides from extracted content
   */
  generateOutput(
    content: ExtractedContent[],
    options: SlideDeckOptions
  ): Promise<GenerationResult> {
    return Promise.resolve().then(() => {
      const startTime = Date.now();

      try {
        if (!this.validateOptions(options)) {
          return this.createErrorResult(options.format, ['Invalid options provided']);
        }

        // Group content into slides
        const slides = this.createSlides(content, options);

        // Generate output based on format
        let output: string | Buffer;
        switch (options.format) {
          case 'markdown':
            output = this.generateMarkdownSlides(slides, options);
            break;
          case 'html':
            output = this.generateHTMLSlides(slides, options);
            break;
          case 'pptx':
            output = this.generatePowerPoint(slides, options);
            break;
          default:
            return this.createErrorResult(options.format, [
              `Unsupported format: ${options.format}`,
            ]);
        }

        const timeElapsed = Date.now() - startTime;
        return this.createSuccessResult(output, options.format, {
          blocksProcessed: content.length,
          timeElapsed,
          outputSize: Buffer.isBuffer(output) ? output.length : output.length,
        });
      } catch (error) {
        return this.createErrorResult(options.format, [
          `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
        ]);
      }
    });
  }

  /**
   * Create slides from content
   */
  private createSlides(content: ExtractedContent[], options: SlideDeckOptions): Slide[] {
    const slides: Slide[] = [];
    const maxSlides = options.maxSlides || 50;
    const slidesPerSection = options.slidesPerSection || 5;

    // Group content by sections
    const sections = this.groupBySection(content);

    // Create title slide
    slides.push({
      type: 'title',
      title: 'Presentation',
      subtitle: `Generated from xats document`,
      date: new Date().toLocaleDateString(),
    });

    // Create slides for each section
    for (const [sectionName, items] of sections.entries()) {
      if (slides.length >= maxSlides) break;

      // Section title slide
      slides.push({
        type: 'section',
        title: sectionName,
      });

      // Content slides for section
      const sectionSlides = this.createSectionSlides(items, slidesPerSection, options);
      slides.push(...sectionSlides);

      if (slides.length >= maxSlides) {
        slides.splice(maxSlides);
        break;
      }
    }

    // Add summary slide
    if (slides.length < maxSlides) {
      slides.push({
        type: 'summary',
        title: 'Summary',
        points: this.extractKeyPoints(content),
      });
    }

    return slides;
  }

  /**
   * Group content by section
   */
  private groupBySection(content: ExtractedContent[]): Map<string, ExtractedContent[]> {
    const sections = new Map<string, ExtractedContent[]>();

    for (const item of content) {
      const section = item.path[1] || 'Introduction';
      if (!sections.has(section)) {
        sections.set(section, []);
      }
      const sectionItems = sections.get(section);
      if (sectionItems) {
        sectionItems.push(item);
      }
    }

    return sections;
  }

  /**
   * Create slides for a section
   */
  private createSectionSlides(
    items: ExtractedContent[],
    maxSlides: number,
    options: SlideDeckOptions
  ): Slide[] {
    const slides: Slide[] = [];

    for (const item of items) {
      if (slides.length >= maxSlides) break;

      const slideType = (item.metadata?.slideType as string) || 'bullet-points';
      const slide = this.createSlide(item, slideType, options);
      if (slide) {
        slides.push(slide);
      }
    }

    return slides;
  }

  /**
   * Create individual slide
   */
  private createSlide(
    item: ExtractedContent,
    slideType: string,
    options: SlideDeckOptions
  ): Slide | null {
    const text = this.extractPlainText(item.content as Parameters<typeof this.extractPlainText>[0]);
    if (!text) return null;

    const slide: Slide = {
      type: slideType,
      title: item.path[item.path.length - 1] || 'Slide',
    };

    // Add speaker notes if requested
    if (options.includeSpeakerNotes && item.metadata?.speakerNotes) {
      slide.speakerNotes = item.metadata.speakerNotes as string;
    }

    // Format content based on slide type
    switch (slideType) {
      case 'bullet-points':
        slide.points = this.extractBulletPoints(
          text,
          (item.metadata?.maxBulletPoints as number) || 5
        );
        break;
      case 'diagram':
      case 'example':
        slide.content = text;
        slide.visual = (item.metadata?.visualPreference as string) || 'text-only';
        break;
      default:
        slide.content = text;
    }

    // Add animation hint if specified
    if (item.metadata?.animationHint) {
      slide.animation = item.metadata.animationHint as string;
    }

    return slide;
  }

  /**
   * Extract bullet points from text
   */
  private extractBulletPoints(text: string, maxPoints: number): string[] {
    const sentences = text.match(/[^.!?]+[.!?]/g) || [];
    return sentences.slice(0, maxPoints).map((s) => s.trim());
  }

  /**
   * Extract key points for summary
   */
  private extractKeyPoints(content: ExtractedContent[]): string[] {
    const points: string[] = [];

    for (const item of content) {
      if (item.metadata?.importance === 'critical') {
        const text = this.extractPlainText(item.content as SemanticText);
        if (text) {
          const firstSentence = text.match(/^[^.!?]+[.!?]/);
          if (firstSentence) {
            points.push(firstSentence[0].trim());
          }
        }
      }
    }

    return points.slice(0, 5); // Limit to 5 key points
  }

  /**
   * Generate Markdown slides
   */
  private generateMarkdownSlides(slides: Slide[], _options: SlideDeckOptions): string {
    let markdown = '';

    for (const slide of slides) {
      markdown += '---\n\n';

      switch (slide.type) {
        case 'title':
          markdown += `# ${slide.title}\n\n${slide.subtitle}\n\n${slide.date}\n\n`;
          break;
        case 'section':
          markdown += `## ${slide.title}\n\n`;
          break;
        case 'bullet-points':
          markdown += `### ${slide.title}\n\n`;
          if (slide.points) {
            for (const point of slide.points) {
              markdown += `- ${point}\n`;
            }
          }
          break;
        case 'summary':
          markdown += `### ${slide.title}\n\n`;
          if (slide.points) {
            for (const point of slide.points) {
              markdown += `- ${point}\n`;
            }
          }
          break;
        default:
          markdown += `### ${slide.title}\n\n${slide.content || ''}\n\n`;
      }

      if (slide.speakerNotes) {
        markdown += `\n<!--\nSpeaker Notes:\n${slide.speakerNotes}\n-->\n`;
      }
    }

    return markdown;
  }

  /**
   * Generate HTML slides (reveal.js format)
   */
  private generateHTMLSlides(slides: Slide[], options: SlideDeckOptions): string {
    let slidesHTML = '';

    for (const slide of slides) {
      let slideContent = '';

      switch (slide.type) {
        case 'title':
          slideContent = `<h1>${slide.title}</h1><p>${slide.subtitle}</p><p>${slide.date}</p>`;
          break;
        case 'section':
          slideContent = `<h2>${slide.title}</h2>`;
          break;
        case 'bullet-points':
          slideContent = `<h3>${slide.title}</h3><ul>`;
          if (slide.points) {
            for (const point of slide.points) {
              slideContent += `<li>${point}</li>`;
            }
          }
          slideContent += '</ul>';
          break;
        default:
          slideContent = `<h3>${slide.title}</h3><p>${slide.content || ''}</p>`;
      }

      const animationClass = slide.animation ? ` data-transition="${slide.animation}"` : '';
      slidesHTML += `<section${animationClass}>${slideContent}`;

      if (slide.speakerNotes) {
        slidesHTML += `<aside class="notes">${slide.speakerNotes}</aside>`;
      }

      slidesHTML += '</section>\n';
    }

    // Return basic reveal.js HTML structure
    return `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/${options.theme || 'white'}.css">
</head>
<body>
    <div class="reveal">
        <div class="slides">
            ${slidesHTML}
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"></script>
    <script>Reveal.initialize();</script>
</body>
</html>`;
  }

  /**
   * Generate PowerPoint (placeholder)
   */
  private generatePowerPoint(slides: Slide[], options: SlideDeckOptions): Buffer {
    // This would use a library like pptxgenjs
    // For now, return markdown as placeholder
    const markdown = this.generateMarkdownSlides(slides, options);
    return Buffer.from(markdown, 'utf-8');
  }
}
