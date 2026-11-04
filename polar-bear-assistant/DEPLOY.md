# 连接 OpenAI：部署指南

当前状态：网页已准备好接入，后端代码尚未在你的账号部署。未连接后端时为 Demo；不能仅凭有 OpenAI 账号就开启实时通话。

## 1. 准备账号与本地工具

注册并登录 [Cloudflare](https://dash.cloudflare.com/)。电脑安装 [Node.js LTS](https://nodejs.org/)。从 GitHub 下载本仓库，进入 `polar-bear-assistant/backend` 目录。

OpenAI API Key 通过 Codex 的 OpenAI Developers 安全设置流程准备，或使用你已有的项目密钥；不要发到聊天、不要写入 GitHub、不要填到网页的访问口令框。确保项目有 API 额度与对应模型权限。

## 2. 登录与部署后端

在 `backend` 目录打开终端：

```sh
npx wrangler@latest login
npx wrangler@latest deploy
```

浏览器会要求登录并授权 Cloudflare。完成部署后，终端返回你的 HTTPS `workers.dev` 地址。保留这个地址。

`wrangler.jsonc` 已配置：

- `ALLOWED_ORIGIN`：`https://cindyyang0912kc-alt.github.io`（不带路径）。
- `OPENAI_MODEL`：`gpt-5-mini`，用于文字、图片与官方资料检索。
- `REALTIME_MODEL`：`gpt-realtime-2.1`，用于实时语音与视觉上下文。
- `AI_RATE_LIMITER`：每个 Cloudflare 节点每分钟约 10 次后端请求，不是全局费用上限。namespace_id 如与其他应用重复，请改为账号内独立整数。

## 3. 设置两项后端 Secret

在 Cloudflare 的对应 Worker → Settings → Variables and Secrets 中，以 **Secret** 类型添加并部署：

| 名称 | 内容 | 填在哪里 |
|---|---|---|
| `OPENAI_API_KEY` | 你的 OpenAI 项目密钥 | 仅后端 Secret |
| `APP_ACCESS_TOKEN` | 自行生成的 24–256 位随机访问口令 | 后端 Secret，以及网页“连接 AI”弹窗 |

访问口令和 OpenAI 密钥必须不同。建议用密码管理器生成 32 位以上随机口令。网页只把访问口令保存在当前页面内存，刷新后需重新填写。持有口令的人能使用你的 API 额度，因此不要公开分享口令。

部署后端前后都不要把真实 Secret 值提交到仓库。没有配置好 Secret 和限流绑定时，后端返回 503，不会开放模型调用。

## 4. 连接网页

打开原 GitHub Pages 体验链接，点击右上角 **连接 AI**：

1. 填入 Worker 的 HTTPS 根地址，不带 `/chat` 等路径。
2. 填入 `APP_ACCESS_TOKEN`，不是 OpenAI API Key。
3. 默认只查美的域名；需要第三方资料时勾选“允许检索公网资料”。
4. 点击“连接后端”。此步骤只检查配置，不验证模型权限，也不调用付费模型。
5. 先问一个文字问题，确认有真实回答与来源链接。服务报错会显示错误，不自动用演示回复冒充 AI。

## 5. 实时音视频

点击小熊下方 **和 midea 说话** 可开始纯语音实时对话；进入 **实时视频** → **开始实时通话**，允许相机和麦克风。接通后直接说话，无需拍照或点击发送。

- 语音通过 WebRTC 持续双向传输，服务端 VAD 自动判断说话结束，支持打断。
- 摄像头保持开启，每 2 秒自动传输一幅压缩画面；开始说话时也立即采样。不是完整视频逐帧推理，画面会有采样和网络延迟。
- 具体家电问题由 Realtime 调用 `lookup_support`，后端检索官方资料，再由 Realtime 语音回答；检索可能需要数秒。
- 远端女声配置为 `marin`，与系统 Demo 朗读声音不同。若浏览器阻止自动播放，点击“播放通话声音”。
- “关闭麦克风”只关闭音频输入，摄像头仍传输；“结束通话”、离开页面或切到后台停止全部音视频。
- 客户端体验默认 10 分钟自动结束；这不是服务器端费用硬限制。Realtime 创建后的媒体直连 OpenAI，不经 Worker 限流。此版本面向个人受控体验，不是公开多人商业服务。
- 摄像头音频与采样画面发送至 OpenAI；检索时当前画面也经后端发送到 Responses API。对话文字保存在页面内存。应用不主动写日志或保存媒体；服务提供商的数据保留适用其政策，`store:false` 不等于零保留。

## 验证与排障

```sh
node test.mjs
```

测试使用模拟上游，不消费 OpenAI 额度。真实设备通话还需部署后实际测试。

- 401：网页访问口令与后端不一致。
- 503：Secret 或 `AI_RATE_LIMITER` 绑定未配置完成。
- 502：检查 OpenAI API 额度、地区可用性、项目权限与模型名称。
- 无画面 / 无声音：检查浏览器相机、麦克风和播放权限，使用 HTTPS。浏览器内嵌页可能限制 WebRTC。
- 后端“已连接”但模型失败：健康检查仅确认配置；以首次问答和通话结果为准。

## 官方接口依据

- [OpenAI WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc)
- [Realtime 会话、图片与工具调用](https://developers.openai.com/api/docs/guides/realtime-conversations)
- [Web search 与域名限制](https://developers.openai.com/api/docs/guides/tools-web-search)
- [Cloudflare 限流绑定](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
