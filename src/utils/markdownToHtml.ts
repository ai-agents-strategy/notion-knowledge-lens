
import { marked } from 'marked';

// Configure marked with safe options
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // Enable GitHub Flavored Markdown
});

export const convertMarkdownToHtml = (markdown: string): string => {
  try {
    const result = marked.parse(markdown);
    // marked.parse() returns a string synchronously when no async extensions are used
    return result as string;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown; // Return original text if conversion fails
  }
};
