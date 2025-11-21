This repo contains the client-side code for the Requestly app - a developer tool for intercepting, modifying, and debugging HTTP requests.

# Sub directories

## `app/` - React Web Application
The main React application that provides the UI for Requestly. This code runs in:
- Web browser (https://app.requestly.io)
- Desktop app (loaded inside Electron from `../requestly-desktop-app`)
- Browser extension popup/options pages

The app contains features for:
- Rule creation and management (Redirect, Modify Headers, Insert Scripts, etc.)
- API Client (Postman-like REST API testing)
- Mock Server
- Session Recording and playback
- Network Inspector
- Workspace and team management
- Billing and subscriptions

See `app/claude.md` for detailed breakdown of the app structure.

## `shared/` - Shared Types and Common Helpers
Common TypeScript types and utility functions used across the codebase. This includes:
- Core entity type definitions (Rules, Groups, Sessions, etc.)
- Shared helper functions
- Constants and enums

This code is shared between the app, browser extension, and other parts of the system.

## `browser-extension/` - Browser Extension Code
Browser extension implementation for Chrome, Firefox, Safari, Edge, and other browsers. Provides:
- Request interception using webRequest/declarativeNetRequest APIs
- Rule execution in the browser context
- Background service worker/script
- Content scripts for script injection
- Extension popup UI (loads React app from `app/`)
- Communication with the desktop app and web app

The extension shares the rule processor from `common/rule-processor`.

## `common/rule-processor/` - Core Rule Processing Engine
The core rule execution engine that processes Requestly rules. This code is shared across:
- Browser extension (rule execution in browser)
- Desktop app (rule execution in proxy)
- Web app (rule preview and validation)

Contains the logic for:
- Evaluating rule conditions (URL matching, resource type, etc.)
- Applying rule modifications (redirects, header changes, response modifications, etc.)
- Rule prioritization and conflict resolution
- Performance-optimized rule matching

# Architecture Overview

Requestly follows a modular architecture:
```
┌─────────────────────────────────────────────────────────┐
│                    Web App (app/)                        │
│              React + Redux + Firebase                    │
│         (runs in browser, desktop, extension)            │
└─────────────────────────────────────────────────────────┘
                           │
                           │ uses
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Shared Types (shared/)                      │
│              Common utilities and types                  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ uses
                           ▼
┌─────────────────────────────────────────────────────────┐
│          Browser Extension (browser-extension/)          │
│           Uses webRequest/declarativeNetRequest          │
└─────────────────────────────────────────────────────────┘
                           │
                           │ uses
                           ▼
┌─────────────────────────────────────────────────────────┐
│         Rule Processor (common/rule-processor/)          │
│          Core rule matching and execution logic          │
│        (shared across extension, desktop, web)           │
└─────────────────────────────────────────────────────────┘
```

# External Dependencies

The code in this repo integrates with:
- `../requestly-cloud/` - Firebase Cloud Functions backend (authentication, database, serverless functions)
- `../requestly-desktop-app/` - Electron desktop app wrapper (loads `app/` UI and runs proxy for interception)