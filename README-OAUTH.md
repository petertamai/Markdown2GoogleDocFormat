# File: README-OAUTH.md

# OAuth Bearer Token Authentication Guide

This document explains how the OAuth Bearer token authentication works in the Markdown to Google Doc Converter API.

## How OAuth Authentication Works in this API

The API now supports standard OAuth Bearer token authentication that works directly with n8n's predefined credentials. Here's how it works:

1. **Authorization Header**: The API extracts the OAuth access token from the standard `Authorization: Bearer <token>` HTTP header.

2. **No Request Body Credentials Needed**: You no longer need to include OAuth credentials in the request body.

3. **Automatic Token Handling**: When using "Predefined Credential Type" with "Google Docs OAuth2 API" in n8n, the OAuth token is automatically added to the Authorization header.

## Configuring n8n to Use OAuth

In your n8n HTTP Request node:

1. Set **Authentication** to "Predefined Credential Type"
2. Set **Credential Type** to "Google Docs OAuth2 API"
3. Select your Google Docs OAuth credentials
4. Send your request body without including credentials:
   ```json
   {
     "docName": "My Document",
     "markdown": "# Heading\nThis is markdown content"
   }
   ```

The OAuth token will be automatically added to the Authorization header.

## Troubleshooting

If you get authentication errors:

1. Make sure your Google Docs OAuth credentials are properly set up in n8n
2. Check that you've authorized the credentials by clicking "Sign in with Google"
3. Verify that the credentials have the necessary scopes (`https://www.googleapis.com/auth/documents`)
4. Check the API logs for more details

## API Changes

The following changes were made to support standard OAuth:

1. Added middleware to check for the Bearer token in the Authorization header
2. Modified the controller to extract the token from the header
3. Updated the validators to no longer require credentials in the request body
4. Simplified the Google Docs service to work with just the access token

This implementation follows OAuth 2.0 best practices and makes integration with n8n and other OAuth-capable services much simpler.