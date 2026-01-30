# 修复验证测试指南

## 1. HSTS 头部测试

部署后运行以下命令验证 HSTS 头部:

```bash
curl -I https://your-domain.workers.dev
```

**预期结果**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 2. 审计日志测试

### 测试上传日志
```bash
# 上传一张图片
curl -X POST https://your-domain.workers.dev/api/upload \
  -F "file=@test.jpg" \
  -F "password=YOUR_PASSWORD" \
  -F 'metadata={"title":"测试图片","category":"candid"}'
```

### 测试删除日志
```bash
# 删除图片
curl -X POST https://your-domain.workers.dev/api/delete \
  -H "Content-Type: application/json" \
  -d '{"id":"123456789","password":"YOUR_PASSWORD"}'
```

### 查看审计日志
在 Cloudflare Workers 控制台执行:
```javascript
// 列出所有审计日志
const logs = await env.ALBUM_KV2.list({ prefix: 'audit_log_' });
console.log('Total logs:', logs.keys.length);

// 查看最新的日志
if (logs.keys.length > 0) {
    const latestLog = await env.ALBUM_KV2.get(logs.keys[0].name);
    console.log('Latest log:', JSON.parse(latestLog));
}
```

**预期日志格式**:
```json
{
  "action": "upload_album",
  "timestamp": "2026-01-31T09:30:00.000Z",
  "albumId": "1738318200000",
  "fileName": "1738318200000_abc123.jpg",
  "category": "candid",
  "ip": "1.2.3.4",
  "userAgent": "Mozilla/5.0..."
}
```

---

## 3. 全局速率限制测试

### 测试正常请求
```bash
# 发送 10 次请求（应该全部成功）
for i in {1..10}; do
  echo "Request $i"
  curl -X POST https://your-domain.workers.dev/api/like \
    -H "Content-Type: application/json" \
    -d '{"albumId":"123"}'
  sleep 0.5
done
```

### 测试速率限制
```bash
# 快速发送 70 次请求（前 60 次成功，后 10 次应该被限制）
for i in {1..70}; do
  echo "Request $i"
  curl -s -X POST https://your-domain.workers.dev/api/like \
    -H "Content-Type: application/json" \
    -d '{"albumId":"123"}' | jq '.error'
done
```

**预期结果**:
- 前 60 次请求: 正常响应或 "您已经点过赞了"
- 第 61-70 次请求: `"请求过于频繁，请稍后再试"`
- HTTP 状态码: 429

---

## 4. 输入验证测试

### 测试空评论
```bash
curl -X POST https://your-domain.workers.dev/api/comment \
  -H "Content-Type: application/json" \
  -d '{"albumId":"123","comment":{"text":""}}'
```

**预期结果**:
```json
{
  "success": false,
  "error": "评论内容不能为空"
}
```

### 测试过长评论
```bash
# 生成 600 字符的评论
LONG_TEXT=$(python -c "print('a' * 600)")
curl -X POST https://your-domain.workers.dev/api/comment \
  -H "Content-Type: application/json" \
  -d "{\"albumId\":\"123\",\"comment\":{\"text\":\"$LONG_TEXT\"}}"
```

**预期结果**:
```json
{
  "success": false,
  "error": "评论内容不能超过 500 个字符"
}
```

### 测试无效的 albumId
```bash
curl -X POST https://your-domain.workers.dev/api/comment \
  -H "Content-Type: application/json" \
  -d '{"albumId":null,"comment":{"text":"测试"}}'
```

**预期结果**:
```json
{
  "success": false,
  "error": "缺少或无效的相册ID"
}
```

### 测试无效的 comment 对象
```bash
curl -X POST https://your-domain.workers.dev/api/comment \
  -H "Content-Type: application/json" \
  -d '{"albumId":"123","comment":"invalid"}'
```

**预期结果**:
```json
{
  "success": false,
  "error": "缺少或无效的评论数据"
}
```

---

## 5. 统一错误响应测试

### 测试各种错误场景
```bash
# 测试 400 错误
curl -X POST https://your-domain.workers.dev/api/delete \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong"}'

# 测试 401 错误
curl -X POST https://your-domain.workers.dev/api/delete \
  -H "Content-Type: application/json" \
  -d '{"id":"123","password":"wrong"}'

# 测试 404 错误
curl -X POST https://your-domain.workers.dev/api/like \
  -H "Content-Type: application/json" \
  -d '{"albumId":"999999999"}'
```

**验证所有错误响应格式一致**:
```json
{
  "success": false,
  "error": "错误信息"
}
```

---

## 6. 性能测试

### 测试响应时间
```bash
# 测试 API 响应时间
time curl -s https://your-domain.workers.dev/api/albums?page=1 > /dev/null
```

**预期结果**:
- 响应时间 < 2 秒
- 无明显性能下降

### 测试并发请求
```bash
# 使用 Apache Bench 测试
ab -n 100 -c 10 https://your-domain.workers.dev/api/albums?page=1
```

**预期结果**:
- 所有请求成功
- 平均响应时间 < 2 秒

---

## 7. 安全测试

### 测试 XSS 防护
```bash
curl -X POST https://your-domain.workers.dev/api/comment \
  -H "Content-Type: application/json" \
  -d '{"albumId":"123","comment":{"text":"<script>alert(1)</script>","author":"<img src=x onerror=alert(1)>"}}'
```

**验证**:
- 评论内容被正确转义
- 不执行恶意脚本

### 测试 SQL 注入（虽然使用 KV，但仍需验证）
```bash
curl -X POST https://your-domain.workers.dev/api/delete \
  -H "Content-Type: application/json" \
  -d '{"id":"123 OR 1=1","password":"YOUR_PASSWORD"}'
```

**预期结果**:
- 请求被正确处理
- 不会删除其他数据

---

## 8. 浏览器测试

### 测试 HSTS
1. 打开浏览器开发者工具
2. 访问 `https://your-domain.workers.dev`
3. 查看 Network 标签
4. 验证响应头包含 `Strict-Transport-Security`

### 测试速率限制
1. 打开浏览器控制台
2. 运行以下代码:
```javascript
// 快速发送 70 次点赞请求
for (let i = 0; i < 70; i++) {
  fetch('/api/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ albumId: '123' })
  })
  .then(r => r.json())
  .then(data => console.log(`Request ${i+1}:`, data.error || 'success'));
}
```

**预期结果**:
- 前 60 次请求成功
- 后 10 次返回 "请求过于频繁，请稍后再试"

---

## 9. 回归测试

确保修复没有破坏现有功能:

- [ ] 图片上传功能正常
- [ ] 图片删除功能正常
- [ ] 点赞功能正常
- [ ] 评论功能正常
- [ ] 图片故事编辑功能正常
- [ ] 公告功能正常
- [ ] 管理员验证功能正常
- [ ] 分页加载功能正常
- [ ] 图片懒加载功能正常

---

## 10. 监控建议

### Cloudflare Analytics
1. 登录 Cloudflare Dashboard
2. 查看 Workers Analytics
3. 监控以下指标:
   - 请求数
   - 错误率
   - 响应时间
   - CPU 使用率

### 审计日志监控
定期检查审计日志:
```javascript
// 统计最近 24 小时的操作
const now = Date.now();
const oneDayAgo = now - 86400000;
const logs = await env.ALBUM_KV2.list({ prefix: 'audit_log_' });

const recentLogs = logs.keys.filter(key => {
  const timestamp = parseInt(key.name.replace('audit_log_', ''));
  return timestamp > oneDayAgo;
});

console.log('Recent operations:', recentLogs.length);
```

---

## 测试完成检查清单

- [ ] HSTS 头部已启用
- [ ] 审计日志正常记录
- [ ] 全局速率限制生效
- [ ] 输入验证正常工作
- [ ] 错误响应格式统一
- [ ] 性能无明显下降
- [ ] 安全防护正常
- [ ] 所有现有功能正常
- [ ] 无语法错误
- [ ] 无运行时错误

---

**测试日期**: ___________
**测试人员**: ___________
**测试结果**: ___________
