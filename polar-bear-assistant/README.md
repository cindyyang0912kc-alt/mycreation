# 小北 · Polar Pal

Midea 美国家电助手 H5 交互 Demo。独立设计，非官方客服。无需后端、API 密钥、安装或构建。

体验：https://cindyyang0912kc-alt.github.io/mycreation/polar-bear-assistant/

## 已实现

- 原创 SVG 红围巾小北极熊，呼吸、眨眼、挥手与朗读时嘴部动画。
- 桌面 / 手机响应式界面、预设问题与来源链接。
- 浏览器语音识别；识别结果由用户确认后发送。不支持时用文字输入。
- 系统语音合成，优先中文女声，音色选择与试听。系统声音差异可能导致音色不一致。
- 摄像头本地预览、拍照、附图消息、结束会话与页面切后台释放摄像头。
- 输入内容安全地作为纯文本渲染，无外部脚本依赖。

## Demo 边界

没有真实 AI 问答、实时联网搜索、视觉识别、WebRTC 真人通话或云端女声。回复由关键词匹配预设内容；照片仅用于交互展示。所有回复和界面明确标识演示。

照片和消息仅保存在页面内存，不上传或持久化。语音识别由浏览器提供商实现，可能需要网络并发送音频到其服务。字体可能从 Google Fonts 加载，失败时使用系统字体。无分析追踪。

## 官方资料（2026-11-04 核查）

- Support：https://www.midea.com/us/Support
- FAQ：https://www.midea.com/us/support/faq
- MRS25I7BST 官方说明书：https://www.midea.com/content/dam/midea-aem/us/refrigerators/side-by-side/mrs25i7bst/MIDEA-MRS25I7BST-USER-MANUAL.pdf
- MAD22S1CWWT 官方说明书：https://www.midea.com/content/dam/midea-aem/us/air-conditioners/dehumidifiers/mad22s1cwwt/manual/MAD22S1CWWT-User-Guide.pdf

示例温度和清洁周期仅适用于所标注型号，不能推广到所有产品。其他问题引导到官方支持，不编造操作步骤。

## 本地运行

在此目录运行 `python3 -m http.server 8080`，打开 http://localhost:8080 。手机远程访问摄像头须使用 HTTPS；建议直接打开上方 GitHub Pages 链接。麦克风识别依赖浏览器支持、权限及网络。体验时请用系统浏览器，避免内嵌浏览器限制。

## 发布

整个目录放到现有 GitHub Pages 仓库的 `polar-bear-assistant/`。不修改仓库根目录的既有应用。

## 后续接入真实 AI

需单独部署受保护的服务端，将密钥保存在服务端环境变量；接入多模态模型、官方域名检索与引用，以及可控音色的语音合成。当前版本不包含这类接口，避免让 Demo 误被当作线上诊断服务。
