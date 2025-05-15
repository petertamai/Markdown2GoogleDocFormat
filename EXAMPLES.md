# File: EXAMPLES.md

# Markdown to Google Doc Converter Examples

This document provides examples of how to use the Markdown to Google Doc Converter API in different scenarios.

## Basic Usage with OAuth Authentication (Recommended)

The API now supports standard OAuth Bearer token authentication:

```bash
curl -X POST https://yourapi.example.com/api/markdown/convert-to-gdoc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ya29.a0AbVbY6A..." \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "docName": "Test Document",
    "markdown": "# Hello World\n\nThis is a test document created with the Markdown to Google Doc Converter API.\n\n## Features\n\n- Bold text: **this is bold**\n- Italic text: *this is italic*\n- Code: `console.log('Hello')`\n\n```javascript\nfunction test() {\n  console.log('Hello, world!');\n}\n```"
  }'
```

## Using with n8n and Predefined Google Docs Credentials

In n8n, use the HTTP Request node with these settings:

1. Method: POST
2. URL: Your endpoint
3. Authentication: "Predefined Credential Type"
4. Credential Type: "Google Docs OAuth2 API"
5. Select your Google Docs OAuth2 credentials
6. Body Parameters:
   - docName: Your document name
   - markdown: Your markdown content

This automatically adds the Authorization Bearer token header for you!

## Using with JavaScript (Node.js)

```javascript
const axios = require('axios');

async function convertMarkdownToGoogleDoc() {
  try {
    const response = await axios.post(
      'https://yourapi.example.com/api/markdown/convert-to-gdoc',
      {
        docName: 'API Test Document',
        markdown: '# API Test\n\nThis document was created programmatically using the API.'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ya29.a0AbVbY6A...', // Your OAuth token
          'X-API-Key': 'your_api_key_here'
        }
      }
    );
    
    console.log('Document created:', response.data);
    console.log('Document URL:', response.data.docUrl);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

convertMarkdownToGoogleDoc();
```

## Using with Python

```python
import requests
import json

url = 'https://yourapi.example.com/api/markdown/convert-to-gdoc'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ya29.a0AbVbY6A...', # Your OAuth token
    'X-API-Key': 'your_api_key_here'
}

data = {
    'docName': 'Python Test Document',
    'markdown': '# Python Test\n\nThis document was created from Python.'
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.json())
```

## n8n Workflow Example: Reading Markdown from a File

1. Add a "Read Binary File" node to read a markdown file
2. Add a "Function" node to extract and prepare the data:

```javascript
// In function node
return [{
  json: {
    docName: 'Document from File',
    markdown: Buffer.from($binary.data, 'base64').toString('utf-8')
  }
}];
```

3. Add an HTTP Request node with:
   - Authentication: "Predefined Credential Type"
   - Credential Type: "Google Docs OAuth2 API"
   - Select your Google Docs OAuth credentials
   - Body: The output from the Function node

## Handling Complex Markdown

The API supports a variety of markdown elements:

```json
{
  "docName": "Complex Document",
  "markdown": "# Complex Document\n\n## Table Example\n\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n## Image Example\n\n![Sample Image](https://example.com/image.jpg)\n\n## Link Example\n\n[Google](https://www.google.com)\n\n## Code Block\n\n```python\ndef hello_world():\n    print('Hello, world!')\n```"
}
```

Note: The current implementation handles basic markdown elements. Tables might not render correctly in Google Docs.

          refresh_token: '1//0eXu...',
          token_type: 'Bearer', 
          expiry_date: 1620000000000
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'your_api_key_here'
        }
      }
    );
    
    console.log('Document created:', response.data);
    console.log('Document URL:', response.data.docUrl);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

convertMarkdownToGoogleDoc();
```

## Using with Python

```python
import requests
import json

url = 'http://localhost:3000/api/markdown/convert-to-gdoc'
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key_here'
}

data = {
    'docName': 'Python Test Document',
    'markdown': '# Python Test\n\nThis document was created from Python.',
    'credentials': {
        'access_token': 'ya29.a0AfB_byC...',
        'refresh_token': '1//0eXu...',
        'token_type': 'Bearer',
        'expiry_date': 1620000000000
    }
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.json())
```

## Using in n8n Workflow with OAuth

1. Add a "Manual Trigger" node
2. Add a "Google Drive" node with OAuth authentication:
   - Set the operation to any simple operation like "List" 
   - This ensures we have a valid OAuth token
3. Add an "HTTP Request" node with these settings:
   - Method: POST
   - URL: http://localhost:3000/api/markdown/convert-to-gdoc
   - Headers:
     - Content-Type: application/json
     - X-API-Key: {{ $env.API_KEY }}
   - Body Parameters:
     - docName: {{ $json.docName }}
     - markdown: {{ $json.markdown }}
     - credentials: {{ $node["Google Drive"].oauthTokenData }}

The OAuth token data will be automatically passed to your API.

### Reading Markdown from a File

1. Add a "Read Binary File" node to read a markdown file
2. Add a "Google Drive" node with OAuth authentication 
3. Add a "Function" node to extract and prepare the data:

```javascript
// In function node
return [{
  json: {
    docName: 'Document from File',
    markdown: Buffer.from($binary.data, 'base64').toString('utf-8')
  }
}];
```

4. Connect to an HTTP Request node as shown above, passing the OAuth credentials:

```
{
  "docName": "={{ $json.docName }}",
  "markdown": "={{ $json.markdown }}",
  "credentials": "={{ $node[\"Google Drive\"].oauthTokenData }}"
}
```

## Handling Complex Markdown

For complex markdown documents with tables, images, and links:

```json
{
  "docName": "Complex Document",
  "markdown": "# Complex Document\n\n## Table Example\n\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n## Image Example\n\n![Sample Image](https://example.com/image.jpg)\n\n## Link Example\n\n[Google](https://www.google.com)\n\n## Code Block\n\n```python\ndef hello_world():\n    print('Hello, world!')\n```",
  "credentials": {
    "access_token": "ya29.a0AfB_byC...",
    "refresh_token": "1//0eXu...",
    "token_type": "Bearer",
    "expiry_date": 1620000000000
  }
}
```

Note: The current implementation handles basic markdown elements. Tables might not render correctly in Google Docs.