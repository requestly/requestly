
# Contributing to Requestly

First off, thank you for considering to contribute! It’s people like you that make Requestly such a great tool. We look forward to improve the lives of web engineers together. 

This documentation will guide you through the process of development and contribution to the Requestly source code.

## Code of conduct

We adhere to the [Requestly code of conduct](./CODE_OF_CONDUCT.md) and by participating, you are expected to uphold this code. Please report unacceptable behavior to contact@requestly.io.

## Reporting issues

We use [Github issues](https://github.com/requestly/requestly/issues) to track feature requests and bugs. Please check existing issues before filing anything new. We do our best to respond to the issues as earliest as possible. 

If you would like to contribute a fix, please let us know by leaving a comment on the issue.

## Pull Requests

Before submitting any pull request (PR), it is recommended that you first log an issue [here](https://github.com/requestly/requestly/issues) and explain your solution in comments if it is more than a typo fix. It is always a good idea to gather feedback from the team to reduce the number of iterations in code review. 

Please note that we have multiple Git repositories. The [Development](#development) section below will help you find the right repo to make changes in. But the issues are still managed centrally in this repository.

1. Fork the repo and create your branch from `master`.
2. Add a clear description covering your changes.
3. Reference the Github issue in the PR description.
4. Follow and update all items in the PR checklist.

All submissions require code review from team. So, please be patient. In case your PR is in opened state for more than 2 weeks without any response from us, feel free to escalate at contact@requestly.io.

## Development

Requestly is composed of multiple modules:
- [Browser extension](./browser-extension)
- [UI application](./app)
- [Desktop application](https://github.com/requestly/requestly-desktop-app) (Electron-based application for MacOS, Windows)
- [Mobile SDK](https://github.com/requestly/requestly-android-sdk) (to debug mobile apps)
- [Web SDK](https://github.com/requestly/requestly-web-sdk) (facilitates SessionBook)
- [Mock Server](https://github.com/requestly/requestly-mock-server)
- [Backend](https://github.com/requestly/requestly-backend)

This repository contains the source code for Browser extension and UI application which make up the core of Requestly.

Please follow the [Getting Started Guide](./getting-started.md) to get to know about the development process in this repository.

## Documentation

We try to keep our documentation always up to date. When making changes to any UI component, please make sure that you also raise a pull request to update the corresponding documentation page to reflect latest changes.

Documentations are managed in a separate repository:
https://github.com/requestly/requestly-docs

Please follow the steps in [README](https://github.com/requestly/requestly-docs/blob/master/README.md) file to get started.

## Special rules for events or bounty style contributions

To keep things fair during contribution events we follow a few extra rules. These are written so everyone gets a chance to contribute, and maintainers aren’t overwhelmed.

### The 2-Issue Limit

- A contributor can have at most 2 issues assigned at the same time.
- This helps prevent a few people from taking all the easy tasks and keeps things open for new contributors.
- Issues are assigned on a first-come-first-served basis, so comment on the issue you'd like to work on to get assigned.

### PR Merged Unlock

- You can be assigned a new issue (up to the 2-issue cap) only after one of your assigned PRs has been merged.
- This encourages finishing work and responding to review feedback.

### 7-Day Inactivity Rule

- If you’re assigned an issue but show no activity for 7 consecutive days (no commits, comments, or draft PR), the issue will be unassigned automatically.
- This keeps issues from becoming stale and available to others.

These rules follow the spirit of events like Hacktoberfest: encourage quality and fair participation. Please keep PRs meaningful and useful; low-quality or trivial PRs (that don’t help maintainers) are discouraged.
