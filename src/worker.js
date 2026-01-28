import { getCorsHeaders } from './cors.js';
import {
    handleGetAlbums,
    handleUpload,
    handleDelete,
    handleLike,
    handleComment,
    handleAnnouncement,
    handleVerifyAdmin
} from './api.js';
import { handleStaticAssets } from './static.js';
import { getHTML } from './html.js';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        // API路由处理
        if (pathname.startsWith('/api/')) {
            return handleAPI(request, env, pathname);
        }

        // 静态文件服务
        if (pathname === '/' || pathname === '/index.html') {
            return new Response(getHTML(), {
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }

        // 其他静态资源
        return await handleStaticAssets(request, env);
    }
};

// 处理所有API请求
async function handleAPI(request, env, pathname) {
    const corsHeaders = getCorsHeaders(request);

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders
        });
    }

    try {
        switch (pathname) {
            case '/api/albums':
                return handleGetAlbums(request, env);
            case '/api/upload':
                return handleUpload(request, env);
            case '/api/delete':
                return handleDelete(request, env);
            case '/api/like':
                return handleLike(request, env);
            case '/api/comment':
                return handleComment(request, env);
            case '/api/announcement':
                return handleAnnouncement(request, env);
            case '/api/verify-admin':
                return handleVerifyAdmin(request, env);
            default:
                return new Response('API Not Found', { status: 404 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
