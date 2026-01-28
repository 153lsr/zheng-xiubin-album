// CORS 头部 - 限制为指定域名
export function getCorsHeaders(request) {
    const origin = request ? request.headers.get('Origin') : null;
    const allowedOrigins = [
        'https://ibeautiful.de5.net',
        'http://ibeautiful.de5.net',
        'https://zheng-xiubin-album.workers.dev'
    ];

    const corsOrigin = (origin && allowedOrigins.includes(origin))
        ? origin
        : 'https://ibeautiful.de5.net';

    return {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    };
}
