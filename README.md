<p align="center">
<p align="center">
  <a rel="noreferrer noopener" href="https://requestly.io/">
    <img src="https://user-images.githubusercontent.com/16779465/194505910-b6a7be70-df20-4b1a-9730-06a48cdd75ac.png" alt="Requestly Logo" width="40%"/>
  </a>
</p>

<p align="center">
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/requestly/requestly"/>
  <a rel="noreferrer noopener" href="https://chrome.google.com/webstore/detail/redirect-url-modify-heade/mdnleldcmiljblolnjhpnblkcekpdkpa/">
    <img alt="Chrome Web Store Rating" src="https://img.shields.io/chrome-web-store/rating/mdnleldcmiljblolnjhpnblkcekpdkpa" />
  </a>
  <a rel="noreferrer noopener" href="https://chrome.google.com/webstore/detail/redirect-url-modify-heade/mdnleldcmiljblolnjhpnblkcekpdkpa/">
    <img alt="Chrome Web Store Reviews" src="https://img.shields.io/chrome-web-store/rating-count/mdnleldcmiljblolnjhpnblkcekpdkpa?label=reviews" />
  </a>
  <a rel="noreferrer noopener" href="https://chrome.google.com/webstore/detail/redirect-url-modify-heade/mdnleldcmiljblolnjhpnblkcekpdkpa/">
    <img alt="Chrome Web Store Downloads" src="https://img.shields.io/chrome-web-store/users/mdnleldcmiljblolnjhpnblkcekpdkpa?label=downloads" />
  </a>
</p>

<p align="center">
  <a href="https://docs.requestly.io">Docs</a> - <a href="https://requestly.io/downloads">Download</a> - <a href="https://app.requestly.io/getting-started">Getting Started</a> - <a href="https://bit.ly/requestly-slack">Support community</a> - <a href="https://github.com/requestly/requestly/issues/new?assignees=&labels=bug&template=bug-report.yml">Report a bug</a>
</p>

<h2 align="center">Supercharge ⚡ your web & mobile development using Requestly</h2>

Requestly allows you to modify network (HTTP/S) requests by setting up **'Rules'** for **Redirects, Modifying Headers, Switching Hosts, Injecting Custom Scripts, Cancelling & Throttling Requests, Modifying request body and Modifying AJAX responses, to share debugging sessions and a whole lot more!**

Requestly also offers a library service which allows you to upload and host JS/CSS files with direct links to ease debugging process. These files can also be used directly inside rules **with a single click!**

- [Documentation](#documentation-)
- [Features](#features-)
- [Development](#development)
- [Contributing](#contributing-%EF%B8%8F)
- [Links](#links-)

## Documentation 📕

Please visit our [documentation](https://docs.requestly.io/) for step-by-step guide to get started with Requestly.

## Features ✨

#### 🌐 Modify Request URL

Modify the url of ongoing request and can change the url to something else. Common examples include:

- Redirect Production to Local Environment
- Redirect to local System files (Map Local)
- Test API version changes:
- Swap Tag Manager scripts from production to staging/dev environment

#### 🔌 Modify API Request body and Response

- Work on front-end while back-end is not available or ready yet
- Modify certain part of response/request body programatically
- Modify Response of GraphQL requests

#### 📜 Insert Custom Scripts

- Run scripts on website and customize the web pages you want
- Support your script with popular libraries like jQuery and underscore.
- Use FileHosting service to upload long scripts and get a URL to be used in your websites or Requestly rules
- Very similar to GreaseMonkey or TamperMonkey user scripts

#### 🎬 Modify Headers

Modify HTTP Request & Response headers. (Extremely helpful for web developers for debugging applications)

#### 📱 Modify User Agent

- Setup different user agents for websites and test how they behave
- Useful for web developers for testing cross-device compatibility

#### 🗃 Mock Server

Host your APIs & files using Requestly Mock Server which can be directly used in rules. No need to setup local server now.

#### 🎥 Data Rich bug reports

Share data rich bug reports with Video, console logs, network logs, and env details with teammates.

## Development

This repository contains the source code for Browser extension and UI application which make up the core of Requestly.
Please follow the [Getting Started Guide](./getting-started.md) to get to know about the development process in this repository.

Start working on individual modules:

- [Browser extension](./browser-extension)
- [UI application](./app)
- [Desktop application](https://github.com/requestly/requestly-desktop-app) (Electron-based application for MacOS, Linux, Windows)
- [Mobile SDK](https://github.com/requestly/requestly-android-sdk) (to debug mobile apps)
- [Web SDK](https://github.com/requestly/requestly-web-sdk) (facilitates Session Recording)
- [Mock Server](https://github.com/requestly/requestly-mock-server)
- [Backend](https://github.com/requestly/requestly-backend)

## Contributing ⌨️

Read our [contributing guide](./CONTRIBUTING.md) to learn about how to propose bugfixes and improvements, and how the development process works.

## Links 🔗

- 🏠 Website: [https://www.requestly.io](https://www.requestly.io)
- 🌐 Web application: [https://app.requestly.io](https://app.requestly.io)
- 📖 Documentation: [https://docs.requestly.io](https://docs.requestly.io)
- Chrome Store: [Visit Chrome Store](https://chrome.google.com/webstore/detail/requestly-redirect-url-mo/mdnleldcmiljblolnjhpnblkcekpdkpa)
- 🖥️ Download Desktop App: [https://requestly.io/desktop/](https://requestly.io/desktop/)

For **payment/billing related issues**, feel free to contact us at [contact@requestly.io](mailto:contact@requestly.io)

## Our Mission

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
