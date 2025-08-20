# Security Policy

## Supported Versions

We provide security updates for the following versions of xats:

| Version | Supported          |
| ------- | ------------------ |
| 0.4.x   | :white_check_mark: |
| 0.3.x   | :white_check_mark: |
| 0.2.x   | :x:                |
| 0.1.x   | :x:                |

## Reporting a Vulnerability

We take the security of xats seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please DO NOT:

- Open a public issue on GitHub
- Post about the vulnerability on social media
- Exploit the vulnerability on production systems

### Please DO:

1. **Email us directly** at security@xats.org
2. **Include the following information:**
   - Type of vulnerability (e.g., XSS, injection, path traversal)
   - Affected package(s) and version(s)
   - Steps to reproduce the vulnerability
   - Potential impact of the vulnerability
   - Any suggested fixes or mitigations

3. **Encrypt sensitive information** using our PGP key (available at https://xats.org/security.asc)

### What to Expect

- **Acknowledgment:** We will acknowledge receipt of your report within 48 hours
- **Initial Assessment:** Within 5 business days, we will provide an initial assessment
- **Updates:** We will keep you informed of our progress
- **Fix Timeline:** Critical vulnerabilities will be addressed within 30 days
- **Credit:** We will credit you for the discovery (unless you prefer to remain anonymous)

## Security Measures

### Code Security

- **Input Validation:** All user inputs are validated and sanitized
- **Path Traversal Protection:** File references are restricted to allowed directories
- **JSON Schema Validation:** Strict schema validation prevents malformed data
- **Content Security:** Rendering engines escape user content appropriately

### Dependency Security

- **Automated Scanning:** Dependabot monitors all dependencies
- **Regular Updates:** Dependencies are updated weekly
- **License Compliance:** All dependencies are checked for compatible licenses
- **Vulnerability Monitoring:** GitHub Security Advisories are monitored

### CI/CD Security

- **Secret Scanning:** Automated scanning for exposed secrets
- **CodeQL Analysis:** Static analysis for security vulnerabilities
- **SAST:** Static Application Security Testing on all PRs
- **Container Scanning:** Docker images are scanned for vulnerabilities

### Runtime Security

- **Resource Limits:** Processing limits prevent denial of service
- **Memory Protection:** Safeguards against memory exhaustion
- **Safe Parsing:** Protected against JSON parsing vulnerabilities
- **Sandboxed Rendering:** Content rendering is sandboxed

## Security Best Practices

### For Users

1. **Keep xats Updated:** Always use the latest version
2. **Validate Input:** Always validate documents before processing
3. **Restrict File Access:** Limit file system access to necessary directories
4. **Use HTTPS:** Always use HTTPS for remote document fetching
5. **Review Extensions:** Carefully review third-party extensions

### For Contributors

1. **Follow Secure Coding:** Adhere to OWASP guidelines
2. **Validate All Input:** Never trust user input
3. **Escape Output:** Always escape content in renderers
4. **Use Parameterized Queries:** Prevent injection attacks
5. **Review Dependencies:** Check dependencies before adding

### For Extension Developers

1. **Sandbox Extensions:** Run extensions in isolated environments
2. **Limit Permissions:** Request minimum necessary permissions
3. **Validate Extension Data:** Validate all extension configuration
4. **Document Security:** Clearly document security considerations
5. **Test Thoroughly:** Include security testing in your workflow

## Known Security Considerations

### File System Access

The xats validator and renderer may access the file system to:
- Read document files
- Resolve file references ($ref)
- Write rendered output

**Mitigation:** File access is restricted to specified directories using path validation.

### Remote Content

Documents may reference remote resources:
- Images and media files
- External JSON references
- Extension resources

**Mitigation:** Remote content fetching uses:
- URL validation
- HTTPS enforcement (configurable)
- Timeout limits
- Size restrictions

### Extension System

The extension system allows third-party code:
- Custom block types
- Processing hooks
- Rendering modifications

**Mitigation:** Extensions are:
- Sandboxed by default
- Permission-based
- Validated before execution
- Auditable through logs

## Security Audit History

| Date       | Auditor        | Findings | Status    |
|------------|----------------|----------|-----------|
| 2025-01-20 | Internal Team  | 0 High   | Completed |
| 2024-12-01 | External Audit | 2 Medium | Resolved  |

## Security Headers

When serving xats content over HTTP, use these headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Compliance

xats aims to comply with:

- **OWASP Top 10:** Protection against common vulnerabilities
- **CWE Top 25:** Mitigation of dangerous software weaknesses
- **GDPR:** Privacy and data protection (where applicable)
- **WCAG 2.1:** Accessibility standards

## Security Tools

We use the following security tools:

- **GitHub Security:** Dependabot, CodeQL, Secret Scanning
- **npm audit:** Package vulnerability scanning
- **Snyk:** Continuous security monitoring
- **Trivy:** Container vulnerability scanning
- **Semgrep:** Static analysis security testing

## Contact

- **Security Team:** security@xats.org
- **PGP Key:** https://xats.org/security.asc
- **Bug Bounty:** Coming soon

## Acknowledgments

We thank the following security researchers for responsibly disclosing vulnerabilities:

- [Reserved for future contributors]

---

Last Updated: January 20, 2025
Next Review: April 20, 2025