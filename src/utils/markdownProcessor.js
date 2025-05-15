// File: src/utils/markdownProcessor.js

const { marked } = require('marked');
const logger = require('./logger');

/**
 * Process markdown content and convert to Google Docs format
 * @param {string} markdown - Markdown content
 * @returns {Object} Google Docs formatted content
 */
exports.processMarkdown = (markdown) => {
  try {
    // Create a new instance of marked to avoid global conflicts
    const markedInstance = new marked.Marked();
    
    // Array to store elements from the parsing process
    const elements = [];
    
    // Custom renderer functions that will build our elements array
    const renderer = {
      heading(text, level) {
        elements.push({
          type: 'heading',
          level,
          text,
          style: { namedStyleType: `HEADING_${level}` }
        });
        return ''; // Return empty string to avoid HTML output
      },
      
      paragraph(text) {
        elements.push({
          type: 'paragraph',
          text,
          style: { namedStyleType: 'NORMAL_TEXT' }
        });
        return '';
      },
      
      list(body, ordered) {
        // Just track list type, items will be added via listitem
        return '';
      },
      
      listitem(text, task, checked) {
        elements.push({
          type: 'listItem',
          text,
          ordered: this.listOrder, // Use a property we'll set in the extension
          index: elements.filter(e => e.type === 'listItem' && e.ordered === this.listOrder).length + 1,
          level: 0, // Simplified for now, could track nesting level if needed
          style: {
            indentStart: { magnitude: 36, unit: 'PT' },
            indentFirstLine: { magnitude: -18, unit: 'PT' }
          }
        });
        return '';
      },
      
      code(code, language) {
        elements.push({
          type: 'codeBlock',
          text: code,
          language,
          style: {
            fontFamily: 'Courier New',
            backgroundColor: { color: { rgbColor: { red: 0.95, green: 0.95, blue: 0.95 } } }
          }
        });
        return '';
      },
      
      strong(text) {
        return text; // Just return text, we're not handling inline formatting yet
      },
      
      em(text) {
        return text; // Just return text, we're not handling inline formatting yet
      },
      
      image(href, title, text) {
        elements.push({
          type: 'image',
          href,
          title,
          text,
          style: {}
        });
        return '';
      }
    };
    
    // Use the renderer with our instance
    markedInstance.use({ renderer });
    
    // Add hooks to track list type
    const hooks = {
      preprocess(markdown) {
        return markdown;
      },
      postprocess(html) {
        return html;
      }
    };
    markedInstance.use({ hooks });
    
    // Add a walkTokens function to track list order
    const walkTokens = (token) => {
      if (token.type === 'list') {
        renderer.listOrder = token.ordered; // Set a property on the renderer to track list type
      }
    };
    markedInstance.use({ walkTokens });
    
    // Parse markdown
    markedInstance.parse(markdown);
    
    // Convert elements to Google Docs requests
    const requests = [];
    let index = 1; // Start at 1 since the document already has title
    
    for (const element of elements) {
      let request;
      
      switch (element.type) {
        case 'heading':
          requests.push(
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
          );
          index += element.text.length + 1; // +1 for the newline
          break;
          
        case 'paragraph':
          requests.push({
            insertText: {
              text: element.text + '\n',
              location: { index }
            }
          });
          index += element.text.length + 1; // +1 for the newline
          break;
          
        case 'listItem':
          const prefix = element.ordered ? `${element.index}. ` : '• ';
          requests.push(
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
          );
          index += prefix.length + element.text.length + 1; // +1 for the newline
          break;
          
        case 'codeBlock':
          requests.push(
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
          );
          index += element.text.length + 1; // +1 for the newline
          break;
          
        case 'image':
          // Note: Google Docs API doesn't directly support image insertion from URLs
          // This would require downloading the image and uploading as inline image
          // For now, we'll just add a text placeholder
          requests.push({
            insertText: {
              text: `[Image: ${element.text || element.href}]\n`,
              location: { index }
            }
          });
          index += `[Image: ${element.text || element.href}]\n`.length;
          break;
          
        default:
          logger.warn(`Unsupported element type: ${element.type}`);
          break;
      }
    }
    
    logger.info('Successfully processed markdown to Google Docs format');
    
    return {
      requests
    };
  } catch (error) {
    logger.error(`Error processing markdown: ${error.message}`, { stack: error.stack });
    throw error;
  }
};