# 🤝 Contributing to CyberSensei

First off, thank you for considering contributing to CyberSensei! It's people like you that make CyberSensei such a great tool.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by the [CyberSensei Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm 9+
- **Java** 17+ and Maven 3.8+
- **Docker** 20.10+ and Docker Compose 2.0+
- **Git** 2.30+
- **IDE**: IntelliJ IDEA, VS Code, or Eclipse

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/cybersensei.git
cd cybersensei

# Add upstream remote
git remote add upstream https://github.com/your-org/cybersensei.git

# Verify remotes
git remote -v
```

---

## 🛠️ Development Setup

### Quick Setup

```bash
# Run the setup script (Linux/Mac)
./scripts/setup-dev.sh

# Or manually:

# 1. Install dependencies for all projects
cd cybersensei-node/backend && mvn clean install
cd ../dashboard && npm install
cd ../../cybersensei-central/backend && mvn clean install
cd ../dashboard && npm install
cd ../../cybersensei-teams-app/tabs && npm install
cd ../bot && npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start PostgreSQL (Docker)
docker-compose -f docker-compose.dev.yml up -d postgres

# 4. Run database migrations
cd cybersensei-node/backend
mvn liquibase:update
```

### Running Locally

```bash
# Terminal 1: Backend
cd cybersensei-node/backend
mvn spring-boot:run

# Terminal 2: Dashboard
cd cybersensei-node/dashboard
npm run dev

# Terminal 3: AI Service
cd cybersensei-node/ai
./run.sh

# Or use Docker Compose
docker-compose -f docker-compose.dev.yml up
```

---

## 📁 Project Structure

```
cybersensei/
├── cybersensei-central/      # SaaS Platform
│   ├── backend/              # Spring Boot backend
│   ├── dashboard/            # React dashboard
│   └── infrastructure/       # Monitoring configs
│
├── cybersensei-node/         # On-Premise Node
│   ├── backend/              # Spring Boot backend
│   ├── dashboard/            # React dashboard
│   ├── ai/                   # AI service (Python)
│   └── compose/              # Docker configs
│
├── cybersensei-teams-app/    # Teams Extension
│   ├── tabs/                 # React tabs
│   ├── bot/                  # Bot Framework
│   └── manifest/             # Teams manifest
│
├── docs/                     # Documentation
├── .github/                  # CI/CD workflows
└── scripts/                  # Build scripts
```

---

## 🎯 How to Contribute

### Types of Contributions

We welcome many types of contributions:

- 🐛 **Bug Reports**: Report bugs via [GitHub Issues](https://github.com/your-org/cybersensei/issues)
- ✨ **Feature Requests**: Suggest new features
- 📝 **Documentation**: Improve or add documentation
- 🔧 **Code**: Submit pull requests to fix bugs or add features
- 🧪 **Tests**: Add or improve test coverage
- 🌍 **Translations**: Help translate the app

### Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/your-org/cybersensei/issues) to avoid duplicates.

When creating a bug report, include:

- **Clear title** and description
- **Steps to reproduce** the behavior
- **Expected** vs **actual** behavior
- **Screenshots** if applicable
- **Environment** (OS, browser, versions)
- **Logs** or error messages

**Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

### Suggesting Features

Feature requests are tracked as [GitHub Issues](https://github.com/your-org/cybersensei/issues).

Include:

- **Clear title** and description
- **Use case**: Why is this feature useful?
- **Expected behavior**: How should it work?
- **Alternative solutions**: What alternatives have you considered?
- **Mockups**: If applicable, add mockups or wireframes

---

## 💻 Coding Standards

### General Principles

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **SOLID**: Follow SOLID principles
- **Clean Code**: Write self-documenting code
- **Test**: Write tests for new features

### Java (Backend)

```java
// Use Java 17 features
// Follow Spring Boot best practices
// Use Lombok for boilerplate reduction

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    
    /**
     * Find user by email.
     * 
     * @param email User email
     * @return User or empty
     */
    public Optional<User> findByEmail(String email) {
        log.debug("Finding user by email: {}", email);
        return userRepository.findByEmail(email);
    }
}
```

**Code Style:**
- Use **Spring Boot** conventions
- Follow **Google Java Style Guide**
- Use **Lombok** for DTOs and entities
- Write **Javadoc** for public methods
- Maximum line length: **120 characters**

### TypeScript/React (Frontend)

```typescript
// Use functional components with hooks
// Use TypeScript for type safety
// Follow React best practices

import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};
```

**Code Style:**
- Use **functional components** with hooks
- Use **TypeScript** strictly (no `any`)
- Follow **Airbnb React Style Guide**
- Use **Tailwind CSS** for styling
- Maximum line length: **100 characters**

### Python (AI Service)

```python
# Use Python 3.10+ features
# Follow PEP 8
# Use type hints

from typing import Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    """Chat request model."""
    prompt: str
    max_tokens: Optional[int] = 512
    temperature: Optional[float] = 0.7

async def generate_response(request: ChatRequest) -> str:
    """
    Generate AI response.
    
    Args:
        request: Chat request with prompt
        
    Returns:
        Generated response text
    """
    # Implementation
    pass
```

**Code Style:**
- Follow **PEP 8**
- Use **type hints**
- Write **docstrings** (Google style)
- Maximum line length: **100 characters**

---

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
# Feature
feat(auth): add JWT refresh token support

# Bug fix
fix(phishing): correct tracking pixel URL generation

# Documentation
docs(api): update REST API documentation

# Refactoring
refactor(quiz): extract quiz scoring logic into service

# Breaking change
feat(api)!: change user endpoint response format

BREAKING CHANGE: User endpoint now returns nested role object
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feat/my-feature
   ```

3. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat(module): add new feature"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feat/my-feature
   ```

### Submitting PR

1. Go to [GitHub](https://github.com/your-org/cybersensei)
2. Click **"New Pull Request"**
3. Select your branch
4. Fill in the PR template:

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings
```

5. Request review from maintainers
6. Address review comments
7. Wait for approval and merge

### PR Requirements

- ✅ All tests pass
- ✅ Code coverage maintained/improved
- ✅ No linter errors
- ✅ Documentation updated
- ✅ Signed commits (optional)

---

## 🧪 Testing

### Backend (Java)

```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=UserServiceTest

# Run integration tests
mvn verify

# Generate coverage report
mvn jacoco:report
```

### Frontend (React)

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests (if applicable)
npm run test:e2e
```

### Test Coverage

We aim for:
- **Backend**: 80%+ code coverage
- **Frontend**: 70%+ code coverage

---

## 📚 Documentation

### Code Documentation

- Write **Javadoc** for public Java methods
- Write **JSDoc** for exported TypeScript functions
- Write **docstrings** for Python functions
- Comment complex logic

### User Documentation

When adding features, update:

- `README.md` (if user-facing)
- API documentation (if API changes)
- User guides in `/docs`

### Architecture Documentation

For architectural changes, update:

- `/docs/ARCHITECTURE.md`
- Diagrams in `/docs/diagrams`

---

## 🏆 Recognition

Contributors will be recognized in:

- `CONTRIBUTORS.md` file
- Release notes
- Project website (if applicable)

---

## ❓ Questions?

- 💬 **Discord**: [CyberSensei Community](https://discord.gg/cybersensei)
- 📧 **Email**: dev@cybersensei.io
- 📚 **Docs**: [docs.cybersensei.io](https://docs.cybersensei.io)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to CyberSensei! 🎉**

