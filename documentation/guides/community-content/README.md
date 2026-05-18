# Community Content

Welcome to the Requestly Documentation repository! This is where community members can contribute tutorials, guides, use cases, and other valuable content to help fellow Requestly users.

## What is Community Content?

Community Content includes user-contributed documentation, tutorials, guides, and examples that complement the official Requestly documentation. These contributions help users discover new ways to use Requestly and solve real-world problems.

## What Can You Contribute?

We welcome various types of content, including:

- **Tutorials & Guides**, Step-by-step use cases, integrations, and best practices  
- **Use Cases & Examples**, Real-world debugging, API testing, automation workflows  
- **Code Snippets**, Scripts, regex patterns, and JS snippets  
- **Videos**, Tutorials, screencasts, and workshop recordings  

## How to Contribute

### 1. Fork the Repository

Fork the [requestly-docs](https://github.com/requestly/requestly-docs) repository to your GitHub account.

### 2. Create Your Content

Create your content file in the `/guides/community-content` folder:

```bash
cd guides/community-content
# Create your content file (use .md or .mdx format)
touch your-tutorial-name.mdx
```

### 3. Follow the Content Structure

Use this template for your content:

```mdx
---
title: Your Tutorial Title
author: Your Name
authorUrl: https://github.com/yourusername
date: YYYY-MM-DD
description: A brief description of your content
tags: [api-testing, debugging, automation]
difficulty: beginner|intermediate|advanced
---

## Introduction

Brief introduction to what this tutorial covers and what users will learn.

## Prerequisites

- List any prerequisites
- Tools or knowledge required
- Requestly features needed

## Step-by-Step Guide

### Step X: [Step Title]

Detailed explanation with code examples or screenshots.

## Examples

Provide practical examples that users can follow.

## Conclusion

Summarize takeaways and next steps.

## Additional Resources

- Link to related Requestly documentation
- External references
- Your social media or blog
```

### 4. Content Guidelines

#### Quality Standards
- Write clear, concise, and accurate content
- Include practical examples and screenshots
- Test all code snippets and instructions
- Proofread for grammar and spelling
- Use proper Markdown formatting

#### Technical Requirements
- Use .mdx format (supports [Mintlify components](https://www.mintlify.com/docs))
- Include frontmatter metadata (title, label, description, tags)
- Add syntax-highlighted code blocks
- Optimize images (≤1 MB, store in /images/community-content/)
- We use [Mintlify](https://www.mintlify.com/docs) for our documentation. You can refer to their documentation for available components, formatting options, and interactive elements.

#### Content Standards
- Keep content beginner-friendly when possible
- Explain technical terms and concepts
- Include real-world use cases

### 5. Submit a Pull Request

1. Commit your changes:
```bash
git add .
git commit -m "Add: [Your Tutorial Title]"
```

2. Push to your fork:
```bash
git push origin your-branch-name
```

3. Create a Pull Request to the main repository with:
   - Clear title describing your contribution
   - Description of what you're adding
   - Screenshots or examples if applicable

## Review Process

1. **Community Review**: Other contributors may provide feedback
2. **Maintainer Review**: Requestly team members will review for quality and accuracy
3. **Approval & Merge**: Once approved, your content will be merged and published

## Questions?

- **Documentation**: [docs.requestly.com](https://docs.requestly.com)
- **GitHub Discussions**: [github.com/requestly/requestly/discussions](https://github.com/requestly/requestly/discussions)
- **Discord**: [Join our Discord community](https://rqst.ly/join-community)
- **Email**: contact@requestly.io

## Thank You!

Thank you for contributing to Requestly! Your contributions help developers worldwide build better applications and debug more efficiently.

---

**Happy Contributing!**
