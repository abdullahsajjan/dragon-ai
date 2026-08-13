import { ArtifactItem } from '../types';

/**
 * Extracts code blocks or artifact blocks from markdown text.
 * E.g., ```html ... ``` or ```jsx ... ``` or ```svg ... ```
 */
export function extractArtifacts(text: string): ArtifactItem[] {
  const artifacts: ArtifactItem[] = [];
  
  // Regex to match code blocks with language specifiers
  const codeBlockRegex = /```(html|jsx|tsx|javascript|typescript|svg|css|json|markdown)\s*\n([\s\S]*?)```/gi;
  let match;
  let index = 1;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const lang = match[1].toLowerCase();
    const content = match[2].trim();

    // Only make an artifact if content is non-trivial (> 30 chars or HTML/SVG)
    if (content.length > 20) {
      let type: ArtifactItem['type'] = 'code';
      let title = `Artifact ${index} (${lang.toUpperCase()})`;

      if (lang === 'html') {
        type = 'html';
        title = `HTML Visualizer #${index}`;
      } else if (lang === 'svg') {
        type = 'svg';
        title = `Vector Graphic #${index}`;
      } else if (lang === 'jsx' || lang === 'tsx') {
        type = 'react';
        title = `React Component #${index}`;
      } else if (lang === 'json') {
        type = 'json';
        title = `JSON Document #${index}`;
      } else if (lang === 'markdown') {
        type = 'markdown';
        title = `Formatted Document #${index}`;
      }

      artifacts.push({
        id: `artifact-${Date.now()}-${index}`,
        title,
        type,
        language: lang,
        content,
      });
      index++;
    }
  }

  return artifacts;
}
