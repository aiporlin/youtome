# Cloudflare Drop - 安全文件快传工具

![Cloudflare Drop Logo](src/assets/logo.svg)

## 项目简介

Cloudflare Drop 是一个基于 Cloudflare Pages 构建的安全文件传输工具，提供端到端加密和 P2P 点对点传输功能，确保您的数据安全和快速传输。

### 主要功能

- **文件快传** - 支持多个文件同时拖拽上传和传输
- **文字快传** - 快速分享文本内容，支持长文本和代码片段
- **端到端加密** - 数据在客户端加密，只有接收者可以解密，确保传输安全
- **P2P 点对点传输** - 使用 WebRTC 技术实现浏览器间直接传输，减少服务器负担
- **响应式设计** - 完美适配手机、平板和桌面设备
- **临时存储** - 服务器不长期存储您的文件或数据
- **链接过期** - 生成的分享链接在 24 小时后自动失效

## 技术栈

- **前端框架** - 纯 JavaScript + HTML5 + CSS3
- **UI 框架** - Tailwind CSS v3
- **图标库** - Font Awesome
- **部署平台** - Cloudflare Pages
- **P2P 技术** - WebRTC
- **构建工具** - Wrangler (Cloudflare CLI)

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/username/cloudflare-drop.git
cd cloudflare-drop
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 访问 `http://localhost:8080` 查看应用

### 部署到 Cloudflare Pages

1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

2. 登录 Cloudflare
```bash
wrangler login
```

3. 部署项目
```bash
npm run deploy
```

或者通过 Cloudflare Dashboard 手动部署：
- 创建新的 Cloudflare Pages 项目
- 连接您的 GitHub 仓库
- 选择项目分支
- 构建命令：`echo "构建完成"`
- 发布目录：`.`
- 点击部署

## 使用指南

### 文件传输

1. 点击"文件传输"选项卡
2. 拖拽文件到上传区域或点击"浏览文件"选择文件
3. 可以选择启用端到端加密和 P2P 传输
4. 点击"生成链接"创建分享链接
5. 复制链接并分享给接收者

### 文字传输

1. 点击"文字传输"选项卡
2. 在文本框中输入要分享的内容
3. 可以选择启用端到端加密
4. 点击"生成链接"创建分享链接
5. 复制链接并分享给接收者

## 安全性说明

- **端到端加密** - 所有数据在发送前使用 AES-256 加密，解密密钥通过安全通道传输
- **P2P 传输** - 启用 P2P 时，文件直接在浏览器间传输，不经过服务器
- **临时存储** - 即使使用服务器中转，文件也仅临时存储 24 小时后自动删除
- **CSP 策略** - 严格的内容安全策略，防止 XSS 攻击
- **HTTPS 传输** - 全程使用 HTTPS 加密传输

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

> 注意：P2P 功能需要浏览器支持 WebRTC。如果浏览器不支持，系统会自动回退到标准传输模式。

## 贡献指南

欢迎贡献代码！请按照以下步骤操作：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [https://github.com/username/cloudflare-drop/issues](https://github.com/username/cloudflare-drop/issues)
- Email: contact@example.com