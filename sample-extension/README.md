# cURL Request Runner Chrome Extension

A simple Chrome extension that allows users to select text on any webpage, right-click, and choose "Run cURL Request" to see the selected text in an alert.

## Features

- Context menu integration for selected text
- Works on any webpage
- Simple popup interface
- Background service worker for handling context menu events

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this folder
4. The extension will be installed and ready to use

## Usage

1. Navigate to any webpage
2. Select any text on the page
3. Right-click on the selected text
4. Choose "Run cURL Request" from the context menu
5. An alert will appear showing the selected text

## Files

- `manifest.json` - Extension configuration and permissions
- `background.js` - Service worker for context menu and event handling
- `content.js` - Content script for webpage interaction
- `popup.html` - Extension popup interface
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

## Note about Icons

The current icon files are placeholders. For a production extension, you should replace them with proper PNG icons of the specified sizes (16x16, 48x48, and 128x128 pixels). You can create or download appropriate icons and replace the existing files.

## Permissions Used

- `contextMenus` - For creating the right-click context menu
- `activeTab` - For executing scripts on the current tab
- `scripting` - For injecting scripts into web pages
- `host_permissions` - For accessing all URLs

## Development

To modify the extension:
1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes
