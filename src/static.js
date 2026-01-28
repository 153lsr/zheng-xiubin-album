// 静态资源处理
export async function handleStaticAssets(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 如果是图片资源,从R2获取
    if (pathname.startsWith('/images/')) {
        const key = pathname.substring(8);
        try {
            const object = await env.IMAGE_BUCKET.get(key);
            if (object === null) {
                return new Response('Not Found', { status: 404 });
            }

            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set('etag', object.httpEtag);
            headers.set('Cache-Control', 'public, max-age=31536000');

            return new Response(object.body, {
                headers
            });
        } catch (error) {
            return new Response('Error fetching image', { status: 500 });
        }
    }

    return new Response('Not Found', { status: 404 });
}
