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

<p align="center"><a href="https://player.vimeo.com/video/783580986?h=91114ac785&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"><img src="https://user-images.githubusercontent.com/16779465/210133944-63bc6bb9-ee17-4ff7-a452-9096dc74d94c.gif" alt="Getting Started with Requestly" width="75%"/></a></p>


Requestly allows you to modify network (HTTP/S) requests by setting up **'Rules'** for **Redirects, Modifying Headers, Switching Hosts, Injecting Custom Scripts, Cancelling & Throttling Requests, Modifying request body and Modifying AJAX responses, to share debugging sessions and a whole lot more!**

Requestly also offers a library service which allows you to upload and host JS/CSS files with direct links to ease debugging process. These files can also be used directly inside rules **with a single click!**

- [Documentation](#documentation-)
- [Why Requestly](#why-requestly-)
- [Features](#features-)
- [Development](#development)
- [Contributing](#contributing-%EF%B8%8F)
- [Links](#links-)

## Documentation 📕

Please visit our [documentation](https://docs.requestly.io/) for step-by-step guide to get started with Requestly. 

## Why Requestly 🙋

![](https://user-images.githubusercontent.com/35186614/153814415-6c0c5db7-998d-47cb-bedd-696e3ac30708.png)

👨‍💻 **Easy Interface** - Primarily designed for web developers – Requestly enables easy debugging of remote & external scripts using simple Redirect & Script Rules.

🗃 **Mock Server** - Requestly lets you create a simple server which can be used in Requestly rules. No need to setup local server now.

💬 **Regex Support** - Requestly has rich interface to provide url matching conditions. Multiple Operators are supported – Equals, Contains, Regex (Matches) and Regex with wildcard too.

👯 **Auto Sync** - Requestly rules are stored in cloud so even if you change your device, when you login you will get back your rules.

💻 **Multi Browser** - Requestly is available for Chrome, Firefox and Edge. We intend to support Safari & Opera in near future. Debugging cross browser issues is lot more easier.

⬇ **Backup & Share** - Requestly allows you to download rules as text file. You can also share a list of rules by generating a public url and providing that to other users.

## Features ✨

#### 🌐 Modify Request URL

Requestly allows you to modify the url of ongoing request and you can change the url to something else. Common examples include:

- Setting up Redirects (eg, facebook.com -> quora.com)
- Creating URL shortcuts (e.g. Type j-1 in address bar will open jira.corp.example.com/projects/jira-1).
- Switching Hosts (All requests for xyz.com should go to abc.com)
- Block websites (e.g. Block social media websites to stay productive)
- Modify some part of URL (be it host, path, query parameters etc)
- Stay way from time killing sites. Setup rules like when source contains facebook.com or twitter.com then redirect to StackOverflow and do some geeky stuff.
- Test your JS running in production environment. Simply redirect your JS from prod to JS from your local setup box and test if your fix/code actually works in production site.

#### 📜 Insert Custom Scripts

- Run scripts on website and customize the web pages you want
- Support your script with popular libraries like jQuery and underscore.
- Use FileHosting service to upload long scripts and get a URL to be used in your websites or Requestly rules
- Very similar to GreaseMonkey or TamperMonkey user scripts

#### 🧮 Host JS/CSS Files

Use Library Service to host JS/CSS Files and use the URLs inside Requestly rules. No need to setup local server.

#### 🎬 Modify Headers

Modify HTTP Request & Response headers. (Extremely helpful for web developers for debugging applications)

#### 📱 Modify User Agent

- Setup different user agents for websites and test how they behave
- Useful for web developers for testing cross-device compatibility

#### 🔌 Modify API Request body and Response

- Use Modify API Request body Rule to define custom payload for any intercepted request.
- Use Modify API Response Rule to define custom response to any intercepted request.

#### 🎥 Share debugging sessions

Share debugging sessions with Video, console logs, network logs, and env details with teammates.

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
