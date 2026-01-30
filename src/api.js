import { getCorsHeaders } from './cors.js';

// 安全的 JSON 解析辅助函数
function safeJSONParse(str, defaultValue = null) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('JSON parse error:', e);
        return defaultValue;
    }
}

// 审计日志记录函数
async function logAuditAction(env, action, details) {
    try {
        const timestamp = Date.now();
        const logKey = `audit_log_${timestamp}`;
        const logData = {
            action,
            timestamp: new Date().toISOString(),
            ...details
        };
        // 日志保留 30 天
        await env.ALBUM_KV2.put(logKey, JSON.stringify(logData), { expirationTtl: 2592000 });
    } catch (error) {
        console.error('Failed to log audit action:', error);
        // 不抛出错误，避免影响主要操作
    }
}

// 统一错误响应函数
function createErrorResponse(error, statusCode, corsHeaders) {
    return new Response(JSON.stringify({
        success: false,
        error: error
    }), {
        status: statusCode,
        headers: corsHeaders
    });
}

// 统一成功响应函数
function createSuccessResponse(data, corsHeaders) {
    return new Response(JSON.stringify({
        success: true,
        ...data
    }), {
        status: 200,
        headers: corsHeaders
    });
}

// 全局速率限制检查
async function checkGlobalRateLimit(env, clientIP) {
    const rateLimitKey = `global_rate_${clientIP}`;
    const rateData = await env.ALBUM_KV2.get(rateLimitKey);

    if (!rateData) {
        // 首次请求，设置计数为 1，1 分钟过期
        await env.ALBUM_KV2.put(rateLimitKey, '1', { expirationTtl: 60 });
        return { allowed: true, count: 1 };
    }

    const count = parseInt(rateData, 10);
    const MAX_REQUESTS_PER_MINUTE = 60; // 每分钟最多 60 次请求

    if (count >= MAX_REQUESTS_PER_MINUTE) {
        return { allowed: false, count };
    }

    // 增加计数
    await env.ALBUM_KV2.put(rateLimitKey, String(count + 1), { expirationTtl: 60 });
    return { allowed: true, count: count + 1 };
}

// 获取相册（支持分页）- 优化版本
// 使用 KV cursor 分页，避免一次性加载所有数据
export async function handleGetAlbums(request, env) {
    const corsHeaders = getCorsHeaders(request);
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page'), 10) || 1;
        let limit = parseInt(url.searchParams.get('limit'), 10) || 20;

        // 限制 limit 参数范围（降低最大值）
        if (limit < 1) limit = 20;
        if (limit > 50) limit = 50;  // 降低到 50

        // 添加超时保护
        const timeoutMs = 8000;  // 8秒超时
        const startTime = Date.now();

        // 使用 KV list 的 cursor 功能进行真正的分页
        let allKeys = [];
        let listResult = await env.ALBUM_KV2.list({
            prefix: 'album_',
            limit: 500  // 降低每次获取数量
        });

        allKeys = allKeys.concat(listResult.keys);

        // 更严格的循环限制（最多 1500 个相册）
        let loopCount = 0;
        const MAX_LOOPS = 2;  // 总共最多 3 次（1 + 2）

        while (!listResult.list_complete && loopCount < MAX_LOOPS) {
            // 检查超时
            if (Date.now() - startTime > timeoutMs) {
                console.warn('handleGetAlbums: 接近超时，提前退出');
                break;
            }

            listResult = await env.ALBUM_KV2.list({
                prefix: 'album_',
                limit: 500,
                cursor: listResult.cursor
            });
            allKeys = allKeys.concat(listResult.keys);
            loopCount++;
        }

        // 从键名中提取 ID 和时间戳进行排序
        const sortedKeys = allKeys
            .map(key => ({
                name: key.name,
                timestamp: parseInt(key.name.replace('album_', ''), 10)
            }))
            .sort((a, b) => b.timestamp - a.timestamp);

        const total = sortedKeys.length;
        const start = (page - 1) * limit;
        const end = Math.min(start + limit, total);
        const hasMore = end < total;

        // 分批并行查询，避免一次性发起太多请求
        const pageKeys = sortedKeys.slice(start, end);
        const BATCH_SIZE = 10;  // 每批最多 10 个
        const albums = [];

        for (let i = 0; i < pageKeys.length; i += BATCH_SIZE) {
            // 检查超时
            if (Date.now() - startTime > timeoutMs) {
                console.warn('handleGetAlbums: 数据获取超时');
                break;
            }

            const batch = pageKeys.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(keyInfo =>
                env.ALBUM_KV2.get(keyInfo.name)
            );
            const batchValues = await Promise.all(batchPromises);

            const batchAlbums = batchValues
                .filter(value => value !== null)
                .map(value => safeJSONParse(value))
                .filter(album => album !== null);

            albums.push(...batchAlbums);
        }

        return new Response(JSON.stringify({
            albums: albums,
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

    // 全局速率限制检查
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkGlobalRateLimit(env, clientIP);
    if (!rateLimit.allowed) {
        return createErrorResponse('请求过于频繁，请稍后再试', 429, corsHeaders);
    }

    // 添加超时保护
    const timeoutMs = 25000;  // 25秒超时（留 5 秒缓冲）
    const startTime = Date.now();

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

        // 检查超时
        if (Date.now() - startTime > timeoutMs) {
            throw new Error('请求处理超时');
        }

        const formData = await request.formData();

        // 再次检查超时
        if (Date.now() - startTime > timeoutMs) {
            throw new Error('FormData 解析超时');
        }

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
            console.error('Metadata parse error:', parseError);
            return new Response(JSON.stringify({
                success: false,
                error: '元数据格式错误，请检查数据格式'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // 验证并提取文件扩展名
        const originalFileName = file.name || '';
        const lastDotIndex = originalFileName.lastIndexOf('.');

        if (lastDotIndex === -1 || lastDotIndex === originalFileName.length - 1) {
            return new Response(JSON.stringify({
                success: false,
                error: '文件名无效或缺少扩展名'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        const fileExtension = originalFileName.substring(lastDotIndex + 1).toLowerCase();

        // 验证扩展名只包含字母数字，且长度合理
        if (!/^[a-z0-9]{1,10}$/.test(fileExtension)) {
            return new Response(JSON.stringify({
                success: false,
                error: '文件扩展名无效'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

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

        // 文件大小限制（8MB 是性能和功能的平衡点）
        if (file.size > 8 * 1024 * 1024) {  // 8MB
            return new Response(JSON.stringify({
                success: false,
                error: '文件太大。请上传小于8MB的图片'
            }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // 检查超时
        if (Date.now() - startTime > timeoutMs) {
            throw new Error('上传前检查超时');
        }

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 11);
        const fileName = `${timestamp}_${randomStr}.${fileExtension}`;

        try {
            await env.IMAGE_BUCKET.put(fileName, file);
        } catch (r2Error) {
            console.error('R2 upload error:', r2Error);
            return new Response(JSON.stringify({
                success: false,
                error: '文件上传失败，请稍后重试'
            }), {
                status: 500,
                headers: corsHeaders
            });
        }

        // 检查超时
        if (Date.now() - startTime > timeoutMs) {
            // 尝试清理已上传的文件
            try {
                await env.IMAGE_BUCKET.delete(fileName);
            } catch (e) {
                console.error('清理文件失败:', e);
            }
            throw new Error('上传后处理超时');
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
            console.error('KV save error:', kvError);
            try {
                await env.IMAGE_BUCKET.delete(fileName);
            } catch (deleteError) {
                console.error('Failed to cleanup R2 file:', deleteError);
            }

            return new Response(JSON.stringify({
                success: false,
                error: '数据保存失败，请稍后重试'
            }), {
                status: 500,
                headers: corsHeaders
            });
        }

        // 记录审计日志
        await logAuditAction(env, 'upload_album', {
            albumId,
            fileName,
            category: metadata.category,
            ip: clientIP,
            userAgent: request.headers.get('User-Agent') || 'unknown'
        });

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

    // 全局速率限制检查
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkGlobalRateLimit(env, clientIP);
    if (!rateLimit.allowed) {
        return createErrorResponse('请求过于频繁，请稍后再试', 429, corsHeaders);
    }

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
            const album = safeJSONParse(albumData);
            if (album && album.img && album.img.startsWith('/images/')) {
                const fileName = album.img.substring(8);
                if (fileName && fileName.length > 0) {
                    try {
                        await env.IMAGE_BUCKET.delete(fileName);
                    } catch (e) {
                        console.error('Failed to delete R2 file:', e);
                    }
                }
            }
        }

        await env.ALBUM_KV2.delete(`album_${id}`);

        // 记录审计日志
        await logAuditAction(env, 'delete_album', {
            albumId: id,
            ip: clientIP,
            userAgent: request.headers.get('User-Agent') || 'unknown'
        });

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

    // 全局速率限制检查
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkGlobalRateLimit(env, clientIP);
    if (!rateLimit.allowed) {
        return createErrorResponse('请求过于频繁，请稍后再试', 429, corsHeaders);
    }

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

        const album = safeJSONParse(albumData);
        if (!album) {
            return new Response(JSON.stringify({
                success: false,
                error: '相册数据损坏'
            }), {
                status: 500,
                headers: corsHeaders
            });
        }

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

    // 全局速率限制检查
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkGlobalRateLimit(env, clientIP);
    if (!rateLimit.allowed) {
        return createErrorResponse('请求过于频繁，请稍后再试', 429, corsHeaders);
    }

    try {
        const data = await request.json();
        const { albumId, comment } = data;

        // 验证 albumId
        if (!albumId || typeof albumId !== 'string' && typeof albumId !== 'number') {
            return createErrorResponse('缺少或无效的相册ID', 400, corsHeaders);
        }

        // 验证 comment 对象
        if (!comment || typeof comment !== 'object') {
            return createErrorResponse('缺少或无效的评论数据', 400, corsHeaders);
        }

        // 验证评论文本
        const commentText = comment.text;
        if (!commentText || typeof commentText !== 'string') {
            return createErrorResponse('评论内容不能为空', 400, corsHeaders);
        }

        // 验证评论长度（在转义前）
        const MAX_COMMENT_LENGTH = 500;
        if (commentText.length > MAX_COMMENT_LENGTH) {
            return createErrorResponse(`评论内容不能超过 ${MAX_COMMENT_LENGTH} 个字符`, 400, corsHeaders);
        }

        const commentRateKey = `comment_rate_${clientIP}`;

        const rateData = await env.ALBUM_KV2.get(commentRateKey);
        let commentCount = rateData ? parseInt(rateData, 10) : 0;

        if (commentCount >= 5) {
            return createErrorResponse('评论太频繁，请稍后再试', 429, corsHeaders);
        }

        const albumKey = `album_${albumId}`;
        const albumData = await env.ALBUM_KV2.get(albumKey);

        if (!albumData) {
            return createErrorResponse('相册不存在', 404, corsHeaders);
        }

        const album = safeJSONParse(albumData);
        if (!album) {
            return createErrorResponse('相册数据损坏', 500, corsHeaders);
        }

        album.comments = album.comments || [];

        // 限制评论数量，防止数组无限增长
        const MAX_COMMENTS = 100;
        if (album.comments.length >= MAX_COMMENTS) {
            // 删除最旧的评论
            album.comments.shift();
        }

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

        // 限制作者名称长度
        const MAX_AUTHOR_LENGTH = 50;
        const authorName = comment.author || '匿名用户';

        album.comments.push({
            author: escapeHtml(authorName).substring(0, MAX_AUTHOR_LENGTH),
            text: escapeHtml(commentText),
            time: comment.time || new Date().toLocaleString('zh-CN')
        });

        await env.ALBUM_KV2.put(commentRateKey, String(commentCount + 1), { expirationTtl: 60 });
        await env.ALBUM_KV2.put(albumKey, JSON.stringify(album));

        return createSuccessResponse({}, corsHeaders);
    } catch (error) {
        return createErrorResponse('评论失败: ' + error.message, 500, corsHeaders);
    }
}

// 更新图片故事
export async function handleUpdateStory(request, env) {
    const corsHeaders = getCorsHeaders(request);

    // 全局速率限制检查
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkGlobalRateLimit(env, clientIP);
    if (!rateLimit.allowed) {
        return createErrorResponse('请求过于频繁，请稍后再试', 429, corsHeaders);
    }

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

        const album = safeJSONParse(albumData);
        if (!album) {
            return new Response(JSON.stringify({
                success: false,
                error: '相册数据损坏'
            }), {
                status: 500,
                headers: corsHeaders
            });
        }

        // 限制描述长度
        const MAX_DESC_LENGTH = 1000;
        album.desc = (desc || '').substring(0, MAX_DESC_LENGTH);

        await env.ALBUM_KV2.put(albumKey, JSON.stringify(album));

        // 记录审计日志
        await logAuditAction(env, 'update_story', {
            albumId: id,
            ip: clientIP,
            userAgent: request.headers.get('User-Agent') || 'unknown'
        });

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

        // 安全修复：移除默认密码，强制要求配置环境变量
        const adminPassword = env.ADMIN_PASSWORD;
        if (!adminPassword) {
            return new Response(JSON.stringify({
                success: false,
                error: '服务器未配置管理员密码，请联系管理员在 Cloudflare Dashboard 中设置 ADMIN_PASSWORD 环境变量'
            }), {
                status: 500,
                headers: corsHeaders
            });
        }

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
