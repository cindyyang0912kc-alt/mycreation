# 拾光 · 马来西亚中文门店 H5 Demo

无需 WhatsApp 或支付账号。手机浏览器中即可完整体验顾客、门店和导购三个角色。货币为马币 MYR / RM，日期使用吉隆坡时间。

## 本地开发与构建

```sh
npm ci
npm run build
npm start
```

Node.js 24+，默认端口 3000，可用 PORT 覆盖。静态发布产物在 dist/，可以部署到 GitHub Pages、Netlify 或任何静态网站服务器。资源使用相对地址，支持 /mycreation/ 子目录。二维码库已本地打包，不依赖第三方 CDN。

## 体验顺序

1. 商城：选择 2–3 件商品进行参数对比，加入购物车。
2. 结算：保留虚构的马来西亚配送资料，选择是否模拟订阅营销。
3. 模拟付款：选择 FPX、DuitNow QR 或 Touch ’n Go，尝试失败、取消、重试及支付成功，无需输入真实支付资料。
4. 店长：打开订单与配送，开始配送、确认送达。
5. 顾客：在我的订单查看同步的物流时间线及模拟配送单号。
6. 导购：客户与分群中查看自动新增会员、修改分群及模拟订阅状态。累计消费 RM 1,500 自动进入高价值分群。
7. 营销：创建活动草稿，模拟发送到已订阅的目标客户。
8. 消息体验：打开站内 WhatsApp 预览模拟已读、退订，点击活动商品返回商城。
9. 门店二维码：部署后默认填入当前公开网址，生成并下载二维码。

页面顶部提供体验指引和重置演示。

## 数据与模拟边界

演示数据仅存储在当前浏览器 localStorage 中；不同手机、浏览器不会同步。后台无需登录是 Demo 角色切换，不代表真实后台权限。请使用虚构资料。所有支付、配送、WhatsApp 发送和回执均为明确标注的模拟，不会发生扣款、真实发货或发送消息。

原 Node/SQLite API 保留用于后续接入开发，当前 H5 默认不调用它。真实后台 API 仍受 ADMIN_TOKEN 保护，未配置时禁用。真实订单存于 data/store.db，不与 Demo 数据混用。禁止将密钥、.env、数据库或真实个人资料加入静态发布包。

## 测试

```sh
npm test
npm run build
npm run test:e2e
```

端到端测试使用系统 /usr/bin/chromium；在其他机器可将 playwright.config.js 的 executablePath 改为已安装 Chromium 的路径，或使用 Playwright 默认浏览器。测试覆盖手机端全链路、支付失败与取消、重复支付保护、目标分群与订阅过滤、模拟消息已读、退订、二维码和浏览器刷新恢复。

## GitHub Pages 发布

已提供 gh-pages 分支发布脚本：npm run publish:pages，默认推送当前 origin 的 gh-pages 分支。脚本只在临时目录构建提交，不切换或覆盖当前检出，不强制推送。

第一次需仓库管理员在 Settings → Pages 中选择 Deploy from a branch → gh-pages → / (root) → Save。之后更新 gh-pages 会自动发布。若仓库计划不支持私有仓库 Pages，请使用支持静态部署的平台，或由仓库所有者决定是否公开仓库；脚本不会更改仓库可见性。

不要将预测的 Pages 地址当作已发布成功；必须验证公开网站返回页面并可加载脚本后再分享二维码。

云任务使用现有 /workspace/mycreation 检出，无需另建 worktree。
