<p align="center">
  <a rel="noreferrer noopener" href="https://requestly.com/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/requestly/requestly/blob/master/app/src/assets/img/brand/rq_logo_full.svg?raw=true">
      <source media="(prefers-color-scheme: light)" srcset="https://github.com/requestly/requestly/blob/master/app/src/assets/img/brand/rq_logo_full_light_mode.svg?raw=true">
        <img alt="Requestly Logo" src="https://github.com/requestly/requestly/blob/master/app/src/assets/img/brand/rq_logo_full.svg?raw=true" width="40%">
      </picture>
  </a>
</p>

<p align="center">
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/requestly/requestly"/>
  <a target="_blank" href="https://chrome.google.com/webstore/detail/redirect-url-modify-heade/mdnleldcmiljblolnjhpnblkcekpdkpa/">
    <img alt="Chrome Web Store Rating" src="https://img.shields.io/chrome-web-store/rating/mdnleldcmiljblolnjhpnblkcekpdkpa" />
  </a>
  <a target="_blank" href="https://chrome.google.com/webstore/detail/redirect-url-modify-heade/mdnleldcmiljblolnjhpnblkcekpdkpa/">
    <img alt="Chrome Web Store Reviews" src="https://img.shields.io/chrome-web-store/rating-count/mdnleldcmiljblolnjhpnblkcekpdkpa?label=reviews" />
  </a>
  <a target="_blank" href="https://chrome.google.com/webstore/detail/redirect-url-modify-heade/mdnleldcmiljblolnjhpnblkcekpdkpa/">
    <img alt="Chrome Web Store Downloads" src="https://img.shields.io/chrome-web-store/users/mdnleldcmiljblolnjhpnblkcekpdkpa?label=downloads" />
  </a>
    <a target="_blank" href="https://status.requestly.io">
    <img alt="Status badge" src="https://uptime.betterstack.com/status-badges/v2/monitor/13j20.svg" />
  </a>
</p>

<h3 align="center">⚡ HTTP Interceptor for browsers </h2>

**Requestly is an Open-Source HTTP Interceptor that helps developers test, debug and modify API requests from browsers & mobile apps. It serves as an alternative to Charles Proxy and Telerik Fiddler but works directly in browsers without VPN or proxy configuration. Front-end developers can continue development against API mocks when backend APIs are either unreliable or not ready.**

## 🏡 Getting Started
- [What is Requestly?](#-what-is-requestly)
- [Features](#-features)
    - [HTTP Rules (Intercept & Modify HTTPs Requests)](#-http-rules-intercept--modify-https-requests)
    - [API Client](#-api-client)
    - [Mock Server](#-mock-server)
    - [Sessions](#-sessions)
    - [Team Workspaces](#-team-workspaces)
- [Documentation](#-documentation)
- [Development](#-development)
- [Contributing](#-contributing)
- [Our Mission](#-our-mission)

## What is Requestly

Requestly is an Open-Source platform that helps developers:
- Intercept and modify HTTP(s) traffic from browsers, mobile apps, system apps, and emulators
- Create and test API mocks when backend isn't ready
- Debug network issues faster with session recordings
- Collaborate with team members through shared workspaces
- Reduce friction between front-end and back-end teams

## Features

### HTTP Rules
Different modifications supported:
- Rewriting URLs (Map Local & Map Remote)
  - Change Hostname, QueryParams in URLs
  - Redirect traffic between environments
  - Swap Tag Manager scripts
- Modify HTTP Request & Response Headers
- Modify API Request & Response body
- Throttle & Block Requests 
- Inject custom scripts
- Cancel requests
- Add request delays
- Set custom User-Agent
- Create mocks for non-existent endpoints

Access through:
- Browser extension for web traffic
- Desktop app for mobile apps, emulators & system applications

<p align="center">
  <a target="_blank" href="https://requestly.com/products/web-debugger">
    <img width="60%" alt="intercept_ _modify_https_requests_-_1280x800_5" src="https://github.com/requestly/requestly/assets/3108399/c69f0935-40d5-4b91-bd50-102696c55560">
  </a>
</p>

### API Client
A lightweight API client with:
- Import cURL requests
- Send requests with query parameters, headers, and body
- Test API responses
- Environment variable management for secure authorization
- Request history tracking
- API collections for organization
- Integration with Mock Server
- Switch between different environments easily

<p align="center">
  <a target="_blank" href="https://requestly.com/products/api-client">
    <img width="60%" alt="store_asset_-_api_client_-_1280x800_8" src="https://github.com/requestly/requestly/assets/3108399/d04e3116-665c-4e60-8a50-4ce50326c900">
  </a>
</p>

### Mock Server
Quick API mocking capabilities:
- Create mocks for REST and GraphQL APIs
- Support for static and dynamic responses
- Mock entire API flows
- Record and replay API traffic
- Create mocks from file or static data
- Override existing endpoints
- Bulk API mocking for entire flows
- Record network requests for specific flows
- Create mocks for every request in recorded sessions

<p align="center">
  <a target="_blank" href="https://requestly.com/products/mock-server">
    <img width="60%" alt="mock_server_-_1280x800_4" src="https://github.com/requestly/requestly/assets/3108399/337b8251-3b62-4f87-825f-f3166417c7d5">
  </a>
</p>

### Sessions
Record debugging sessions with:
- Network logs
- Console logs
- Video recording
- Environment details
- Shareable with team members
- Record specific flows (e.g., user journeys)
- Replay recorded sessions

<p align="center">
  <a target="_blank" href="https://requestly.com/products/session-book">
  <img width="60%" alt="session_-_1280x800_5" src="https://github.com/requestly/requestly/assets/3108399/41375ad4-021e-490e-b488-1967cade727c">
  </a>
</p>

### Team Workspaces
- Shared access to rules and collections
- Collaborative workspace management
- Environment sharing
- Session sharing for debugging
- Team member invitations and management
- Seamless collaboration between front-end and back-end teams

## Documentation

Please find our [documentation here](https://developers.requestly.io/). Our docs can help with
- [Getting Started](https://developers.requestly.io/)
- Product Documentation
- FAQs
- Troubleshooting
- [Security & Privacy](https://developers.requestly.io/faq/security-and-privacy/)

## Development

This repository contains the source code for Browser extension and UI application which make up the core of Requestly.
Please follow the [Getting Started Guide](./getting-started.md) to get to know about the development process in this repository.

Start working on individual modules:

- [Browser extension](./browser-extension)
- [UI application](./app)
- [Desktop application](https://github.com/requestly/requestly-desktop-app) (Electron-based application for MacOS, Linux, Windows)
- [Web SDK](https://github.com/requestly/requestly-web-sdk) (facilitates SessionBook)
- [Mock Server](https://github.com/requestly/requestly-mock-server)
- [Backend](https://github.com/requestly/requestly-backend)

## Contributing

Read our [contributing guide](./CONTRIBUTING.md) to learn about how to propose bugfixes and improvements, and how the development process works.

For **payment/billing related issues**, feel free to contact us at [contact@requestly.io](mailto:contact@requestly.io).

## Our Mission

Our mission is to help developers ship web and mobile apps faster and with confidence by giving them the tools to debug & resolve issues without external dependency.

## Contributors

[![All Contributors](https://img.shields.io/github/all-contributors/requestly/requestly?color=ee8449&style=flat-square)](#contributors)

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://sagarsoni.dev/"><img src="https://avatars.githubusercontent.com/u/29792913?v=4?s=100" width="100px;" alt="Sagar Soni"/><br /><sub><b>Sagar Soni</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=sagarsoni7" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://sahil865gupta.github.io"><img src="https://avatars.githubusercontent.com/u/16779465?v=4?s=100" width="100px;" alt="Sahil Gupta"/><br /><sub><b>Sahil Gupta</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=wrongsahil" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lazyvab"><img src="https://avatars.githubusercontent.com/u/6367566?v=4?s=100" width="100px;" alt="Vaibhav Nigam"/><br /><sub><b>Vaibhav Nigam</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=lazyvab" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/RuntimeTerror10"><img src="https://avatars.githubusercontent.com/u/53986600?v=4?s=100" width="100px;" alt="Parth Bhardwaj"/><br /><sub><b>Parth Bhardwaj</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=RuntimeTerror10" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://linkedin.com/in/rohanmathur91"><img src="https://avatars.githubusercontent.com/u/61556757?v=4?s=100" width="100px;" alt="Rohan Mathur"/><br /><sub><b>Rohan Mathur</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=rohanmathur91" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nafees87n"><img src="https://avatars.githubusercontent.com/u/56021937?v=4?s=100" width="100px;" alt="Nafees Nehar"/><br /><sub><b>Nafees Nehar</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=nafees87n" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nsrCodes"><img src="https://avatars.githubusercontent.com/u/57226514?v=4?s=100" width="100px;" alt="Navdeep Singh Rathore"/><br /><sub><b>Navdeep Singh Rathore</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=nsrCodes" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://requestly.com"><img src="https://avatars.githubusercontent.com/u/3108399?v=4?s=100" width="100px;" alt="Sachin Jain"/><br /><sub><b>Sachin Jain</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=sachinjain024" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ashishsangle707"><img src="https://avatars.githubusercontent.com/u/124448580?v=4?s=100" width="100px;" alt="ashishsangle707"/><br /><sub><b>ashishsangle707</b></sub></a><br /><a href="#projectManagement-ashishsangle707" title="Project Management">📆</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/echo-sg"><img src="https://avatars.githubusercontent.com/u/56088056?v=4?s=100" width="100px;" alt="Shrey Gupta"/><br /><sub><b>Shrey Gupta</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=echo-sg" title="Code">💻</a> <a href="#projectManagement-echo-sg" title="Project Management">📆</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ncharanaraj"><img src="https://avatars.githubusercontent.com/u/43924299?v=4?s=100" width="100px;" alt="Charanaraj N"/><br /><sub><b>Charanaraj N</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=ncharanaraj" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Muhammad-Daniyal-Jawad1"><img src="https://avatars.githubusercontent.com/u/130592856?v=4?s=100" width="100px;" alt="Muhammad-Daniyal-Jawad1"/><br /><sub><b>Muhammad-Daniyal-Jawad1</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=Muhammad-Daniyal-Jawad1" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://piyush-web-app.web.app/"><img src="https://avatars.githubusercontent.com/u/43876655?v=4?s=100" width="100px;" alt="PIYUSH NEGI"/><br /><sub><b>PIYUSH NEGI</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=npiyush97" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

## Special Mentions
A big shoutout to these amazing Open Source projects that have helped make Requestly possible.
- [rrweb](https://github.com/rrweb-io/rrweb)
