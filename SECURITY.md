# 🔐 Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The CyberSensei team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Preferred**: Email us at **security@cybersensei.io**
2. **Alternative**: Use our [Security Advisory](https://github.com/your-org/cybersensei/security/advisories/new) feature on GitHub

### What to Include

To help us triage and address the issue quickly, please include:

- **Type of issue** (e.g., SQL injection, XSS, authentication bypass)
- **Full paths** of source file(s) related to the issue
- **Location** of the affected source code (tag/branch/commit)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept** or exploit code (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within **48 hours**
- **Initial Assessment**: We will provide an initial assessment within **5 business days**
- **Regular Updates**: We will keep you informed about the progress
- **Resolution**: We aim to resolve critical issues within **30 days**
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

### Disclosure Policy

- We follow **Coordinated Disclosure**
- Please give us reasonable time to address the issue before public disclosure
- We will coordinate with you on the disclosure timeline
- We will publicly acknowledge your responsible disclosure (with your permission)

## Security Best Practices

### For Developers

#### Backend (Spring Boot)

1. **Never commit secrets**
   ```java
   // ❌ BAD
   String password = "hardcoded_password";
   
   // ✅ GOOD
   @Value("${db.password}")
   private String password;
   ```

2. **Use parameterized queries**
   ```java
   // ❌ BAD (SQL Injection vulnerable)
   String query = "SELECT * FROM users WHERE email = '" + email + "'";
   
   // ✅ GOOD
   @Query("SELECT u FROM User u WHERE u.email = :email")
   User findByEmail(@Param("email") String email);
   ```

3. **Validate input**
   ```java
   // ✅ GOOD
   @NotBlank(message = "Email is required")
   @Email(message = "Email must be valid")
   private String email;
   ```

4. **Use HTTPS only**
   ```yaml
   server:
     ssl:
       enabled: true
   security:
     require-ssl: true
   ```

#### Frontend (React)

1. **Sanitize user input**
   ```typescript
   // ❌ BAD (XSS vulnerable)
   <div dangerouslySetInnerHTML={{__html: userInput}} />
   
   // ✅ GOOD
   <div>{sanitize(userInput)}</div>
   ```

2. **Store tokens securely**
   ```typescript
   // ❌ BAD
   localStorage.setItem('token', token);
   
   // ✅ GOOD (HttpOnly cookie set by backend)
   // Or use sessionStorage for short-lived tokens
   sessionStorage.setItem('token', token);
   ```

3. **Validate API responses**
   ```typescript
   // ✅ GOOD
   const response = await api.get<User>('/user');
   if (!isValidUser(response.data)) {
     throw new Error('Invalid response');
   }
   ```

#### AI Service (Python)

1. **Validate prompts**
   ```python
   # ✅ GOOD
   def validate_prompt(prompt: str) -> bool:
       if len(prompt) > MAX_PROMPT_LENGTH:
           raise ValueError("Prompt too long")
       if contains_injection_attempt(prompt):
           raise ValueError("Invalid prompt")
       return True
   ```

2. **Rate limiting**
   ```python
   # ✅ GOOD
   @app.post("/api/ai/chat")
   @limiter.limit("10/minute")
   async def chat(request: ChatRequest):
       pass
   ```

### For Users

#### On-Premise Deployment

1. **Change default passwords**
   ```bash
   # Update .env with strong passwords
   POSTGRES_PASSWORD=<strong-random-password>
   JWT_SECRET=<256-bit-secret>
   ```

2. **Use HTTPS**
   ```yaml
   # Configure reverse proxy (Nginx)
   server {
       listen 443 ssl http2;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
   }
   ```

3. **Keep updated**
   ```bash
   # Regularly update
   docker-compose pull
   docker-compose up -d
   ```

4. **Backup regularly**
   ```bash
   # Backup database
   make db-backup
   ```

## Known Security Features

### Authentication & Authorization

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with BCrypt
- ✅ Token expiration and refresh
- ✅ Microsoft Teams SSO integration

### Data Protection

- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (input sanitization)
- ✅ CSRF protection (SameSite cookies)
- ✅ HTTPS enforcement
- ✅ Secure headers (CSP, HSTS, etc.)

### Infrastructure Security

- ✅ Docker container isolation
- ✅ Network segmentation
- ✅ Secrets management (environment variables)
- ✅ Rate limiting on API endpoints
- ✅ Input validation on all endpoints

### Monitoring & Logging

- ✅ Security event logging
- ✅ Failed authentication tracking
- ✅ Suspicious activity detection
- ✅ Audit trail for sensitive operations

## Security Audit

Last security audit: **Not yet performed**

We welcome third-party security audits. Please contact security@cybersensei.io for coordination.

## Security Updates

Security updates are released as:

- **Critical**: Immediate patch release (within 24-48h)
- **High**: Patch release within 1 week
- **Medium**: Included in next minor release
- **Low**: Included in next major release

Subscribe to security advisories:
- GitHub: Watch → Custom → Security alerts
- Email: security-advisories@cybersensei.io

## Bug Bounty Program

We do not currently have a formal bug bounty program, but we recognize and appreciate security researchers who responsibly disclose vulnerabilities.

Recognition may include:
- Public acknowledgment in security advisory
- Credit in release notes
- Mention in CONTRIBUTORS.md
- Swag (stickers, t-shirts) for significant findings

## Compliance

CyberSensei is designed with the following compliance standards in mind:

- 🔒 **GDPR** (General Data Protection Regulation)
- 🔒 **CCPA** (California Consumer Privacy Act)
- 🔒 **SOC 2** (Service Organization Control 2)
- 🔒 **ISO 27001** (Information Security Management)

*Note: Compliance certification is in progress*

## Security Checklist for Deployment

### Before Going to Production

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (256+ bits)
- [ ] Enable HTTPS with valid certificates
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Setup backup strategy
- [ ] Configure monitoring and alerting
- [ ] Review and restrict CORS settings
- [ ] Disable debug modes
- [ ] Remove test/demo accounts
- [ ] Enable security headers
- [ ] Configure Content Security Policy
- [ ] Setup intrusion detection (optional)
- [ ] Perform security scan
- [ ] Review access logs

## Contact

- 🔐 **Security Email**: security@cybersensei.io
- 🐛 **GitHub Security Advisories**: [Link](https://github.com/your-org/cybersensei/security/advisories)
- 💬 **Private Disclosure**: Use GitHub Security Advisory feature

## Hall of Fame

We appreciate the following security researchers for their responsible disclosure:

*No entries yet - be the first!*

---

**Last Updated**: 2024-11-24  
**Version**: 1.0.0

