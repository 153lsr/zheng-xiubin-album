export default {
    async fetch(request, env, ctx) {
        // 检查必要的环境变量
        if (!env.ALBUM_KV2) {
            return new Response('KV namespace not configured', { status: 500 });
        }
        if (!env.IMAGE_BUCKET) {
            return new Response('R2 bucket not configured', { status: 500 });
        }
        
        const url = new URL(request.url);
        const pathname = url.pathname;
        
        // API路由处理
        if (pathname.startsWith('/api/')) {
            return handleAPI(request, env, pathname);
        }
        
        // 静态文件服务
        if (pathname === '/' || pathname === '/index.html') {
            return new Response(getStaticHTML(), {
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

// 获取HTML内容
function getStaticHTML() {
    // 返回你的完整HTML内容（这里保持你原来的HTML内容不变）
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>郑秀彬专属相册集</title>
    <!-- ... 其他HTML内容保持不变 ... -->
</head>
<body>
    <!-- ... body内容保持不变 ... -->
</body>
</html>`;
}

// 静态资源处理
async function handleStaticAssets(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // 如果是图片资源，从R2获取
    if (pathname.startsWith('/images/')) {
        const key = pathname.substring(8); // 移除 /images/ 前缀
        try {
            const object = await env.IMAGE_BUCKET.get(key);
            if (object === null) {
                return new Response('Not Found', { status: 404 });
            }
            
            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set('etag', object.httpEtag);
            headers.set('Cache-Control', 'public, max-age=31536000'); // 1年缓存
            
            return new Response(object.body, {
                headers
            });
        } catch (error) {
            return new Response('Error fetching image', { status: 500 });
        }
    }
    
    return new Response('Not Found', { status: 404 });
}

// CORS 头部
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};

// 处理所有API请求
async function handleAPI(request, env, pathname) {
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: CORS_HEADERS
        });
    }
    
    try {
        switch (pathname) {
            case '/api/albums':
                return handleGetAlbums(env);
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
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// 获取所有相册
async function handleGetAlbums(env) {
    try {
        const keys = await env.ALBUM_KV2.list({ prefix: 'album_' });
        const albums = [];
        
        for (const key of keys.keys) {
            const value = await env.ALBUM_KV2.get(key.name);
            if (value) {
                albums.push(JSON.parse(value));
            }
        }
        
        // 按日期倒序排列
        albums.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return new Response(JSON.stringify(albums), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        console.error('Get albums error:', error);
        return new Response(JSON.stringify([]), {
            headers: CORS_HEADERS
        });
    }
}

// 上传图片 - 修复版本
async function handleUpload(request, env) {
    try {
        const contentType = request.headers.get('content-type') || '';
        console.log('Upload request received, Content-Type:', contentType);
        
        if (!contentType.includes('multipart/form-data')) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Content-Type must be multipart/form-data' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const metadataStr = formData.get('metadata');
        
        console.log('File:', file ? file.name : 'No file');
        console.log('Metadata:', metadataStr);

        if (!file) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '缺少文件' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        if (!metadataStr) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '缺少元数据' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        let metadata;
        try {
            metadata = JSON.parse(metadataStr);
        } catch (parseError) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '元数据格式错误: ' + parseError.message 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        // 获取文件扩展名
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        
        if (!validExtensions.includes(fileExtension)) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '不支持的文件格式。请上传 JPG, PNG, GIF, 或 WebP 格式的图片' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        // 检查文件大小 (限制为10MB)
        if (file.size > 10 * 1024 * 1024) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '文件太大。请上传小于10MB的图片' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        // 生成唯一文件名
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9);
        const fileName = timestamp + '_' + randomStr + '.' + fileExtension;
        
        console.log('Uploading file to R2:', fileName);
        
        // 上传到R2
        try {
            await env.IMAGE_BUCKET.put(fileName, file);
            console.log('File uploaded to R2 successfully');
        } catch (r2Error) {
            console.error('R2 upload error:', r2Error);
            return new Response(JSON.stringify({ 
                success: false, 
                error: '文件上传到存储失败: ' + r2Error.message 
            }), {
                status: 500,
                headers: CORS_HEADERS
            });
        }
        
        const albumId = timestamp.toString();
        const imageUrl = '/images/' + fileName;
        
        const albumData = {
            id: parseInt(albumId),
            title: metadata.title || '未命名',
            desc: metadata.desc || '',
            category: metadata.category || 'candid',
            date: metadata.date || new Date().toISOString().split('T')[0],
            img: imageUrl,
            likes: 0,
            liked: false,
            comments: []
        };
        
        console.log('Saving album data to KV:', albumData);
        
        try {
            await env.ALBUM_KV2.put('album_' + albumId, JSON.stringify(albumData));
            console.log('Album data saved to KV successfully');
        } catch (kvError) {
            console.error('KV save error:', kvError);
            // 如果KV保存失败，删除已上传的文件
            try {
                await env.IMAGE_BUCKET.delete(fileName);
            } catch (deleteError) {
                console.error('Failed to cleanup R2 file:', deleteError);
            }
            
            return new Response(JSON.stringify({ 
                success: false, 
                error: '相册数据保存失败: ' + kvError.message 
            }), {
                status: 500,
                headers: CORS_HEADERS
            });
        }
        
        return new Response(JSON.stringify({ 
            success: true, 
            data: albumData 
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: '上传失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}

// 删除图片
async function handleDelete(request, env) {
    try {
        const data = await request.json();
        const { id } = data;
        
        if (!id) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '缺少ID参数' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        // 从KV删除记录
        await env.ALBUM_KV2.delete('album_' + id);
        
        return new Response(JSON.stringify({ 
            success: true, 
            message: '删除成功' 
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '删除失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}

// 点赞处理
async function handleLike(request, env) {
    try {
        const data = await request.json();
        const { albumId, liked, likes } = data;
        
        if (albumId === undefined) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '缺少相册ID' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        const albumKey = 'album_' + albumId;
        const albumData = await env.ALBUM_KV2.get(albumKey);
        
        if (!albumData) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '相册不存在' 
            }), {
                status: 404,
                headers: CORS_HEADERS
            });
        }

        const album = JSON.parse(albumData);
        album.liked = liked;
        album.likes = likes;
        
        await env.ALBUM_KV2.put(albumKey, JSON.stringify(album));
        
        return new Response(JSON.stringify({ 
            success: true 
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '点赞失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}

// 评论处理
async function handleComment(request, env) {
    try {
        const data = await request.json();
        const { albumId, comment } = data;
        
        if (!albumId || !comment) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '缺少参数' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        const albumKey = 'album_' + albumId;
        const albumData = await env.ALBUM_KV2.get(albumKey);
        
        if (!albumData) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '相册不存在' 
            }), {
                status: 404,
                headers: CORS_HEADERS
            });
        }

        const album = JSON.parse(albumData);
        album.comments = album.comments || [];
        album.comments.push({
            author: comment.author || '匿名用户',
            text: comment.text,
            time: comment.time || new Date().toLocaleString('zh-CN')
        });
        
        await env.ALBUM_KV2.put(albumKey, JSON.stringify(album));
        
        return new Response(JSON.stringify({ 
            success: true 
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '评论失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}

// 公告处理
async function handleAnnouncement(request, env) {
    try {
        if (request.method === 'GET') {
            const content = await env.ALBUM_KV2.get('announcement') || '欢迎来到郑秀彬专属相册集！这里珍藏着秀彬的每一个精彩瞬间。请尽情欣赏并留下您的宝贵评论。';
            return new Response(JSON.stringify({ content }), {
                headers: CORS_HEADERS
            });
        } else {
            const data = await request.json();
            await env.ALBUM_KV2.put('announcement', data.content);
            return new Response(JSON.stringify({ success: true }), {
                headers: CORS_HEADERS
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '公告操作失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}
