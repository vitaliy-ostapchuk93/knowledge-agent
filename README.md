# Universal Knowledge Agent

A cross-platform knowledge management integration system that provides unified access to various knowledge management platforms (Logseq, Obsidian, Notion, etc.) and content sources.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or higher (recommended package manager)
- Node.js v18+ (fallback)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd knowledge-agent

# Install dependencies with Bun
bun install
```

### Development

```bash
# Start development server with hot reload
bun dev

# Run tests
bun test

# Run linting
bun run lint

# Build the project
bun run build
```

### Scripts

- `bun dev` - Start development server with file watching
- `bun test` - Run all tests using Bun's built-in test runner
- `bun run build` - Build the project using Bun's native bundler
- `bun run build:tsc` - Build using TypeScript compiler (alternative)
- `bun run lint` - Run ESLint
- `bun run check` - Run both linting and tests
- `bun run demo` - Run demonstration/proof of concept

## 🏗️ Architecture

Based on the solution strategy outlined in the documentation, this system implements:

1. **Facade Pattern** - Unified interface for all knowledge management systems
2. **Adapter Pattern** - Platform-specific integrations (Logseq, Obsidian, Notion)
3. **Strategy Pattern** - Configurable content discovery and AI enhancement
4. **Observer Pattern** - Real-time synchronization and updates
5. **Plugin Architecture** - Extensible system for adding new platforms

## 📁 Project Structure

```txt
src/
├── interfaces/         # Core interfaces and contracts
├── types/             # TypeScript type definitions
├── adapters/          # Platform-specific adapters
├── strategies/        # Content discovery strategies
├── cache/            # Caching implementations
├── ai/               # AI enhancement modules
├── demo/             # Demonstration and examples
└── index.ts          # Main entry point
```

## 🔧 Configuration

The project uses Bun as the primary package manager and runtime. Configuration files:

- `bunfig.toml` - Bun-specific configuration
- `tsconfig.json` - TypeScript configuration optimized for Bun
- `package.json` - Project dependencies and scripts

## 🧪 Testing

This project uses Bun's built-in test runner, which is faster than Jest and requires no additional configuration:

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/knowledge-agent.main.test.ts
```

## 📚 Development Workflow

1. **Development**: Use `bun dev` for hot reloading during development
2. **Testing**: Run `bun test` to ensure all tests pass
3. **Linting**: Use `bun run lint` to check code quality
4. **Building**: Use `bun run build` for production builds

## 🎯 Goals

As outlined in the project documentation:

- **Unified Interface**: Single API for multiple knowledge management platforms
- **Intelligent Content Discovery**: AI-powered content recommendations
- **Real-time Synchronization**: Keep data in sync across platforms
- **Extensible Architecture**: Easy to add new platforms and features
- **Cross-platform Compatibility**: Works on Windows, macOS, and Linux

## 📝 Next Steps

1. Implement core interfaces and types
2. Create platform adapters for Logseq, Obsidian, and Notion
3. Develop content discovery strategies
4. Add AI enhancement capabilities
5. Build comprehensive test suite
6. Create demonstration applications

---

For more detailed information, see the documentation in the `docs/` folder.
