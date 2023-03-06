简体中文 | [English](README.md)
<p style="text-align:center">
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
  <a href="https://docs.requestly.io">文档</a> - <a href="https://requestly.io/downloads">下载</a> - <a href="https://app.requestly.io/getting-started">入门</a> - <a href="https://bit.ly/requestly-slack">支持社区</a> - <a href="https://github.com/requestly/requestly/issues/new?assignees=&labels=bug&template=bug-report.yml">Bug提交</a>
</p>

<h2 align="center">使用 Requestly 增强 ⚡ 您的 Web 和移动开发</h2>

Requestly允许您通过为重定向设置**“规则”**来修改网络（HTTP / S）请求，**修改标头，切换主机，注入自定义脚本，取消和限制请求，修改请求正文和修改AJAX响应，以共享调试会话等等！**

Requestly还提供库服务，允许您使用直接链接上传和托管JS/CSS文件，以简化调试过程。这些文件也可以直接在规则中使用，**只需单击一下！**

- [文档](#documentation-)
- [功能](#features-)
- [开发](#development)
- [贡献](#contributing-%EF%B8%8F)
- [相关链接](#links-)

## Documentation 📕

请访问我们的[文档](https://docs.requestly.io/) 以获取分步指南，开始使用 Requestly。
## Features ✨

#### 🌐 修改请求网址

修改正在进行的请求的 url，并且可以将 url 更改为其他地址。常见示例包括：

- 将生产重定向到本地环境
- 重定向至本地系统文件（映射本地文件） (Map Local)
- 测试 API 版本更改:
- 将跟踪代码管理器脚本从生产环境交换到过渡/开发环境

#### 🔌 修改 API 请求正文和响应

- 在后端不可用或尚未准备就绪时在前端完成联调工作
- 以编程方式修改响应/请求正文的某些部分
- 修改 GraphQL 请求的响应

#### 📜 插入自定义脚本

- 在网站上运行脚本并自定义所需的网页（常用于破解）
- 使用流行的库（如jQuery和underscore）支持您的脚本
- 使用文件托管服务上传长脚本并获取要在您的网站或请求规则中使用的 URL
- 与 GreaseMonkey 或 TamperMonkey 插件的自定义用户脚本非常相似

#### 🎬 修改标头

修改 HTTP 请求和响应标头。（对 Web 开发人员调试应用程序非常有帮助）

#### 📱 修改用户代理

- 为网站设置不同的用户代理并测试它们的行为方式
- 对于 Web 开发人员测试跨设备兼容性很有用

#### 🗃  模拟服务器

使用Requestly Mock Server托管您的API和文件，该服务器可以直接在规则中使用。现在无需设置本地服务器。

#### 🎥 数据丰富的错误报告

与团队成员共享数据丰富的错误报告，包括视频、控制台日志、网络日志和环境详细信息。

## 开发
本仓库包含浏览器扩展和 UI 应用程序的源代码，它们构成了 Requestly 的核心。请按照[入门指南](./getting-started.md)了解此存储库中的开发过程。
开始揉捏各个模块：
- [浏览器插件](./browser-extension)
- [用户界面程序](./app)
- [桌面客户端](https://github.com/requestly/requestly-desktop-app) (Electron基座客户端支持MacOS, Linux, Windows)
- [移动端（安卓）工具包](https://github.com/requestly/requestly-android-sdk) (安卓App调试)
- [Web 工具包](https://github.com/requestly/requestly-web-sdk) (促进会话录制)
- [模拟服务器](https://github.com/requestly/requestly-mock-server)
- [后端](https://github.com/requestly/requestly-backend)


## 贡献 ⌨️

阅读我们的[贡献指南](./CONTRIBUTING.zh-CN.md)，了解如何提交错误修复和改进，以及开发中的工作。
## 相关链接 🔗

- 🏠 官网: [https://www.requestly.io](https://www.requestly.io)
- 🌐 Web 程序: [https://app.requestly.io](https://app.requestly.io)
- 📖 文档: [https://docs.requestly.io](https://docs.requestly.io)
- Chrome 应用商店: [Visit Chrome Store](https://chrome.google.com/webstore/detail/requestly-redirect-url-mo/mdnleldcmiljblolnjhpnblkcekpdkpa)
- 🖥️ 下载桌面端: [https://requestly.io/desktop/](https://requestly.io/desktop/)

For **payment/billing related issues**, feel free to contact us at [contact@requestly.io](mailto:contact@requestly.io)
有关**付款/账单相关问题**，请随时通过以下方式与我们联系 [contact@requestly.io](mailto:contact@requestly.io)
## 我们的使命

我们的使命是帮助开发人员更快、更自信地交付 Web 和移动应用程序，方法是提供调试和解决问题的工具，而无需外部依赖。
