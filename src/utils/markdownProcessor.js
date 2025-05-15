// File: src/utils/markdownProcessor.js

const logger = require('./logger');

/**
 * Process markdown content and convert to Google Docs format
 * @param {string} markdown - Markdown content
 * @returns {Object} Google Docs formatted content
 */
exports.processMarkdown = (markdown) => {
  try {
    logger.info('Processing markdown to Google Docs format');
    
    // Directly parse the markdown
    const requests = convertMarkdownToRequests(markdown);
    
    logger.info(`Successfully processed markdown to Google Docs format with ${requests.length} requests`);
    
    return {
      requests
    };
  } catch (error) {
    logger.error(`Error processing markdown: ${error.message}`, { stack: error.stack });
    throw error;
  }
};

/**
 * Convert markdown directly to Google Docs API requests
 * @param {string} markdown - Markdown content
 * @returns {Array} Array of Google Docs API requests
 */
function convertMarkdownToRequests(markdown) {
  const requests = [];
  let index = 1; // Start at 1 since the document already has title
  
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
    if (line.trim().startsWith('```')) {
      const codeStartMatch = line.trim().match(/^```([a-zA-Z0-9]*)?$/);
      if (codeStartMatch) {
        // This is the start of a code block
        const language = codeStartMatch[1] || '';
        let codeContent = '';
        let j = i + 1;
        
        // Find the end of the code block
        while (j < lines.length && !lines[j].trim().startsWith('```')) {
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
    
    // Process regular paragraph
    requests.push({
      insertText: {
        text: line + '\n',
        location: { index }
      }
    });
    
    // Process inline formatting for this paragraph
    processInlineFormatting(requests, line, index);
    
    index += line.length + 1; // +1 for newline
  }
  
  return requests;
}

/**
 * Process inline formatting (bold, italic, links) in text
 * @param {Array} requests - Array of Google Docs API requests to add to
 * @param {string} text - Text to process
 * @param {number} startIndex - Starting index in the document
 */
function processInlineFormatting(requests, text, startIndex) {
  // Process bold (** or __)
  const boldRegex = /(\*\*|__)(.*?)\1/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    const matchText = match[2];
    const matchStart = match.index + match[1].length;
    const matchEnd = matchStart + matchText.length;
    
    requests.push({
      updateTextStyle: {
        textStyle: {
          bold: true
        },
        range: {
          startIndex: startIndex + matchStart,
          endIndex: startIndex + matchEnd
        },
        fields: 'bold'
      }
    });
  }
  
  // Process italic (* or _)
  const italicRegex = /(?<!\*|_)(\*|_)((?!\1).*?)\1(?!\1)/g;
  
  try {
    while ((match = italicRegex.exec(text)) !== null) {
      const matchText = match[2];
      const matchStart = match.index + 1;
      const matchEnd = matchStart + matchText.length;
      
      requests.push({
        updateTextStyle: {
          textStyle: {
            italic: true
          },
          range: {
            startIndex: startIndex + matchStart,
            endIndex: startIndex + matchEnd
          },
          fields: 'italic'
        }
      });
    }
  } catch (error) {
    // Skip italic formatting if the regex fails
    logger.warn('Error processing italic formatting, skipping');
  }
  
  // Process links [text](url)
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  
  while ((match = linkRegex.exec(text)) !== null) {
    const linkText = match[1];
    const linkUrl = match[2];
    const linkStart = match.index + 1;
    const linkEnd = linkStart + linkText.length;
    
    requests.push({
      updateTextStyle: {
        textStyle: {
          link: {
            url: linkUrl
          }
        },
        range: {
          startIndex: startIndex + linkStart,
          endIndex: startIndex + linkEnd
        },
        fields: 'link'
      }
    });
  }
}