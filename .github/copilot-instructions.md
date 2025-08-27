# GitHub Copilot Agent Instructions for Knowledge Agent Project

## Project Overview

This is a TypeScript-based Universal Knowledge Agent that follows clean architecture principles and implements comprehensive knowledge management capabilities. The system discovers, processes, and integrates knowledge from multiple sources into knowledge management platforms.

## Documentation Reference

### Architecture Documentation (arc42)

- **Introduction & Goals**: See `docs/01-introduction-goals.md`
- **Architecture Constraints**: See `docs/02-architecture-constraints.md`
- **System Scope & Context**: See `docs/03-system-scope-context.md`
- **Solution Strategy**: See `docs/04-solution-strategy.md`
- **Building Blocks**: See `docs/05-building-blocks.md`

**Always consult the arc42 documentation before making architectural decisions.**

## Core Development Principles

### 1. **Collaborative Development & Communication**

- **Ask clarifying questions**: Never assume requirements are complete or correct
- **Request feedback early**: Share design decisions and get input before implementation
- **Validate assumptions**: Confirm understanding of business requirements
- **Question unclear inputs**: If requirements are ambiguous, ask for clarification
- **Propose alternatives**: Suggest different approaches when appropriate
- **Document decisions**: Explain reasoning behind architectural choices

### 2. **Build & Test First Approach**

- **Run tests before any changes**: `bun test`
- **Continuous validation**: Test after every significant change
- **Build verification**: `bunx tsc --noEmit` to ensure type safety
- **Regular integration**: `bun run lint:fix && bun run format`

### 3. **Test-Driven Development**

- **Extend tests regularly**: Add tests for new functionality
- **Test vs Code Decision**: When tests fail, determine whether to fix the test or the code
  - Fix code if business logic is wrong
  - Fix test if requirements have changed
  - Validate with domain experts when uncertain
- **Maintain test coverage**: All new code should have corresponding tests

### 4. **File Organization Principle**

- **Separate into smaller files**: Each file should have a single, focused responsibility
- **Domain-driven structure**: Group related functionality by business domain
- **Interface segregation**: One interface per file with descriptive names
- **Type organization**: Split types by domain and usage patterns

## Architecture & Design Principles

### 1. **Clean Architecture Layers**

Follow the established layer structure:

- **Core Layer** (`src/core/`): Business logic, orchestration, domain services
- **Adapters Layer** (`src/adapters/`): External system integrations
- **Discovery Layer** (`src/discovery/`): Content source connectors
- **AI Layer** (`src/ai/`): AI processing strategies and implementations
- **Cache Layer** (`src/cache/`): Caching strategies and implementations
- **Events Layer** (`src/events/`): Event handling and messaging
- **Interfaces** (`src/interfaces/`): Contract definitions (one per file)
- **Types** (`src/types/`): Type definitions organized by domain

### 2. **SOLID Principles Compliance**

- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Interfaces are focused (max 8 methods recommended)
- **Dependency Inversion**: Depend on abstractions, not concretions

### 3. **Dependency Rules**

```
Interfaces & Types ← All Layers
Core ← Adapters
Core ← Discovery
Core ← AI
Core ← Cache
Core ← Events
```

**Never violate these dependency directions.**

## Code Standards & Best Practices

### 1. **Import System**

- **ALWAYS use named imports with `.ts` extensions**
- **ALWAYS use `@/` path aliases instead of relative paths**
- **Example**: `import { IContentDiscovery } from '@/interfaces/content-discovery.ts';`
- **Never use**: `import { IContentDiscovery } from '../interfaces/content-discovery';`

### 2. **File Organization & Separation**

- **One responsibility per file**: Split large files into focused, smaller files
- **Domain-driven organization**: Group by business domain, not technical layer
- **Interface files**: One interface per file with descriptive names
- **Type files**: Organize by domain (`content.ts`, `platform.ts`, `knowledge.ts`)
- **Implementation files**: Keep classes focused and cohesive

### 3. **Path Management**

- **Centralized configuration**: Use `tests/utils/test-utils.ts` PATHS object
- **No hardcoded paths**: Always use centralized path constants
- **Consistent usage**: All test files import from centralized utilities

### 4. **TypeScript Best Practices**

- **Strict type checking**: Enable all strict TypeScript options
- **No `any` types**: Use proper typing throughout
- **Interface over type unions**: Prefer interfaces for object shapes
- **Generic constraints**: Use proper generic constraints where applicable

## Testing Strategy & Quality Assurance

### 1. **Continuous Testing Approach**

- **Test before coding**: Run existing tests before making changes
- **Test after changes**: Validate all tests pass after modifications
- **Extend test coverage**: Add tests for all new functionality
- **Regular test maintenance**: Update tests when requirements change

### 2. **Test vs Code Decision Framework**

When tests fail, systematically determine the correct action:

1. **Analyze the failure**: Understand why the test is failing
2. **Review requirements**: Check if business requirements have changed
3. **Validate test correctness**: Ensure test accurately reflects intended behavior
4. **Fix accordingly**:
   - Fix code if logic is incorrect
   - Fix test if requirements have changed
   - Consult domain experts for unclear cases

### 3. **Test Structure**

```
tests/
├── utils/                    # Centralized test utilities and configurations
├── architecture/             # Architecture compliance and design validation
├── unit/                     # Isolated component testing
├── integration/              # Multi-component interaction testing
└── e2e/                      # Full system workflow testing
```

### 4. **Architecture Validation**

- **Automated compliance checking**: Use architecture tests to validate design
- **Dependency rule enforcement**: Prevent architectural violations
- **Quality attributes validation**: Test for performance, security, maintainability

## Design Patterns & Implementation Guidance

### 1. **Use Existing Interfaces**

**DO NOT create new interfaces without checking existing ones first.**

Refer to established interfaces in the codebase:

- Content discovery: `src/interfaces/content-discovery.ts`
- AI processing: `src/interfaces/ai-strategy.ts`
- Caching: `src/interfaces/cache-manager.ts`
- Events: `src/interfaces/event-bus.ts`
- Platform adapters: `src/interfaces/platform-adapter.ts`

### 2. **Strategy Pattern Usage**

- AI processing strategies for different providers
- Content discovery strategies for different sources
- Platform adaptation strategies for different tools

### 3. **Event-Driven Architecture**

- Use loose coupling through event-driven patterns
- Implement pub/sub for cross-cutting concerns
- Handle events asynchronously where appropriate

### 4. **Repository Pattern**

- Abstract data access behind repositories
- Use interfaces for data layer abstraction
- Implement caching at the repository level

## Cross-Cutting Concerns

### 1. **Error Handling & Resilience**

- **Error boundaries**: Implement proper error handling in external integrations
- **Error propagation**: Don't propagate internal errors to external boundaries
- **Meaningful messages**: Use descriptive error messages with context
- **Graceful degradation**: Provide fallbacks for non-critical operations

### 2. **Logging & Observability**

- **Structured logging**: Use consistent log levels (debug, info, warn, error)
- **No console.log**: Use proper logger: `import { logger } from '@/utils/logger.ts';`
- **Contextual information**: Include relevant context in log messages
- **Performance monitoring**: Log timing for expensive operations

### 3. **Security & Configuration**

- **Environment variables**: Use environment variables for external configurations
- **No hardcoded secrets**: Never commit sensitive information
- **Configuration validation**: Validate configuration at startup
- **Type-safe config**: Use TypeScript for configuration objects

### 4. **Performance & Scalability**

- **Caching strategy**: Implement caching for expensive operations
- **Async operations**: Use appropriate async/await patterns with timeouts
- **Resource management**: Clean up resources properly
- **Monitoring**: Provide metrics and health checks

## Build & Deployment Process

### 1. **Continuous Integration**

- **Pre-commit validation**: Always run tests before committing
- **Build verification**: Ensure TypeScript compilation succeeds
- **Linting & formatting**: Maintain code quality standards
- **Automated testing**: Run full test suite on every change

### 2. **Quality Gates**

- **Test coverage**: Maintain and improve test coverage
- **Architecture compliance**: Validate architectural constraints
- **Performance benchmarks**: Monitor performance regressions
- **Security scanning**: Check for vulnerabilities

### 3. **Regular Maintenance**

```bash
# Daily development workflow
bun test                    # Run all tests
bunx tsc --noEmit          # Type checking
bun run lint:fix && bun run format  # Code quality
bun run build              # Build verification
```

## Development Workflow & Guidelines

### 1. **Requirement Analysis & Communication**

1. **Question unclear requirements**: Ask for clarification when requirements are vague or incomplete
2. **Validate assumptions**: Confirm understanding with stakeholders before implementation
3. **Request examples**: Ask for concrete examples when dealing with abstract requirements
4. **Propose alternatives**: Suggest different approaches and explain trade-offs
5. **Document decisions**: Record why specific approaches were chosen

**Example Questions to Ask:**

- "Could you provide a specific example of how this should behave?"
- "What should happen in error cases or edge conditions?"
- "Are there performance requirements for this feature?"
- "How does this integrate with existing functionality?"
- "What are the acceptance criteria for this change?"

### 2. **Feature Development Process**

1. **Understand requirements**: Review arc42 documentation and existing interfaces
2. **Ask clarifying questions**: Don't assume - verify understanding first
3. **Design first**: Consider architecture impact before coding
4. **Seek feedback**: Share design decisions early for validation
5. **Test-driven approach**: Write tests alongside or before implementation
6. **Incremental delivery**: Break large features into smaller, testable units
7. **Validation**: Ensure all quality gates pass

### 3. **Code Review & Collaboration**

- [ ] **Requirements clarity**: Confirm requirements are well understood
- [ ] **Design feedback**: Request input on architectural decisions
- [ ] **Alternative approaches**: Consider and discuss different solutions
- [ ] **Follows established patterns**: Uses existing architecture patterns
- [ ] **Interface compatibility**: Uses existing interfaces where applicable
- [ ] **Test coverage**: Includes comprehensive tests
- [ ] **Type safety**: Maintains strict TypeScript usage
- [ ] **Import conventions**: Follows established import patterns
- [ ] **Error handling**: Includes proper error handling
- [ ] **Logging**: Has appropriate logging and monitoring

**Code Review Questions to Ask:**

- "Is this approach aligned with our architecture goals?"
- "Are there existing patterns I should follow instead?"
- "What edge cases should I consider?"
- "How does this impact performance/security/maintainability?"
- "Should this be broken into smaller components?"

### 4. **Refactoring Best Practices**

- **Question scope**: Ask if refactoring scope is appropriate
- **Seek validation**: Get approval for large architectural changes
- **Backward compatibility**: Maintain API compatibility where possible

2. Update all import paths when moving files
3. Use centralized path management
4. Validate all tests pass after changes

## Common Issues & Solutions

### 1. **Import Errors**

- **Problem**: Relative imports or missing .ts extensions
- **Solution**: Use `@/` aliases with `.ts` extensions

### 2. **Path Management**

- **Problem**: Hardcoded paths in tests
- **Solution**: Use PATHS object from test-utils

### 3. **Architecture Violations**

- **Problem**: Layer dependency violations
- **Solution**: Check architecture tests and follow dependency rules

### 4. **Test Failures**

- **Test isolation**: Ensure tests don't affect each other
- **Incremental changes**: Make small, verifiable changes
- **Documentation updates**: Update docs when changing interfaces

## Common Anti-Patterns to Avoid

### 1. **Architecture Violations**

- ❌ Core layer depending on external frameworks
- ❌ Direct file system access from business logic
- ❌ Hardcoded configuration values
- ❌ Circular dependencies between layers

### 2. **Code Quality Issues**

- ❌ Large files with multiple responsibilities
- ❌ God classes or interfaces
- ❌ Deep inheritance hierarchies
- ❌ Tight coupling between components

### 3. **Testing Problems**

- ❌ Tests that depend on external services
- ❌ Brittle tests that break with minor changes
- ❌ Insufficient test coverage for edge cases
- ❌ Tests that don't reflect actual usage patterns

## Data Format & Content Handling

### 1. **Content Processing**

- **Format validation**: Always validate input data formats
- **Transformation pipelines**: Use consistent data transformation patterns
- **Error recovery**: Provide fallbacks for malformed data
- **Schema validation**: Use TypeScript types to enforce data contracts

### 2. **External Integration**

- **API versioning**: Handle multiple API versions gracefully
- **Rate limiting**: Implement proper rate limiting for external services
- **Timeout handling**: Set appropriate timeouts for all external calls
- **Retry mechanisms**: Implement exponential backoff for transient failures

## File Organization Standards

### 1. **Separation Guidelines**

- **Maximum file size**: Keep files under 200 lines when possible
- **Single responsibility**: Each file should have one clear purpose
- **Related functionality**: Group related functions and types together
- **Clear naming**: Use descriptive, unambiguous file names

### 2. **Directory Structure**

```
src/
├── interfaces/          # One interface per file
├── types/              # Domain-specific type definitions
├── core/               # Business logic and orchestration
├── adapters/           # External system integrations
├── discovery/          # Content source connectors
├── ai/                 # AI processing implementations
├── cache/              # Caching implementations
├── events/             # Event handling
└── utils/              # Shared utilities
```

## Quality Assurance & Monitoring

### 1. **Code Quality Metrics**

- **Cyclomatic complexity**: Keep functions simple and focused
- **Test coverage**: Maintain >80% code coverage
- **Type coverage**: Ensure 100% TypeScript type coverage
- **Dependency analysis**: Regular dependency audits

### 2. **Performance Monitoring**

- **Response times**: Monitor and alert on performance degradation
- **Memory usage**: Track memory consumption patterns
- **Cache hit rates**: Monitor caching effectiveness
- **Error rates**: Track and analyze error patterns

## Tools & Commands Reference

### Daily Development

```bash
bun test                              # Run all tests
bunx tsc --noEmit                    # TypeScript type checking
bun run lint:fix && bun run format   # Code quality & formatting
bun run build                        # Build verification
```

### Quality Assurance

```bash
bun test --coverage                  # Test coverage report
bun run test:architecture           # Architecture compliance tests
bun run test:integration            # Integration tests
bun run demo                        # Run demo scenarios
```

### Troubleshooting

```bash
bun run clean                       # Clean build artifacts
bun install                         # Reinstall dependencies
bun run type-check                  # Detailed type checking
```

## Communication & Collaboration Guidelines

### 1. **Active Questioning Principles**

- **Never assume requirements are complete**: Always ask follow-up questions
- **Challenge unclear specifications**: Request concrete examples and edge cases
- **Validate business logic**: Confirm understanding with domain experts
- **Question technical decisions**: Ask about rationale behind existing patterns
- **Seek context**: Understand the broader business objectives

### 2. **Effective Feedback Requests**

- **Early design validation**: Share architectural decisions before implementation
- **Code review preparation**: Explain complex logic and design choices
- **Alternative evaluation**: Present multiple approaches with trade-offs
- **Risk assessment**: Highlight potential issues and mitigation strategies
- **Documentation clarity**: Ensure explanations are clear and comprehensive

### 3. **Common Questions to Ask**

**Requirements & Design:**

- "What are the expected input/output formats?"
- "How should the system behave under error conditions?"
- "Are there specific performance or scalability requirements?"
- "What are the security implications of this change?"
- "How does this fit into the overall system architecture?"

**Implementation & Testing:**

- "Should I follow existing patterns or create new ones?"
- "What level of backward compatibility is required?"
- "Are there existing test utilities I should use?"
- "How should I handle edge cases and error scenarios?"
- "What monitoring or logging should be included?"

**Integration & Deployment:**

- "How does this change affect other system components?"
- "Are there database migrations or configuration changes needed?"
- "What is the rollback strategy if issues arise?"
- "How should this be tested in different environments?"

---

## Final Reminders

1. **Question First**: Never assume requirements are complete - always ask clarifying questions
2. **Seek Feedback Early**: Request input on design decisions before implementation
3. **Architecture First**: Always consult arc42 documentation before making changes
4. **Test Continuously**: Build and test regularly, extend test coverage
5. **File Separation**: Keep files small and focused on single responsibilities
6. **Use Existing Interfaces**: Check existing interfaces before creating new ones
7. **Quality Gates**: Ensure all quality checks pass before committing
8. **Documentation**: Keep code self-documenting with clear interfaces and types

**Remember**: Collaboration and communication are as important as code quality. When uncertain, ask questions rather than making assumptions. The best solutions come from understanding the problem thoroughly.

**When in doubt, prioritize: Understanding > Implementation > Optimization** 5. **Quality Gates**: Ensure all quality checks pass before committing 6. **Documentation**: Keep code self-documenting with clear interfaces and types

**When in doubt, prioritize code maintainability, test coverage, and architectural consistency.**
