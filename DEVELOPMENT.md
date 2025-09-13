# Development Workflow Guidelines

## Branch Protection Strategy

Since this is a private repository on GitHub Free, we implement workflow-based branch protection instead of GitHub's built-in branch protection rules.

## Branch Naming Convention

All feature branches must follow this naming pattern:

### Required Prefixes

- `feature/` - New features and enhancements
- `bugfix/` - Bug fixes and patches
- `hotfix/` - Critical production fixes
- `chore/` - Maintenance and tooling
- `docs/` - Documentation updates
- `test/` - Testing improvements
- `refactor/` - Code refactoring

### Examples

```bash
feature/user-authentication
feature/knowledge-discovery-engine
bugfix/fix-memory-leak-cache
bugfix/resolve-timeout-issues
hotfix/critical-security-patch
chore/update-dependencies
chore/improve-ci-pipeline
docs/api-documentation
docs/setup-instructions
test/integration-test-coverage
refactor/extract-content-processor
```

## Pull Request Requirements

### Title Format (Conventional Commits)

PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <description>

Examples:
feat: add user authentication system
fix: resolve login timeout issue
docs: update API documentation
chore: update project dependencies
test: add integration test coverage
refactor: extract content processor class
```

### Required Content

1. **Meaningful Title** - Describes what the PR accomplishes
2. **Detailed Description** - Minimum 20 characters explaining:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
3. **Breaking Changes** - Clearly marked if any exist

## Development Workflow

### 1. Start New Work

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Alternative: Create branch from current location
git switch -c feature/your-feature-name
```

### 2. Work on Your Branch

```bash
# Make your changes
# ... edit files ...

# Stage and commit changes
git add .
git commit -m "feat: implement core feature functionality"

# Push branch to remote
git push origin feature/your-feature-name
```

### 3. Create Pull Request

```bash
# Using GitHub CLI (recommended)
gh pr create \
  --title "feat: add user authentication system" \
  --body "Implements JWT-based authentication with session management"

# Or create PR through GitHub web interface
```

### 4. PR Review Process

The automated PR validation will check:

- ✅ Branch name follows convention
- ✅ PR title uses conventional commits
- ✅ PR has adequate description
- ✅ Code passes linting and formatting
- ✅ All tests pass
- ✅ Architecture compliance
- ✅ No merge conflicts

### 5. Merge Process

```bash
# After approval, merge via GitHub interface
# DO NOT merge locally and push to main

# Clean up after merge
git checkout main
git pull origin main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Quality Gates

Every PR must pass:

1. **Code Quality**
   - TypeScript compilation (`bun run typecheck`)
   - ESLint checks (`bun run lint`)
   - Prettier formatting (`bun run format:check`)

2. **Testing**
   - Unit tests (`bun test`)
   - Architecture tests (`bun run test:arch`)
   - Integration tests (if applicable)

3. **Branch Policies**
   - Valid branch naming
   - Conventional commit titles
   - Adequate PR description
   - No merge conflicts

## Branch Protection Features

### Automated Enforcement

- **Branch Name Validation** - Rejects invalid branch names
- **PR Title Validation** - Enforces conventional commits
- **Quality Checks** - Runs full test and lint suite
- **Merge Conflict Detection** - Prevents problematic merges
- **Direct Push Detection** - Creates issues for bypassed workflow

### Warning System

Direct pushes to `main` trigger:

- Automatic issue creation
- Commit details logging
- Workflow violation alerts
- Remediation guidance

## Common Commands

### Branch Management

```bash
# List all branches
git branch -a

# Switch to existing branch
git checkout branch-name
git switch branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Sync with main
git checkout main
git pull origin main
git checkout your-branch
git rebase main  # or git merge main
```

### PR Management

```bash
# Create PR
gh pr create

# List PRs
gh pr list

# View PR details
gh pr view 123

# Checkout PR locally for testing
gh pr checkout 123

# Merge PR (after approval)
gh pr merge 123 --squash
```

### Quick Fixes

```bash
# Fix lint issues
bun run lint:fix

# Fix formatting
bun run format

# Run all quality checks
bun run check

# Fix common issues
bun run fix
```

## Emergency Procedures

### Hotfix Process

For critical production issues:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue-description

# Make minimal fix
# ... edit files ...
git commit -m "hotfix: resolve critical security vulnerability"

# Push and create PR immediately
git push origin hotfix/critical-issue-description
gh pr create --title "hotfix: resolve critical security vulnerability"

# Request immediate review and merge
```

### Reverting Changes

```bash
# Revert a commit
git revert <commit-hash>

# Revert a PR merge
git revert -m 1 <merge-commit-hash>

# Create PR for reversion
gh pr create --title "revert: undo problematic changes"
```

## Best Practices

### Before Starting Work

1. Always pull latest main
2. Create descriptive branch names
3. Plan your commits logically
4. Consider breaking large changes into smaller PRs

### During Development

1. Commit frequently with clear messages
2. Run tests locally before pushing
3. Keep PRs focused and reviewable
4. Update documentation as needed

### PR Creation

1. Write clear, descriptive titles
2. Provide context in description
3. Link related issues
4. Request specific reviewers when needed
5. Mark as draft if work in progress

### After Merge

1. Delete feature branches promptly
2. Pull main and update local branches
3. Monitor for any issues in production
4. Update related documentation

## Troubleshooting

### Common Issues

**"Branch name doesn't follow convention"**

```bash
git branch -m old-name feature/new-descriptive-name
```

**"PR title format invalid"**

- Update PR title to use conventional commits format
- Examples: `feat:`, `fix:`, `docs:`, `chore:`

**"Merge conflicts detected"**

```bash
git checkout your-branch
git rebase main
# Resolve conflicts
git rebase --continue
git push --force-with-lease
```

**"Quality checks failed"**

```bash
bun run fix      # Fix lint and format issues
bun run check    # Verify all issues resolved
```

This workflow ensures code quality while maintaining development velocity through automation and clear guidelines.
