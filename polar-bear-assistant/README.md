# midea · 美国家电陪伴助手

蓝白主题、居中的写实北极熊幼崽与红围巾。独立助手，非美的官方客服。

[体验网页](https://cindyyang0912kc-alt.github.io/mycreation/polar-bear-assistant/) · [完整部署指南](DEPLOY.md)

## 本地中文版本

现已增加免配置的本地中文模型通道，支持连续语音与自动摄像头画面采样。安装和一键启动说明见 [LOCAL.md](LOCAL.md)。原 GitHub 入口会在当前 Mac 服务在线时自动进入；电脑和临时连接需要保持运行。此通道不使用 OpenAI API。

## OpenAI 可选后端

前端可直接打开；未连接后端时仅提供预设示例。已提供 OpenAI 后端及实时通话实现，但尚未部署到用户 Cloudflare 账号，也未用真实密钥验证。

## 功能

- 写实幼熊透明图片、轻微呼吸、嘴部开合与语音状态波形。实时通话的嘴部动画由音频幅度驱动，系统朗读使用节奏动画；这是 2D 虚拟形象，不是逐音素口型或 3D 数字人。
- 文字问答：Responses API，默认官方域名联网检索，显示引用。
- 实时视频对话：持续双向 WebRTC 语音，每 2 秒自动发送摄像头画面。无需手动拍照或提交问题。非完整视频逐帧推理。
- Realtime 函数调用查询 Midea 官方资料后语音回答，支持语音打断、麦克风静音与结束通话。
- 对话信息流与底部输入框，移动端布局。
- OpenAI API Key 只在后端；网页使用独立访问口令，刷新即清除。

## 文件

- `index.html`、`style.css`：页面与布局。
- `app.js`：文字交互、系统语音与预设演示。
- `ai.js`：受保护的后端连接及文字问答。
- `realtime.js`：WebRTC、连续画面采样与工具调用。
- `backend/worker.mjs`：Cloudflare Worker `/health`、`/chat`、`/realtime`。
- `backend/wrangler.jsonc`：部署配置，不含密钥。
- `backend/test.mjs`：模拟上游测试，不调用真实 API。
- `assets/midea-bear-realistic.png`：使用内置 imagegen 生成的写实幼熊透明图片。

## 图像生成记录

工具：内置 imagegen；发布副本缩放为 720px 高，保留透明通道。

提示词：Use case: photorealistic-natural. Asset type: a transparent cutout character for the center of a blue-and-white appliance assistant webpage. A single adorable realistic polar bear cub, full body seated upright naturally, facing the camera, anatomically plausible small rounded ears, elongated polar bear muzzle, small natural dark eyes, textured black nose, dense fine ivory-white fur with individual strands. Wearing a bright red knitted scarf with short hanging ends. Both front paws resting naturally, relaxed friendly expression, mouth gently closed. High quality naturalistic studio animal portrait, soft diffuse daylight, subtle cool highlights. Centered symmetrical framing with all paws, ears and scarf visible and generous transparent padding. Real cub proportions, not a cartoon teddy bear or human-like mascot, no exaggerated eyes, no blush, no plastic surface. Isolated on genuinely transparent background, no landscape, no pedestal, no objects, no text, no logo, no watermark.

## 演示资料

- https://www.midea.com/us/Support
- https://www.midea.com/us/support/faq
- MRS25I7BST 与 MAD22S1CWWT 官方说明书链接在预设回复内。

示例温度与清洁周期仅适用于相应型号，不能推广到所有产品。实时模型也可能出错，请核对美国型号、来源与官方说明书。

## 摆拳舞

点击“特朗普同款摆拳”，或在文字框输入“跳舞”，midea 会切换到站立摆拳姿势，左右摇摆12秒。再次点击停止。实时通话接入后，也可口头要求跳舞，由 Realtime 工具调用触发。采用 AI 生成姿势图片与 CSS 动画，不包含背景音乐。

跳舞形象由内置 imagegen 根据现有小熊生成，提示词：保留同一写实白色北极熊幼崽和红围巾，站立于后腿，前爪抬起弯曲作双拳摆动姿势，模仿特朗普常见的左右摇摆舞；保持自然毛发、完整身体、透明背景，无文字、标志或其他政治元素。

跳舞专属装扮：红色棒球帽，正面白色小写“meta”，帽檐下露出金黄色头发。普通对话仍采用原版不戴帽子的写实幼熊。

最终跳舞资源：`assets/midea-bear-dance-hat.png`，使用内置 imagegen 编辑。最终提示词：Change only head accessories: bright red baseball cap with exact lowercase white embroidered word “meta”; golden-yellow swept-over hair peeking from under cap. Preserve the same photorealistic polar bear cub, face, white fur, red knitted scarf, upright double-fist dance pose and transparent background. No extra objects or watermark.
