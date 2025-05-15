// File: src/utils/googleDocsFormatter.js

const { Converter } = require('showdown');
const logger = require('./logger');

/**
 * Format Markdown content into Google Docs API requests
 * @param {string} markdown - Markdown content
 * @returns {Object} Google Docs API requests
 */
function formatMarkdownToGoogleDocsRequests(markdown) {
  try {
    logger.info('Converting markdown to Google Docs format');
    
    // Step 1: Parse markdown to HTML using showdown (more reliable than marked)
    const converter = new Converter({
      tables: true,
      tasklists: true,
      strikethrough: true,
      simpleLineBreaks: true
    });
    
    // Step 2: Convert to Google Docs API requests
    const { requests, index } = convertToDocRequests(markdown);
    
    logger.info(`Successfully converted markdown to ${requests.length} Google Docs requests`);
    
    return { requests };
  } catch (error) {
    logger.error(`Error formatting markdown to Google Docs: ${error.message}`, { stack: error.stack });
    throw error;
  }
}

/**
 * Convert markdown to Google Docs API requests
 * @param {string} markdown - Markdown content
 * @returns {Object} Object containing requests array and current index
 */
function convertToDocRequests(markdown) {
  const requests = [];
  let index = 1; // Start at 1 since the document already has a title
  
  // Split the markdown into lines
  const lines = markdown.split('\n');
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (line.trim() === '') {
      requests.push({
        insertText: {
          text: '\n',
          location: { index }
        }
      });
      index += 1;
      continue;
    }
    
    // Process headings (e.g., # Heading 1, ## Heading 2)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      
      requests.push({
        insertText: {
          text: text + '\n',
          location: { index }
        }
      });
      
      requests.push({
        updateParagraphStyle: {
          paragraphStyle: {
            namedStyleType: `HEADING_${level}`
          },
          range: {
            startIndex: index,
            endIndex: index + text.length
          },
          fields: 'namedStyleType'
        }
      });
      
      index += text.length + 1; // +1 for newline
      continue;
    }
    
    // Process lists (bulleted and numbered)
    const bulletedListMatch = line.match(/^(\s*)-\s+(.+)$/);
    const numberedListMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    
    if (bulletedListMatch) {
      const indent = bulletedListMatch[1].length;
      const text = bulletedListMatch[2];
      
      requests.push({
        insertText: {
          text: text + '\n',
          location: { index }
        }
      });
      
      requests.push({
        createParagraphBullets: {
          range: {
            startIndex: index,
            endIndex: index + text.length
          },
          bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE'
        }
      });
      
      if (indent > 0) {
        requests.push({
          updateParagraphStyle: {
            paragraphStyle: {
              indentStart: {
                magnitude: indent * 18,
                unit: 'PT'
              },
              indentFirstLine: {
                magnitude: 0,
                unit: 'PT'
              }
            },
            range: {
              startIndex: index,
              endIndex: index + text.length
            },
            fields: 'indentStart,indentFirstLine'
          }
        });
      }
      
      index += text.length + 1; // +1 for newline
      continue;
    }
    
    if (numberedListMatch) {
      const indent = numberedListMatch[1].length;
      const text = numberedListMatch[2];
      
      requests.push({
        insertText: {
          text: text + '\n',
          location: { index }
        }
      });
      
      requests.push({
        createParagraphBullets: {
          range: {
            startIndex: index,
            endIndex: index + text.length
          },
          bulletPreset: 'NUMBERED_DECIMAL_NESTED'
        }
      });
      
      if (indent > 0) {
        requests.push({
          updateParagraphStyle: {
            paragraphStyle: {
              indentStart: {
                magnitude: indent * 18,
                unit: 'PT'
              },
              indentFirstLine: {
                magnitude: 0,
                unit: 'PT'
              }
            },
            range: {
              startIndex: index,
              endIndex: index + text.length
            },
            fields: 'indentStart,indentFirstLine'
          }
        });
      }
      
      index += text.length + 1; // +1 for newline
      continue;
    }
    
    // Process code blocks
    if (line.startsWith('```')) {
      const codeStartMatch = line.match(/^```([a-zA-Z0-9]*)?$/);
      if (codeStartMatch) {
        // This is the start of a code block
        const language = codeStartMatch[1] || '';
        let codeContent = '';
        let j = i + 1;
        
        // Find the end of the code block
        while (j < lines.length && !lines[j].startsWith('```')) {
          codeContent += lines[j] + '\n';
          j++;
        }
        
        // Add code block to requests
        requests.push({
          insertText: {
            text: codeContent,
            location: { index }
          }
        });
        
        requests.push({
          updateTextStyle: {
            textStyle: {
              fontFamily: 'Courier New',
              backgroundColor: {
                color: {
                  rgbColor: {
                    red: 0.95,
                    green: 0.95,
                    blue: 0.95
                  }
                }
              }
            },
            range: {
              startIndex: index,
              endIndex: index + codeContent.length
            },
            fields: 'fontFamily,backgroundColor'
          }
        });
        
        index += codeContent.length;
        i = j; // Skip to the end of the code block
        continue;
      }
    }
    
    // Process text with inline formatting
    let processedText = line;
    let currentIndex = index;
    
    // Save the original text for adding to requests
    const originalText = processedText + '\n';
    
    // Add the text to requests
    requests.push({
      insertText: {
        text: originalText,
        location: { index }
      }
    });
    
    // Process bold (** or __)
    const boldMatches = [...processedText.matchAll(/(\*\*|__)(.*?)\1/g)];
    for (const match of boldMatches) {
      const startOffset = match.index;
      const endOffset = match.index + match[0].length;
      const innerText = match[2];
      const innerStartIndex = currentIndex + startOffset + match[1].length;
      const innerEndIndex = innerStartIndex + innerText.length;
      
      requests.push({
        updateTextStyle: {
          textStyle: {
            bold: true
          },
          range: {
            startIndex: innerStartIndex,
            endIndex: innerEndIndex
          },
          fields: 'bold'
        }
      });
    }
    
    // Process italic (* or _)
    const italicMatches = [...processedText.matchAll(/(?<!\*|_)(\*|_)((?!\1).*?)\1(?!\1)/g)];
    for (const match of italicMatches) {
      const startOffset = match.index;
      const endOffset = match.index + match[0].length;
      const innerText = match[2];
      const innerStartIndex = currentIndex + startOffset + 1;
      const innerEndIndex = innerStartIndex + innerText.length;
      
      requests.push({
        updateTextStyle: {
          textStyle: {
            italic: true
          },
          range: {
            startIndex: innerStartIndex,
            endIndex: innerEndIndex
          },
          fields: 'italic'
        }
      });
    }
    
    // Process links [text](url)
    const linkMatches = [...processedText.matchAll(/\[(.*?)\]\((.*?)\)/g)];
    for (const match of linkMatches) {
      const startOffset = match.index;
      const endOffset = match.index + match[0].length;
      const text = match[1];
      const url = match[2];
      const innerStartIndex = currentIndex + startOffset;
      const innerEndIndex = innerStartIndex + text.length;
      
      requests.push({
        updateTextStyle: {
          textStyle: {
            link: {
              url
            }
          },
          range: {
            startIndex: innerStartIndex,
            endIndex: innerEndIndex
          },
          fields: 'link'
        }
      });
    }
    
    // Update index
    index += originalText.length;
  }
  
  return { requests, index };
}

module.exports = {
  formatMarkdownToGoogleDocsRequests
};