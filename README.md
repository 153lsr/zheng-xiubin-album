# 郑秀彬专属相册集

基于 Cloudflare Workers 的粉丝相册网站，支持图片上传、点赞、弹幕评论等功能。

## 技术栈

- **运行时**: Cloudflare Workers
- **数据存储**: Cloudflare KV (元数据)
- **图片存储**: Cloudflare R2 (对象存储)
- **前端**: 原生 HTML/CSS/JavaScript

## 项目结构

```
albumtry/
├── package.json          # 项目配置
├── wrangler.toml         # Cloudflare Workers 配置
├── README.md             # 项目说明
└── src/
    ├── worker.js         # 主入口，路由分发
    ├── api.js            # API 处理函数
    ├── cors.js           # CORS 配置
    ├── static.js         # 静态资源处理
    └── html.js           # 前端页面模板
```

## 功能特性

### 相册功能
- 图片上传（支持 JPG、PNG、GIF、WebP，最大 10MB）
- **批量上传**（可同时选择多张图片，逐张编辑信息后上传）
- 图片分类（剧照、生活照、粉丝活动、写真）
- 按年份/月份筛选
- 分页加载（每页 20 张）
- 图片懒加载
- 上传后自动刷新（无需手动刷新页面）

### 互动功能
- 点赞（每个 IP 每张图片限一次，24 小时后可重新点赞）
- **彩色弹幕**（20 种随机颜色，流动过屏幕后自动消失）
- 弹幕评论（每个 IP 每分钟最多 5 条）
- 图片故事（点击图片翻转查看描述）

### 管理功能
- 管理员登录
- 图片删除（需要密码）
- **编辑图片故事**（管理员可修改图片描述）
- 公告编辑（需要密码）

### 安全特性
- 后端密码验证（密码不暴露在前端）
- XSS 防护（用户输入转义）
- CORS 限制（只允许指定域名）
- 点赞/评论防刷机制

## 部署指南

### 前置条件

1. 安装 [Node.js](https://nodejs.org/) (v16+)
2. 安装 Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
3. 登录 Cloudflare:
   ```bash
   wrangler login
   ```

### 创建存储资源

1. **创建 KV 命名空间**:
   ```bash
   wrangler kv:namespace create "ALBUM_KV2"
   ```
   将返回的 `id` 更新到 `wrangler.toml` 中。

2. **创建 R2 存储桶**:
   ```bash
   wrangler r2 bucket create album
   ```

### 配置环境变量

在 Cloudflare Dashboard 中设置 Secrets:

1. 进入 Workers & Pages → 你的 Worker → Settings → Variables
2. 添加以下变量（选择 Encrypt）:

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ADMIN_PASSWORD` | 管理员密码（用于登录、删除、上传、编辑故事） | `your_admin_password` |
| `ANNOUNCEMENT_PASSWORD` | 公告编辑密码 | `your_announcement_password` |

### 部署

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 部署到 Cloudflare
npm run deploy
```

### 自定义域名（可选）

1. 在 Cloudflare Dashboard 中添加自定义域名
2. 修改 `src/cors.js` 中的 `allowedOrigins` 数组，添加你的域名

## API 接口

### 获取相册列表
```
GET /api/albums?page=1&limit=20
```

响应:
```json
{
  "albums": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

### 上传图片
```
POST /api/upload
Content-Type: multipart/form-data

file: <图片文件>
password: <管理员密码>
metadata: {"title": "标题", "desc": "描述", "category": "candid", "date": "2025-01-28"}
```

### 删除图片
```
POST /api/delete
Content-Type: application/json

{
  "id": "图片ID",
  "password": "管理员密码"
}
```

### 更新图片故事
```
POST /api/update-story
Content-Type: application/json

{
  "id": "图片ID",
  "desc": "新的图片描述",
  "password": "管理员密码"
}
```

### 点赞
```
POST /api/like
Content-Type: application/json

{
  "albumId": "图片ID"
}
```

### 发送评论
```
POST /api/comment
Content-Type: application/json

{
  "albumId": "图片ID",
  "comment": {
    "author": "用户名",
    "text": "评论内容"
  }
}
```

### 获取/更新公告
```
GET /api/announcement

POST /api/announcement
Content-Type: application/json

{
  "content": "公告内容",
  "password": "公告密码"
}
```

### 验证管理员
```
POST /api/verify-admin
Content-Type: application/json

{
  "password": "管理员密码"
}
```

## 配置说明

### wrangler.toml

```toml
name = "zheng-xiubin-album"        # Worker 名称
main = "src/worker.js"             # 入口文件
compatibility_date = "2023-12-01"  # 兼容日期

[[kv_namespaces]]
binding = "ALBUM_KV2"              # KV 绑定名称
id = "你的KV命名空间ID"             # KV 命名空间 ID

[[r2_buckets]]
binding = "IMAGE_BUCKET"           # R2 绑定名称
bucket_name = "album"              # R2 存储桶名称
```

## 本地开发

```bash
# 启动本地开发服务器
npm run dev

# 访问 http://localhost:8787
```

注意：本地开发时需要配置 KV 和 R2 的本地模拟，或使用远程资源。

## 使用说明

### 批量上传
1. 点击上传区域或拖拽多张图片
2. 系统会显示"第 X / 共 Y 张"
3. 为每张图片填写标题、描述、分类
4. 点击"保存并继续"处理下一张
5. 最后一张点击"保存"完成全部上传

### 编辑图片故事
1. 以管理员身份登录
2. 点击任意图片打开灯箱
3. 点击图片翻转到背面
4. 点击"编辑故事"按钮
5. 修改内容后保存

### 弹幕功能
- 在灯箱中输入文字发送弹幕
- 弹幕会以随机颜色从右向左飘过
- 点击眼睛按钮可隐藏/显示弹幕

## 常见问题

### Q: 上传图片失败？
A: 检查以下几点：
- 图片大小是否超过 10MB
- 图片格式是否为 JPG/PNG/GIF/WebP
- 上传密码是否正确

### Q: 点赞无效？
A: 每个 IP 对同一张图片 24 小时内只能点赞一次。

### Q: CORS 错误？
A: 检查 `src/cors.js` 中的 `allowedOrigins` 是否包含你的域名。

### Q: 上传后图片不显示？
A: 现在上传成功后会自动刷新相册列表，无需手动刷新页面。

## 许可证

MIT License
