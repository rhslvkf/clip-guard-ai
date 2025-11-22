# 🛡️ Clip Guard AI

> Never accidentally leak API keys, tokens, or credentials to AI chatbots again.

A developer-focused browser extension that automatically detects and masks secrets/credentials when pasting into AI platforms and other websites.

## ✨ Features

### 🔐 Smart Secret Detection
- **39 Built-in Patterns**: Automatically detects AWS keys, GitHub tokens, private keys, passwords, and more
- **Zero Cloud Processing**: All detection happens locally in your browser
- **Real-time Masking**: Secrets are masked instantly as you paste

### 🎯 Protected Platforms
Pre-configured for popular AI platforms:
- ChatGPT (chatgpt.com)
- Claude (claude.ai)
- Google Gemini (gemini.google.com)
- Perplexity (www.perplexity.ai)
- Grok (grok.com)

### ⚙️ Flexible Configuration
- **7 Category Toggles**: Cloud keys, API tokens, private keys, passwords, database, network, PII
- **Per-Site Controls**: Enable/disable protection for each site independently
- **Pattern Details**: View all 39 detection patterns with explanations
- **Usage Statistics**: Track protected secrets by category and site

### 🚀 Performance
- **Lightning Fast**: 0.67ms average detection time for 10KB text (75x faster than target)
- **No UI Lag**: Sub-millisecond processing
- **Minimal Footprint**: <5MB memory usage

## 📦 Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/rhslvkf/clip-guard-ai.git
   cd clip-guard-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

## 🎨 Usage

### Basic Usage

1. **Enable Protection**: Click the extension icon to open the popup
2. **Paste as Usual**: Copy and paste code/configs into AI chat platforms
3. **Automatic Masking**: Secrets are automatically detected and masked
4. **Visual Feedback**: Toast notification shows how many secrets were protected

### Example

**Before (Original)**:
```javascript
const config = {
  awsAccessKey: 'AKIAIOSFODNN7EXAMPLE',
  githubToken: 'ghp_1234567890abcdefghijklmnopqrst',
  database: 'postgres://admin:secret@db.example.com/prod'
};
```

**After (Masked)**:
```javascript
const config = {
  awsAccessKey: '[AWS_KEY#a3f7]',
  githubToken: '[GITHUB_TOKEN#b2e9]',
  database: 'postgres://[USER#c4d1]:[PASS#e8f3]@[HOST#f9a2]/prod'
};
```

### Settings

Access advanced settings by clicking "Settings" in the popup:

- **Pattern Categories**: Toggle entire categories ON/OFF
- **Protected Sites**: Enable/disable protection per site
- **Pattern Details**: View detection rules for all 39 patterns
- **Statistics**: See how many secrets were protected by category and site

## 🔍 Detection Patterns

### Cloud Provider Keys (4 patterns)
- AWS Access Key ID
- AWS Secret Access Key
- Google Cloud API Key
- Azure Connection String

### API & Service Tokens (16 patterns)
- GitHub, GitLab, NPM tokens
- JWT, Bearer tokens
- OpenAI, Stripe, SendGrid API keys
- Slack, Discord, Telegram webhooks/tokens
- Cloudflare API tokens

### Private Keys & Certificates (6 patterns)
- RSA, EC, SSH private keys
- PGP private keys
- Generic private keys
- SSL/TLS certificates

### Passwords & Authentication (6 patterns)
- Password field assignments
- Environment variable passwords
- MySQL CLI passwords
- Curl basic auth

### Database Connections (2 patterns)
- Database connection URLs (PostgreSQL, MySQL, MongoDB, Redis)
- JDBC connection strings

### Network & Endpoints (4 patterns)
- IPv4 addresses
- Full URLs
- Quoted domain names
- HTTP endpoints

### Personal Information (1 pattern, optional)
- Email addresses (disabled by default)

## 🛠️ Development

### Project Structure
```
/src
  /background       # Background service worker
  /content          # Content scripts (paste interception)
  /popup            # Extension popup UI
  /settings         # Settings page UI
  /core             # Detection engine
  /utils            # Utilities
/public             # Static assets
/test               # Tests and benchmarks
```

### Build Commands

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Run performance tests
npx tsx test/performance-test.ts
```

### Technologies

- **TypeScript** (strict mode)
- **React 18** (hooks)
- **Vite 5** (build tool)
- **Tailwind CSS 3** (styling)
- **Chrome Extension Manifest V3**

## 📊 Performance

Benchmarked on MacBook Pro M1:

| Text Size | Average Time | vs 50ms Target |
|-----------|--------------|----------------|
| 1KB       | 0.32ms       | 0.6%           |
| 5KB       | 0.42ms       | 0.8%           |
| **10KB**  | **0.67ms**   | **1.3%** ✅    |
| 50KB      | 4.41ms       | 8.8%           |
| 100KB     | 13.20ms      | 26%            |

## 🔒 Privacy & Security

- **100% Local Processing**: No data ever leaves your browser
- **No Telemetry**: Zero analytics, zero tracking
- **Minimal Permissions**: Only `storage` and `activeTab` permissions
- **No External Servers**: All detection happens client-side
- **Open Source**: Core detection engine is fully auditable

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Adding New Patterns

1. Edit `src/core/detector.ts`
2. Add your pattern to `SECRET_PATTERNS`
3. Test with `npx tsx test/performance-test.ts`
4. Submit a PR with pattern details

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code)
- Icons from [Lucide](https://lucide.dev)
- Design inspiration from developer-first tools

## 📮 Contact

- **Issues**: [GitHub Issues](https://github.com/rhslvkf/clip-guard-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rhslvkf/clip-guard-ai/discussions)

---

**Made with ❤️ for developers who care about security**
