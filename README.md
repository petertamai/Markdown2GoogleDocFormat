# Markdown to Google Doc# File: README.md

# Markdown to Google Doc Converter API

This Node.js API service converts markdown content to Google Docs format and creates a new Google Doc with the formatted content. It's designed to work with n8n workflows or any other automation tools, using OAuth authentication for Google Docs access.

## Features

- Convert Markdown to Google Docs format
- Create new Google Docs with formatted content
- Use with n8n or other workflow automation tools
- Accept OAuth credentials directly in the request
- Comprehensive error handling and logging
- API key authentication for security
- Rate limiting to prevent abuse
- Input validation

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/markdown-to-gdoc-converter.git
   cd markdown-to-gdoc-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration, especially set a strong API key

5. Start the server:
   ```bash
   npm start
   ```

## Usage with n8n and OAuth

### API Endpoint

```
POST /api/markdown/convert-to-gdoc
```

Headers:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

Request body:
```json
{
  "docName": "My Document Title",
  "markdown": "# Heading\n\nThis is a paragraph with **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```",
  "credentials": {
    "access_token": "ya29.a0AfB_byC...",
    "refresh_token": "1//0eXu...",
    "token_type": "Bearer",
    "expiry_date": 1620000000000
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Google Doc created successfully",
  "docId": "abc123xyz",
  "docUrl": "https://docs.google.com/document/d/abc123xyz/edit"
}
```

### n8n Workflow with OAuth

A sample n8n workflow is included in the file `n8n-workflow-example.json`. This workflow:

1. Listens for incoming webhook requests
2. Uses a Google Drive node to obtain OAuth credentials
3. Sends the received data along with the OAuth token to the markdown-to-gdoc endpoint

To use this workflow:
1. Import the workflow into n8n
2. Configure the Google Drive OAuth credentials in n8n
3. Set your API key in n8n environment variables
4. Update the endpoint URL if needed

## OAuth vs Service Account

This implementation uses OAuth authentication instead of service accounts because:

1. It integrates seamlessly with n8n's Google Drive node
2. Users don't need to create and manage service accounts
3. It uses the user's existing Google permissions
4. It's more convenient for workflow automation

## Supported Markdown Features

- Headings (H1-H6)
- Paragraphs
- Bold and italic text
- Ordered and unordered lists
- Code blocks
- Inline code
- Links (formatted as hyperlinks in Google Docs)
- Images (converted to text placeholders with image descriptions)

## Security Considerations

- The API uses API key authentication to secure endpoints
- OAuth credentials are only stored in memory during request processing
- Rate limiting prevents abuse
- All input is validated before processing
- Error details are hidden in production mode

## Error Handling

The API provides detailed error messages and logs all errors for debugging. In production mode, error details are not exposed in API responses for security reasons.

## License

MIT

## Author

Piotr Tamulewicz <pt@petertam.pro>

This Node.js API service converts markdown content to Google Docs format and creates a new Google Doc with the formatted content. It's designed to work with n8n workflows or any other automation tools.

## Features

- Convert Markdown to Google Docs format
- Create new Google Docs with formatted content
- Use with n8n or other workflow automation tools
- Accept Google API credentials directly in the request
- Comprehensive error handling and logging
- API key authentication for security
- Rate limiting to prevent abuse
- Input validation

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/markdown-to-gdoc-converter.git
   cd markdown-to-gdoc-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration, especially set a strong API key

5. Start the server:
   ```bash
   npm start
   ```

## Usage with n8n

### API Endpoint

```
POST /api/markdown/convert-to-gdoc
```

Headers:
```
Content-Type: application/json
X-API-Key: your_api_key_here
```

Request body:
```json
{
  "docName": "My Document Title",
  "markdown": "# Heading\n\nThis is a paragraph with **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```",
  "credentials": {
    "client_email": "your-service-account@project-id.iam.gserviceaccount.com",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Google Doc created successfully",
  "docId": "abc123xyz",
  "docUrl": "https://docs.google.com/document/d/abc123xyz/edit"
}
```

### n8n Workflow Example

A sample n8n workflow is included in the file `n8n-workflow-example.json`. This workflow:

1. Listens for incoming webhook requests
2. Sends the received data to the markdown-to-gdoc endpoint
3. Includes the Google credentials in the request

To use this workflow:
1. Import the workflow into n8n
2. Set your API key in n8n environment variables
3. Update the endpoint URL if needed
4. Make sure your Google service account has the necessary permissions

## Google API Credentials

You'll need a Google service account with the Google Docs API enabled:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Docs API
4. Create a service account and download the JSON credentials
5. Share folders or documents with the service account email to give it access

## Supported Markdown Features

- Headings (H1-H6)
- Paragraphs
- Bold and italic text
- Ordered and unordered lists
- Code blocks
- Inline code
- Links (formatted as hyperlinks in Google Docs)
- Images (converted to text placeholders with image descriptions)

## Security Considerations

- The API uses API key authentication to secure endpoints
- Credentials are only stored in memory during request processing
- Rate limiting prevents abuse
- All input is validated before processing
- Error details are hidden in production mode

## Error Handling

The API provides detailed error messages and logs all errors for debugging. In production mode, error details are not exposed in API responses for security reasons.

## License

MIT

## Author

Piotr Tamulewicz <pt@petertam.pro>d/abc123xyz/edit"
}
```

## Supported Markdown Features

- Headings (H1-H6)
- Paragraphs
- Bold and italic text
- Ordered and unordered lists
- Code blocks
- Inline code
- Links

## Error Handling

The API provides detailed error messages and logs all errors for debugging. In production mode, error details are not exposed in API responses for security reasons.

## License

MIT

## Author

Piotr Tamulewicz <pt@petertam.pro>