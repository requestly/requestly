![svgviewer-output (2)](https://github.com/requestly/requestly/assets/16779465/b2a40e48-eae8-445e-948d-4ceedf90cbe8)<p align="center">
<p align="center">
  <a target="_blank" href="https://requestly.io/">
    <img src="https://github.com/requestly/requestly/assets/16779465/652552db-c867-44cb-9bb5-94a2026e04ca" alt="Requestly Logo" width="40%"/>
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
</p>

<!--
<p align="center">
  <a target="_blank" href="https://docs.requestly.io">Docs</a> - <a target="_blank" 
href="https://requestly.io/downloads">Download</a> - <a target="_blank" href="https://app.requestly.io/getting-started">Getting Started</a> - <a target="_blank" href="https://bit.ly/requestly-slack">Support community</a> - <a target="_blank" href="https://github.com/requestly/requestly/issues/new?assignees=&labels=bug&template=bug-report.yml">Report a bug</a>
</p>
-->

<h3 align="center">⚡ Build, Test & Debug web and mobile apps 10x faster </h2>

**Bring the power of Charles Proxy, Fiddler & Postman together** with beautiful, modern UI & collaboration features. Available as a browser extension on all major browsers & desktop apps on all platforms. [Install Requestly](https://requestly.io/downloads)

<p align="center">
  <a href="https://requestly.io/">
    <img src="https://github.com/requestly/requestly/assets/16779465/3d5945a9-4f42-4509-90d6-769cf2600ef1" alt="Requestly Details" width="60%"/>
  </a>
</p>

## 🏡 Getting Started
- [🚀 What is Requestly?](#-what-is-requestly)
- [✨ Features](#-features)
    - [HTTP Rules (Intercept & Modify HTTPs Requests)](#-http-rules-intercept--modify-https-requests)
    - [API Client](#-api-client)
    - [Mock Server (Create API Mocks in seconds)](#-mock-server-create-api-mocks-in-seconds)
    - [Sessions for faster debugging](#-sessions)
- [📕 Documentation](#-documentation)
- [👩‍💻 Development](#-development)
- [🙏 Contributing](#-contributing)
- [🎯 Our Mission](#-our-mission)

## 🚀 What is Requestly

Requestly is an Open-Source platform for front-end developers with essential tooling & integrations that helps them write, test & debug their code 10x faster. Requestly reduces dependency on backend devs and environments for development & testing needs. 

Using Requestly, devs can create mock, test, validate & override API responses, modify request & response headers, set up redirects (Map local, Map remote), and use Requestly sessions for faster debugging.

## ✨ Features

### 👉 HTTP Rules (Intercept & Modify HTTPs Requests)
Intercept & Modify HTTPs requests & responses from browsers & mobile apps. 
- 👉 Use the browser extension for capturing & modifying traffic from browsers
- 👉 Use the desktop app for capturing & modifying traffic from mobile apps & other desktop apps.

Different Modifications supported
- Rewriting URLs (Map Local & Map Remote) e.g.
    - Change Hostname, QueryParams, etc in the URL
    - Redirect traffic from one environment to another (e.g. production to dev)
    - Swap Tag Manager scripts from production to staging/dev environment
- Modify HTTP Request & Response Headers
- Modify API Request & Response body
- Throttles & Blocking of Requests
- Inject scripts on web pages

<br/>

<p align="center">
  <a target="_blank" href="https://requestly.io/">
    <img width="60%" alt="intercept_ _modify_https_requests_-_1280x800_5" src="https://github.com/requestly/requestly/assets/3108399/c69f0935-40d5-4b91-bd50-102696c55560">
  </a>
</p>

### 👉 API Client

Requestly offers a minimal, lightweight API client that works directly in the browser. It can help you 
- Import cURL requests,
- Send new requests, and
- Quickly test API responses.
- Integration with Mock Server to clone an API endpoint with the same response
- Integration with Modify Response Rule to override the response body

<p align="center">
  <a target="_blank" href="https://requestly.io/feature/api-client">
    <img width="60%" alt="store_asset_-_api_client_-_1280x800_8" src="https://github.com/requestly/requestly/assets/3108399/d04e3116-665c-4e60-8a50-4ce50326c900">
  </a>
</p>

### 👉 Mock Server (Create API Mocks in seconds)

Mock Server helps you quickly create API mocks. Especially helpful when APIs don't exist and you have to build a feature, just define the response you need and get an endpoint to be used in your code.

<p align="center">
  <a target="_blank" href="https://requestly.io/feature/mock-server">
    <img width="60%" alt="mock_server_-_1280x800_4" src="https://github.com/requestly/requestly/assets/3108399/337b8251-3b62-4f87-825f-f3166417c7d5">
  </a>
</p>

### 👉 Sessions

Collaborate with other teammates and get Requestly sessions that contain video, console logs, network logs, and env details for faster troubleshooting.

<p align="center">
  <a target="_blank" href="https://requestly.io/feature/mock-server">
  <img width="60%" alt="session_-_1280x800_5" src="https://github.com/requestly/requestly/assets/3108399/41375ad4-021e-490e-b488-1967cade727c">
  </a>
</p>


## 📕 Documentation

Please find our [documentation here](https://developers.requestly.io/). Our docs can help with
- Getting Started
- Product Documentation
- FAQs
- Troubleshooting

## 👩‍💻 Development

This repository contains the source code for Browser extension and UI application which make up the core of Requestly.
Please follow the [Getting Started Guide](./getting-started.md) to get to know about the development process in this repository.

Start working on individual modules:

- [Browser extension](./browser-extension)
- [UI application](./app)
- [Desktop application](https://github.com/requestly/requestly-desktop-app) (Electron-based application for MacOS, Linux, Windows)
- [Web SDK](https://github.com/requestly/requestly-web-sdk) (facilitates Session Recording)
- [Mock Server](https://github.com/requestly/requestly-mock-server)
- [Backend](https://github.com/requestly/requestly-backend)

## 🙏 Contributing

Read our [contributing guide](./CONTRIBUTING.md) to learn about how to propose bugfixes and improvements, and how the development process works.

For **payment/billing related issues**, feel free to contact us at [contact@requestly.io](mailto:contact@requestly.io).

## 🎯 Our Mission

Our mission is to help developers ship web and mobile apps faster and with confidence by giving them the tools to debug & resolve issues without external dependency.

## Contributors

[![All Contributors](https://img.shields.io/github/all-contributors/requestly/requestly?color=ee8449&style=flat-square)](#contributors)

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
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
      <td align="center" valign="top" width="14.28%"><a href="http://requestly.io"><img src="https://avatars.githubusercontent.com/u/3108399?v=4?s=100" width="100px;" alt="Sachin Jain"/><br /><sub><b>Sachin Jain</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=sachinjain024" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ashishsangle707"><img src="https://avatars.githubusercontent.com/u/124448580?v=4?s=100" width="100px;" alt="ashishsangle707"/><br /><sub><b>ashishsangle707</b></sub></a><br /><a href="#projectManagement-ashishsangle707" title="Project Management">📆</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/echo-sg"><img src="https://avatars.githubusercontent.com/u/56088056?v=4?s=100" width="100px;" alt="Shrey Gupta"/><br /><sub><b>Shrey Gupta</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=echo-sg" title="Code">💻</a> <a href="#projectManagement-echo-sg" title="Project Management">📆</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ncharanaraj"><img src="https://avatars.githubusercontent.com/u/43924299?v=4?s=100" width="100px;" alt="Charanaraj N"/><br /><sub><b>Charanaraj N</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=ncharanaraj" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Muhammad-Daniyal-Jawad1"><img src="https://avatars.githubusercontent.com/u/130592856?v=4?s=100" width="100px;" alt="Muhammad-Daniyal-Jawad1"/><br /><sub><b>Muhammad-Daniyal-Jawad1</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=Muhammad-Daniyal-Jawad1" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://piyush-web-app.web.app/"><img src="https://avatars.githubusercontent.com/u/43876655?v=4?s=100" width="100px;" alt="PIYUSH NEGI"/><br /><sub><b>PIYUSH NEGI</b></sub></a><br /><a href="https://github.com/requestly/requestly/commits?author=npiyush97" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Special Mentions
A big shoutout to these amazing Open Source projects that have helped make Requestly possible.
- [rrweb](https://github.com/rrweb-io/rrweb)
