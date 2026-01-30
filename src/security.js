// 安全头部配置
export function getSecurityHeaders() {
    return {
        // Content Security Policy - 防止 XSS 攻击
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",  // 移除 unsafe-eval
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' https://cdnjs.cloudflare.com",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; '),

        // 防止点击劫持
        'X-Frame-Options': 'DENY',

        // 防止 MIME 类型嗅探
        'X-Content-Type-Options': 'nosniff',

        // XSS 保护
        'X-XSS-Protection': '1; mode=block',

        // Referrer 策略
        'Referrer-Policy': 'strict-origin-when-cross-origin',

        // 权限策略
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

        // HSTS - 强制 HTTPS
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };
}

// 合并安全头部和其他头部
export function addSecurityHeaders(headers) {
    const securityHeaders = getSecurityHeaders();
    return {
        ...headers,
        ...securityHeaders
    };
}
