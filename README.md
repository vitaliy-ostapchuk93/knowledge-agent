# Universal Knowledge Agent

<br>
<a href="https://vshymanskyy.github.io/StandWithUkraine">
 <img src="https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg">
</a>
<br>
<br>
<br>

<!-- Workflow & Quality Badges -->

[![CI/CD Pipeline](https://github.com/vitaliy-ostapchuk93/knowledge-agent/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/vitaliy-ostapchuk93/knowledge-agent/actions/workflows/ci.yml)
[![Quality](https://github.com/vitaliy-ostapchuk93/knowledge-agent/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/vitaliy-ostapchuk93/knowledge-agent/actions/workflows/quality.yml)
[![Dependencies](https://github.com/vitaliy-ostapchuk93/knowledge-agent/actions/workflows/dependency-updates.yml/badge.svg?branch=main)](https://github.com/vitaliy-ostapchuk93/knowledge-agent/actions/workflows/dependency-updates.yml)
[![Security](https://img.shields.io/badge/Security-A%2B-green.svg)](https://github.com/vitaliy-ostapchuk93/knowledge-agent)

[**📥 Download Latest Release**](https://github.com/vitaliy-ostapchuk93/knowledge-agent/releases/latest) | [📖 Documentation](docs/) | [💬 Discussions](https://github.com/vitaliy-ostapchuk93/knowledge-agent/discussions)

The Universal Knowledge Agent is an intelligent knowledge discovery and synthesis system that automatically curates and summarizes relevant content from multiple sources, designed to enhance personal knowledge management workflows.

**Our mission** is to empower knowledge workers and researchers by creating an intelligent agent that seamlessly integrates external knowledge sources with personal knowledge management systems, automatically discovering and synthesizing relevant documentation, tutorials, and expert content to create dense, interconnected summaries that enhance personal knowledge graphs and accelerate learning.

## ✨ Key Features

It provides a number of features that make it easy to build comprehensive knowledge bases:

- 🔍 **Intelligent Content Discovery** - Automated curation from web sources, documentation, Reddit, and YouTube
- 🧠 **AI-Powered Synthesis** - Dense, actionable summaries using advanced language models
- 📝 **Universal Integration** - Seamless compatibility with Logseq, Obsidian, Notion, and markdown
- 🔗 **Knowledge Linking** - Automatic connection of new insights to existing knowledge graphs
- ⚡ **Productivity Focus** - Reduce research time for technical topics
- 🎯 **Contextual Intelligence** - Understand existing knowledge base to avoid redundancy
- 📚 **Quality over Quantity** - Curated high-quality sources with depth over breadth
- 🚀 **Real-time Processing** - Live content monitoring and intelligent caching
- ...and much more 💫

## 🤔 Why Universal Knowledge Agent?

Universal Knowledge Agent addresses the growing challenge of information overload that knowledge workers face daily. Instead of spending hours manually searching through documentation, tutorials, and forums, you can focus on what matters most - applying knowledge to solve real problems.

**🎯 Built for Modern Knowledge Workers**: Whether you're a developer exploring new frameworks, a researcher building comprehensive notes, or a product manager staying current with industry trends, Universal Knowledge Agent adapts to your workflow and amplifies your productivity.

**🔒 Privacy-First Approach**: Your knowledge remains yours. The agent works locally with your preferred tools (Logseq, Obsidian, Notion) while optionally leveraging AI services only when you choose to enable them.

**🧠 Intelligent, Not Overwhelming**: Rather than dumping raw information, the agent creates thoughtful, interconnected summaries that build upon your existing knowledge base, helping you develop deeper understanding over time.

[**📥 Try the Demo Now**](https://github.com/vitaliy-ostapchuk93/knowledge-agent/releases/latest) - No account required, works offline

## Table of Contents

- [🤔 Why Universal Knowledge Agent?](#-why-universal-knowledge-agent)
- [🚀 Getting Started](#-getting-started)
- [💻 Development](#-development)
- [🏗️ Architecture](#️-architecture)
- [🔧 Configuration](#-configuration)
- [🧪 Testing](#-testing)
- [✨ Features](#-features)
- [🤝 Contributing](#-contributing)
- [📚 Documentation](#-documentation)
- [📝 Next Steps](#-next-steps)
- [🌟 Community & Resources](#-community--resources)
- [🔍 Support](#-support)
- [⚖️ License](#️-license)

## 🚀 Getting Started

To start using Universal Knowledge Agent, follow these simple steps:

1. **[Download](https://github.com/vitaliy-ostapchuk93/knowledge-agent/releases/latest)** the latest release for your platform
2. **Install** the agent and launch the application
3. **Start discovering** knowledge ✨

That's it! You can now enjoy automated knowledge curation and synthesis. Have fun! 🎉

### 🛠️ Developer Installation

For developers who want to contribute or customize the agent:

```bash
# Clone the repository
git clone https://github.com/vitaliy-ostapchuk93/knowledge-agent.git
cd knowledge-agent

# Install dependencies
bun install

# Run the interactive demo (no API keys required)
bun run demo
```

> **💡 Tip:** The demo showcases core functionality with mock data, creating a sample knowledge base in the `demo-knowledge-base` directory. For enhanced AI features, set your `OPENAI_API_KEY` environment variable.

### Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or higher (recommended)
- [Node.js](https://nodejs.org/) v22+ (alternative runtime)
- Optional: [OpenAI API](https://platform.openai.com/api-keys) key for enhanced AI features

### Quick Example

```typescript
import { KnowledgeAgent } from './src/core/knowledge-agent.js';

const agent = new KnowledgeAgent({
  platform: 'markdown',
  aiStrategy: 'openai', // or 'mock' for development
});

// Discover and synthesize knowledge on any topic
const result = await agent.processQuery('React Server Components');
console.log(result.summary);
```

## 💻 Development

### Available Scripts

- `bun dev` - Start development server with hot reload
- `bun run demo` - Run the MVP demonstration
- `bun test` - Run all tests (unit, integration, architecture)
- `bun test:watch` - Run tests in watch mode
- `bun test:arch` - Run architecture compliance tests
- `bun run lint` - Run ESLint code analysis
- `bun run format` - Format code with Prettier
- `bun run typecheck` - Type checking with TypeScript
- `bun run check` - Run full quality checks (lint, format, typecheck, tests)
- `bun run build` - Build for production

### Environment Configuration

```bash
# Optional: Enable enhanced AI features
export OPENAI_API_KEY="your-api-key-here"

# Optional: Configure cache settings
export CACHE_TTL="3600"
```

## 🏗️ Architecture

The Universal Knowledge Agent uses a clean, modular design that's easy to extend and maintain:

- **Intelligent Discovery** - Automatically finds relevant content from multiple sources
- **AI Processing** - Summarizes and extracts insights using configurable AI strategies
- **Smart Integration** - Links new content with your existing knowledge base
- **Platform Adapters** - Works seamlessly with your preferred tools (Markdown, Logseq, Obsidian, Notion)
- **Domain-Aware Taxonomy** - Learns and classifies technical terms intelligently

### Key Benefits

- **Modular Design** - Easy to customize and extend
- **Multiple AI Strategies** - Choose between local processing or cloud services
- **Platform Agnostic** - Works with any knowledge management tool
- **Performance Optimized** - Intelligent caching and efficient processing

## 🔧 Configuration

The project uses Bun as the primary runtime with TypeScript. Key configuration files:

- `bunfig.toml` - Bun runtime and package manager settings
- `tsconfig.json` - TypeScript compiler configuration
- `eslint.config.js` - Code quality and style rules
- `package.json` - Dependencies, scripts, and project metadata

## 🧪 Testing

Comprehensive testing strategy using Bun's built-in test runner:

```bash
# Run all tests
bun test

# Run tests in watch mode for development
bun test --watch

# Run specific test categories
bun test:arch           # Architecture compliance tests
bun test tests/unit/    # Unit tests only
bun test tests/integration/  # Integration tests only

# Run tests with coverage
bun test --coverage
```

### Test Categories

- **Unit Tests** - Individual component testing
- **Integration Tests** - Component interaction testing
- **Architecture Tests** - SOLID principles and design pattern compliance
- **E2E Tests** - End-to-end workflow validation

## 🚀 CI/CD & Automation

The project includes comprehensive GitHub Actions workflows for automated building, testing, and quality assurance:

### Automated Workflows

- **🔄 CI/CD Pipeline** (`.github/workflows/ci.yml`)
  - Multi-version Bun testing (1.0.0, latest)
  - TypeScript compilation and linting
  - Full test suite with coverage reporting
  - Build verification and artifact generation
  - Automated architecture compliance checks

- **🔍 Code Quality Checks** (`.github/workflows/quality.yml`)
  - Static analysis with ESLint and TypeScript
  - Security vulnerability scanning
  - Performance benchmarks and memory usage tests
  - Documentation and API surface validation
  - Weekly scheduled quality audits

- **📦 Dependency Management** (`.github/workflows/dependency-updates.yml`)
  - Automated dependency updates (weekly)
  - Security audit monitoring
  - Pull request creation for updates
  - Compatibility testing after updates

- **✅ PR Validation** (`.github/workflows/pr-validation.yml`)
  - Conventional commit title validation
  - Change impact analysis and automated comments
  - Merge conflict detection
  - PR size and complexity warnings

- **🏷️ Release Automation** (`.github/workflows/release.yml`)
  - Automated release builds on version tags
  - Release asset generation and publishing
  - GitHub release creation with changelogs

### Quality Gates

All pull requests must pass:

- ✅ TypeScript compilation with strict settings
- ✅ All 261+ automated tests
- ✅ Architecture compliance validation
- ✅ Code formatting and linting checks
- ✅ Security vulnerability scans

### Monitoring & Metrics

- 📊 **Test Coverage**: Automated coverage reporting with Codecov
- 🏗️ **Architecture Validation**: Dependency rules and design pattern compliance
- 🔒 **Security**: Regular dependency audits and vulnerability scanning
- ⚡ **Performance**: Benchmark tracking and memory usage monitoring

## ✨ Features

### Current MVP Features

✅ **Content Discovery**

- Web content extraction and analysis
- Reddit post and comment mining
- YouTube video metadata and transcript processing
- Mock discovery for development and testing

✅ **AI Processing**

- OpenAI integration for content summarization
- Mock AI strategy for development without API keys
- Configurable summarization strategies

✅ **Knowledge Management**

- Markdown file-based knowledge storage
- Intelligent content linking and cross-referencing
- File system monitoring for real-time updates

✅ **Caching & Performance**

- Memory-based caching with TTL support
- Event-driven architecture for scalability
- Efficient content deduplication

### Planned Features

🔄 **Platform Integrations**

- Logseq plugin development
- Obsidian plugin support
- Notion API integration

🔄 **Enhanced AI Features**

- Multiple AI provider support
- Custom summarization prompts
- Knowledge graph analysis

🔄 **Advanced Discovery**

- GitHub repository analysis
- Stack Overflow integration
- Academic paper discovery

### Core Values

- 🎯 **Contextual Intelligence** - Understand your existing knowledge base and provide relevant connections while avoiding redundant information
- 🔗 **Seamless Integration** - Native experience with minimal friction, respecting existing workflows and conventions
- 📚 **Quality over Quantity** - Curate high-quality sources with depth and understanding over breadth
- 🚀 **Productivity Focus** - Reduce research time and accelerate the transition from learning to application

### Target Users

- 👨‍💻 **Software developers** researching new technologies
- ✍️ **Technical writers** creating comprehensive documentation
- 🎓 **Students and researchers** building knowledge bases
- 📊 **Product managers** exploring market trends and technologies
- 🗂️ **Anyone** maintaining a personal knowledge management system

## 🤝 Contributing

We welcome contributions! Please see our [development workflow](#-development) and:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `bun run check`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- [Mission & Vision](docs/mission-vision.md) - Project goals and objectives
- [Architecture Overview](docs/02-architecture-constraints.md) - System design principles
- [MVP Implementation Plan](docs/mvp-implementation-plan.md) - Development roadmap
- [Quality Model](docs/quality-model.md) - Quality attributes and metrics

## 📝 Next Steps

**Current Focus**: MVP Enhancement

- ✅ Core architecture and patterns implemented
- ✅ Basic content discovery working
- ✅ AI integration with fallback strategies
- 🔄 Comprehensive testing suite expansion
- 🔄 Platform-specific adapter development

**Immediate Roadmap**:

1. Complete architecture compliance testing
2. Enhance content discovery algorithms
3. Develop Logseq plugin prototype
4. Implement real-time knowledge graph updates
5. Add comprehensive error handling and logging

## 🌟 Community & Resources

### 💬 Connect with the Community

Currently building our community! Here's how you can get involved:

- **GitHub Discussions**: [Join conversations](https://github.com/vitaliy-ostapchuk93/knowledge-agent/discussions) - Ask questions, share workflows, and connect with other users
- **GitHub Issues**: [Report bugs & request features](https://github.com/vitaliy-ostapchuk93/knowledge-agent/issues) - Help us improve the project

> 🚧 **Coming Soon**: project website, and community resources! Stay tuned for updates...

### 📚 Learn More

- **Documentation**: [Full Documentation](docs/) - Comprehensive guides and API reference
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/vitaliy-ostapchuk93/knowledge-agent/issues) - Report bugs and technical issues
- **Feature Discussions**: [GitHub Discussions](https://github.com/vitaliy-ostapchuk93/knowledge-agent/discussions) - Share ideas and get community help

### 🎯 Feature Requests

Have an idea to make Universal Knowledge Agent better? We'd love to hear it! Share your feature requests in our [GitHub Discussions](https://github.com/vitaliy-ostapchuk93/knowledge-agent/discussions).

Your feedback helps us understand user needs and prioritize features that matter most to the community.

## 🔍 Support

- **Issues**: [GitHub Issues](https://github.com/vitaliy-ostapchuk93/knowledge-agent/issues)

- _TBD_

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

> I'd really appreciate your support. [Buy Vitaliy Ostapchuk a coffee a coffee ☕](https://buymeacoffee.com/vitaliy.ostapchuk).

![coffee](/assets/bmc_qr_small.png)

Universal Knowledge Agent is inspired by and builds upon the excellent work of knowledge management pioneers:

- **[Logseq](https://logseq.com/)** - For demonstrating the power of local-first, block-based knowledge graphs
- **[Obsidian](https://obsidian.md/)** - For creating an extensible, community-driven knowledge management ecosystem
- **[Notion](https://notion.so/)** - For showing how databases and documents can work together seamlessly
- **[Roam Research](https://roamresearch.com/)** - For pioneering bi-directional linking and networked thought

We're grateful to the open-source community and the tools that make this project possible:

- **[Bun](https://bun.sh/)** - The fast, all-in-one JavaScript runtime
- **[TypeScript](https://typescriptlang.org/)** - For type safety and developer experience
- **[OpenAI](https://openai.com/)** - For advancing AI capabilities that enhance knowledge work

---

**Built with ❤️ using [Bun](https://bun.sh/) and TypeScript**

_Empowering knowledge workers, one insight at a time._
