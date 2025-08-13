
![Requestly Logo](https://github.com/user-attachments/assets/d0f13ec3-ca42-4b6c-ab6c-16e380ad04b3)

<br/>

## Requestly - A Free-Forever & Open-Source API Client with HTTP Interceptor, Modfications, API Testing & Mocking.

Requestly is a powerful combination of a local API Client (like Postman) & HTTP Interceptor (like Charles Proxy) with API Testing and Mocking. Requestly can be used directly in the browser as a Chrome Extension or installed as a desktop application.


#### ⚡ A Local-first & Powerful alternative to Postman & Charles Proxy ⚡
![requestly-overview](https://github.com/user-attachments/assets/04c32f25-96c4-46d9-a31d-b6887ce7bfdc)
<br/>

![GitHub closed issues](https://img.shields.io/github/issues-closed/requestly/requestly)     [![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/mdnleldcmiljblolnjhpnblkcekpdkpa) ![Chrome Web Store Reviews](https://img.shields.io/chrome-web-store/rating-count/mdnleldcmiljblolnjhpnblkcekpdkpa?label=reviews) ![Chrome Web Store Downloads](https://img.shields.io/chrome-web-store/users/mdnleldcmiljblolnjhpnblkcekpdkpa?label=downloads)](https://chrome.google.com/webstore/detail/redirect-url-modify-heade/mdnleldcmiljblolnjhpnblkcekpdkpa/) [![Status badge](https://uptime.betterstack.com/status-badges/v2/monitor/13j20.svg)](https://status.requestly.io)

<br/>
<br/>

## 🏡 Getting Started

*   [A Local-first Solution](#a-local-first-solution-local-workspaces)
*   [REST API Client](#rest-api-client)
*   [Environments](#environments)
*   [HTTP Interceptor - Intercept & Modify HTTP Requests](#http-interceptor--http-rules-intercept--modify-https-requests)
*   [API Mocking](#api-mocking-helps-in-building-frontend-faster-without-waiting-for-backend)
*   [1-Click Imports from Postman, Insomnia, Modheader, Charles Proxy, and Resource Override](#1-click-imports)
*   [Support Channels](#-best-in-class-support)
*   [👩‍💻 Development](#-development)
*   [🙏 Contributing](#-contributing)

<br/>
<br/>

## A Local-first Solution (Local Workspaces)

**Local Workspaces** is a simple, powerful, and privacy-friendly approach to building, testing & mocking your APIs. All your data is stored in the selected directory on your disk. You can also import all your API client files (requests, collections, environments) and codebase into VSCode and edit them directly in your IDE.

Collaborate with your colleagues using your preferred sync engine - Git, Google Drive, iCloud, or nothing at all.

**Team Workspaces** are great for seamless collaboration through Requestly sync engine.


#### ⚡ Local and team workspaces⚡

![requestly-local-first-support](https://github.com/user-attachments/assets/06f17e34-1614-4396-95ee-1416003261ad)

<br/>
<br/>

## REST API Client

[**Rest API Client**](https://docs.requestly.com/general/api-client/overview) offers a local API playground to build and test your APIs. It supports features like API Collections, Environments, Environment Switcher, API Requests History with a beautiful and collaborative interface.

#### ⚡ A Local-first, Beautiful & Powerful alternative to Postman & Insomina ⚡

![requestly-api-client](https://github.com/user-attachments/assets/a962b213-8744-4ffc-bd04-fcf891f48914)

<br/>
<br/>

## Environments

**Environment** is a set of key-value pairs that can be used in API requests. Environments feature lets you manage variables across multiple environments with an easy environment selector. We support Global variables as well as Collection level variables. [Docs](https://docs.requestly.com/general/api-client/environments-and-variables)

#### ⚡ Environments feature ⚡

![requestly-api-client-environments-support](https://github.com/user-attachments/assets/2726fe0e-9f0a-4df7-bfc9-344c65e19353)

<br/>
<br/>

## HTTP Interceptor / HTTP Rules (Intercept & Modify HTTPs Requests)

[**HTTP Rules**](https://docs.requestly.com/general/http-interceptor/overview) feature can be used to **Intercept, Monitor & Modify HTTPs requests & responses** from browsers & mobile apps.

*   Use the Chrome/Firefox/Edge extension for Intercepting & Modifying traffic from browsers
*   Use the desktop app for capturing & modifying traffic from browsers, mobile apps & other desktop apps.
    

#### ⚡ Intercept, Monitor & Modify HTTP Requests & Responses ⚡

![requestly-http-interceptor](https://github.com/user-attachments/assets/791e54cb-d817-4bc2-83a6-e8bdd3b1cef7)

<br/>
<br/>

**Different Modifications supported**

*   Redirect URLs (Map Local & Map Remote) e.g.
    *   Change Hostname, QueryParams, etc in the URL
    *   Redirect traffic from one environment to another (e.g. production to dev)
    *   Swap Tag Manager scripts from production to staging/dev environment
*   Modify HTTP Request & Response Headers
*   Modify API Request & Response body
*   Inject scripts on web pages

<br/>
<br/>

## API Mocking (Helps in building frontend faster without waiting for backend)

Requestly offers a complete API Mocking solution. Using Requestly, you can

*   [Create Local API Mocks](https://docs.requestly.com/general/api-mocking/api-mocking): Intercept the API Requests and return the new response
*   [Static & Dynamic Response Overrides](https://docs.requestly.com/general/http-rules/rule-types/modify-response-body): Override the API response received from server dynamically using simple JS
*   [GraphQL Support](https://docs.requestly.com/general/http-rules/advanced-usage/graphql-modify-request-response): Override graphQL APIs by targeting on query, operationName
*   [Create Cloud-based API Mocks](https://docs.requestly.com/general/api-mocking/create-cloud-based-mocks): Create cloud-based API Mocks and get new endpoints for the mocks
*   [Bulk API Mocks](https://docs.requestly.com/general/sessions/record-api-sessions#bulk-mocking): Record API traffic & Serve the Mocks from the recorded Session
*   Mock APIs in e2e testing: Use Requestly in your e2e Cypress/Playwright/Selenium and mock the APIs in CI pipeline
    

#### ⚡ API Mocks - Build & Test your frontend faster without waiting for backend ⚡

![requestly-api-mocking](https://github.com/user-attachments/assets/7bc00c7e-c280-40eb-9a2a-c070ecdea662)

<br/>
<br/>

## 1-Click Imports

Requestly provides **Importing Configuration** from the following tools

API Clients

*   [Import from Postman](https://docs.requestly.com/general/imports/postman)
*   [Import from Insomnia](#) - Coming Soon
*   [Import from Bruno](#) - Coming Soon

HTTP Interceptors

*   [Import from Charles Proxy](https://docs.requestly.com/general/imports/charles-proxy)
*   [Import from Resource Override](https://docs.requestly.com/general/imports/resource-override)
*   [Import from ModHeader](https://docs.requestly.com/general/imports/modheader)

#### ⚡ Import from Postman, Insomnia, CharlesProxy, ModHeader, etc. ⚡
![requestly-api-client-environments-support](https://github.com/user-attachments/assets/6186e916-9036-4847-95dd-53b66a4c2730)

<br/>
<br/>

## 🤝 Best In-Class Support

#### ⚡ Requestly is known for best product, team and Best in-class support (4.3⭐️ in 1000+ reviews) ⚡

*   [Documentation](https://docs.requestly.com/): Product Documentation and Understanding of different features
*   [Security & Privacy](https://docs.requestly.com/security-privacy/): Our Security & Privacy document
*   [Email contact@requestly.com](mailto:contact@requestly.com): Email Support
*   [StackOverflow Questions](https://stackoverflow.com/questions/tagged/requestly): Ask Questions on StackOverflow and add "Requestly" tag

<br/>
<br/>

## 👩‍💻 Development

This repository contains the source code for Browser extension and UI application which make up the core of Requestly.  
Please follow the [Getting Started Guide](./getting-started.md) to get to know about the development process in this repository.

Start working on individual modules:

*   [Browser extension](./browser-extension)
*   [UI application](./app)
*   [Desktop application](https://github.com/requestly/requestly-desktop-app) (Electron-based application for MacOS, Windows)
*   [Web SDK](https://github.com/requestly/requestly-web-sdk) (facilitates SessionBook)
*   [Mock Server](https://github.com/requestly/requestly-mock-server)
*   [Backend](https://github.com/requestly/requestly-backend)

<br/>
<br/>

## 🙏 Contributing

Currently, while Requestly is open source, we are not accepting pull requests. As a startup with a small team, our focus is on moving quickly and we currently lack the resources and documentation needed to actively support an open-source community. This will probably change in the future.

If you are still interested, read our [contributing guide](./CONTRIBUTING.md) to learn about how to propose bugfixes and improvements, and how the development process works.

## Contributors

[![All Contributors](https://img.shields.io/github/all-contributors/requestly/requestly?color=ee8449&style=flat-square)](#contributors)

<table><tbody><tr><td style="text-align:center;vertical-align:top;"><a href="https://sagarsoni.dev/"><img src="https://avatars.githubusercontent.com/u/29792913?v=4?s=100" alt="Sagar Soni" width="100px;"></a><br><a href="https://sagarsoni.dev/"><strong>Sagar Soni</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=sagarsoni7">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="http://sahil865gupta.github.io"><img src="https://avatars.githubusercontent.com/u/16779465?v=4?s=100" alt="Sahil Gupta" width="100px;"></a><br><a href="http://sahil865gupta.github.io"><strong>Sahil Gupta</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=wrongsahil">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="https://github.com/lazyvab"><img src="https://avatars.githubusercontent.com/u/6367566?v=4?s=100" alt="Vaibhav Nigam" width="100px;"></a><br><a href="https://github.com/lazyvab"><strong>Vaibhav Nigam</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=lazyvab">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="https://github.com/RuntimeTerror10"><img src="https://avatars.githubusercontent.com/u/53986600?v=4?s=100" alt="Parth Bhardwaj" width="100px;"></a><br><a href="https://github.com/RuntimeTerror10"><strong>Parth Bhardwaj</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=RuntimeTerror10">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="http://linkedin.com/in/rohanmathur91"><img src="https://avatars.githubusercontent.com/u/61556757?v=4?s=100" alt="Rohan Mathur" width="100px;"></a><br><a href="http://linkedin.com/in/rohanmathur91"><strong>Rohan Mathur</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=rohanmathur91">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="https://github.com/nafees87n"><img src="https://avatars.githubusercontent.com/u/56021937?v=4?s=100" alt="Nafees Nehar" width="100px;"></a><br><a href="https://github.com/nafees87n"><strong>Nafees Nehar</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=nafees87n">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="https://github.com/nsrCodes"><img src="https://avatars.githubusercontent.com/u/57226514?v=4?s=100" alt="Navdeep Singh Rathore" width="100px;"></a><br><a href="https://github.com/nsrCodes"><strong>Navdeep Singh Rathore</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=nsrCodes">💻</a></td></tr><tr><td style="text-align:center;vertical-align:top;"><a href="https://requestly.com"><img src="https://avatars.githubusercontent.com/u/3108399?v=4?s=100" alt="Sachin Jain" width="100px;"></a><br><a href="https://requestly.com"><strong>Sachin Jain</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=sachinjain024">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="https://github.com/ashishsangle707"><img src="https://avatars.githubusercontent.com/u/124448580?v=4?s=100" alt="ashishsangle707" width="100px;"></a><br><a href="https://github.com/ashishsangle707"><strong>ashishsangle707</strong></a><br><a href="#projectManagement-ashishsangle707">📆</a></td><td style="text-align:center;vertical-align:top;"><a href="https://github.com/echo-sg"><img src="https://avatars.githubusercontent.com/u/56088056?v=4?s=100" alt="Shrey Gupta" width="100px;"></a><br><a href="https://github.com/echo-sg"><strong>Shrey Gupta</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=echo-sg">💻</a> <a href="#projectManagement-echo-sg">📆</a></td><td style="text-align:center;vertical-align:top;"><a href="https://github.com/ncharanaraj"><img src="https://avatars.githubusercontent.com/u/43924299?v=4?s=100" alt="Charanaraj N" width="100px;"></a><br><a href="https://github.com/ncharanaraj"><strong>Charanaraj N</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=ncharanaraj">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="https://github.com/Muhammad-Daniyal-Jawad1"><img src="https://avatars.githubusercontent.com/u/130592856?v=4?s=100" alt="Muhammad-Daniyal-Jawad1" width="100px;"></a><br><a href="https://github.com/Muhammad-Daniyal-Jawad1"><strong>Muhammad-Daniyal-Jawad1</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=Muhammad-Daniyal-Jawad1">💻</a></td><td style="text-align:center;vertical-align:top;"><a href="https://piyush-web-app.web.app/"><img src="https://avatars.githubusercontent.com/u/43876655?v=4?s=100" alt="PIYUSH NEGI" width="100px;"></a><br><a href="https://piyush-web-app.web.app/"><strong>PIYUSH NEGI</strong></a><br><a href="https://github.com/requestly/requestly/commits?author=npiyush97">💻</a></td><td>&nbsp;</td></tr></tbody></table>

