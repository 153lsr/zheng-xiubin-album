// 静态资源处理
import { addSecurityHeaders } from './security.js';

export async function handleStaticAssets(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 如果是图片资源,从R2获取
    if (pathname.startsWith('/images/')) {
        const key = pathname.substring(8);

        // 验证路径安全性（防止路径遍历攻击）
        if (!key || key.length === 0 || key.includes('..') || key.includes('/') || key.includes('\\')) {
            return new Response('Invalid image path', { status: 400 });
        }

        try {
            const object = await env.IMAGE_BUCKET.get(key);
            if (object === null) {
                return new Response('Not Found', { status: 404 });
            }

            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set('etag', object.httpEtag);
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');  // 添加 immutable

            // 添加安全头部（但保留图片特定的头部）
            const securityHeaders = addSecurityHeaders({});
            for (const [headerKey, headerValue] of Object.entries(securityHeaders)) {
                // 不覆盖已有的头部
                if (!headers.has(headerKey)) {
                    headers.set(headerKey, headerValue);
                }
            }

            return new Response(object.body, {
                headers
            });
        } catch (error) {
            return new Response('Error fetching image', { status: 500 });
        }
    }

    return new Response('Not Found', { status: 404 });
}
