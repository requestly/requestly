简体中文 | [English](./CONTRIBUTING.md)
# 为 Requestly 做出贡献

首先，感谢您考虑做出贡献！正是像您这样的人使 Requestly 成为如此出色的工具。我们期待共同改善网络开发人员的生活。

本文档将指导您完成开发和贡献 Requestly 源代码的过程。

## 行为准则

我们遵守 [Requestly行为准则](./CODE_OF_CONDUCT.zh-CN.md)，通过参与，您应该遵守该准则。请向 contact@requestly.io 报告违反准则的行为。
## 报告问题

我们使用 [Github issues](https://github.com/requestly/requestly/issues)来跟踪功能请求和错误。在提交任何新内容之前，请检查现有问题。我们尽最大努力尽早对问题做出回应。
如果您想提供某个问题的修复，请通过对该问题发表评论来告知我们。

## 拉取请求（PR）

在提交任何拉取请求 （PR） 之前，建议您首先在[此处](https://github.com/requestly/requestly/issues)记录问题，如果它不仅仅是拼写错误修复，请在注释中解释您的解决方案。从团队收集反馈以减少代码审查中的迭代次数始终是一个好主意。
请注意，我们有多个 Git 仓库。下面的[开发](#development)部分将帮助你找到要进行更改的正确仓库。但问题仍在此仓库中集中管理。
1. Fork整个仓库，从`master`创建对应的分支.
2. 添加涵盖更改的清晰说明。（可以参考Husky）
3. 在 PR 描述中引用 Github 问题。
4. 关注并更新 PR 清单中的所有项目。

所有提交都需要团队进行代码审查。所以，请耐心等待。如果您的 PR 处于打开状态超过 2 周而我们没有任何回复，请随时在 <a href="mailto:contact@requestly.io">contact@requestly.io</a> 上报。

## 开发

请求由多个模块组成：
- [浏览器扩展插件](./browser-extension)
- [用户界面应用](./app)
- [桌面应用](https://github.com/requestly/requestly-desktop-app) (Electron为基座，适用于MacOS, Linux, Windows)
- [移动端SDK（安卓）](https://github.com/requestly/requestly-android-sdk) (用于调试移动应用)
- [网页端SDK](https://github.com/requestly/requestly-web-sdk) (促进会话录制)
- [模拟服务器](https://github.com/requestly/requestly-mock-server)
- [后端](https://github.com/requestly/requestly-backend)

本仓库包含浏览器扩展和UI应用程序的源代码，它们构成了 Requestly 的核心。

请按照[入门指南](./getting-started.zh-CN.md)了解此存储库中的开发过程。
## Documentation

我们尽量使我们的文档始终保持最新。对任何UI组件进行更改时，请确保您已拉取最新以更新相应的文档页面以反映最新更改。

文档在单独的存储库中管理:
https://github.com/requestly/requestly-docs

请按照[README](https://github.com/requestly/requestly-docs/blob/master/README.md)文件中的步骤开始
