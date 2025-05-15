// File: src/utils/markdownProcessor.js

const { marked } = require('marked');
const logger = require('./logger');

/**
 * Custom renderer for marked to track element hierarchy
 */
class GoogleDocsRenderer {
  constructor() {
    super();
    this.elements = [];
    this.inlineStyles = [];
    this.listNesting = 0;
    this.orderedList = false;
  }
  
  // Override rendering methods to create element structure
  heading(text, level) {
    this.elements.push({
      type: 'heading',
      level,
      text,
      style: { namedStyleType: `HEADING_${level}` }
    });
    return '';
  }
  
  paragraph(text) {
    this.elements.push({
      type: 'paragraph',
      text,
      style: { namedStyleType: 'NORMAL_TEXT' }
    });
    return '';
  }
  
  list(body, ordered) {
    this.orderedList = ordered;
    return '';
  }
  
  listitem(text) {
    this.elements.push({
      type: 'listItem',
      text,
      ordered: this.orderedList,
      index: this.elements.filter(e => e.type === 'listItem' && e.ordered === this.orderedList).length + 1,
      level: this.listNesting,
      style: {
        indentStart: { magnitude: 36 * this.listNesting, unit: 'PT' },
        indentFirstLine: { magnitude: -18, unit: 'PT' }
      }
    });
    return '';
  }
  
  code(code, language) {
    this.elements.push({
      type: 'codeBlock',
      text: code,
      language,
      style: {
        fontFamily: 'Courier New',
        backgroundColor: { color: { rgbColor: { red: 0.95, green: 0.95, blue: 0.95 } } }
      }
    });
    return '';
  }
  
  strong(text) {
    return { type: 'bold', text };
  }
  
  em(text) {
    return { type: 'italic', text };
  }
  
  link(href, title, text) {
    return {
      type: 'link',
      href,
      title,
      text
    };
  }
  
  image(href, title, text) {
    this.elements.push({
      type: 'image',
      href,
      title,
      text,
      style: {}
    });
    return '';
  }
  
  // Helper method to convert elements to Google Docs requests
  generateGoogleDocsRequests() {
    const requests = [];
    let index = 1; // Start at 1 since the document already has title
    
    for (const element of this.elements) {
      const request = this.elementToRequest(element, index);
      if (Array.isArray(request)) {
        requests.push(...request);
        // Update index based on last request
        const lastRequest = request[request.length - 1];
        if (lastRequest.insertText) {
          index += lastRequest.insertText.text.length;
        }
      } else if (request) {
        requests.push(request);
        if (request.insertText) {
          index += request.insertText.text.length;
        }
      }
    }
    
    return requests;
  }
  
  // Convert a single element to Google Docs request
  elementToRequest(element, index) {
    switch (element.type) {
      case 'heading':
        return [
          {
            insertText: {
              text: element.text + '\n',
              location: { index }
            }
          },
          {
            updateParagraphStyle: {
              paragraphStyle: element.style,
              range: {
                startIndex: index,
                endIndex: index + element.text.length
              },
              fields: 'namedStyleType'
            }
          }
        ];
        
      case 'paragraph':
        return {
          insertText: {
            text: element.text + '\n',
            location: { index }
          }
        };
        
      case 'listItem':
        const prefix = element.ordered ? `${element.index}. ` : '• ';
        return [
          {
            insertText: {
              text: prefix + element.text + '\n',
              location: { index }
            }
          },
          {
            updateParagraphStyle: {
              paragraphStyle: element.style,
              range: {
                startIndex: index,
                endIndex: index + prefix.length + element.text.length
              },
              fields: 'indentStart,indentFirstLine'
            }
          }
        ];
        
      case 'codeBlock':
        return [
          {
            insertText: {
              text: element.text + '\n',
              location: { index }
            }
          },
          {
            updateTextStyle: {
              textStyle: element.style,
              range: {
                startIndex: index,
                endIndex: index + element.text.length
              },
              fields: 'fontFamily,backgroundColor'
            }
          }
        ];
        
      case 'image':
        // Note: Google Docs API doesn't directly support image insertion from URLs
        // This would require downloading the image and uploading as inline image
        // For now, we'll just add a text placeholder
        return {
          insertText: {
            text: `[Image: ${element.text || element.href}]\n`,
            location: { index }
          }
        };
        
      default:
        logger.warn(`Unsupported element type: ${element.type}`);
        return null;
    }
  }
}

/**
 * Process markdown content and convert to Google Docs format
 * @param {string} markdown - Markdown content
 * @returns {Object} Google Docs formatted content
 */
exports.processMarkdown = (markdown) => {
  try {
    // Create a new instance of marked
    const markedInstance = new marked.Marked();
    
    // Create a new renderer
    const renderer = new GoogleDocsRenderer();
    
    // Set the renderer
    markedInstance.use({ renderer });
    
    // Parse markdown
    markedInstance.parse(markdown);
    
    // Generate Google Docs requests
    const requests = renderer.generateGoogleDocsRequests();
    
    logger.info('Successfully processed markdown to Google Docs format');
    
    return {
      requests
    };
  } catch (error) {
    logger.error(`Error processing markdown: ${error.message}`, { stack: error.stack });
    throw error;
  }
};