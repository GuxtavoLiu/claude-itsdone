# Contributing to claude-itsdone

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/claude-itsdone.git
   cd claude-itsdone
   ```
3. Install locally for development:
   ```bash
   npm link
   ```

## Development

This project has **zero dependencies** — please keep it that way. Use only Node.js built-in modules.

### Project Structure

```
claude-itsdone/
├── bin/claude-itsdone.js    # CLI entry point
├── src/
│   ├── index.js          # Public API
│   ├── sound.js          # Cross-platform sound playback
│   ├── config.js         # User configuration
│   └── installer.js      # Claude Code hook installer
├── package.json
└── README.md
```

### Testing

```bash
# Test the notification sound
claude-itsdone test

# Check status
claude-itsdone status
```

## Submitting Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test on your platform (Windows, macOS, or Linux)
4. Commit with a clear message:
   ```bash
   git commit -m "Add: brief description of your change"
   ```
5. Push and open a Pull Request

## Commit Message Convention

Use a short prefix to categorize your commit:

- `Add:` — new feature or preset
- `Fix:` — bug fix
- `Docs:` — documentation only
- `Refactor:` — code change that neither fixes a bug nor adds a feature

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Update the README if your change affects usage
- Test cross-platform behavior if possible (or note which platforms you tested)
- Maintain zero external dependencies

## Reporting Bugs

Open an [issue](https://github.com/GuxtavoLiu/claude-itsdone/issues) with:

- Your OS and version
- Node.js version (`node --version`)
- Steps to reproduce
- Expected vs. actual behavior

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
