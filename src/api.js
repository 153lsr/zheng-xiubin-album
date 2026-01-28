import { getCorsHeaders } from './cors.js';

// 获取相册（支持分页）
export async function handleGetAlbums(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;

        const keys = await env.ALBUM_KV2.list({ prefix: 'album_' });
        const albums = [];

        for (const key of keys.keys) {
            const value = await env.ALBUM_KV2.get(key.name);
            if (value) {
                albums.push(JSON.parse(value));
            }
        }

        albums.sort((a, b) => new Date(b.date) - new Date(a.date));

        const total = albums.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const pagedAlbums = albums.slice(start, end);
        const hasMore = end < total;

        return new Response(JSON.stringify({
            albums: pagedAlbums,
            total: total,
            page: page,
            limit: limit,
            hasMore: hasMore
        }), {
            headers: corsHeaders
        });
    } catch (error) {
        console.error('Get albums error:', error);
        return new Response(JSON.stringify({
            albums: [],
            total: 0,
            page: 1,
            limit: 20,
            hasMore: false
        }), {
            headers: corsHeaders
        });
    }
}

// 上传图片
export async function handleUpload(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const contentType = request.headers.get('content-type') || '';

        if (!contentType.includes('multipart/form-data')) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Content-Type must be multipart/form-data'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const metadataStr = formData.get('metadata');
        const password = formData.get('password');

        // 验证上传密码
        const uploadPassword = env.ADMIN_PASSWORD;
        if (!uploadPassword) {
            return new Response(JSON.stringify({
                success: false,
                error: '服务器未配置管理员密码，请联系管理员'
            }), {
                status: 500,
                headers: corsHeaders
            });
        }
        if (password !== uploadPassword) {
            return new Response(JSON.stringify({
                success: false,
                error: '上传密码错误'
            }), {
                status: 401,
                headers: corsHeaders
            });
        }

        if (!file) {
            return new Response(JSON.stringify({
                success: false,
                error: '缺少文件'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        if (!metadataStr) {
            return new Response(JSON.stringify({
                success: false,
                error: '缺少元数据'
            }), {
                status: 400,
                headers: corsHeaders
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
                headers: corsHeaders
            });
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        if (!validExtensions.includes(fileExtension)) {
            return new Response(JSON.stringify({
                success: false,
                error: '不支持的文件格式。请上传 JPG, PNG, GIF, 或 WebP 格式的图片'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        if (file.size > 10 * 1024 * 1024) {
            return new Response(JSON.stringify({
                success: false,
                error: '文件太大。请上传小于10MB的图片'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 11);
        const fileName = `${timestamp}_${randomStr}.${fileExtension}`;

        try {
            await env.IMAGE_BUCKET.put(fileName, file);
        } catch (r2Error) {
            return new Response(JSON.stringify({
                success: false,
                error: '文件上传到存储失败: ' + r2Error.message
            }), {
                status: 500,
                headers: corsHeaders
            });
        }

        const albumId = timestamp.toString();
        const imageUrl = `/images/${fileName}`;

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

        try {
            await env.ALBUM_KV2.put(`album_${albumId}`, JSON.stringify(albumData));
        } catch (kvError) {
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
                headers: corsHeaders
            });
        }

        return new Response(JSON.stringify({
            success: true,
            data: albumData
        }), {
            headers: corsHeaders
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '上传失败: ' + error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// 删除图片
export async function handleDelete(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const data = await request.json();
        const { id, password } = data;

        const adminPassword = env.ADMIN_PASSWORD;
        if (!adminPassword) {
            return new Response(JSON.stringify({
                success: false,
                error: '服务器未配置管理员密码，请联系管理员'
            }), {
                status: 500,
                headers: corsHeaders
            });
        }
        if (password !== adminPassword) {
            return new Response(JSON.stringify({
                success: false,
                error: '密码错误'
            }), {
                status: 401,
                headers: corsHeaders
            });
        }

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                error: '缺少ID参数'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const albumData = await env.ALBUM_KV2.get(`album_${id}`);
        if (albumData) {
            const album = JSON.parse(albumData);
            if (album.img && album.img.startsWith('/images/')) {
                const fileName = album.img.substring(8);
                try {
                    await env.IMAGE_BUCKET.delete(fileName);
                } catch (e) {
                    console.error('Failed to delete R2 file:', e);
                }
            }
        }

        await env.ALBUM_KV2.delete(`album_${id}`);

        return new Response(JSON.stringify({
            success: true,
            message: '删除成功'
        }), {
            headers: corsHeaders
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '删除失败: ' + error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// 点赞处理（带防刷机制）
export async function handleLike(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const data = await request.json();
        const { albumId } = data;

        if (albumId === undefined) {
            return new Response(JSON.stringify({
                success: false,
                error: '缺少相册ID'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const likeKey = `like_${albumId}_${clientIP}`;

        const existingLike = await env.ALBUM_KV2.get(likeKey);
        if (existingLike) {
            return new Response(JSON.stringify({
                success: false,
                error: '您已经点过赞了',
                alreadyLiked: true
            }), {
                status: 200,
                headers: corsHeaders
            });
        }

        const albumKey = `album_${albumId}`;
        const albumData = await env.ALBUM_KV2.get(albumKey);

        if (!albumData) {
            return new Response(JSON.stringify({
                success: false,
                error: '相册不存在'
            }), {
                status: 404,
                headers: corsHeaders
            });
        }

        const album = JSON.parse(albumData);
        album.likes = (album.likes || 0) + 1;

        await env.ALBUM_KV2.put(likeKey, '1', { expirationTtl: 86400 });
        await env.ALBUM_KV2.put(albumKey, JSON.stringify(album));

        return new Response(JSON.stringify({
            success: true,
            likes: album.likes
        }), {
            headers: corsHeaders
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '点赞失败: ' + error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// 评论处理（带防刷机制）
export async function handleComment(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const data = await request.json();
        const { albumId, comment } = data;

        if (!albumId || !comment) {
            return new Response(JSON.stringify({
                success: false,
                error: '缺少参数'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const commentRateKey = `comment_rate_${clientIP}`;

        const rateData = await env.ALBUM_KV2.get(commentRateKey);
        let commentCount = rateData ? parseInt(rateData) : 0;

        if (commentCount >= 5) {
            return new Response(JSON.stringify({
                success: false,
                error: '评论太频繁，请稍后再试'
            }), {
                status: 429,
                headers: corsHeaders
            });
        }

        const albumKey = `album_${albumId}`;
        const albumData = await env.ALBUM_KV2.get(albumKey);

        if (!albumData) {
            return new Response(JSON.stringify({
                success: false,
                error: '相册不存在'
            }), {
                status: 404,
                headers: corsHeaders
            });
        }

        const album = JSON.parse(albumData);
        album.comments = album.comments || [];

        // HTML 转义函数，防止 XSS 攻击
        const escapeHtml = (text) => {
            if (!text) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        album.comments.push({
            author: escapeHtml(comment.author || '匿名用户'),
            text: escapeHtml(comment.text),
            time: comment.time || new Date().toLocaleString('zh-CN')
        });

        await env.ALBUM_KV2.put(commentRateKey, String(commentCount + 1), { expirationTtl: 60 });
        await env.ALBUM_KV2.put(albumKey, JSON.stringify(album));

        return new Response(JSON.stringify({
            success: true
        }), {
            headers: corsHeaders
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '评论失败: ' + error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// 更新图片故事
export async function handleUpdateStory(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const data = await request.json();
        const { id, desc, password } = data;

        // 验证管理员密码
        const adminPassword = env.ADMIN_PASSWORD;
        if (!adminPassword) {
            return new Response(JSON.stringify({
                success: false,
                error: '服务器未配置管理员密码，请联系管理员'
            }), {
                status: 500,
                headers: corsHeaders
            });
        }
        if (password !== adminPassword) {
            return new Response(JSON.stringify({
                success: false,
                error: '密码错误'
            }), {
                status: 401,
                headers: corsHeaders
            });
        }

        if (!id) {
            return new Response(JSON.stringify({
                success: false,
                error: '缺少图片ID'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const albumKey = `album_${id}`;
        const albumData = await env.ALBUM_KV2.get(albumKey);

        if (!albumData) {
            return new Response(JSON.stringify({
                success: false,
                error: '图片不存在'
            }), {
                status: 404,
                headers: corsHeaders
            });
        }

        const album = JSON.parse(albumData);
        album.desc = desc || '';

        await env.ALBUM_KV2.put(albumKey, JSON.stringify(album));

        return new Response(JSON.stringify({
            success: true,
            message: '故事已更新'
        }), {
            headers: corsHeaders
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '更新失败: ' + error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// 公告处理
export async function handleAnnouncement(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        if (request.method === 'GET') {
            const content = await env.ALBUM_KV2.get('announcement') || '欢迎来到郑秀彬专属相册集！这里珍藏着秀彬的每一个精彩瞬间。请尽情欣赏并留下您的宝贵评论。';
            return new Response(JSON.stringify({ content }), {
                headers: corsHeaders
            });
        } else {
            const data = await request.json();

            const announcementPassword = env.ANNOUNCEMENT_PASSWORD;
            if (!announcementPassword) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '服务器未配置公告密码，请联系管理员'
                }), {
                    status: 500,
                    headers: corsHeaders
                });
            }
            if (data.password !== announcementPassword) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '密码错误'
                }), {
                    status: 401,
                    headers: corsHeaders
                });
            }

            await env.ALBUM_KV2.put('announcement', data.content);
            return new Response(JSON.stringify({ success: true }), {
                headers: corsHeaders
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '公告操作失败: ' + error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

// 验证管理员密码
export async function handleVerifyAdmin(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const data = await request.json();
        const { password } = data;

        const adminPassword = env.ADMIN_PASSWORD || 'admin123';
        if (password === adminPassword) {
            return new Response(JSON.stringify({ success: true }), {
                headers: corsHeaders
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                error: '密码错误'
            }), {
                status: 401,
                headers: corsHeaders
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '验证失败: ' + error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
