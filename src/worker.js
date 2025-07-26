export default {
    async fetch(request, env) {
        const url = new URLexport default {
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
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>郑秀彬专属相册集</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                        url('https://wmimg.com/i/698/2025/07/6882002520d29.webp') center/cover no-repeat fixed;
            color: #333;
            min-height: 100vh;
            padding: 20px;
            overflow-x: hidden;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            padding: 40px 20px;
            animation: fadeInDown 1s ease;
            position: relative;
        }

        header h1 {
            font-size: 3.5rem;
            margin-bottom: 15px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
            color: #FFD700;
            word-break: keep-all;
            white-space: normal;
        }

        header p {
            font-size: 1.3rem;
            max-width: 700px;
            margin: 0 auto;
            opacity: 0.9;
            color: #fff;
        }

        /* 登录按钮样式 - 左上角灰色 */
        .login-section {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 100;
        }

        .login-btn {
            background: linear-gradient(45deg, #9e9e9e, #757575);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }

        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        }

        .logout-btn {
            background: linear-gradient(45deg, #f44336, #da190b);
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(244, 67, 54, 0.4);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }

        .logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.5);
        }

        .user-info {
            color: white;
            background: rgba(0, 0, 0, 0.5);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }

        .announcement-float {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            width: 90%;
            max-width: 800px;
            border: 3px solid #FFD54F;
            cursor: move;
        }

        .announcement-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #FFD700;
        }

        .announcement-header h2 {
            color: #FF8C00;
            font-size: 1.5rem;
            margin: 0;
        }

        .announcement-actions {
            display: flex;
            gap: 10px;
        }

        .edit-announcement-btn, .close-announcement-btn {
            background: linear-gradient(45deg, #FFA500, #FF8C00);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 3px 8px rgba(255, 140, 0, 0.4);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-announcement-btn {
            background: linear-gradient(45deg, #ff4757, #ff6b81);
        }

        .edit-announcement-btn:hover, .close-announcement-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 12px rgba(255, 140, 0, 0.5);
        }

        .announcement-content {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #444;
            min-height: 60px;
        }

        .announcement-content.empty {
            font-style: italic;
            color: #999;
        }

        .profile-section {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin: 30px 0;
            flex-wrap: wrap;
            perspective: 1000px;
        }

        .profile-card {
            width: 150px;
            height: 150px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.8s;
            cursor: pointer;
        }

        .profile-card.flipped {
            transform: rotateY(180deg);
        }

        .profile-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            border: 5px solid rgba(255, 215, 0, 0.5);
        }

        .profile-front {
            background: url('https://wmimg.com/i/698/2025/07/688200253fecc.jpg') center/cover;
        }

        .profile-back {
            background: rgba(255, 255, 255, 0.95);
            transform: rotateY(180deg);
            padding: 15px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .profile-back h3 {
            color: #FF8C00;
            font-size: 1.2rem;
            margin-bottom: 5px;
        }

        .profile-back p {
            font-size: 0.8rem;
            color: #666;
        }

        .upload-section {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            padding: 30px;
            margin: 30px auto;
            max-width: 800px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            text-align: center;
            backdrop-filter: blur(10px);
        }

        .upload-section h2 {
            color: #FF8C00;
            margin-bottom: 20px;
        }

        .upload-area {
            border: 3px dashed #FFA500;
            border-radius: 15px;
            padding: 40px 20px;
            margin: 20px 0;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            background: rgba(255, 255, 255, 0.7);
        }

        .upload-area:hover {
            background: rgba(255, 215, 0, 0.2);
        }

        .upload-area i {
            font-size: 3rem;
            color: #FFA500;
            margin-bottom: 15px;
        }

        #file-input {
            display: none;
        }

        .upload-btn {
            background: linear-gradient(to right, #FFA500, #FF8C00);
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 1.1rem;
            border-radius: 50px;
            cursor: pointer;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(255, 140, 0, 0.4);
            transition: all 0.3s ease;
        }

        .upload-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(255, 140, 0, 0.5);
        }

        .upload-btn:active {
            transform: translateY(1px);
        }

        .filter-section {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-group {
            display: flex;
            gap: 10px;
            align-items: center;
            background: rgba(255, 255, 255, 0.9);
            padding: 10px 20px;
            border-radius: 50px;
            backdrop-filter: blur(5px);
        }

        .filter-label {
            font-weight: bold;
            color: #FF8C00;
        }

        .filter-select {
            padding: 8px 15px;
            border: 2px solid #FFA500;
            border-radius: 20px;
            background: white;
            color: #333;
            font-size: 1rem;
            cursor: pointer;
        }

        .filter-btn {
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid #FFA500;
            color: #FF8C00;
            padding: 12px 25px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }

        .filter-btn:hover, .filter-btn.active {
            background: #FFA500;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
            padding: 20px;
        }

        .album-item {
            position: relative;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transform: translateY(50px);
            opacity: 0;
            transition: all 0.6s ease;
            animation: fadeInUp 0.6s forwards;
            animation-delay: calc(var(--delay) * 0.1s);
            height: 300px;
            background: #fff;
            cursor: pointer;
        }

        .album-item.visible {
            transform: translateY(0);
            opacity: 1;
        }

        .album-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .album-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(255, 215, 0, 0.9), transparent);
            padding: 25px 20px 15px;
            transform: translateY(100px);
            transition: transform 0.4s ease;
        }

        .album-item:hover .album-overlay {
            transform: translateY(0);
        }

        .album-item:hover .album-img {
            transform: scale(1.05);
        }

        .album-title {
            font-size: 1.4rem;
            margin-bottom: 8px;
            color: #333;
        }

        .album-desc {
            font-size: 0.95rem;
            color: #555;
            margin-bottom: 12px;
        }

        .album-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            color: #666;
        }

        .album-date {
            font-size: 0.85rem;
            background: rgba(255, 140, 0, 0.8);
            color: white;
            padding: 3px 8px;
            border-radius: 10px;
            display: inline-block;
            margin-top: 5px;
        }

        .delete-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 0, 0, 0.7);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 10;
        }

        .album-item:hover .delete-btn {
            opacity: 1;
        }

        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,200,0.95) 0%, rgba(255,248,220,0.98) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            overflow: hidden;
        }

        .lightbox.active {
            opacity: 1;
            pointer-events: all;
        }

        .lightbox-content-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            position: relative;
        }

        .lightbox-content {
            max-width: 90%;
            max-height: 80vh;
            border-radius: 15px;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
            cursor: zoom-in;
            transition: transform 0.3s ease;
            border: 5px solid #FFD700;
            z-index: 100;
        }

        .lightbox-content.zoomed {
            max-width: none;
            max-height: none;
            cursor: zoom-out;
        }

        .close-lightbox {
            position: absolute;
            top: 30px;
            right: 30px;
            color: #FF6B35;
            font-size: 2.5rem;
            cursor: pointer;
            transition: transform 0.3s ease;
            z-index: 1001;
            background: rgba(255, 255, 255, 0.8);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(255, 107, 53, 0.5);
        }

        .close-lightbox:hover {
            transform: rotate(90deg) scale(1.1);
            background: white;
        }

        /* 图片导航按钮 */
        .nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.7);
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.5rem;
            color: #FF6B35;
            box-shadow: 0 0 15px rgba(0,0,0,0.3);
            z-index: 200;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .nav-btn:hover {
            background: white;
            transform: translateY(-50%) scale(1.1);
        }

        .nav-btn.prev {
            left: 30px;
        }

        .nav-btn.next {
            right: 30px;
        }

        /* 弹幕容器 */
        .danmu-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 200;
            overflow: hidden;
        }

        /* 弹幕项 */
        .danmu-item {
            position: absolute;
            right: -300px;
            white-space: nowrap;
            font-size: 1.2rem;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            pointer-events: none;
            padding: 5px 15px;
            border-radius: 20px;
            background: rgba(0,0,0,0.3);
            animation: danmuMove linear;
            animation-fill-mode: forwards;
        }

        @keyframes danmuMove {
            from {
                transform: translateX(0);
            }
            to {
                transform: translateX(-100vw);
            }
        }

        /* 弹幕输入区域 */
        .danmu-input-container {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.9);
            border-radius: 30px;
            padding: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 300;
            width: 95%;
            max-width: 600px;
        }

        .danmu-input {
            flex: 1;
            padding: 12px 15px;
            border: 2px solid #FFD54F;
            border-radius: 25px;
            outline: none;
            font-size: 1rem;
            background: rgba(255, 255, 255, 0.8);
        }

        .danmu-input:focus {
            border-color: #FFB74D;
            box-shadow: 0 0 10px rgba(255, 183, 77, 0.5);
        }

        .danmu-submit {
            background: linear-gradient(45deg, #FFD54F, #FFB74D);
            color: #333;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 3px 8px rgba(255, 183, 77, 0.4);
            white-space: nowrap;
        }

        .danmu-submit:hover {
            background: linear-gradient(45deg, #FFB74D, #FF9800);
            transform: translateY(-2px);
            box-shadow: 0 5px 12px rgba(255, 152, 0, 0.5);
        }

        /* 点赞按钮 */
        .like-btn-container {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: 5px;
        }

        .like-btn {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            font-size: 1.4rem;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s ease;
            padding: 8px 10px;
            border-radius: 20px;
        }

        .like-btn.liked {
            color: #ff4757;
            background: rgba(255, 71, 87, 0.1);
            transform: scale(1.1);
        }

        .like-count {
            font-weight: bold;
            color: #E65F5C;
            font-size: 1.1rem;
        }

        /* 隐藏/显示弹幕按钮 */
        .toggle-danmu-btn {
            position: fixed;
            bottom: 90px;
            right: 20px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            z-index: 300;
        }

        .toggle-danmu-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.5);
        }

        /* 图片翻转卡片样式 */
        .image-card {
            position: relative;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transition: transform 0.8s;
            cursor: pointer;
            margin: 0 auto;
        }

        .image-card.flipped {
            transform: rotateY(180deg);
        }

        .image-face {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .image-front {
            /* 正面是图片本身 */
        }

        .image-back {
            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);
            transform: rotateY(180deg);
            padding: 25px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            border: 3px solid #FFD700;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            overflow: hidden;
        }

        .image-back-content {
            max-height: 100%;
            overflow-y: auto;
            width: 100%;
            padding: 20px;
        }

        .image-back-content h4 {
            color: #E65F5C;
            margin-bottom: 15px;
            font-size: 1.4rem;
        }

        .image-back-content p {
            color: #555;
            line-height: 1.6;
            font-size: 1.1rem;
            word-wrap: break-word;
            white-space: pre-wrap;
        }

        .image-back-content p.empty-story {
            font-style: italic;
            color: #999;
        }

        /* 登录弹窗样式 */
        .login-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .login-modal.active {
            opacity: 1;
            pointer-events: all;
        }

        .login-content {
            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
            border: 3px solid #FFD700;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }

        .login-modal.active .login-content {
            transform: scale(1);
        }

        .login-content h3 {
            color: #E65F5C;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }

        .login-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #FFB74D;
            border-radius: 15px;
            font-size: 1.1rem;
            margin: 15px 0;
            outline: none;
            text-align: center;
        }

        .login-input:focus {
            border-color: #FF8A65;
            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);
        }

        .login-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
        }

        .login-btn-modal {
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            flex: 1;
        }

        .login-confirm {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
        }

        .login-cancel {
            background: linear-gradient(45deg, #f44336, #da190b);
            color: white;
        }

        .login-btn-modal:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        /* 酷炫可爱的上传编辑弹窗样式 - 添加滚动条 */
        .edit-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,140,0,0.2) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s ease;
            backdrop-filter: blur(5px);
            padding: 20px;
            overflow-y: auto;
        }

        .edit-modal.active {
            opacity: 1;
            pointer-events: all;
        }

        .edit-content {
            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);
            border-radius: 25px;
            padding: 25px 20px;
            width: 95%;
            max-width: 95%;
            box-shadow: 
                0 0 30px rgba(255, 215, 0, 0.6),
                0 0 60px rgba(255, 140, 0, 0.4),
                inset 0 0 20px rgba(255, 255, 255, 0.5);
            transform: translateY(50px) scale(0.9);
            transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            border: 3px solid #FFD700;
            max-height: 95vh;
            overflow-y: auto;
            margin: 20px 0;
        }

        .edit-modal.active .edit-content {
            transform: translateY(0) scale(1);
        }

        .edit-content::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
            transform: rotate(30deg);
            z-index: 0;
        }

        .edit-content h3 {
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.3rem;
            font-weight: bold;
            position: relative;
            z-index: 1;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            animation: heartbeat 2s infinite;
            background: linear-gradient(45deg, #FF6B35, #FFD700, #FF8A65, #FFD54F);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 300% 300%;
            animation: gradientShift 3s ease infinite;
            line-height: 1.3;
        }

        /* 公告编辑弹窗 */
        .announcement-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .announcement-modal.active {
            opacity: 1;
            pointer-events: all;
        }

        .announcement-content-modal {
            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 600px;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
            border: 3px solid #FFD700;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }

        .announcement-modal.active .announcement-content-modal {
            transform: scale(1);
        }

        .announcement-content-modal h3 {
            color: #E65F5C;
            margin-bottom: 20px;
            font-size: 1.5rem;
            text-align: center;
        }

        .announcement-textarea {
            width: 100%;
            min-height: 150px;
            padding: 15px;
            border: 2px solid #FFB74D;
            border-radius: 15px;
            font-size: 1.1rem;
            margin: 20px 0;
            outline: none;
            resize: vertical;
            background: rgba(255, 255, 255, 0.9);
        }

        .announcement-textarea:focus {
            border-color: #FF8A65;
            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);
        }

        .announcement-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .announcement-btn {
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .announcement-save {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
        }

        .announcement-cancel {
            background: linear-gradient(45deg, #f44336, #da190b);
            color: white;
        }

        .announcement-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        /* 渐变动画 */
        @keyframes gradientShift {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }

        .edit-form-group {
            margin-bottom: 18px;
            position: relative;
            z-index: 1;
        }

        .edit-form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #E65F5C;
            font-size: 1.1rem;
        }

        .edit-form-group input,
        .edit-form-group select,
        .edit-form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #FFB74D;
            border-radius: 15px;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.7);
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .edit-form-group input:focus,
        .edit-form-group select:focus,
        .edit-form-group textarea:focus {
            border-color: #FF8A65;
            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);
            transform: translateY(-2px);
        }

        .edit-form-group textarea {
            min-height: 100px;
            resize: vertical;
        }

        .edit-form-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
            position: relative;
            z-index: 1;
        }

        .edit-btn {
            padding: 12px 25px;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            flex: 1;
            max-width: 180px;
        }

        .edit-btn.edit-save {
            background: linear-gradient(45deg, #FF8A65, #FF7043);
            color: white;
        }

        .edit-btn.edit-cancel {
            background: linear-gradient(45deg, #90A4AE, #78909C);
            color: white;
        }

        .edit-btn::before {
            content: "";
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: 0.5s;
        }

        .edit-btn:hover::before {
            left: 100%;
        }

        .edit-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }

        .edit-btn:active {
            transform: translateY(0) scale(0.98);
        }

        .preview-image {
            max-width: 100%;
            max-height: 180px;
            border-radius: 15px;
            margin-bottom: 15px;
            object-fit: contain;
            border: 3px solid #FFD54F;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
        }

        .upload-progress {
            margin-top: 15px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 15px;
            height: 10px;
            overflow: hidden;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #FFD54F, #FFB74D, #FF9800);
            width: 0%;
            transition: width 0.3s ease;
            border-radius: 15px;
            box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
        }

        /* 装饰元素 */
        .heart {
            position: absolute;
            color: #FF5252;
            font-size: 20px;
            animation: float 6s infinite ease-in-out;
            z-index: 0;
        }

        .star {
            position: absolute;
            color: #FFD700;
            font-size: 15px;
            animation: twinkle 3s infinite ease-in-out;
            z-index: 0;
        }

        /* 错误提示样式 */
        .error-message {
            color: #ff4757;
            font-size: 0.9rem;
            margin-top: 5px;
            display: none;
        }

        .upload-error {
            color: #ff4757;
            font-size: 0.9rem;
            margin-top: 5px;
            display: none;
        }

        footer {
            text-align: center;
            padding: 40px 20px;
            margin-top: 30px;
            font-size: 1.1rem;
            opacity: 0.9;
            color: #fff;
            text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        /* 密码验证弹窗样式 */
        .password-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .password-modal.active {
            opacity: 1;
            pointer-events: all;
        }

        .password-content {
            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
            border: 3px solid #FFD700;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }

        .password-modal.active .password-content {
            transform: scale(1);
        }

        .password-content h3 {
            color: #E65F5C;
            margin-bottom: 20px;
            font-size: 1.5rem;
        }

        .password-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #FFB74D;
            border-radius: 15px;
            font-size: 1.1rem;
            margin: 20px 0;
            outline: none;
            text-align: center;
        }

        .password-input:focus {
            border-color: #FF8A65;
            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);
        }

        .password-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .password-btn {
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .password-confirm {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
        }

        .password-cancel {
            background: linear-gradient(45deg, #f44336, #da190b);
            color: white;
        }

        .password-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        /* 动画关键帧 */
        @keyframes heartbeat {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        @keyframes float {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }

        @keyframes twinkle {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0; transform: scale(0.5); }
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (min-width: 768px) {
            .edit-content {
                max-width: 500px;
                padding: 30px 25px;
            }
            
            .edit-content h3 {
                font-size: 1.5rem;
            }
        }

        @media (min-width: 1024px) {
            .edit-content h3 {
                font-size: 1.7rem;
            }
        }

        @media (max-width: 768px) {
            header h1 {
                font-size: 2.5rem;
            }
            
            header p {
                font-size: 1.1rem;
            }
            
            .gallery {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
            
            .profile-section {
                flex-direction: column;
                text-align: center;
            }
            
            .filter-section {
                flex-direction: column;
                gap: 15px;
            }
            
            .filter-group {
                width: 100%;
                justify-content: center;
            }
            
            .edit-form-buttons {
                flex-direction: column;
                gap: 15px;
            }
            
            .edit-btn {
                width: 100%;
                max-width: none;
            }
        }

        @media (max-width: 480px) {
            .filter-btn {
                padding: 10px 15px;
                font-size: 0.9rem;
            }
            
            header h1 {
                font-size: 2rem;
            }
            
            .upload-section {
                padding: 20px 15px;
            }
            
            .edit-content h3 {
                font-size: 1.2rem;
            }
            
            .edit-content {
                padding: 20px 15px;
            }
            
            .danmu-input-container {
                width: 95%;
                padding: 6px;
                bottom: 10px;
            }
            
            .danmu-input {
                padding: 10px 12px;
                font-size: 0.9rem;
            }
            
            .danmu-submit {
                padding: 10px 15px;
                font-size: 0.9rem;
            }
            
            .like-btn-container {
                gap: 5px;
            }
            
            .like-btn {
                padding: 6px 8px;
                font-size: 1.2rem;
            }
            
            .like-count {
                font-size: 1rem;
            }
            
            .nav-btn {
                width: 40px;
                height: 40px;
                font-size: 1.2rem;
            }
            
            .nav-btn.prev {
                left: 15px;
            }
            
            .nav-btn.next {
                right: 15px;
            }
        }
        
        /* 加载提示样式 */
        .loading {
            text-align: center;
            padding: 50px;
            color: #fff;
            font-size: 1.2rem;
        }
        
        .loading i {
            margin-right: 10px;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="login-section" id="login-section">
                <!-- 登录/登出按钮将在这里动态生成 -->
            </div>
            <h1><i class="fas fa-star"></i> 郑秀彬专属相册集</h1>
            <p>珍藏秀彬的每一个精彩瞬间</p>
        </header>
        
        <!-- 悬浮公告区域 -->
        <div class="announcement-float" id="announcement-float">
            <div class="announcement-header">
                <h2><i class="fas fa-bullhorn"></i> 最新公告</h2>
                <div class="announcement-actions">
                    <button class="edit-announcement-btn" id="edit-announcement-btn" title="编辑公告">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="close-announcement-btn" id="close-announcement-btn" title="关闭公告">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="announcement-content" id="announcement-content">
                欢迎来到郑秀彬专属相册集！这里珍藏着秀彬的每一个精彩瞬间。请尽情欣赏并留下您的宝贵评论。
            </div>
        </div>
        
        <div class="profile-section">
            <div class="profile-card" id="profile-card">
                <div class="profile-face profile-front"></div>
                <div class="profile-face profile-back">
                    <h3>郑秀彬</h3>
                    <p>演员</p>
                    <p>1998.08.17</p>
                </div>
            </div>
        </div>
        
        <div class="upload-section">
            <h2><i class="fas fa-cloud-upload-alt"></i> 上传秀彬照片</h2>
            <div class="upload-area" id="upload-area">
                <i class="fas fa-images"></i>
                <p>点击或拖拽图片到此处上传</p>
                <p>支持 JPG, PNG, GIF 格式</p>
                <input type="file" id="file-input" accept="image/*">
            </div>
            <button class="upload-btn" id="upload-btn">上传图片</button>
        </div>
        
        <div class="filter-section">
            <div class="filter-group">
                <span class="filter-label">类型:</span>
                <select class="filter-select" id="category-filter">
                    <option value="all">全部</option>
                    <option value="stage">剧照</option>
                    <option value="candid">生活照</option>
                    <option value="fan">粉丝活动</option>
                    <option value="mv">写真</option>
                </select>
            </div>
            
            <div class="filter-group">
                <span class="filter-label">年份:</span>
                <select class="filter-select" id="year-filter">
                    <option value="all">全部</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                </select>
            </div>
            
            <div class="filter-group">
                <span class="filter-label">月份:</span>
                <select class="filter-select" id="month-filter">
                    <option value="all">全部</option>
                    <option value="01">1月</option>
                    <option value="02">2月</option>
                    <option value="03">3月</option>
                    <option value="04">4月</option>
                    <option value="05">5月</option>
                    <option value="06">6月</option>
                    <option value="07">7月</option>
                    <option value="08">8月</option>
                    <option value="09">9月</option>
                    <option value="10">10月</option>
                    <option value="11">11月</option>
                    <option value="12">12月</option>
                </select>
            </div>
            
            <button class="filter-btn" id="apply-filter">
                <i class="fas fa-search"></i> 应用筛选
            </button>
            
            <button class="filter-btn" id="reset-filter">
                <i class="fas fa-sync"></i> 重置
            </button>
        </div>
        
        <div class="gallery" id="gallery">
            <!-- 相册项目将在JavaScript中生成 -->
            <div class="loading"><i class="fas fa-spinner"></i> 正在加载相册数据...</div>
        </div>
        
        <div class="lightbox">
            <span class="close-lightbox">&times;</span>
            <!-- 图片导航按钮 -->
            <button class="nav-btn prev" id="prev-btn">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="nav-btn next" id="next-btn">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="lightbox-content-container">
                <div class="image-card" id="image-card">
                    <div class="image-face image-front">
                        <img class="lightbox-content" id="lightbox-img" src="" alt="">
                    </div>
                    <div class="image-face image-back">
                        <div class="image-back-content" id="image-back-content">
                            <h4>图片故事</h4>
                            <p id="image-story">秀斌也有自己的小秘密~</p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 弹幕容器 -->
            <div class="danmu-container" id="danmu-container"></div>
            
            <!-- 弹幕输入区域 -->
            <div class="danmu-input-container">
                <input type="text" class="danmu-input" id="danmu-input" placeholder="发送弹幕..." maxlength="50">
                <div class="like-btn-container">
                    <button class="like-btn" id="like-btn">
                        <i class="fas fa-heart"></i>
                    </button>
                    <span class="like-count" id="like-count">0</span>
                </div>
                <button class="danmu-submit" id="danmu-submit">发送</button>
            </div>
            
            <!-- 隐藏/显示弹幕按钮 -->
            <button class="toggle-danmu-btn" id="toggle-danmu-btn" title="隐藏弹幕">
                <i class="fas fa-eye-slash"></i>
            </button>
        </div>
        
        <!-- 酷炫可爱的上传编辑弹窗 -->
        <div class="edit-modal" id="edit-modal">
            <div class="edit-content">
                <h3>每一次用心编辑都是爱的具象化</h3>
                <img id="preview-image" class="preview-image" src="" alt="预览图片">
                <form id="edit-form">
                    <div class="edit-form-group">
                        <label for="edit-title"><i class="fas fa-heading"></i> 图片标题:</label>
                        <input type="text" id="edit-title" required placeholder="给这张美美的照片起个名字吧~">
                        <div class="error-message" id="title-error">图片名称已存在，请使用其他名称</div>
                        <div class="upload-error" id="upload-error"></div>
                    </div>
                    <div class="edit-form-group">
                        <label for="edit-desc"><i class="fas fa-align-left"></i> 图片描述:</label>
                        <textarea id="edit-desc" placeholder="分享这张照片的故事..."></textarea>
                    </div>
                    <div class="edit-form-group">
                        <label for="edit-category"><i class="fas fa-tags"></i> 图片分类:</label>
                        <select id="edit-category">
                            <option value="stage">剧照</option>
                            <option value="candid" selected>生活照</option>
                            <option value="fan">粉丝活动</option>
                            <option value="mv">写真</option>
                        </select>
                    </div>
                    <div class="edit-form-group">
                        <label for="edit-year"><i class="fas fa-calendar"></i> 年份:</label>
                        <select id="edit-year">
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023" selected>2023</option>
                            <option value="2022">2022</option>
                            <option value="2021">2021</option>
                        </select>
                    </div>
                    <div class="edit-form-group">
                        <label for="edit-month"><i class="fas fa-calendar-alt"></i> 月份:</label>
                        <select id="edit-month">
                            <option value="01">1月</option>
                            <option value="02">2月</option>
                            <option value="03">3月</option>
                            <option value="04">4月</option>
                            <option value="05">5月</option>
                            <option value="06">6月</option>
                            <option value="07">7月</option>
                            <option value="08" selected>8月</option>
                            <option value="09">9月</option>
                            <option value="10">10月</option>
                            <option value="11">11月</option>
                            <option value="12">12月</option>
                        </select>
                    </div>
                    <div class="upload-progress">
                        <div class="progress-bar" id="progress-bar"></div>
                    </div>
                    <div class="edit-form-buttons">
                        <button type="button" class="edit-btn edit-cancel" id="edit-cancel">
                            <i class="fas fa-times"></i> 取消
                        </button>
                        <button type="submit" class="edit-btn edit-save">
                            <i class="fas fa-heart"></i> 保存
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- 公告编辑弹窗 -->
        <div class="announcement-modal" id="announcement-modal">
            <div class="announcement-content-modal">
                <h3><i class="fas fa-edit"></i> 编辑公告</h3>
                <textarea class="announcement-textarea" id="announcement-textarea" placeholder="请输入公告内容..."></textarea>
                <div class="announcement-buttons">
                    <button class="announcement-btn announcement-cancel" id="announcement-cancel">取消</button>
                    <button class="announcement-btn announcement-save" id="announcement-save">保存</button>
                </div>
            </div>
        </div>
        
        <!-- 密码验证弹窗 -->
        <div class="password-modal" id="password-modal">
            <div class="password-content">
                <h3><i class="fas fa-lock"></i> 需要密码验证</h3>
                <p id="password-action">请输入密码以继续操作</p>
                <input type="password" class="password-input" id="password-input" placeholder="请输入密码">
                <div class="password-buttons">
                    <button class="password-btn password-cancel" id="password-cancel">取消</button>
                    <button class="password-btn password-confirm" id="password-confirm">确认</button>
                </div>
            </div>
        </div>
        
        <!-- 登录弹窗 -->
        <div class="login-modal" id="login-modal">
            <div class="login-content">
                <h3><i class="fas fa-user-lock"></i> 管理员登录</h3>
                <input type="password" class="login-input" id="login-password" placeholder="请输入管理员密码">
                <div class="login-buttons">
                    <button class="login-btn-modal login-cancel" id="login-cancel">取消</button>
                    <button class="login-btn-modal login-confirm" id="login-confirm">登录</button>
                </div>
            </div>
        </div>
        
        <footer>
            <p>&copy; 郑秀彬专属相册集 | 为优秀演员郑秀彬应援!</p>
        </footer>
    </div>

    <script>
        // 全局变量
        let albums = [];
        let announcementContent = "欢迎来到郑秀彬专属相册集！这里珍藏着秀彬的每一个精彩瞬间。请尽情欣赏并留下您的宝贵评论。";

        // 获取DOM元素
        const gallery = document.getElementById('gallery');
        const categoryFilter = document.getElementById('category-filter');
        const yearFilter = document.getElementById('year-filter');
        const monthFilter = document.getElementById('month-filter');
        const applyFilterBtn = document.getElementById('apply-filter');
        const resetFilterBtn = document.getElementById('reset-filter');
        const lightbox = document.querySelector('.lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeLightbox = document.querySelector('.close-lightbox');
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const uploadBtn = document.getElementById('upload-btn');
        const profileCard = document.getElementById('profile-card');
        const imageCard = document.getElementById('image-card');
        const imageStory = document.getElementById('image-story');
        const loginSection = document.getElementById('login-section');
        const danmuContainer = document.getElementById('danmu-container');
        const danmuInput = document.getElementById('danmu-input');
        const danmuSubmit = document.getElementById('danmu-submit');
        const likeBtn = document.getElementById('like-btn');
        const likeCount = document.getElementById('like-count');
        const toggleDanmuBtn = document.getElementById('toggle-danmu-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        // 编辑弹窗元素
        const editModal = document.getElementById('edit-modal');
        const previewImage = document.getElementById('preview-image');
        const editForm = document.getElementById('edit-form');
        const editTitle = document.getElementById('edit-title');
        const editDesc = document.getElementById('edit-desc');
        const editCategory = document.getElementById('edit-category');
        const editYear = document.getElementById('edit-year');
        const editMonth = document.getElementById('edit-month');
        const editCancel = document.getElementById('edit-cancel');
        const progressBar = document.getElementById('progress-bar');
        const titleError = document.getElementById('title-error');
        const uploadError = document.getElementById('upload-error');

        // 密码弹窗元素
        const passwordModal = document.getElementById('password-modal');
        const passwordInput = document.getElementById('password-input');
        const passwordConfirm = document.getElementById('password-confirm');
        const passwordCancel = document.getElementById('password-cancel');
        const passwordAction = document.getElementById('password-action');

        // 登录弹窗元素
        const loginModal = document.getElementById('login-modal');
        const loginPassword = document.getElementById('login-password');
        const loginConfirm = document.getElementById('login-confirm');
        const loginCancel = document.getElementById('login-cancel');

        // 当前查看的相册ID和临时上传文件
        let currentAlbumId = null;
        let tempUploadFile = null;
        let isZoomed = false;
        let pendingAction = null;
        let clickCount = 0;
        let clickTimer = null;
        let scale = 1;
        let startX, startY, isDragging = false;
        let translateX = 0, translateY = 0;
        let startTranslateX = 0, startTranslateY = 0;
        let isAdmin = false;
        let danmuVisible = true;
        let currentIndex = 0;
        let startXSwipe = 0;
        let isSwiping = false;

        // 预设密码
        const PASSWORD = "81798";
        const ANNOUNCEMENT_PASSWORD = "72703";
        const ADMIN_PASSWORD = "admin123";

        // 随机颜色数组
        const danmuColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D9E5', '#FFB347', '#B19CD9', '#FF6961'
        ];

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', async function() {
            updateLoginDisplay();
            await loadAlbums();
            await loadAnnouncement();
            renderAlbums();
            bindEventListeners();
        });

        // 绑定所有事件监听器
        function bindEventListeners() {
            if (profileCard) {
                profileCard.addEventListener('click', function() {
                    this.classList.toggle('flipped');
                });
            }
            
            if (closeLightbox) closeLightbox.addEventListener('click', closeLightboxFunc);
            if (likeBtn) likeBtn.addEventListener('click', likeAlbum);
            if (toggleDanmuBtn) toggleDanmuBtn.addEventListener('click', toggleDanmu);
            if (danmuSubmit) danmuSubmit.addEventListener('click', sendDanmu);
            if (danmuInput) {
                danmuInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendDanmu();
                    }
                });
            }
            if (prevBtn) prevBtn.addEventListener('click', showPrevImage);
            if (nextBtn) nextBtn.addEventListener('click', showNextImage);
            if (imageCard) imageCard.addEventListener('click', flipImageCard);

            // 上传相关事件
            if (uploadArea) {
                uploadArea.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    this.style.background = 'rgba(255, 215, 0, 0.3)';
                });

                uploadArea.addEventListener('dragleave', function(e) {
                    e.preventDefault();
                    this.style.background = 'rgba(255, 255, 255, 0.7)';
                });

                uploadArea.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.style.background = 'rgba(255, 255, 255, 0.7)';
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        handleFileSelect(files[0]);
                    }
                });

                uploadArea.addEventListener('click', function() {
                    if (fileInput) fileInput.click();
                });
            }

            if (fileInput) {
                fileInput.addEventListener('change', function() {
                    if (this.files.length > 0) {
                        handleFileSelect(this.files[0]);
                    }
                });
            }

            if (uploadBtn) {
                uploadBtn.addEventListener('click', function() {
                    if (fileInput) fileInput.click();
                });
            }

            // 编辑表单事件
            if (editCancel) editCancel.addEventListener('click', closeEditModal);
            if (editForm) editForm.addEventListener('submit', handleUploadSubmit);

            // 筛选功能
            if (applyFilterBtn) applyFilterBtn.addEventListener('click', applyFilters);
            if (resetFilterBtn) resetFilterBtn.addEventListener('click', resetFilters);

            // 公告编辑事件
            const editAnnouncementBtn = document.getElementById('edit-announcement-btn');
            const closeAnnouncementBtn = document.getElementById('close-announcement-btn');
            const announcementSave = document.getElementById('announcement-save');
            const announcementCancel = document.getElementById('announcement-cancel');
            
            if (editAnnouncementBtn) {
                editAnnouncementBtn.addEventListener('click', () => {
                    showPasswordModal('announcement');
                });
            }

            if (closeAnnouncementBtn) {
                closeAnnouncementBtn.addEventListener('click', () => {
                    const announcementFloat = document.getElementById('announcement-float');
                    if (announcementFloat) announcementFloat.style.display = 'none';
                });
            }

            if (announcementSave) announcementSave.addEventListener('click', saveAnnouncement);
            if (announcementCancel) announcementCancel.addEventListener('click', hideEditAnnouncementModal);

            // 密码弹窗事件
            if (passwordConfirm) passwordConfirm.addEventListener('click', verifyPassword);
            if (passwordCancel) passwordCancel.addEventListener('click', hidePasswordModal);
            if (passwordInput) {
                passwordInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        verifyPassword();
                    }
                });
            }

            // 登录弹窗事件
            if (loginConfirm) loginConfirm.addEventListener('click', login);
            if (loginCancel) loginCancel.addEventListener('click', hideLoginModal);
            if (loginPassword) {
                loginPassword.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        login();
                    }
                });
            }

            // 点击背景关闭弹窗
            const modals = document.querySelectorAll('.login-modal, .password-modal, .announcement-modal, .edit-modal');
            modals.forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        this.classList.remove('active');
                        document.body.style.overflow = 'auto';
                        if (this.classList.contains('edit-modal')) {
                            closeEditModal();
                        }
                    }
                });
            });

            // ESC键关闭弹窗
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeLightboxFunc();
                    hidePasswordModal();
                    hideEditAnnouncementModal();
                    hideLoginModal();
                    closeEditModal();
                }
            });

            // 鼠标滚轮缩放图片
            if (lightboxImg) {
                lightboxImg.addEventListener('wheel', function(e) {
                    e.preventDefault();
                    const zoomIntensity = 0.1;
                    const mouseX = e.clientX - lightboxImg.getBoundingClientRect().left;
                    const mouseY = e.clientY - lightboxImg.getBoundingClientRect().top;
                    
                    if (e.deltaY < 0) {
                        scale *= (1 + zoomIntensity);
                    } else {
                        scale *= (1 - zoomIntensity);
                        if (scale < 1) scale = 1;
                    }
                    
                    updateImageTransform();
                    isZoomed = scale > 1;
                });
            }
        }

        // 加载相册数据
        async function loadAlbums() {
            try {
                const response = await fetch('/api/albums');
                if (response.ok) {
                    albums = await response.json();
                } else {
                    console.error('加载相册失败:', response.status);
                    albums = [];
                }
            } catch (error) {
                console.error('加载相册失败:', error);
                albums = [];
            }
        }

        // 加载公告数据
        async function loadAnnouncement() {
            try {
                const response = await fetch('/api/announcement');
                if (response.ok) {
                    const data = await response.json();
                    announcementContent = data.content;
                    const announcementContentEl = document.getElementById('announcement-content');
                    if (announcementContentEl) {
                        announcementContentEl.innerHTML = announcementContent;
                    }
                }
            } catch (error) {
                console.error('加载公告失败:', error);
            }
        }

        // 更新登录显示
        function updateLoginDisplay() {
            if (!loginSection) return;
            
            loginSection.innerHTML = '';
            
            if (isAdmin) {
                loginSection.innerHTML = \`
                    <div class="user-info" title="管理员已登录">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <button class="logout-btn" id="logout-btn" title="退出管理员">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                \`;
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', logout);
                }
            } else {
                loginSection.innerHTML = \`
                    <button class="login-btn" id="login-btn" title="管理员登录">
                        <i class="fas fa-user-lock"></i>
                    </button>
                \`;
                const loginBtn = document.getElementById('login-btn');
                if (loginBtn) {
                    loginBtn.addEventListener('click', showLoginModal);
                }
            }
        }

        // 显示登录弹窗
        function showLoginModal() {
            if (loginPassword) loginPassword.value = '';
            if (loginModal) {
                loginModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        // 隐藏登录弹窗
        function hideLoginModal() {
            if (loginModal) {
                loginModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }

        // 登录
        function login() {
            if (!loginPassword) return;
            const password = loginPassword.value.trim();
            if (password === ADMIN_PASSWORD) {
                isAdmin = true;
                hideLoginModal();
                updateLoginDisplay();
                alert('管理员登录成功！');
            } else {
                alert('密码错误！');
                loginPassword.value = '';
                loginPassword.focus();
            }
        }

        // 登出
        function logout() {
            isAdmin = false;
            updateLoginDisplay();
            alert('已退出管理员账户');
        }

        // 渲染相册
        function renderAlbums(filteredAlbums = albums) {
            if (!gallery) return;
            
            gallery.innerHTML = '';
            
            if (filteredAlbums.length === 0) {
                gallery.innerHTML = '<div class="loading">暂无相册数据</div>';
                return;
            }
            
            filteredAlbums.forEach((album, index) => {
                const albumItem = document.createElement('div');
                albumItem.className = 'album-item';
                albumItem.style.setProperty('--delay', index);
                
                // 格式化日期显示
                const dateObj = new Date(album.date);
                const formattedDate = \`\${dateObj.getFullYear()}年\${dateObj.getMonth()+1}月\${dateObj.getDate()}日\`;
                
                albumItem.innerHTML = \`
                    <img class="album-img" src="\${album.img}" alt="\${album.title}" data-id="\${album.id}">
                    <div class="album-overlay">
                        <h3 class="album-title">\${album.title}</h3>
                        <p class="album-desc">\${album.desc}</p>
                        <div class="album-meta">
                            <span><i class="fas fa-heart"></i> \${album.likes || 0}</span>
                            <span><i class="fas fa-comment"></i> \${album.comments ? album.comments.length : 0}</span>
                        </div>
                        <div class="album-date">\${formattedDate}</div>
                    </div>
                    <button class="delete-btn" data-id="\${album.id}"><i class="fas fa-trash"></i></button>
                \`;
                
                // 图片点击事件处理
                const imgElement = albumItem.querySelector('.album-img');
                if (imgElement) {
                    imgElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openLightbox(album);
                    });
                }
                
                const overlayElement = albumItem.querySelector('.album-overlay');
                if (overlayElement) {
                    overlayElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openLightbox(album);
                    });
                }
                
                // 删除按钮事件处理
                const deleteBtn = albumItem.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isAdmin) {
                            deleteAlbum(album.id);
                        } else {
                            showPasswordModal('delete', album.id);
                        }
                    });
                }
                
                gallery.appendChild(albumItem);
            });
            
            // 延迟添加visible类以触发动画
            setTimeout(() => {
                const albumItems = document.querySelectorAll('.album-item');
                albumItems.forEach(item => {
                    item.classList.add('visible');
                });
            }, 100);
        }

        // 打开灯箱
        function openLightbox(album) {
            currentAlbumId = album.id;
            if (lightboxImg) lightboxImg.src = album.img;
            if (lightbox) lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            isZoomed = false;
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
            
            // 重置图片卡片状态
            if (imageCard) imageCard.classList.remove('flipped');
            
            // 设置图片故事内容
            if (imageStory) {
                if (album.desc && album.desc.trim() !== "") {
                    imageStory.innerHTML = album.desc;
                    imageStory.classList.remove('empty-story');
                } else {
                    imageStory.innerHTML = "秀斌也有自己的小秘密~";
                    imageStory.classList.add('empty-story');
                }
            }
            
            // 清空弹幕容器
            if (danmuContainer) danmuContainer.innerHTML = '';
            
            // 更新点赞信息
            updateLikeInfo(album);
            
            // 显示弹幕（如果之前被隐藏）
            danmuVisible = true;
            updateToggleDanmuButton();
            
            // 设置当前索引
            currentIndex = albums.findIndex(a => a.id === album.id);
        }

        // 更新图片变换
        function updateImageTransform() {
            if (lightboxImg) {
                lightboxImg.style.transform = \`scale(\${scale}) translate(\${translateX}px, \${translateY}px)\`;
            }
        }

        // 关闭灯箱
        function closeLightboxFunc() {
            if (lightbox) lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // 切换弹幕显示/隐藏
        function toggleDanmu() {
            danmuVisible = !danmuVisible;
            updateToggleDanmuButton();
            const danmuItems = document.querySelectorAll('.danmu-item');
            danmuItems.forEach(danmu => {
                danmu.style.display = danmuVisible ? 'block' : 'none';
            });
        }

        // 更新弹幕开关按钮
        function updateToggleDanmuButton() {
            if (!toggleDanmuBtn) return;
            const icon = toggleDanmuBtn.querySelector('i');
            if (icon) {
                if (danmuVisible) {
                    icon.className = 'fas fa-eye-slash';
                    toggleDanmuBtn.title = '隐藏弹幕';
                } else {
                    icon.className = 'fas fa-eye';
                    toggleDanmuBtn.title = '显示弹幕';
                }
            }
        }

        // 发送弹幕
        function sendDanmu() {
            if (!danmuInput) return;
            const text = danmuInput.value.trim();
            if (!text) return;
            
            const danmuItem = document.createElement('div');
            danmuItem.className = 'danmu-item';
            danmuItem.textContent = text;
            danmuItem.style.color = danmuColors[Math.floor(Math.random() * danmuColors.length)];
            danmuItem.style.top = \`\${Math.random() * 70 + 10}%\`;
            danmuItem.style.fontSize = \`\${Math.random() * 0.5 + 1}rem\`;
            danmuItem.style.animationDuration = \`\${Math.random() * 5 + 10}s\`;
            
            if (!danmuVisible && danmuItem.style) {
                danmuItem.style.display = 'none';
            }
            
            if (danmuContainer) danmuContainer.appendChild(danmuItem);
            
            // 清空输入框
            danmuInput.value = '';
        }

        // 更新点赞信息
        function updateLikeInfo(album) {
            if (likeCount) likeCount.textContent = album.likes || 0;
            if (likeBtn) likeBtn.classList.toggle('liked', album.liked);
        }

        // 点赞功能
        function likeAlbum() {
            const album = albums.find(a => a.id === currentAlbumId);
            if (!album) return;
            
            const wasLiked = album.liked;
            album.liked = !wasLiked;
            album.likes = wasLiked ? Math.max(0, (album.likes || 0) - 1) : (album.likes || 0) + 1;
            
            // 更新UI
            updateLikeInfo(album);
            
            // 发送请求到后端
            fetch('/api/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    albumId: currentAlbumId,
                    liked: album.liked,
                    likes: album.likes
                })
            }).catch(error => {
                console.error('点赞请求失败:', error);
                // 如果失败，回滚状态
                album.liked = wasLiked;
                album.likes = wasLiked ? (album.likes || 0) + 1 : Math.max(0, (album.likes || 0) - 1);
                updateLikeInfo(album);
            });
        }

        // 切换到上一张图片
        function showPrevImage() {
            if (currentIndex > 0) {
                currentIndex--;
                openLightbox(albums[currentIndex]);
            }
        }

        // 切换到下一张图片
        function showNextImage() {
            if (currentIndex < albums.length - 1) {
                currentIndex++;
                openLightbox(albums[currentIndex]);
            }
        }

        // 文件选择处理
        function handleFileSelect(file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('请上传 JPG, PNG, GIF 或 WebP 格式的图片！');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                alert('图片大小不能超过 10MB！');
                return;
            }
            
            tempUploadFile = {
                file: file,
                name: file.name,
                size: file.size,
                type: file.type
            };
            
            const reader = new FileReader();
            reader.onload = function(e) {
                if (previewImage) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                }
                if (editTitle) {
                    editTitle.value = file.name.split('.')[0];
                }
                if (editDesc) {
                    editDesc.value = '';
                }
                openEditModal();
            };
            reader.readAsDataURL(file);
        }

        function openEditModal() {
            if (editModal) editModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (titleError) titleError.style.display = 'none';
            if (uploadError) uploadError.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
        }

        function closeEditModal() {
            if (editModal) editModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            tempUploadFile = null;
            if (previewImage) {
                previewImage.style.display = 'none';
            }
            if (editForm) editForm.reset();
            if (titleError) titleError.style.display = 'none';
            if (uploadError) uploadError.style.display = 'none';
            if (progressBar) progressBar.style.width = '0%';
        }

        function isTitleExists(title) {
            return albums.some(album => album.title === title);
        }

        // 修复后的上传表单提交函数
        async function handleUploadSubmit(e) {
            e.preventDefault();
            
            if (!tempUploadFile) return;
            
            const title = editTitle ? editTitle.value.trim() : '';
            
            // 检查名称是否已存在
            if (isTitleExists(title)) {
                if (titleError) titleError.style.display = 'block';
                return;
            }
            
            // 隐藏错误提示
            if (titleError) titleError.style.display = 'none';
            if (uploadError) uploadError.style.display = 'none';
            
            // 获取年月
            const year = editYear ? editYear.value : '2023';
            const month = editMonth ? editMonth.value : '08';
            const dateString = new Date().toISOString().split('T')[0];
            
            // 准备上传数据
            const formData = new FormData();
            formData.append('file', tempUploadFile.file);
            formData.append('metadata', JSON.stringify({
                title: title || "未命名图片",
                desc: editDesc ? editDesc.value : "用户上传的照片",
                category: editCategory ? editCategory.value : "candid",
                date: dateString
            }));
            
            try {
                // 显示上传进度
                if (progressBar) progressBar.style.width = "30%";
                
                console.log('Starting upload...');
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                console.log('Upload response status:', response.status);
                if (progressBar) progressBar.style.width = "70%";
                
                // 关键修改：先检查响应状态和内容类型
                const contentType = response.headers.get('content-type');
                console.log('Response content-type:', contentType);
                
                // 获取响应文本
                const responseText = await response.text();
                console.log('Raw response text:', responseText);
                
                // 检查是否为空响应
                if (!responseText || responseText.trim() === '') {
                    throw new Error(\`服务器返回空响应 (状态码: \${response.status})\`);
                }
                
                // 检查是否为JSON格式
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Failed to parse JSON response:', parseError);
                    console.error('Full response text:', responseText);
                    throw new Error(\`服务器返回了无效的响应格式: \${responseText.substring(0, 200)}\`);
                }
                
                if (result.success) {
                    if (progressBar) progressBar.style.width = "100%";
                    
                    // 添加到相册数组开头
                    if (result.data) {
                        albums.unshift(result.data);
                    }
                    
                    // 关闭弹窗并刷新相册
                    closeEditModal();
                    applyFilters();
                    
                    // 显示成功提示
                    setTimeout(() => {
                        alert('图片上传成功！秀彬感谢你的分享~');
                    }, 300);
                } else {
                    throw new Error(result.error || '上传失败');
                }
            } catch (error) {
                console.error('Upload failed:', error);
                if (uploadError) {
                    uploadError.textContent = '上传失败：' + error.message;
                    uploadError.style.display = 'block';
                }
                if (progressBar) progressBar.style.width = "0%";
            }
        }

        // 筛选功能
        function applyFilters() {
            const category = categoryFilter ? categoryFilter.value : 'all';
            const year = yearFilter ? yearFilter.value : 'all';
            const month = monthFilter ? monthFilter.value : 'all';
            
            let filtered = albums.filter(album => {
                const albumDate = new Date(album.date);
                const albumYear = albumDate.getFullYear().toString();
                const albumMonth = (albumDate.getMonth() + 1).toString().padStart(2, '0');
                
                return (category === 'all' || album.category === category) &&
                       (year === 'all' || albumYear === year) &&
                       (month === 'all' || albumMonth === month);
            });
            
            renderAlbums(filtered);
        }

        function resetFilters() {
            if (categoryFilter) categoryFilter.value = 'all';
            if (yearFilter) yearFilter.value = 'all';
            if (monthFilter) monthFilter.value = 'all';
            renderAlbums();
        }

        // 公告相关函数
        function showEditAnnouncementModal() {
            const announcementTextarea = document.getElementById('announcement-textarea');
            if (announcementTextarea) {
                announcementTextarea.value = announcementContent;
            }
            const announcementModal = document.getElementById('announcement-modal');
            if (announcementModal) {
                announcementModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        function hideEditAnnouncementModal() {
            const announcementModal = document.getElementById('announcement-modal');
            if (announcementModal) {
                announcementModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }

        function saveAnnouncement() {
            const announcementTextarea = document.getElementById('announcement-textarea');
            const newContent = announcementTextarea ? announcementTextarea.value : '';
            announcementContent = newContent;
            const announcementContentEl = document.getElementById('announcement-content');
            if (announcementContentEl) {
                announcementContentEl.innerHTML = newContent;
            }
            
            // 保存到后端
            fetch('/api/announcement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newContent })
            }).catch(error => {
                console.error('保存公告失败:', error);
            });
            
            hideEditAnnouncementModal();
        }

        // 密码验证相关函数
        function showPasswordModal(action, albumId = null) {
            pendingAction = action;
            if (passwordAction) {
                if (action === 'delete') {
                    passwordAction.textContent = '请输入密码以删除图片';
                } else if (action === 'announcement') {
                    passwordAction.textContent = '请输入密码以编辑公告';
                }
            }
            if (passwordInput) passwordInput.value = '';
            if (passwordModal) {
                passwordModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            currentAlbumId = albumId;
        }

        function hidePasswordModal() {
            if (passwordModal) {
                passwordModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            pendingAction = null;
            currentAlbumId = null;
        }

        function verifyPassword() {
            if (!passwordInput) return;
            const password = passwordInput.value.trim();
            
            if (pendingAction === 'delete' && password === PASSWORD) {
                deleteAlbum(currentAlbumId);
                hidePasswordModal();
            } else if (pendingAction === 'announcement' && password === ANNOUNCEMENT_PASSWORD) {
                hidePasswordModal();
                showEditAnnouncementModal();
            } else {
                alert('密码错误！');
                passwordInput.value = '';
                passwordInput.focus();
            }
        }

        function deleteAlbum(id) {
            albums = albums.filter(album => album.id !== id);
            renderAlbums();
            
            // 发送删除请求到后端
            fetch('/api/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            }).catch(error => {
                console.error('删除请求失败:', error);
            });
        }

        // 图片操作相关函数
        function flipImageCard() {
            if (imageCard) imageCard.classList.toggle('flipped');
        }
    </script>
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
(request.url);
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
    // 返回你的完整HTML内容
    return '<!DOCTYPE html>\n' +
'<html lang="zh-CN">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">\n' +
'    <title>郑秀彬专属相册集</title>\n' +
'    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n' +
'    <style>\n' +
'        * {\n' +
'            margin: 0;\n' +
'            padding: 0;\n' +
'            box-sizing: border-box;\n' +
'            font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;\n' +
'        }\n' +
'\n' +
'        body {\n' +
'            background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), \n' +
'                        url(\'https://wmimg.com/i/698/2025/07/6882002520d29.webp\') center/cover no-repeat fixed;\n' +
'            color: #333;\n' +
'            min-height: 100vh;\n' +
'            padding: 20px;\n' +
'            overflow-x: hidden;\n' +
'        }\n' +
'\n' +
'        .container {\n' +
'            max-width: 1400px;\n' +
'            margin: 0 auto;\n' +
'        }\n' +
'\n' +
'        header {\n' +
'            text-align: center;\n' +
'            padding: 40px 20px;\n' +
'            animation: fadeInDown 1s ease;\n' +
'            position: relative;\n' +
'        }\n' +
'\n' +
'        header h1 {\n' +
'            font-size: 3.5rem;\n' +
'            margin-bottom: 15px;\n' +
'            text-shadow: 0 2px 10px rgba(0,0,0,0.5);\n' +
'            color: #FFD700;\n' +
'            word-break: keep-all;\n' +
'            white-space: normal;\n' +
'        }\n' +
'\n' +
'        header p {\n' +
'            font-size: 1.3rem;\n' +
'            max-width: 700px;\n' +
'            margin: 0 auto;\n' +
'            opacity: 0.9;\n' +
'            color: #fff;\n' +
'        }\n' +
'\n' +
'        /* 登录按钮样式 - 左上角灰色 */\n' +
'        .login-section {\n' +
'            position: fixed;\n' +
'            top: 20px;\n' +
'            left: 20px;\n' +
'            z-index: 100;\n' +
'        }\n' +
'\n' +
'        .login-btn {\n' +
'            background: linear-gradient(45deg, #9e9e9e, #757575);\n' +
'            color: white;\n' +
'            border: none;\n' +
'            width: 40px;\n' +
'            height: 40px;\n' +
'            border-radius: 50%;\n' +
'            cursor: pointer;\n' +
'            font-weight: bold;\n' +
'            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);\n' +
'            transition: all 0.3s ease;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            font-size: 1.2rem;\n' +
'        }\n' +
'\n' +
'        .login-btn:hover {\n' +
'            transform: translateY(-2px);\n' +
'            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);\n' +
'        }\n' +
'\n' +
'        .logout-btn {\n' +
'            background: linear-gradient(45deg, #f44336, #da190b);\n' +
'            color: white;\n' +
'            border: none;\n' +
'            width: 40px;\n' +
'            height: 40px;\n' +
'            border-radius: 50%;\n' +
'            cursor: pointer;\n' +
'            font-weight: bold;\n' +
'            box-shadow: 0 3px 10px rgba(244, 67, 54, 0.4);\n' +
'            transition: all 0.3s ease;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            font-size: 1.2rem;\n' +
'        }\n' +
'\n' +
'        .logout-btn:hover {\n' +
'            transform: translateY(-2px);\n' +
'            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.5);\n' +
'        }\n' +
'\n' +
'        .user-info {\n' +
'            color: white;\n' +
'            background: rgba(0, 0, 0, 0.5);\n' +
'            width: 40px;\n' +
'            height: 40px;\n' +
'            border-radius: 50%;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            font-size: 1.2rem;\n' +
'        }\n' +
'\n' +
'        .announcement-float {\n' +
'            position: fixed;\n' +
'            top: 20px;\n' +
'            left: 50%;\n' +
'            transform: translateX(-50%);\n' +
'            background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);\n' +
'            border-radius: 15px;\n' +
'            padding: 20px;\n' +
'            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\n' +
'            z-index: 2000;\n' +
'            width: 90%;\n' +
'            max-width: 800px;\n' +
'            border: 3px solid #FFD54F;\n' +
'            cursor: move;\n' +
'        }\n' +
'\n' +
'        .announcement-header {\n' +
'            display: flex;\n' +
'            justify-content: space-between;\n' +
'            align-items: center;\n' +
'            margin-bottom: 15px;\n' +
'            padding-bottom: 10px;\n' +
'            border-bottom: 2px solid #FFD700;\n' +
'        }\n' +
'\n' +
'        .announcement-header h2 {\n' +
'            color: #FF8C00;\n' +
'            font-size: 1.5rem;\n' +
'            margin: 0;\n' +
'        }\n' +
'\n' +
'        .announcement-actions {\n' +
'            display: flex;\n' +
'            gap: 10px;\n' +
'        }\n' +
'\n' +
'        .edit-announcement-btn, .close-announcement-btn {\n' +
'            background: linear-gradient(45deg, #FFA500, #FF8C00);\n' +
'            color: white;\n' +
'            border: none;\n' +
'            width: 30px;\n' +
'            height: 30px;\n' +
'            border-radius: 50%;\n' +
'            cursor: pointer;\n' +
'            font-weight: bold;\n' +
'            box-shadow: 0 3px 8px rgba(255, 140, 0, 0.4);\n' +
'            transition: all 0.3s ease;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'        }\n' +
'\n' +
'        .close-announcement-btn {\n' +
'            background: linear-gradient(45deg, #ff4757, #ff6b81);\n' +
'        }\n' +
'\n' +
'        .edit-announcement-btn:hover, .close-announcement-btn:hover {\n' +
'            transform: translateY(-2px);\n' +
'            box-shadow: 0 5px 12px rgba(255, 140, 0, 0.5);\n' +
'        }\n' +
'\n' +
'        .announcement-content {\n' +
'            font-size: 1.1rem;\n' +
'            line-height: 1.6;\n' +
'            color: #444;\n' +
'            min-height: 60px;\n' +
'        }\n' +
'\n' +
'        .announcement-content.empty {\n' +
'            font-style: italic;\n' +
'            color: #999;\n' +
'        }\n' +
'\n' +
'        .profile-section {\n' +
'            display: flex;\n' +
'            justify-content: center;\n' +
'            align-items: center;\n' +
'            gap: 30px;\n' +
'            margin: 30px 0;\n' +
'            flex-wrap: wrap;\n' +
'            perspective: 1000px;\n' +
'        }\n' +
'\n' +
'        .profile-card {\n' +
'            width: 150px;\n' +
'            height: 150px;\n' +
'            position: relative;\n' +
'            transform-style: preserve-3d;\n' +
'            transition: transform 0.8s;\n' +
'            cursor: pointer;\n' +
'        }\n' +
'\n' +
'        .profile-card.flipped {\n' +
'            transform: rotateY(180deg);\n' +
'        }\n' +
'\n' +
'        .profile-face {\n' +
'            position: absolute;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            backface-visibility: hidden;\n' +
'            border-radius: 50%;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            box-shadow: 0 5px 15px rgba(0,0,0,0.3);\n' +
'            border: 5px solid rgba(255, 215, 0, 0.5);\n' +
'        }\n' +
'\n' +
'        .profile-front {\n' +
'            background: url(\'https://wmimg.com/i/698/2025/07/688200253fecc.jpg\') center/cover;\n' +
'        }\n' +
'\n' +
'        .profile-back {\n' +
'            background: rgba(255, 255, 255, 0.95);\n' +
'            transform: rotateY(180deg);\n' +
'            padding: 15px;\n' +
'            text-align: center;\n' +
'            display: flex;\n' +
'            flex-direction: column;\n' +
'            justify-content: center;\n' +
'            align-items: center;\n' +
'        }\n' +
'\n' +
'        .profile-back h3 {\n' +
'            color: #FF8C00;\n' +
'            font-size: 1.2rem;\n' +
'            margin-bottom: 5px;\n' +
'        }\n' +
'\n' +
'        .profile-back p {\n' +
'            font-size: 0.8rem;\n' +
'            color: #666;\n' +
'        }\n' +
'\n' +
'        .upload-section {\n' +
'            background: rgba(255, 255, 255, 0.9);\n' +
'            border-radius: 20px;\n' +
'            padding: 30px;\n' +
'            margin: 30px auto;\n' +
'            max-width: 800px;\n' +
'            box-shadow: 0 8px 25px rgba(0,0,0,0.3);\n' +
'            text-align: center;\n' +
'            backdrop-filter: blur(10px);\n' +
'        }\n' +
'\n' +
'        .upload-section h2 {\n' +
'            color: #FF8C00;\n' +
'            margin-bottom: 20px;\n' +
'        }\n' +
'\n' +
'        .upload-area {\n' +
'            border: 3px dashed #FFA500;\n' +
'            border-radius: 15px;\n' +
'            padding: 40px 20px;\n' +
'            margin: 20px 0;\n' +
'            cursor: pointer;\n' +
'            transition: all 0.3s ease;\n' +
'            position: relative;\n' +
'            background: rgba(255, 255, 255, 0.7);\n' +
'        }\n' +
'\n' +
'        .upload-area:hover {\n' +
'            background: rgba(255, 215, 0, 0.2);\n' +
'        }\n' +
'\n' +
'        .upload-area i {\n' +
'            font-size: 3rem;\n' +
'            color: #FFA500;\n' +
'            margin-bottom: 15px;\n' +
'        }\n' +
'\n' +
'        #file-input {\n' +
'            display: none;\n' +
'        }\n' +
'\n' +
'        .upload-btn {\n' +
'            background: linear-gradient(to right, #FFA500, #FF8C00);\n' +
'            color: white;\n' +
'            border: none;\n' +
'            padding: 12px 30px;\n' +
'            font-size: 1.1rem;\n' +
'            border-radius: 50px;\n' +
'            cursor: pointer;\n' +
'            margin-top: 20px;\n' +
'            box-shadow: 0 4px 15px rgba(255, 140, 0, 0.4);\n' +
'            transition: all 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .upload-btn:hover {\n' +
'            transform: translateY(-3px);\n' +
'            box-shadow: 0 6px 20px rgba(255, 140, 0, 0.5);\n' +
'        }\n' +
'\n' +
'        .upload-btn:active {\n' +
'            transform: translateY(1px);\n' +
'        }\n' +
'\n' +
'        .filter-section {\n' +
'            display: flex;\n' +
'            justify-content: center;\n' +
'            gap: 20px;\n' +
'            margin: 30px 0;\n' +
'            flex-wrap: wrap;\n' +
'            align-items: center;\n' +
'        }\n' +
'\n' +
'        .filter-group {\n' +
'            display: flex;\n' +
'            gap: 10px;\n' +
'            align-items: center;\n' +
'            background: rgba(255, 255, 255, 0.9);\n' +
'            padding: 10px 20px;\n' +
'            border-radius: 50px;\n' +
'            backdrop-filter: blur(5px);\n' +
'        }\n' +
'\n' +
'        .filter-label {\n' +
'            font-weight: bold;\n' +
'            color: #FF8C00;\n' +
'        }\n' +
'\n' +
'        .filter-select {\n' +
'            padding: 8px 15px;\n' +
'            border: 2px solid #FFA500;\n' +
'            border-radius: 20px;\n' +
'            background: white;\n' +
'            color: #333;\n' +
'            font-size: 1rem;\n' +
'            cursor: pointer;\n' +
'        }\n' +
'\n' +
'        .filter-btn {\n' +
'            background: rgba(255, 255, 255, 0.9);\n' +
'            border: 2px solid #FFA500;\n' +
'            color: #FF8C00;\n' +
'            padding: 12px 25px;\n' +
'            border-radius: 50px;\n' +
'            cursor: pointer;\n' +
'            font-size: 1.1rem;\n' +
'            transition: all 0.3s ease;\n' +
'            backdrop-filter: blur(5px);\n' +
'        }\n' +
'\n' +
'        .filter-btn:hover, .filter-btn.active {\n' +
'            background: #FFA500;\n' +
'            color: white;\n' +
'            transform: translateY(-3px);\n' +
'            box-shadow: 0 5px 15px rgba(0,0,0,0.3);\n' +
'        }\n' +
'\n' +
'        .gallery {\n' +
'            display: grid;\n' +
'            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));\n' +
'            gap: 25px;\n' +
'            padding: 20px;\n' +
'        }\n' +
'\n' +
'        .album-item {\n' +
'            position: relative;\n' +
'            border-radius: 15px;\n' +
'            overflow: hidden;\n' +
'            box-shadow: 0 10px 30px rgba(0,0,0,0.3);\n' +
'            transform: translateY(50px);\n' +
'            opacity: 0;\n' +
'            transition: all 0.6s ease;\n' +
'            animation: fadeInUp 0.6s forwards;\n' +
'            animation-delay: calc(var(--delay) * 0.1s);\n' +
'            height: 300px;\n' +
'            background: #fff;\n' +
'            cursor: pointer;\n' +
'        }\n' +
'\n' +
'        .album-item.visible {\n' +
'            transform: translateY(0);\n' +
'            opacity: 1;\n' +
'        }\n' +
'\n' +
'        .album-img {\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            object-fit: cover;\n' +
'            transition: transform 0.5s ease;\n' +
'        }\n' +
'\n' +
'        .album-overlay {\n' +
'            position: absolute;\n' +
'            bottom: 0;\n' +
'            left: 0;\n' +
'            right: 0;\n' +
'            background: linear-gradient(to top, rgba(255, 215, 0, 0.9), transparent);\n' +
'            padding: 25px 20px 15px;\n' +
'            transform: translateY(100px);\n' +
'            transition: transform 0.4s ease;\n' +
'        }\n' +
'\n' +
'        .album-item:hover .album-overlay {\n' +
'            transform: translateY(0);\n' +
'        }\n' +
'\n' +
'        .album-item:hover .album-img {\n' +
'            transform: scale(1.05);\n' +
'        }\n' +
'\n' +
'        .album-title {\n' +
'            font-size: 1.4rem;\n' +
'            margin-bottom: 8px;\n' +
'            color: #333;\n' +
'        }\n' +
'\n' +
'        .album-desc {\n' +
'            font-size: 0.95rem;\n' +
'            color: #555;\n' +
'            margin-bottom: 12px;\n' +
'        }\n' +
'\n' +
'        .album-meta {\n' +
'            display: flex;\n' +
'            justify-content: space-between;\n' +
'            font-size: 0.9rem;\n' +
'            color: #666;\n' +
'        }\n' +
'\n' +
'        .album-date {\n' +
'            font-size: 0.85rem;\n' +
'            background: rgba(255, 140, 0, 0.8);\n' +
'            color: white;\n' +
'            padding: 3px 8px;\n' +
'            border-radius: 10px;\n' +
'            display: inline-block;\n' +
'            margin-top: 5px;\n' +
'        }\n' +
'\n' +
'        .delete-btn {\n' +
'            position: absolute;\n' +
'            top: 10px;\n' +
'            right: 10px;\n' +
'            background: rgba(255, 0, 0, 0.7);\n' +
'            color: white;\n' +
'            border: none;\n' +
'            width: 30px;\n' +
'            height: 30px;\n' +
'            border-radius: 50%;\n' +
'            cursor: pointer;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            opacity: 0;\n' +
'            transition: opacity 0.3s ease;\n' +
'            z-index: 10;\n' +
'        }\n' +
'\n' +
'        .album-item:hover .delete-btn {\n' +
'            opacity: 1;\n' +
'        }\n' +
'\n' +
'        .lightbox {\n' +
'            position: fixed;\n' +
'            top: 0;\n' +
'            left: 0;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            background: radial-gradient(circle, rgba(255,255,200,0.95) 0%, rgba(255,248,220,0.98) 100%);\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            z-index: 1000;\n' +
'            opacity: 0;\n' +
'            pointer-events: none;\n' +
'            transition: opacity 0.3s ease;\n' +
'            overflow: hidden;\n' +
'        }\n' +
'\n' +
'        .lightbox.active {\n' +
'            opacity: 1;\n' +
'            pointer-events: all;\n' +
'        }\n' +
'\n' +
'        .lightbox-content-container {\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            position: relative;\n' +
'        }\n' +
'\n' +
'        .lightbox-content {\n' +
'            max-width: 90%;\n' +
'            max-height: 80vh;\n' +
'            border-radius: 15px;\n' +
'            box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);\n' +
'            cursor: zoom-in;\n' +
'            transition: transform 0.3s ease;\n' +
'            border: 5px solid #FFD700;\n' +
'            z-index: 100;\n' +
'        }\n' +
'\n' +
'        .lightbox-content.zoomed {\n' +
'            max-width: none;\n' +
'            max-height: none;\n' +
'            cursor: zoom-out;\n' +
'        }\n' +
'\n' +
'        .close-lightbox {\n' +
'            position: absolute;\n' +
'            top: 30px;\n' +
'            right: 30px;\n' +
'            color: #FF6B35;\n' +
'            font-size: 2.5rem;\n' +
'            cursor: pointer;\n' +
'            transition: transform 0.3s ease;\n' +
'            z-index: 1001;\n' +
'            background: rgba(255, 255, 255, 0.8);\n' +
'            width: 50px;\n' +
'            height: 50px;\n' +
'            border-radius: 50%;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            box-shadow: 0 0 15px rgba(255, 107, 53, 0.5);\n' +
'        }\n' +
'\n' +
'        .close-lightbox:hover {\n' +
'            transform: rotate(90deg) scale(1.1);\n' +
'            background: white;\n' +
'        }\n' +
'\n' +
'        /* 图片导航按钮 */\n' +
'        .nav-btn {\n' +
'            position: absolute;\n' +
'            top: 50%;\n' +
'            transform: translateY(-50%);\n' +
'            background: rgba(255, 255, 255, 0.7);\n' +
'            border: none;\n' +
'            width: 50px;\n' +
'            height: 50px;\n' +
'            border-radius: 50%;\n' +
'            cursor: pointer;\n' +
'            font-size: 1.5rem;\n' +
'            color: #FF6B35;\n' +
'            box-shadow: 0 0 15px rgba(0,0,0,0.3);\n' +
'            z-index: 200;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            transition: all 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .nav-btn:hover {\n' +
'            background: white;\n' +
'            transform: translateY(-50%) scale(1.1);\n' +
'        }\n' +
'\n' +
'        .nav-btn.prev {\n' +
'            left: 30px;\n' +
'        }\n' +
'\n' +
'        .nav-btn.next {\n' +
'            right: 30px;\n' +
'        }\n' +
'\n' +
'        /* 弹幕容器 */\n' +
'        .danmu-container {\n' +
'            position: absolute;\n' +
'            top: 0;\n' +
'            left: 0;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            pointer-events: none;\n' +
'            z-index: 200;\n' +
'            overflow: hidden;\n' +
'        }\n' +
'\n' +
'        /* 弹幕项 */\n' +
'        .danmu-item {\n' +
'            position: absolute;\n' +
'            right: -300px;\n' +
'            white-space: nowrap;\n' +
'            font-size: 1.2rem;\n' +
'            font-weight: bold;\n' +
'            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);\n' +
'            pointer-events: none;\n' +
'            padding: 5px 15px;\n' +
'            border-radius: 20px;\n' +
'            background: rgba(0,0,0,0.3);\n' +
'            animation: danmuMove linear;\n' +
'            animation-fill-mode: forwards;\n' +
'        }\n' +
'\n' +
'        @keyframes danmuMove {\n' +
'            from {\n' +
'                transform: translateX(0);\n' +
'            }\n' +
'            to {\n' +
'                transform: translateX(-100vw);\n' +
'            }\n' +
'        }\n' +
'\n' +
'        /* 弹幕输入区域 */\n' +
'        .danmu-input-container {\n' +
'            position: fixed;\n' +
'            bottom: 20px;\n' +
'            left: 50%;\n' +
'            transform: translateX(-50%);\n' +
'            background: rgba(255, 255, 255, 0.9);\n' +
'            border-radius: 30px;\n' +
'            padding: 8px;\n' +
'            box-shadow: 0 5px 15px rgba(0,0,0,0.3);\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            gap: 8px;\n' +
'            z-index: 300;\n' +
'            width: 95%;\n' +
'            max-width: 600px;\n' +
'        }\n' +
'\n' +
'        .danmu-input {\n' +
'            flex: 1;\n' +
'            padding: 12px 15px;\n' +
'            border: 2px solid #FFD54F;\n' +
'            border-radius: 25px;\n' +
'            outline: none;\n' +
'            font-size: 1rem;\n' +
'            background: rgba(255, 255, 255, 0.8);\n' +
'        }\n' +
'\n' +
'        .danmu-input:focus {\n' +
'            border-color: #FFB74D;\n' +
'            box-shadow: 0 0 10px rgba(255, 183, 77, 0.5);\n' +
'        }\n' +
'\n' +
'        .danmu-submit {\n' +
'            background: linear-gradient(45deg, #FFD54F, #FFB74D);\n' +
'            color: #333;\n' +
'            border: none;\n' +
'            padding: 12px 20px;\n' +
'            border-radius: 25px;\n' +
'            cursor: pointer;\n' +
'            font-weight: bold;\n' +
'            transition: all 0.3s ease;\n' +
'            box-shadow: 0 3px 8px rgba(255, 183, 77, 0.4);\n' +
'            white-space: nowrap;\n' +
'        }\n' +
'\n' +
'        .danmu-submit:hover {\n' +
'            background: linear-gradient(45deg, #FFB74D, #FF9800);\n' +
'            transform: translateY(-2px);\n' +
'            box-shadow: 0 5px 12px rgba(255, 152, 0, 0.5);\n' +
'        }\n' +
'\n' +
'        /* 点赞按钮 */\n' +
'        .like-btn-container {\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            gap: 8px;\n' +
'            margin-left: 5px;\n' +
'        }\n' +
'\n' +
'        .like-btn {\n' +
'            background: none;\n' +
'            border: none;\n' +
'            color: #666;\n' +
'            cursor: pointer;\n' +
'            font-size: 1.4rem;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            gap: 5px;\n' +
'            transition: all 0.3s ease;\n' +
'            padding: 8px 10px;\n' +
'            border-radius: 20px;\n' +
'        }\n' +
'\n' +
'        .like-btn.liked {\n' +
'            color: #ff4757;\n' +
'            background: rgba(255, 71, 87, 0.1);\n' +
'            transform: scale(1.1);\n' +
'        }\n' +
'\n' +
'        .like-count {\n' +
'            font-weight: bold;\n' +
'            color: #E65F5C;\n' +
'            font-size: 1.1rem;\n' +
'        }\n' +
'\n' +
'        /* 隐藏/显示弹幕按钮 */\n' +
'        .toggle-danmu-btn {\n' +
'            position: fixed;\n' +
'            bottom: 90px;\n' +
'            right: 20px;\n' +
'            background: linear-gradient(45deg, #4CAF50, #45a049);\n' +
'            color: white;\n' +
'            border: none;\n' +
'            width: 50px;\n' +
'            height: 50px;\n' +
'            border-radius: 50%;\n' +
'            cursor: pointer;\n' +
'            font-weight: bold;\n' +
'            box-shadow: 0 3px 10px rgba(76, 175, 80, 0.4);\n' +
'            transition: all 0.3s ease;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            font-size: 1.2rem;\n' +
'            z-index: 300;\n' +
'        }\n' +
'\n' +
'        .toggle-danmu-btn:hover {\n' +
'            transform: translateY(-2px);\n' +
'            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.5);\n' +
'        }\n' +
'\n' +
'        /* 图片翻转卡片样式 */\n' +
'        .image-card {\n' +
'            position: relative;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            transform-style: preserve-3d;\n' +
'            transition: transform 0.8s;\n' +
'            cursor: pointer;\n' +
'            margin: 0 auto;\n' +
'        }\n' +
'\n' +
'        .image-card.flipped {\n' +
'            transform: rotateY(180deg);\n' +
'        }\n' +
'\n' +
'        .image-face {\n' +
'            position: absolute;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            backface-visibility: hidden;\n' +
'            border-radius: 15px;\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'        }\n' +
'\n' +
'        .image-front {\n' +
'            /* 正面是图片本身 */\n' +
'        }\n' +
'\n' +
'        .image-back {\n' +
'            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);\n' +
'            transform: rotateY(180deg);\n' +
'            padding: 25px;\n' +
'            display: flex;\n' +
'            flex-direction: column;\n' +
'            justify-content: center;\n' +
'            align-items: center;\n' +
'            text-align: center;\n' +
'            border: 3px solid #FFD700;\n' +
'            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);\n' +
'            overflow: hidden;\n' +
'        }\n' +
'\n' +
'        .image-back-content {\n' +
'            max-height: 100%;\n' +
'            overflow-y: auto;\n' +
'            width: 100%;\n' +
'            padding: 20px;\n' +
'        }\n' +
'\n' +
'        .image-back-content h4 {\n' +
'            color: #E65F5C;\n' +
'            margin-bottom: 15px;\n' +
'            font-size: 1.4rem;\n' +
'        }\n' +
'\n' +
'        .image-back-content p {\n' +
'            color: #555;\n' +
'            line-height: 1.6;\n' +
'            font-size: 1.1rem;\n' +
'            word-wrap: break-word;\n' +
'            white-space: pre-wrap;\n' +
'        }\n' +
'\n' +
'        .image-back-content p.empty-story {\n' +
'            font-style: italic;\n' +
'            color: #999;\n' +
'        }\n' +
'\n' +
'        /* 登录弹窗样式 */\n' +
'        .login-modal {\n' +
'            position: fixed;\n' +
'            top: 0;\n' +
'            left: 0;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            background: rgba(0,0,0,0.8);\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            z-index: 3000;\n' +
'            opacity: 0;\n' +
'            pointer-events: none;\n' +
'            transition: opacity 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .login-modal.active {\n' +
'            opacity: 1;\n' +
'            pointer-events: all;\n' +
'        }\n' +
'\n' +
'        .login-content {\n' +
'            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);\n' +
'            border-radius: 20px;\n' +
'            padding: 30px;\n' +
'            width: 90%;\n' +
'            max-width: 400px;\n' +
'            text-align: center;\n' +
'            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);\n' +
'            border: 3px solid #FFD700;\n' +
'            transform: scale(0.9);\n' +
'            transition: transform 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .login-modal.active .login-content {\n' +
'            transform: scale(1);\n' +
'        }\n' +
'\n' +
'        .login-content h3 {\n' +
'            color: #E65F5C;\n' +
'            margin-bottom: 20px;\n' +
'            font-size: 1.5rem;\n' +
'        }\n' +
'\n' +
'        .login-input {\n' +
'            width: 100%;\n' +
'            padding: 15px;\n' +
'            border: 2px solid #FFB74D;\n' +
'            border-radius: 15px;\n' +
'            font-size: 1.1rem;\n' +
'            margin: 15px 0;\n' +
'            outline: none;\n' +
'            text-align: center;\n' +
'        }\n' +
'\n' +
'        .login-input:focus {\n' +
'            border-color: #FF8A65;\n' +
'            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);\n' +
'        }\n' +
'\n' +
'        .login-buttons {\n' +
'            display: flex;\n' +
'            gap: 15px;\n' +
'            justify-content: center;\n' +
'            margin-top: 20px;\n' +
'        }\n' +
'\n' +
'        .login-btn-modal {\n' +
'            padding: 12px 25px;\n' +
'            border: none;\n' +
'            border-radius: 25px;\n' +
'            font-size: 1rem;\n' +
'            font-weight: bold;\n' +
'            cursor: pointer;\n' +
'            transition: all 0.3s ease;\n' +
'            flex: 1;\n' +
'        }\n' +
'\n' +
'        .login-confirm {\n' +
'            background: linear-gradient(45deg, #4CAF50, #45a049);\n' +
'            color: white;\n' +
'        }\n' +
'\n' +
'        .login-cancel {\n' +
'            background: linear-gradient(45deg, #f44336, #da190b);\n' +
'            color: white;\n' +
'        }\n' +
'\n' +
'        .login-btn-modal:hover {\n' +
'            transform: translateY(-3px);\n' +
'            box-shadow: 0 5px 15px rgba(0,0,0,0.3);\n' +
'        }\n' +
'\n' +
'        /* 酷炫可爱的上传编辑弹窗样式 - 添加滚动条 */\n' +
'        .edit-modal {\n' +
'            position: fixed;\n' +
'            top: 0;\n' +
'            left: 0;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,140,0,0.2) 100%);\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            z-index: 2000;\n' +
'            opacity: 0;\n' +
'            pointer-events: none;\n' +
'            transition: opacity 0.5s ease;\n' +
'            backdrop-filter: blur(5px);\n' +
'            padding: 20px;\n' +
'            overflow-y: auto;\n' +
'        }\n' +
'\n' +
'        .edit-modal.active {\n' +
'            opacity: 1;\n' +
'            pointer-events: all;\n' +
'        }\n' +
'\n' +
'        .edit-content {\n' +
'            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);\n' +
'            border-radius: 25px;\n' +
'            padding: 25px 20px;\n' +
'            width: 95%;\n' +
'            max-width: 95%;\n' +
'            box-shadow: \n' +
'                0 0 30px rgba(255, 215, 0, 0.6),\n' +
'                0 0 60px rgba(255, 140, 0, 0.4),\n' +
'                inset 0 0 20px rgba(255, 255, 255, 0.5);\n' +
'            transform: translateY(50px) scale(0.9);\n' +
'            transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n' +
'            position: relative;\n' +
'            overflow: hidden;\n' +
'            border: 3px solid #FFD700;\n' +
'            max-height: 95vh;\n' +
'            overflow-y: auto;\n' +
'            margin: 20px 0;\n' +
'        }\n' +
'\n' +
'        .edit-modal.active .edit-content {\n' +
'            transform: translateY(0) scale(1);\n' +
'        }\n' +
'\n' +
'        .edit-content::before {\n' +
'            content: "";\n' +
'            position: absolute;\n' +
'            top: -50%;\n' +
'            left: -50%;\n' +
'            width: 200%;\n' +
'            height: 200%;\n' +
'            background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);\n' +
'            transform: rotate(30deg);\n' +
'            z-index: 0;\n' +
'        }\n' +
'\n' +
'        .edit-content h3 {\n' +
'            margin-bottom: 20px;\n' +
'            text-align: center;\n' +
'            font-size: 1.3rem;\n' +
'            font-weight: bold;\n' +
'            position: relative;\n' +
'            z-index: 1;\n' +
'            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);\n' +
'            animation: heartbeat 2s infinite;\n' +
'            background: linear-gradient(45deg, #FF6B35, #FFD700, #FF8A65, #FFD54F);\n' +
'            -webkit-background-clip: text;\n' +
'            -webkit-text-fill-color: transparent;\n' +
'            background-clip: text;\n' +
'            background-size: 300% 300%;\n' +
'            animation: gradientShift 3s ease infinite;\n' +
'            line-height: 1.3;\n' +
'        }\n' +
'\n' +
'        /* 公告编辑弹窗 */\n' +
'        .announcement-modal {\n' +
'            position: fixed;\n' +
'            top: 0;\n' +
'            left: 0;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            background: rgba(0,0,0,0.8);\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            z-index: 3000;\n' +
'            opacity: 0;\n' +
'            pointer-events: none;\n' +
'            transition: opacity 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .announcement-modal.active {\n' +
'            opacity: 1;\n' +
'            pointer-events: all;\n' +
'        }\n' +
'\n' +
'        .announcement-content-modal {\n' +
'            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);\n' +
'            border-radius: 20px;\n' +
'            padding: 30px;\n' +
'            width: 90%;\n' +
'            max-width: 600px;\n' +
'            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);\n' +
'            border: 3px solid #FFD700;\n' +
'            transform: scale(0.9);\n' +
'            transition: transform 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .announcement-modal.active .announcement-content-modal {\n' +
'            transform: scale(1);\n' +
'        }\n' +
'\n' +
'        .announcement-content-modal h3 {\n' +
'            color: #E65F5C;\n' +
'            margin-bottom: 20px;\n' +
'            font-size: 1.5rem;\n' +
'            text-align: center;\n' +
'        }\n' +
'\n' +
'        .announcement-textarea {\n' +
'            width: 100%;\n' +
'            min-height: 150px;\n' +
'            padding: 15px;\n' +
'            border: 2px solid #FFB74D;\n' +
'            border-radius: 15px;\n' +
'            font-size: 1.1rem;\n' +
'            margin: 20px 0;\n' +
'            outline: none;\n' +
'            resize: vertical;\n' +
'            background: rgba(255, 255, 255, 0.9);\n' +
'        }\n' +
'\n' +
'        .announcement-textarea:focus {\n' +
'            border-color: #FF8A65;\n' +
'            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);\n' +
'        }\n' +
'\n' +
'        .announcement-buttons {\n' +
'            display: flex;\n' +
'            gap: 15px;\n' +
'            justify-content: center;\n' +
'        }\n' +
'\n' +
'        .announcement-btn {\n' +
'            padding: 12px 25px;\n' +
'            border: none;\n' +
'            border-radius: 25px;\n' +
'            font-size: 1rem;\n' +
'            font-weight: bold;\n' +
'            cursor: pointer;\n' +
'            transition: all 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .announcement-save {\n' +
'            background: linear-gradient(45deg, #4CAF50, #45a049);\n' +
'            color: white;\n' +
'        }\n' +
'\n' +
'        .announcement-cancel {\n' +
'            background: linear-gradient(45deg, #f44336, #da190b);\n' +
'            color: white;\n' +
'        }\n' +
'\n' +
'        .announcement-btn:hover {\n' +
'            transform: translateY(-3px);\n' +
'            box-shadow: 0 5px 15px rgba(0,0,0,0.3);\n' +
'        }\n' +
'\n' +
'        /* 渐变动画 */\n' +
'        @keyframes gradientShift {\n' +
'            0% {\n' +
'                background-position: 0% 50%;\n' +
'            }\n' +
'            50% {\n' +
'                background-position: 100% 50%;\n' +
'            }\n' +
'            100% {\n' +
'                background-position: 0% 50%;\n' +
'            }\n' +
'        }\n' +
'\n' +
'        .edit-form-group {\n' +
'            margin-bottom: 18px;\n' +
'            position: relative;\n' +
'            z-index: 1;\n' +
'        }\n' +
'\n' +
'        .edit-form-group label {\n' +
'            display: block;\n' +
'            margin-bottom: 8px;\n' +
'            font-weight: bold;\n' +
'            color: #E65F5C;\n' +
'            font-size: 1.1rem;\n' +
'        }\n' +
'\n' +
'        .edit-form-group input,\n' +
'        .edit-form-group select,\n' +
'        .edit-form-group textarea {\n' +
'            width: 100%;\n' +
'            padding: 12px 16px;\n' +
'            border: 2px solid #FFB74D;\n' +
'            border-radius: 15px;\n' +
'            font-size: 1rem;\n' +
'            outline: none;\n' +
'            transition: all 0.3s ease;\n' +
'            background: rgba(255, 255, 255, 0.7);\n' +
'            box-shadow: 0 4px 10px rgba(0,0,0,0.05);\n' +
'        }\n' +
'\n' +
'        .edit-form-group input:focus,\n' +
'        .edit-form-group select:focus,\n' +
'        .edit-form-group textarea:focus {\n' +
'            border-color: #FF8A65;\n' +
'            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);\n' +
'            transform: translateY(-2px);\n' +
'        }\n' +
'\n' +
'        .edit-form-group textarea {\n' +
'            min-height: 100px;\n' +
'            resize: vertical;\n' +
'        }\n' +
'\n' +
'        .edit-form-buttons {\n' +
'            display: flex;\n' +
'            gap: 15px;\n' +
'            justify-content: center;\n' +
'            margin-top: 20px;\n' +
'            position: relative;\n' +
'            z-index: 1;\n' +
'        }\n' +
'\n' +
'        .edit-btn {\n' +
'            padding: 12px 25px;\n' +
'            border: none;\n' +
'            border-radius: 50px;\n' +
'            font-size: 1rem;\n' +
'            font-weight: bold;\n' +
'            cursor: pointer;\n' +
'            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n' +
'            position: relative;\n' +
'            overflow: hidden;\n' +
'            box-shadow: 0 5px 15px rgba(0,0,0,0.2);\n' +
'            flex: 1;\n' +
'            max-width: 180px;\n' +
'        }\n' +
'\n' +
'        .edit-btn.edit-save {\n' +
'            background: linear-gradient(45deg, #FF8A65, #FF7043);\n' +
'            color: white;\n' +
'        }\n' +
'\n' +
'        .edit-btn.edit-cancel {\n' +
'            background: linear-gradient(45deg, #90A4AE, #78909C);\n' +
'            color: white;\n' +
'        }\n' +
'\n' +
'        .edit-btn::before {\n' +
'            content: "";\n' +
'            position: absolute;\n' +
'            top: 0;\n' +
'            left: -100%;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);\n' +
'            transition: 0.5s;\n' +
'        }\n' +
'\n' +
'        .edit-btn:hover::before {\n' +
'            left: 100%;\n' +
'        }\n' +
'\n' +
'        .edit-btn:hover {\n' +
'            transform: translateY(-3px) scale(1.05);\n' +
'            box-shadow: 0 8px 20px rgba(0,0,0,0.3);\n' +
'        }\n' +
'\n' +
'        .edit-btn:active {\n' +
'            transform: translateY(0) scale(0.98);\n' +
'        }\n' +
'\n' +
'        .preview-image {\n' +
'            max-width: 100%;\n' +
'            max-height: 180px;\n' +
'            border-radius: 15px;\n' +
'            margin-bottom: 15px;\n' +
'            object-fit: contain;\n' +
'            border: 3px solid #FFD54F;\n' +
'            box-shadow: 0 5px 15px rgba(0,0,0,0.1);\n' +
'            position: relative;\n' +
'            z-index: 1;\n' +
'        }\n' +
'\n' +
'        .upload-progress {\n' +
'            margin-top: 15px;\n' +
'            background: rgba(255, 255, 255, 0.5);\n' +
'            border-radius: 15px;\n' +
'            height: 10px;\n' +
'            overflow: hidden;\n' +
'            box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);\n' +
'            position: relative;\n' +
'            z-index: 1;\n' +
'        }\n' +
'\n' +
'        .progress-bar {\n' +
'            height: 100%;\n' +
'            background: linear-gradient(90deg, #FFD54F, #FFB74D, #FF9800);\n' +
'            width: 0%;\n' +
'            transition: width 0.3s ease;\n' +
'            border-radius: 15px;\n' +
'            box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);\n' +
'        }\n' +
'\n' +
'        /* 装饰元素 */\n' +
'        .heart {\n' +
'            position: absolute;\n' +
'            color: #FF5252;\n' +
'            font-size: 20px;\n' +
'            animation: float 6s infinite ease-in-out;\n' +
'            z-index: 0;\n' +
'        }\n' +
'\n' +
'        .star {\n' +
'            position: absolute;\n' +
'            color: #FFD700;\n' +
'            font-size: 15px;\n' +
'            animation: twinkle 3s infinite ease-in-out;\n' +
'            z-index: 0;\n' +
'        }\n' +
'\n' +
'        /* 错误提示样式 */\n' +
'        .error-message {\n' +
'            color: #ff4757;\n' +
'            font-size: 0.9rem;\n' +
'            margin-top: 5px;\n' +
'            display: none;\n' +
'        }\n' +
'\n' +
'        .upload-error {\n' +
'            color: #ff4757;\n' +
'            font-size: 0.9rem;\n' +
'            margin-top: 5px;\n' +
'            display: none;\n' +
'        }\n' +
'\n' +
'        footer {\n' +
'            text-align: center;\n' +
'            padding: 40px 20px;\n' +
'            margin-top: 30px;\n' +
'            font-size: 1.1rem;\n' +
'            opacity: 0.9;\n' +
'            color: #fff;\n' +
'            text-shadow: 0 1px 3px rgba(0,0,0,0.5);\n' +
'        }\n' +
'\n' +
'        /* 密码验证弹窗样式 */\n' +
'        .password-modal {\n' +
'            position: fixed;\n' +
'            top: 0;\n' +
'            left: 0;\n' +
'            width: 100%;\n' +
'            height: 100%;\n' +
'            background: rgba(0,0,0,0.8);\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            justify-content: center;\n' +
'            z-index: 3000;\n' +
'            opacity: 0;\n' +
'            pointer-events: none;\n' +
'            transition: opacity 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .password-modal.active {\n' +
'            opacity: 1;\n' +
'            pointer-events: all;\n' +
'        }\n' +
'\n' +
'        .password-content {\n' +
'            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);\n' +
'            border-radius: 20px;\n' +
'            padding: 30px;\n' +
'            width: 90%;\n' +
'            max-width: 400px;\n' +
'            text-align: center;\n' +
'            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);\n' +
'            border: 3px solid #FFD700;\n' +
'            transform: scale(0.9);\n' +
'            transition: transform 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .password-modal.active .password-content {\n' +
'            transform: scale(1);\n' +
'        }\n' +
'\n' +
'        .password-content h3 {\n' +
'            color: #E65F5C;\n' +
'            margin-bottom: 20px;\n' +
'            font-size: 1.5rem;\n' +
'        }\n' +
'\n' +
'        .password-input {\n' +
'            width: 100%;\n' +
'            padding: 15px;\n' +
'            border: 2px solid #FFB74D;\n' +
'            border-radius: 15px;\n' +
'            font-size: 1.1rem;\n' +
'            margin: 20px 0;\n' +
'            outline: none;\n' +
'            text-align: center;\n' +
'        }\n' +
'\n' +
'        .password-input:focus {\n' +
'            border-color: #FF8A65;\n' +
'            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);\n' +
'        }\n' +
'\n' +
'        .password-buttons {\n' +
'            display: flex;\n' +
'            gap: 15px;\n' +
'            justify-content: center;\n' +
'        }\n' +
'\n' +
'        .password-btn {\n' +
'            padding: 12px 25px;\n' +
'            border: none;\n' +
'            border-radius: 25px;\n' +
'            font-size: 1rem;\n' +
'            font-weight: bold;\n' +
'            cursor: pointer;\n' +
'            transition: all 0.3s ease;\n' +
'        }\n' +
'\n' +
'        .password-confirm {\n' +
'            background: linear-gradient(45deg, #4CAF50, #45a049);\n' +
'            color: white;\n' +
'        }\n' +
'\n' +
'        .password-cancel {\n' +
'            background: linear-gradient(45deg, #f44336, #da190b);\n' +
'            color: white;\n' +
'        }\n' +
'\n' +
'        .password-btn:hover {\n' +
'            transform: translateY(-3px);\n' +
'            box-shadow: 0 5px 15px rgba(0,0,0,0.3);\n' +
'        }\n' +
'\n' +
'        /* 动画关键帧 */\n' +
'        @keyframes heartbeat {\n' +
'            0% { transform: scale(1); }\n' +
'            50% { transform: scale(1.05); }\n' +
'            100% { transform: scale(1); }\n' +
'        }\n' +
'\n' +
'        @keyframes float {\n' +
'            0% { transform: translateY(0) rotate(0deg); opacity: 0; }\n' +
'            10% { opacity: 1; }\n' +
'            90% { opacity: 1; }\n' +
'            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }\n' +
'        }\n' +
'\n' +
'        @keyframes twinkle {\n' +
'            0% { opacity: 0; transform: scale(0.5); }\n' +
'            50% { opacity: 1; transform: scale(1.2); }\n' +
'            100% { opacity: 0; transform: scale(0.5); }\n' +
'        }\n' +
'\n' +
'        @keyframes fadeInDown {\n' +
'            from {\n' +
'                opacity: 0;\n' +
'                transform: translateY(-30px);\n' +
'            }\n' +
'            to {\n' +
'                opacity: 1;\n' +
'                transform: translateY(0);\n' +
'            }\n' +
'        }\n' +
'\n' +
'        @keyframes fadeInUp {\n' +
'            from {\n' +
'                opacity: 0;\n' +
'                transform: translateY(50px);\n' +
'            }\n' +
'            to {\n' +
'                opacity: 1;\n' +
'                transform: translateY(0);\n' +
'            }\n' +
'        }\n' +
'\n' +
'        @media (min-width: 768px) {\n' +
'            .edit-content {\n' +
'                max-width: 500px;\n' +
'                padding: 30px 25px;\n' +
'            }\n' +
'            \n' +
'            .edit-content h3 {\n' +
'                font-size: 1.5rem;\n' +
'            }\n' +
'        }\n' +
'\n' +
'        @media (min-width: 1024px) {\n' +
'            .edit-content h3 {\n' +
'                font-size: 1.7rem;\n' +
'            }\n' +
'        }\n' +
'\n' +
'        @media (max-width: 768px) {\n' +
'            header h1 {\n' +
'                font-size: 2.5rem;\n' +
'            }\n' +
'            \n' +
'            header p {\n' +
'                font-size: 1.1rem;\n' +
'            }\n' +
'            \n' +
'            .gallery {\n' +
'                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n' +
'            }\n' +
'            \n' +
'            .profile-section {\n' +
'                flex-direction: column;\n' +
'                text-align: center;\n' +
'            }\n' +
'            \n' +
'            .filter-section {\n' +
'                flex-direction: column;\n' +
'                gap: 15px;\n' +
'            }\n' +
'            \n' +
'            .filter-group {\n' +
'                width: 100%;\n' +
'                justify-content: center;\n' +
'            }\n' +
'            \n' +
'            .edit-form-buttons {\n' +
'                flex-direction: column;\n' +
'                gap: 15px;\n' +
'            }\n' +
'            \n' +
'            .edit-btn {\n' +
'                width: 100%;\n' +
'                max-width: none;\n' +
'            }\n' +
'        }\n' +
'\n' +
'        @media (max-width: 480px) {\n' +
'            .filter-btn {\n' +
'                padding: 10px 15px;\n' +
'                font-size: 0.9rem;\n' +
'            }\n' +
'            \n' +
'            header h1 {\n' +
'                font-size: 2rem;\n' +
'            }\n' +
'            \n' +
'            .upload-section {\n' +
'                padding: 20px 15px;\n' +
'            }\n' +
'            \n' +
'            .edit-content h3 {\n' +
'                font-size: 1.2rem;\n' +
'            }\n' +
'            \n' +
'            .edit-content {\n' +
'                padding: 20px 15px;\n' +
'            }\n' +
'            \n' +
'            .danmu-input-container {\n' +
'                width: 95%;\n' +
'                padding: 6px;\n' +
'                bottom: 10px;\n' +
'            }\n' +
'            \n' +
'            .danmu-input {\n' +
'                padding: 10px 12px;\n' +
'                font-size: 0.9rem;\n' +
'            }\n' +
'            \n' +
'            .danmu-submit {\n' +
'                padding: 10px 15px;\n' +
'                font-size: 0.9rem;\n' +
'            }\n' +
'            \n' +
'            .like-btn-container {\n' +
'                gap: 5px;\n' +
'            }\n' +
'            \n' +
'            .like-btn {\n' +
'                padding: 6px 8px;\n' +
'                font-size: 1.2rem;\n' +
'            }\n' +
'            \n' +
'            .like-count {\n' +
'                font-size: 1rem;\n' +
'            }\n' +
'            \n' +
'            .nav-btn {\n' +
'                width: 40px;\n' +
'                height: 40px;\n' +
'                font-size: 1.2rem;\n' +
'            }\n' +
'            \n' +
'            .nav-btn.prev {\n' +
'                left: 15px;\n' +
'            }\n' +
'            \n' +
'            .nav-btn.next {\n' +
'                right: 15px;\n' +
'            }\n' +
'        }\n' +
'        \n' +
'        /* 加载提示样式 */\n' +
'        .loading {\n' +
'            text-align: center;\n' +
'            padding: 50px;\n' +
'            color: #fff;\n' +
'            font-size: 1.2rem;\n' +
'        }\n' +
'        \n' +
'        .loading i {\n' +
'            margin-right: 10px;\n' +
'            animation: spin 1s linear infinite;\n' +
'        }\n' +
'        \n' +
'        @keyframes spin {\n' +
'            0% { transform: rotate(0deg); }\n' +
'            100% { transform: rotate(360deg); }\n' +
'        }\n' +
'    </style>\n' +
'</head>\n' +
'<body>\n' +
'    <div class="container">\n' +
'        <header>\n' +
'            <div class="login-section" id="login-section">\n' +
'                <!-- 登录/登出按钮将在这里动态生成 -->\n' +
'            </div>\n' +
'            <h1><i class="fas fa-star"></i> 郑秀彬专属相册集</h1>\n' +
'            <p>珍藏秀彬的每一个精彩瞬间</p>\n' +
'        </header>\n' +
'        \n' +
'        <!-- 悬浮公告区域 -->\n' +
'        <div class="announcement-float" id="announcement-float">\n' +
'            <div class="announcement-header">\n' +
'                <h2><i class="fas fa-bullhorn"></i> 最新公告</h2>\n' +
'                <div class="announcement-actions">\n' +
'                    <button class="edit-announcement-btn" id="edit-announcement-btn" title="编辑公告">\n' +
'                        <i class="fas fa-edit"></i>\n' +
'                    </button>\n' +
'                    <button class="close-announcement-btn" id="close-announcement-btn" title="关闭公告">\n' +
'                        <i class="fas fa-times"></i>\n' +
'                    </button>\n' +
'                </div>\n' +
'            </div>\n' +
'            <div class="announcement-content" id="announcement-content">\n' +
'                欢迎来到郑秀彬专属相册集！这里珍藏着秀彬的每一个精彩瞬间。请尽情欣赏并留下您的宝贵评论。\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <div class="profile-section">\n' +
'            <div class="profile-card" id="profile-card">\n' +
'                <div class="profile-face profile-front"></div>\n' +
'                <div class="profile-face profile-back">\n' +
'                    <h3>郑秀彬</h3>\n' +
'                    <p>演员</p>\n' +
'                    <p>1998.08.17</p>\n' +
'                </div>\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <div class="upload-section">\n' +
'            <h2><i class="fas fa-cloud-upload-alt"></i> 上传秀彬照片</h2>\n' +
'            <div class="upload-area" id="upload-area">\n' +
'                <i class="fas fa-images"></i>\n' +
'                <p>点击或拖拽图片到此处上传</p>\n' +
'                <p>支持 JPG, PNG, GIF 格式</p>\n' +
'                <input type="file" id="file-input" accept="image/*">\n' +
'            </div>\n' +
'            <button class="upload-btn" id="upload-btn">上传图片</button>\n' +
'        </div>\n' +
'        \n' +
'        <div class="filter-section">\n' +
'            <div class="filter-group">\n' +
'                <span class="filter-label">类型:</span>\n' +
'                <select class="filter-select" id="category-filter">\n' +
'                    <option value="all">全部</option>\n' +
'                    <option value="stage">剧照</option>\n' +
'                    <option value="candid">生活照</option>\n' +
'                    <option value="fan">粉丝活动</option>\n' +
'                    <option value="mv">写真</option>\n' +
'                </select>\n' +
'            </div>\n' +
'            \n' +
'            <div class="filter-group">\n' +
'                <span class="filter-label">年份:</span>\n' +
'                <select class="filter-select" id="year-filter">\n' +
'                    <option value="all">全部</option>\n' +
'                    <option value="2025">2025</option>\n' +
'                    <option value="2024">2024</option>\n' +
'                    <option value="2023">2023</option>\n' +
'                    <option value="2022">2022</option>\n' +
'                </select>\n' +
'            </div>\n' +
'            \n' +
'            <div class="filter-group">\n' +
'                <span class="filter-label">月份:</span>\n' +
'                <select class="filter-select" id="month-filter">\n' +
'                    <option value="all">全部</option>\n' +
'                    <option value="01">1月</option>\n' +
'                    <option value="02">2月</option>\n' +
'                    <option value="03">3月</option>\n' +
'                    <option value="04">4月</option>\n' +
'                    <option value="05">5月</option>\n' +
'                    <option value="06">6月</option>\n' +
'                    <option value="07">7月</option>\n' +
'                    <option value="08">8月</option>\n' +
'                    <option value="09">9月</option>\n' +
'                    <option value="10">10月</option>\n' +
'                    <option value="11">11月</option>\n' +
'                    <option value="12">12月</option>\n' +
'                </select>\n' +
'            </div>\n' +
'            \n' +
'            <button class="filter-btn" id="apply-filter">\n' +
'                <i class="fas fa-search"></i> 应用筛选\n' +
'            </button>\n' +
'            \n' +
'            <button class="filter-btn" id="reset-filter">\n' +
'                <i class="fas fa-sync"></i> 重置\n' +
'            </button>\n' +
'        </div>\n' +
'        \n' +
'        <div class="gallery" id="gallery">\n' +
'            <!-- 相册项目将在JavaScript中生成 -->\n' +
'            <div class="loading"><i class="fas fa-spinner"></i> 正在加载相册数据...</div>\n' +
'        </div>\n' +
'        \n' +
'        <div class="lightbox">\n' +
'            <span class="close-lightbox">&times;</span>\n' +
'            <!-- 图片导航按钮 -->\n' +
'            <button class="nav-btn prev" id="prev-btn">\n' +
'                <i class="fas fa-chevron-left"></i>\n' +
'            </button>\n' +
'            <button class="nav-btn next" id="next-btn">\n' +
'                <i class="fas fa-chevron-right"></i>\n' +
'            </button>\n' +
'            <div class="lightbox-content-container">\n' +
'                <div class="image-card" id="image-card">\n' +
'                    <div class="image-face image-front">\n' +
'                        <img class="lightbox-content" id="lightbox-img" src="" alt="">\n' +
'                    </div>\n' +
'                    <div class="image-face image-back">\n' +
'                        <div class="image-back-content" id="image-back-content">\n' +
'                            <h4>图片故事</h4>\n' +
'                            <p id="image-story">秀斌也有自己的小秘密~</p>\n' +
'                        </div>\n' +
'                    </div>\n' +
'                </div>\n' +
'            </div>\n' +
'            <!-- 弹幕容器 -->\n' +
'            <div class="danmu-container" id="danmu-container"></div>\n' +
'            \n' +
'            <!-- 弹幕输入区域 -->\n' +
'            <div class="danmu-input-container">\n' +
'                <input type="text" class="danmu-input" id="danmu-input" placeholder="发送弹幕..." maxlength="50">\n' +
'                <div class="like-btn-container">\n' +
'                    <button class="like-btn" id="like-btn">\n' +
'                        <i class="fas fa-heart"></i>\n' +
'                    </button>\n' +
'                    <span class="like-count" id="like-count">0</span>\n' +
'                </div>\n' +
'                <button class="danmu-submit" id="danmu-submit">发送</button>\n' +
'            </div>\n' +
'            \n' +
'            <!-- 隐藏/显示弹幕按钮 -->\n' +
'            <button class="toggle-danmu-btn" id="toggle-danmu-btn" title="隐藏弹幕">\n' +
'                <i class="fas fa-eye-slash"></i>\n' +
'            </button>\n' +
'        </div>\n' +
'        \n' +
'        <!-- 酷炫可爱的上传编辑弹窗 -->\n' +
'        <div class="edit-modal" id="edit-modal">\n' +
'            <div class="edit-content">\n' +
'                <h3>每一次用心编辑都是爱的具象化</h3>\n' +
'                <img id="preview-image" class="preview-image" src="" alt="预览图片">\n' +
'                <form id="edit-form">\n' +
'                    <div class="edit-form-group">\n' +
'                        <label for="edit-title"><i class="fas fa-heading"></i> 图片标题:</label>\n' +
'                        <input type="text" id="edit-title" required placeholder="给这张美美的照片起个名字吧~">\n' +
'                        <div class="error-message" id="title-error">图片名称已存在，请使用其他名称</div>\n' +
'                        <div class="upload-error" id="upload-error"></div>\n' +
'                    </div>\n' +
'                    <div class="edit-form-group">\n' +
'                        <label for="edit-desc"><i class="fas fa-align-left"></i> 图片描述:</label>\n' +
'                        <textarea id="edit-desc" placeholder="分享这张照片的故事..."></textarea>\n' +
'                    </div>\n' +
'                    <div class="edit-form-group">\n' +
'                        <label for="edit-category"><i class="fas fa-tags"></i> 图片分类:</label>\n' +
'                        <select id="edit-category">\n' +
'                            <option value="stage">剧照</option>\n' +
'                            <option value="candid" selected>生活照</option>\n' +
'                            <option value="fan">粉丝活动</option>\n' +
'                            <option value="mv">写真</option>\n' +
'                        </select>\n' +
'                    </div>\n' +
'                    <div class="edit-form-group">\n' +
'                        <label for="edit-year"><i class="fas fa-calendar"></i> 年份:</label>\n' +
'                        <select id="edit-year">\n' +
'                            <option value="2025">2025</option>\n' +
'                            <option value="2024">2024</option>\n' +
'                            <option value="2023" selected>2023</option>\n' +
'                            <option value="2022">2022</option>\n' +
'                            <option value="2021">2021</option>\n' +
'                        </select>\n' +
'                    </div>\n' +
'                    <div class="edit-form-group">\n' +
'                        <label for="edit-month"><i class="fas fa-calendar-alt"></i> 月份:</label>\n' +
'                        <select id="edit-month">\n' +
'                            <option value="01">1月</option>\n' +
'                            <option value="02">2月</option>\n' +
'                            <option value="03">3月</option>\n' +
'                            <option value="04">4月</option>\n' +
'                            <option value="05">5月</option>\n' +
'                            <option value="06">6月</option>\n' +
'                            <option value="07">7月</option>\n' +
'                            <option value="08" selected>8月</option>\n' +
'                            <option value="09">9月</option>\n' +
'                            <option value="10">10月</option>\n' +
'                            <option value="11">11月</option>\n' +
'                            <option value="12">12月</option>\n' +
'                        </select>\n' +
'                    </div>\n' +
'                    <div class="upload-progress">\n' +
'                        <div class="progress-bar" id="progress-bar"></div>\n' +
'                    </div>\n' +
'                    <div class="edit-form-buttons">\n' +
'                        <button type="button" class="edit-btn edit-cancel" id="edit-cancel">\n' +
'                            <i class="fas fa-times"></i> 取消\n' +
'                        </button>\n' +
'                        <button type="submit" class="edit-btn edit-save">\n' +
'                            <i class="fas fa-heart"></i> 保存\n' +
'                        </button>\n' +
'                    </div>\n' +
'                </form>\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <!-- 公告编辑弹窗 -->\n' +
'        <div class="announcement-modal" id="announcement-modal">\n' +
'            <div class="announcement-content-modal">\n' +
'                <h3><i class="fas fa-edit"></i> 编辑公告</h3>\n' +
'                <textarea class="announcement-textarea" id="announcement-textarea" placeholder="请输入公告内容..."></textarea>\n' +
'                <div class="announcement-buttons">\n' +
'                    <button class="announcement-btn announcement-cancel" id="announcement-cancel">取消</button>\n' +
'                    <button class="announcement-btn announcement-save" id="announcement-save">保存</button>\n' +
'                </div>\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <!-- 密码验证弹窗 -->\n' +
'        <div class="password-modal" id="password-modal">\n' +
'            <div class="password-content">\n' +
'                <h3><i class="fas fa-lock"></i> 需要密码验证</h3>\n' +
'                <p id="password-action">请输入密码以继续操作</p>\n' +
'                <input type="password" class="password-input" id="password-input" placeholder="请输入密码">\n' +
'                <div class="password-buttons">\n' +
'                    <button class="password-btn password-cancel" id="password-cancel">取消</button>\n' +
'                    <button class="password-btn password-confirm" id="password-confirm">确认</button>\n' +
'                </div>\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <!-- 登录弹窗 -->\n' +
'        <div class="login-modal" id="login-modal">\n' +
'            <div class="login-content">\n' +
'                <h3><i class="fas fa-user-lock"></i> 管理员登录</h3>\n' +
'                <input type="password" class="login-input" id="login-password" placeholder="请输入管理员密码">\n' +
'                <div class="login-buttons">\n' +
'                    <button class="login-btn-modal login-cancel" id="login-cancel">取消</button>\n' +
'                    <button class="login-btn-modal login-confirm" id="login-confirm">登录</button>\n' +
'                </div>\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <footer>\n' +
'            <p>&copy; 郑秀彬专属相册集 | 为优秀演员郑秀彬应援!</p>\n' +
'        </footer>\n' +
'    </div>\n' +
'\n' +
'    <script>\n' +
'        // 全局变量\n' +
'        let albums = [];\n' +
'        let announcementContent = "欢迎来到郑秀彬专属相册集！这里珍藏着秀彬的每一个精彩瞬间。请尽情欣赏并留下您的宝贵评论。";\n' +
'\n' +
'        // 获取DOM元素\n' +
'        const gallery = document.getElementById(\'gallery\');\n' +
'        const categoryFilter = document.getElementById(\'category-filter\');\n' +
'        const yearFilter = document.getElementById(\'year-filter\');\n' +
'        const monthFilter = document.getElementById(\'month-filter\');\n' +
'        const applyFilterBtn = document.getElementById(\'apply-filter\');\n' +
'        const resetFilterBtn = document.getElementById(\'reset-filter\');\n' +
'        const lightbox = document.querySelector(\'.lightbox\');\n' +
'        const lightboxImg = document.getElementById(\'lightbox-img\');\n' +
'        const closeLightbox = document.querySelector(\'.close-lightbox\');\n' +
'        const uploadArea = document.getElementById(\'upload-area\');\n' +
'        const fileInput = document.getElementById(\'file-input\');\n' +
'        const uploadBtn = document.getElementById(\'upload-btn\');\n' +
'        const profileCard = document.getElementById(\'profile-card\');\n' +
'        const imageCard = document.getElementById(\'image-card\');\n' +
'        const imageStory = document.getElementById(\'image-story\');\n' +
'        const loginSection = document.getElementById(\'login-section\');\n' +
'        const danmuContainer = document.getElementById(\'danmu-container\');\n' +
'        const danmuInput = document.getElementById(\'danmu-input\');\n' +
'        const danmuSubmit = document.getElementById(\'danmu-submit\');\n' +
'        const likeBtn = document.getElementById(\'like-btn\');\n' +
'        const likeCount = document.getElementById(\'like-count\');\n' +
'        const toggleDanmuBtn = document.getElementById(\'toggle-danmu-btn\');\n' +
'        const prevBtn = document.getElementById(\'prev-btn\');\n' +
'        const nextBtn = document.getElementById(\'next-btn\');\n' +
'        \n' +
'        // 编辑弹窗元素\n' +
'        const editModal = document.getElementById(\'edit-modal\');\n' +
'        const previewImage = document.getElementById(\'preview-image\');\n' +
'        const editForm = document.getElementById(\'edit-form\');\n' +
'        const editTitle = document.getElementById(\'edit-title\');\n' +
'        const editDesc = document.getElementById(\'edit-desc\');\n' +
'        const editCategory = document.getElementById(\'edit-category\');\n' +
'        const editYear = document.getElementById(\'edit-year\');\n' +
'        const editMonth = document.getElementById(\'edit-month\');\n' +
'        const editCancel = document.getElementById(\'edit-cancel\');\n' +
'        const progressBar = document.getElementById(\'progress-bar\');\n' +
'        const titleError = document.getElementById(\'title-error\');\n' +
'        const uploadError = document.getElementById(\'upload-error\');\n' +
'\n' +
'        // 密码弹窗元素\n' +
'        const passwordModal = document.getElementById(\'password-modal\');\n' +
'        const passwordInput = document.getElementById(\'password-input\');\n' +
'        const passwordConfirm = document.getElementById(\'password-confirm\');\n' +
'        const passwordCancel = document.getElementById(\'password-cancel\');\n' +
'        const passwordAction = document.getElementById(\'password-action\');\n' +
'\n' +
'        // 登录弹窗元素\n' +
'        const loginModal = document.getElementById(\'login-modal\');\n' +
'        const loginPassword = document.getElementById(\'login-password\');\n' +
'        const loginConfirm = document.getElementById(\'login-confirm\');\n' +
'        const loginCancel = document.getElementById(\'login-cancel\');\n' +
'\n' +
'        // 当前查看的相册ID和临时上传文件\n' +
'        let currentAlbumId = null;\n' +
'        let tempUploadFile = null;\n' +
'        let isZoomed = false;\n' +
'        let pendingAction = null; // \'upload\' 或 \'delete\' 或 \'announcement\'\n' +
'        let clickCount = 0;\n' +
'        let clickTimer = null;\n' +
'        let scale = 1;\n' +
'        let startX, startY, isDragging = false;\n' +
'        let translateX = 0, translateY = 0;\n' +
'        let startTranslateX = 0, startTranslateY = 0;\n' +
'        let isAdmin = false; // 管理员状态\n' +
'        let danmuVisible = true; // 弹幕显示状态\n' +
'        let currentIndex = 0; // 当前图片索引\n' +
'        let startXSwipe = 0; // 触摸开始位置\n' +
'        let isSwiping = false; // 是否正在滑动\n' +
'\n' +
'        // 预设密码\n' +
'        const PASSWORD = "81798";\n' +
'        const ANNOUNCEMENT_PASSWORD = "72703";\n' +
'        const ADMIN_PASSWORD = "admin123"; // 管理员密码\n' +
'\n' +
'        // 随机颜色数组\n' +
'        const danmuColors = [\n' +
'            \'#FF6B6B\', \'#4ECDC4\', \'#45B7D1\', \'#96CEB4\', \'#FFEAA7\',\n' +
'            \'#DDA0DD\', \'#98D9E5\', \'#FFB347\', \'#B19CD9\', \'#FF6961\'\n' +
'        ];\n' +
'\n' +
'        // 页面加载完成后初始化\n' +
'        document.addEventListener(\'DOMContentLoaded\', async function() {\n' +
'            // 初始化登录状态显示\n' +
'            updateLoginDisplay();\n' +
'            \n' +
'            // 加载相册和公告数据\n' +
'            await loadAlbums();\n' +
'            await loadAnnouncement();\n' +
'            \n' +
'            // 渲染相册\n' +
'            renderAlbums();\n' +
'            \n' +
'            // 绑定事件\n' +
'            bindEventListeners();\n' +
'        });\n' +
'\n' +
'        // 绑定所有事件监听器\n' +
'        function bindEventListeners() {\n' +
'            // 基本事件\n' +
'            profileCard.addEventListener(\'click\', function() {\n' +
'                this.classList.toggle(\'flipped\');\n' +
'            });\n' +
'            \n' +
'            closeLightbox.addEventListener(\'click\', closeLightboxFunc);\n' +
'            likeBtn.addEventListener(\'click\', likeAlbum);\n' +
'            toggleDanmuBtn.addEventListener(\'click\', toggleDanmu);\n' +
'            danmuSubmit.addEventListener(\'click\', sendDanmu);\n' +
'            danmuInput.addEventListener(\'keypress\', function(e) {\n' +
'                if (e.key === \'Enter\') {\n' +
'                    sendDanmu();\n' +
'                }\n' +
'            });\n' +
'            prevBtn.addEventListener(\'click\', showPrevImage);\n' +
'            nextBtn.addEventListener(\'click\', showNextImage);\n' +
'            imageCard.addEventListener(\'click\', flipImageCard);\n' +
'\n' +
'            // 上传相关事件\n' +
'            uploadArea.addEventListener(\'dragover\', function(e) {\n' +
'                e.preventDefault();\n' +
'                this.style.background = \'rgba(255, 215, 0, 0.3)\';\n' +
'            });\n' +
'\n' +
'            uploadArea.addEventListener(\'dragleave\', function(e) {\n' +
'                e.preventDefault();\n' +
'                this.style.background = \'rgba(255, 255, 255, 0.7)\';\n' +
'            });\n' +
'\n' +
'            uploadArea.addEventListener(\'drop\', function(e) {\n' +
'                e.preventDefault();\n' +
'                this.style.background = \'rgba(255, 255, 255, 0.7)\';\n' +
'                const files = e.dataTransfer.files;\n' +
'                if (files.length > 0) {\n' +
'                    handleFileSelect(files[0]);\n' +
'                }\n' +
'            });\n' +
'\n' +
'            uploadArea.addEventListener(\'click\', function() {\n' +
'                fileInput.click();\n' +
'            });\n' +
'\n' +
'            fileInput.addEventListener(\'change\', function() {\n' +
'                if (this.files.length > 0) {\n' +
'                    handleFileSelect(this.files[0]);\n' +
'                }\n' +
'            });\n' +
'\n' +
'            uploadBtn.addEventListener(\'click\', function() {\n' +
'                fileInput.click();\n' +
'            });\n' +
'\n' +
'            // 编辑表单事件\n' +
'            editCancel.addEventListener(\'click\', closeEditModal);\n' +
'            \n' +
'            // 修复后的上传表单提交\n' +
'            editForm.addEventListener(\'submit\', handleUploadSubmit);\n' +
'\n' +
'            // 筛选功能\n' +
'            applyFilterBtn.addEventListener(\'click\', applyFilters);\n' +
'            resetFilterBtn.addEventListener(\'click\', resetFilters);\n' +
'\n' +
'            // 公告编辑事件\n' +
'            document.getElementById(\'edit-announcement-btn\').addEventListener(\'click\', () => {\n' +
'                showPasswordModal(\'announcement\');\n' +
'            });\n' +
'\n' +
'            document.getElementById(\'close-announcement-btn\').addEventListener(\'click\', () => {\n' +
'                document.getElementById(\'announcement-float\').style.display = \'none\';\n' +
'            });\n' +
'\n' +
'            document.getElementById(\'announcement-save\').addEventListener(\'click\', saveAnnouncement);\n' +
'            document.getElementById(\'announcement-cancel\').addEventListener(\'click\', hideEditAnnouncementModal);\n' +
'\n' +
'            // 密码弹窗事件\n' +
'            passwordConfirm.addEventListener(\'click\', verifyPassword);\n' +
'            passwordCancel.addEventListener(\'click\', hidePasswordModal);\n' +
'            passwordInput.addEventListener(\'keypress\', function(e) {\n' +
'                if (e.key === \'Enter\') {\n' +
'                    verifyPassword();\n' +
'                }\n' +
'            });\n' +
'\n' +
'            // 登录弹窗事件\n' +
'            loginConfirm.addEventListener(\'click\', login);\n' +
'            loginCancel.addEventListener(\'click\', hideLoginModal);\n' +
'            loginPassword.addEventListener(\'keypress\', function(e) {\n' +
'                if (e.key === \'Enter\') {\n' +
'                    login();\n' +
'                }\n' +
'            });\n' +
'\n' +
'            // 点击背景关闭弹窗\n' +
'            document.querySelectorAll(\'.login-modal, .password-modal, .announcement-modal, .edit-modal\').forEach(modal => {\n' +
'                modal.addEventListener(\'click\', function(e) {\n' +
'                    if (e.target === this) {\n' +
'                        this.classList.remove(\'active\');\n' +
'                        document.body.style.overflow = \'auto\';\n' +
'                        // 重置相关状态\n' +
'                        if (this.classList.contains(\'edit-modal\')) {\n' +
'                            closeEditModal();\n' +
'                        }\n' +
'                    }\n' +
'                });\n' +
'            });\n' +
'\n' +
'            // ESC键关闭弹窗\n' +
'            document.addEventListener(\'keydown\', function(e) {\n' +
'                if (e.key === \'Escape\') {\n' +
'                    closeLightboxFunc();\n' +
'                    hidePasswordModal();\n' +
'                    hideEditAnnouncementModal();\n' +
'                    hideLoginModal();\n' +
'                    closeEditModal();\n' +
'                }\n' +
'            });\n' +
'\n' +
'            // 鼠标滚轮缩放图片\n' +
'            lightboxImg.addEventListener(\'wheel\', function(e) {\n' +
'                e.preventDefault();\n' +
'                const zoomIntensity = 0.1;\n' +
'                \n' +
'                if (e.deltaY < 0) {\n' +
'                    // 放大\n' +
'                    scale *= (1 + zoomIntensity);\n' +
'                } else {\n' +
'                    // 缩小\n' +
'                    scale *= (1 - zoomIntensity);\n' +
'                    if (scale < 1) scale = 1;\n' +
'                }\n' +
'                \n' +
'                updateImageTransform();\n' +
'                isZoomed = scale > 1;\n' +
'            });\n' +
'        }\n' +
'\n' +
'        // 加载相册数据\n' +
'        async function loadAlbums() {\n' +
'            try {\n' +
'                const response = await fetch(\'/api/albums\');\n' +
'                if (response.ok) {\n' +
'                    albums = await response.json();\n' +
'                } else {\n' +
'                    console.error(\'加载相册失败:\', response.status);\n' +
'                    albums = [];\n' +
'                }\n' +
'            } catch (error) {\n' +
'                console.error(\'加载相册失败:\', error);\n' +
'                albums = [];\n' +
'            }\n' +
'        }\n' +
'\n' +
'        // 加载公告数据\n' +
'        async function loadAnnouncement() {\n' +
'            try {\n' +
'                const response = await fetch(\'/api/announcement\');\n' +
'                if (response.ok) {\n' +
'                    const data = await response.json();\n' +
'                    announcementContent = data.content;\n' +
'                    document.getElementById(\'announcement-content\').innerHTML = announcementContent;\n' +
'                }\n' +
'            } catch (error) {\n' +
'                console.error(\'加载公告失败:\', error);\n' +
'            }\n' +
'        }\n' +
'\n' +
'        // 更新登录显示\n' +
'        function updateLoginDisplay() {\n' +
'            loginSection.innerHTML = \'\';\n' +
'            \n' +
'            if (isAdmin) {\n' +
'                loginSection.innerHTML = \n' +
'                    \'<div class="user-info" title="管理员已登录">\' +\n' +
'                        \'<i class="fas fa-user-shield"></i>\' +\n' +
'                    \'</div>\' +\n' +
'                    \'<button class="logout-btn" id="logout-btn" title="退出管理员">\' +\n' +
'                        \'<i class="fas fa-sign-out-alt"></i>\' +\n' +
'                    \'</button>\';\n' +
'                document.getElementById(\'logout-btn\').addEventListener(\'click\', logout);\n' +
'            } else {\n' +
'                loginSection.innerHTML = \n' +
'                    \'<button class="login-btn" id="login-btn" title="管理员登录">\' +\n' +
'                        \'<i class="fas fa-user-lock"></i>\' +\n' +
'                    \'</button>\';\n' +
'                document.getElementById(\'login-btn\').addEventListener(\'click\', showLoginModal);\n' +
'            }\n' +
'        }\n' +
'\n' +
'        // 显示登录弹窗\n' +
'        function showLoginModal() {\n' +
'            loginPassword.value = \'\';\n' +
'            loginModal.classList.add(\'active\');\n' +
'            document.body.style.overflow = \'hidden\';\n' +
'        }\n' +
'\n' +
'        // 隐藏登录弹窗\n' +
'        function hideLoginModal() {\n' +
'            loginModal.classList.remove(\'active\');\n' +
'            document.body.style.overflow = \'auto\';\n' +
'        }\n' +
'\n' +
'        // 登录\n' +
'        function login() {\n' +
'            const password = loginPassword.value.trim();\n' +
'            if (password === ADMIN_PASSWORD) {\n' +
'                isAdmin = true;\n' +
'                hideLoginModal();\n' +
'                alert(\'管理员登录成功！\');\n' +
'                updateLoginDisplay(); // 确保登录后更新显示\n' +
'            } else {\n' +
'                alert(\'密码错误！\');\n' +
'                loginPassword.value = \'\';\n' +
'                loginPassword.focus();\n' +
'            }\n' +
'        }\n' +
'\n' +
'        // 登出\n' +
'        function logout() {\n' +
'            isAdmin = false;\n' +
'            updateLoginDisplay();\n' +
'            alert(\'已退出管理员账户\');\n' +
'        }\n' +
'\n' +
'        // 渲染相册\n' +
'        function renderAlbums(filteredAlbums = albums) {\n' +
'            gallery.innerHTML = \'\';\n' +
'            \n' +
'            if (filteredAlbums.length === 0) {\n' +
'                gallery.innerHTML = \'<div class="loading">暂无相册数据</div>\';\n' +
'                return;\n' +
'            }\n' +
'            \n' +
'            filteredAlbums.forEach((album, index) => {\n' +
'                const albumItem = document.createElement(\'div\');\n' +
'                albumItem.className = \'album-item\';\n' +
'                albumItem.style.setProperty(\'--delay\', index);\n' +
'                \n' +
'                // 格式化日期显示\n' +
'                const dateObj = new Date(album.date);\n' +
'                const formattedDate = dateObj.getFullYear() + \'年\' + (dateObj.getMonth()+1) + \'月\' + dateObj.getDate() + \'日\';\n' +
'                \n' +
'                albumItem.innerHTML = \n' +
'                    \'<img class="album-img" src="\' + album.img + \'" alt="\' + album.title + \'" data-id="\' + album.id + \'">\' +\n' +
'                    \'<div class="album-overlay">\' +\n' +
'                        \'<h3 class="album-title">\' + album.title + \'</h3>\' +\n' +
'                        \'<p class="album-desc">\' + album.desc + \'</p>\' +\n' +
'                        \'<div class="album-meta">\' +\n' +
'                            \'<span><i class="fas fa-heart"></i> \' + (album.likes || 0) + \'</span>\' +\n' +
'                            \'<span><i class="fas fa-comment"></i> \' + (album.comments ? album.comments.length : 0) + \'</span>\' +\n' +
'                        \'</div>\' +\n' +
'                        \'<div class="album-date">\' + formattedDate + \'</div>\' +\n' +
'                    \'</div>\' +\n' +
'                    \'<button class="delete-btn" data-id="\' + album.id + \'"><i class="fas fa-trash"></i></button>\';\n' +
'                \n' +
'                // 图片点击事件处理\n' +
'                const imgElement = albumItem.querySelector(\'.album-img\');\n' +
'                imgElement.addEventListener(\'click\', (e) => {\n' +
'                    e.stopPropagation();\n' +
'                    openLightbox(album);\n' +
'                });\n' +
'                \n' +
'                const overlayElement = albumItem.querySelector(\'.album-overlay\');\n' +
'                overlayElement.addEventListener(\'click\', (e) => {\n' +
'                    e.stopPropagation();\n' +
'                    openLightbox(album);\n' +
'                });\n' +
'                \n' +
'                // 删除按钮事件处理\n' +
'                const deleteBtn = albumItem.querySelector(\'.delete-btn\');\n' +
'                deleteBtn.addEventListener(\'click\', (e) => {\n' +
'                    e.stopPropagation();\n' +
'                    if (isAdmin) {\n' +
'                        deleteAlbum(album.id);\n' +
'                    } else {\n' +
'                        showPasswordModal(\'delete\', album.id);\n' +
'                    }\n' +
'                });\n' +
'                \n' +
'                gallery.appendChild(albumItem);\n' +
'            });\n' +
'            \n' +
'            // 延迟添加visible类以触发动画\n' +
'            setTimeout(() => {\n' +
'                document.querySelectorAll(\'.album-item\').forEach(item => {\n' +
'                    item.classList.add(\'visible\');\n' +
'                });\n' +
'            }, 100);\n' +
'        }\n' +
'\n' +
'        // 打开灯箱\n' +
'        function openLightbox(album) {\n' +
'            currentAlbumId = album.id;\n' +
'            lightboxImg.src = album.img;\n' +
'            lightbox.classList.add(\'active\');\n' +
'            document.body.style.overflow = \'hidden\';\n' +
'            isZoomed = false;\n' +
'            scale = 1;\n' +
'            translateX = 0;\n' +
'            translateY = 0;\n' +
'            updateImageTransform();\n' +
'            \n' +
'            // 重置图片卡片状态\n' +
'            imageCard.classList.remove(\'flipped\');\n' +
'            \n' +
'            // 设置图片故事内容\n' +
'            if (album.desc && album.desc.trim() !== "") {\n' +
'                imageStory.innerHTML = album.desc;\n' +
'                imageStory.classList.remove(\'empty-story\');\n' +
'            } else {\n' +
'                imageStory.innerHTML = "秀斌也有自己的小秘密~";\n' +
'                imageStory.classList.add(\'empty-story\');\n' +
'            }\n' +
'            \n' +
'            // 清空弹幕容器\n' +
'            danmuContainer.innerHTML = \'\';\n' +
'            \n' +
'            // 更新点赞信息\n' +
'            updateLikeInfo(album);\n' +
'            \n' +
'            // 显示弹幕（如果之前被隐藏）\n' +
'            danmuVisible = true;\n' +
'            updateToggleDanmuButton();\n' +
'            \n' +
'            // 设置当前索引\n' +
'            currentIndex = albums.findIndex(a => a.id === album.id);\n' +
'        }\n' +
'\n' +
'        // 更新图片变换\n' +
'        function updateImageTransform() {\n' +
'            lightboxImg.style.transform = \'scale(\' + scale + \') translate(\' + translateX + \'px, \' + translateY + \'px)\';\n' +
'        }\n' +
'\n' +
'        // 关闭灯箱\n' +
'        function closeLightboxFunc() {\n' +
'            lightbox.classList.remove(\'active\');\n' +
'            document.body.style.overflow = \'auto\';\n' +
'        }\n' +
'\n' +
'        // 切换弹幕显示/隐藏\n' +
'        function toggleDanmu() {\n' +
'            danmuVisible = !danmuVisible;\n' +
'            updateToggleDanmuButton();\n' +
'            document.querySelectorAll(\'.danmu-item\').forEach(danmu => {\n' +
'                danmu.style.display = danmuVisible ? \'block\' : \'none\';\n' +
'            });\n' +
'        }\n' +
'\n' +
'        // 更新弹幕开关按钮\n' +
'        function updateToggleDanmuButton() {\n' +
'            const icon = toggleDanmuBtn.querySelector(\'i\');\n' +
'            if (danmuVisible) {\n' +
'                icon.className = \'fas fa-eye-slash\';\n' +
'                toggleDanmuBtn.title = \'隐藏弹幕\';\n' +
'            } else {\n' +
'                icon.className = \'fas fa-eye\';\n' +
'                toggleDanmuBtn.title = \'显示弹幕\';\n' +
'            }\n' +
'        }\n' +
'\n' +
'        // 发送弹幕\n' +
'        function sendDanmu() {\n' +
'            const text = danmuInput.value.trim();\n' +
'            if (!text) return;\n' +
'            \n' +
'            const danmuItem = document.createElement(\'div\');\n' +
'            danmuItem.className = \'danmu-item\';\n' +
'            danmuItem.textContent = text;\n' +
'            danmuItem.style.color = danmuColors[Math.floor(Math.random() * danmuColors.length)];\n' +
'            danmuItem.style.top = (Math.random() * 70 + 10) + \'%\';\n' +
'            danmuItem.style.fontSize = (Math.random() * 0.5 + 1) + \'rem\';\n' +
'            danmuItem.style.animationDuration = (Math.random() * 5 + 10) + \'s\';\n' +
'            \n' +
'            if (!danmuVisible) {\n' +
'                danmuItem.style.display = \'none\';\n' +
'            }\n' +
'            \n' +
'            danmuContainer.appendChild(danmuItem);\n' +
'            \n' +
'            // 清空输入框\n' +
'            danmuInput.value = \'\';\n' +
'        }\n' +
'\n' +
'        // 更新点赞信息\n' +
'        function updateLikeInfo(album) {\n' +
'            likeCount.textContent = album.likes || 0;\n' +
'            likeBtn.classList.toggle(\'liked\', album.liked);\n' +
'        }\n' +
'\n' +
'        // 点赞功能\n' +
'        function likeAlbum() {\n' +
'            const album = albums.find(a => a.id === currentAlbumId);\n' +
'            if (!album) return;\n' +
'            \n' +
'            const wasLiked = album.liked;\n' +
'            album.liked = !wasLiked;\n' +
'            album.likes = wasLiked ? Math.max(0, (album.likes || 0) - 1) : (album.likes || 0) + 1;\n' +
'            \n' +
'            // 更新UI\n' +
'            updateLikeInfo(album);\n' +
'            \n' +
'            // 发送请求到后端\n' +
'            fetch(\'/api/like\', {\n' +
'                method: \'POST\',\n' +
'                headers: {\n' +
'                    \'Content-Type\': \'application/json\',\n' +
'                },\n' +
'                body: JSON.stringify({\n' +
'                    albumId: currentAlbumId,\n' +
'                    liked: album.liked,\n' +
'                    likes: album.likes\n' +
'                })\n' +
'            }).catch(error => {\n' +
'                console.error(\'点赞请求失败:\', error);\n' +
'                // 如果失败，回滚状态\n' +
'                album.liked = wasLiked;\n' +
'                album.likes = wasLiked ? (album.likes || 0) + 1 : Math.max(0, (album.likes || 0) - 1);\n' +
'                updateLikeInfo(album);\n' +
'            });\n' +
'        }\n' +
'\n' +
'        // 切换到上一张图片\n' +
'        function showPrevImage() {\n' +
'            if (currentIndex > 0) {\n' +
'                currentIndex--;\n' +
'                openLightbox(albums[currentIndex]);\n' +
'            }\n' +
'        }\n' +
'\n' +
'        // 切换到下一张图片\n' +
'        function showNextImage() {\n' +
'            if (currentIndex < albums.length - 1) {\n' +
'                currentIndex++;\n' +
'                openLightbox(albums[currentIndex]);\n' +
'            }\n' +
'        }\n' +
'\n' +
'        // 文件选择处理\n' +
'        function handleFileSelect(file) {\n' +
'            const validTypes = [\'image/jpeg\', \'image/jpg\', \'image/png\', \'image/gif\', \'image/webp\'];\n' +
'            if (!validTypes.includes(file.type)) {\n' +
'                alert(\'请上传 JPG, PNG, GIF 或 WebP 格式的图片！\');\n' +
'                return;\n' +
'            }\n' +
'            \n' +
'            if (file.size > 10 * 1024 * 1024) {\n' +
'                alert(\'图片大小不能超过 10MB！\');\n' +
'                return;\n' +
'            }\n' +
'            \n' +
'            tempUploadFile = {\n' +
'                file: file,\n' +
'                name: file.name,\n' +
'                size: file.size,\n' +
'                type: file.type\n' +
'            };\n' +
'            \n' +
'            const reader = new FileReader();\n' +
'            reader.onload = function(e) {\n' +
'                previewImage.src = e.target.result;\n' +
'                previewImage.style.display = \'block\';\n' +
'                editTitle.value = file.name.split(\'.\')[0]; // 修正：获取文件名，不包含扩展名\n' +
'                editDesc.value = \'\';\n' +
'                openEditModal();\n' +
'            };\n' +
'            reader.readAsDataURL(file);\n' +
'        }\n' +
'\n' +
'        function openEditModal() {\n' +
'            editModal.classList.add(\'active\');\n' +
'            document.body.style.overflow = \'hidden\';\n' +
'            titleError.style.display = \'none\';\n' +
'            uploadError.style.display = \'none\';\n' +
'            progressBar.style.width = \'0%\';\n' +
'        }\n' +
'\n' +
'        function closeEditModal() {\n' +
'            editModal.classList.remove(\'active\');\n' +
'            document.body.style.overflow = \'auto\';\n' +
'            tempUploadFile = null;\n' +
'            previewImage.style.display = \'none\';\n' +
'            editForm.reset();\n' +
'            titleError.style.display = \'none\';\n' +
'            uploadError.style.display = \'none\';\n' +
'            progressBar.style.width = \'0%\';\n' +
'        }\n' +
'\n' +
'        function isTitleExists(title) {\n' +
'            return albums.some(album => album.title === title);\n' +
'        }\n' +
'\n' +
'        // 修复后的上传表单提交函数\n' +
'        async function handleUploadSubmit(e) {\n' +
'            e.preventDefault();\n' +
'            \n' +
'            if (!tempUploadFile) return;\n' +
'            \n' +
'            const title = editTitle.value.trim();\n' +
'            \n' +
'            // 检查名称是否已存在\n' +
'            if (isTitleExists(title)) {\n' +
'                titleError.style.display = \'block\';\n' +
'                return;\n' +
'            }\n' +
'            \n' +
'            // 隐藏错误提示\n' +
'            titleError.style.display = \'none\';\n' +
'            uploadError.style.display = \'none\';\n' +
'            \n' +
'            // 获取年月\n' +
'            const year = editYear.value;\n' +
'            const month = editMonth.value;\n' +
'            const dateString = new Date().toISOString().split(\'T\')[0]; // 修正：获取日期字符串，不包含时间部分\n' +
'            \n' +
'            // 准备上传数据\n' +
'            const formData = new FormData();\n' +
'            formData.append(\'file\', tempUploadFile.file);\n' +
'            formData.append(\'metadata\', JSON.stringify({\n' +
'                title: title || "未命名图片",\n' +
'                desc: editDesc.value || "用户上传的照片",\n' +
'                category: editCategory.value,\n' +
'                date: dateString\n' +
'            }));\n' +
'            \n' +
'            try {\n' +
'                // 显示上传进度\n' +
'                progressBar.style.width = "30%";\n' +
'                \n' +
'                console.log(\'Starting upload...\');\n' +
'                const response = await fetch(\'/api/upload\', {\n' +
'                    method: \'POST\',\n' +
'                    body: formData\n' +
'                });\n' +
'                \n' +
'                console.log(\'Upload response status:\', response.status);\n' +
'                progressBar.style.width = "70%";\n' +
'                \n' +
'                // 关键修改：先检查响应状态和内容类型\n' +
'                const contentType = response.headers.get(\'content-type\');\n' +
'                console.log(\'Response content-type:\', contentType);\n' +
'                \n' +
'                // 获取响应文本\n' +
'                const responseText = await response.text();\n' +
'                console.log(\'Raw response text:\', responseText);\n' +
'                \n' +
'                // 检查是否为空响应\n' +
'                if (!responseText || responseText.trim() === \'\') {\n' +
'                    throw new Error(\'服务器返回空响应 (状态码: \' + response.status + \')\');\n' +
'                }\n' +
'                \n' +
'                // 检查是否为JSON格式\n' +
'                let result;\n' +
'                try {\n' +
'                    result = JSON.parse(responseText);\n' +
'                } catch (parseError) {\n' +
'                    console.error(\'Failed to parse JSON response:\', parseError);\n' +
'                    console.error(\'Full response text:\', responseText);\n' +
'                    throw new Error(\'服务器返回了无效的响应格式: \' + responseText.substring(0, 200));\n' +
'                }\n' +
'                \n' +
'                if (result.success) {\n' +
'                    progressBar.style.width = "100%";\n' +
'                    \n' +
'                    // 添加到相册数组开头\n' +
'                    if (result.data) {\n' +
'                        albums.unshift(result.data);\n' +
'                    }\n' +
'                    \n' +
'                    // 关闭弹窗并刷新相册\n' +
'                    closeEditModal();\n' +
'                    applyFilters();\n' +
'                    \n' +
'                    // 显示成功提示\n' +
'                    setTimeout(() => {\n' +
'                        alert(\'图片上传成功！秀彬感谢你的分享~\');\n' +
'                    }, 300);\n' +
'                } else {\n' +
'                    throw new Error(result.error || \'上传失败\');\n' +
'                }\n' +
'            } catch (error) {\n' +
'                console.error(\'Upload failed:\', error);\n' +
'                uploadError.textContent = \'上传失败：\' + error.message;\n' +
'                uploadError.style.display = \'block\';\n' +
'                progressBar.style.width = "0%";\n' +
'            }\n' +
'        }\n' +
'\n' +
'        // 筛选功能\n' +
'        function applyFilters() {\n' +
'            const category = categoryFilter.value;\n' +
'            const year = yearFilter.value;\n' +
'            const month = monthFilter.value;\n' +
'            \n' +
'            let filtered = albums.filter(album => {\n' +
'                const albumDate = new Date(album.date);\n' +
'                const albumYear = albumDate.getFullYear().toString();\n' +
'                const albumMonth = (albumDate.getMonth() + 1).toString().padStart(2, \'0\');\n' +
'                \n' +
'                return (category === \'all\' || album.category === category) &&\n' +
'                       (year === \'all\' || albumYear === year) &&\n' +
'                       (month === \'all\' || albumMonth === month);\n' +
'            });\n' +
'            \n' +
'            renderAlbums(filtered);\n' +
'        }\n' +
'\n' +
'        function resetFilters() {\n' +
'            categoryFilter.value = \'all\';\n' +
'            yearFilter.value = \'all\';\n' +
'            monthFilter.value = \'all\';\n' +
'            renderAlbums();\n' +
'        }\n' +
'\n' +
'        // 公告相关函数\n' +
'        function showEditAnnouncementModal() {\n' +
'            document.getElementById(\'announcement-textarea\').value = announcementContent;\n' +
'            document.getElementById(\'announcement-modal\').classList.add(\'active\');\n' +
'            document.body.style.overflow = \'hidden\';\n' +
'        }\n' +
'\n' +
'        function hideEditAnnouncementModal() {\n' +
'            document.getElementById(\'announcement-modal\').classList.remove(\'active\');\n' +
'            document.body.style.overflow = \'auto\';\n' +
'        }\n' +
'\n' +
'        function saveAnnouncement() {\n' +
'            const newContent = document.getElementById(\'announcement-textarea\').value;\n' +
'            announcementContent = newContent;\n' +
'            document.getElementById(\'announcement-content\').innerHTML = newContent;\n' +
'            \n' +
'            // 保存到后端\n' +
'            fetch(\'/api/announcement\', {\n' +
'                method: \'POST\',\n' +
'                headers: {\n' +
'                    \'Content-Type\': \'application/json\',\n' +
'                },\n' +
'                body: JSON.stringify({ content: newContent })\n' +
'            }).catch(error => {\n' +
'                console.error(\'保存公告失败:\', error);\n' +
'            });\n' +
'            \n' +
'            hideEditAnnouncementModal();\n' +
'        }\n' +
'\n' +
'        // 密码验证相关函数\n' +
'        function showPasswordModal(action, albumId = null) {\n' +
'            pendingAction = action;\n' +
'            if (action === \'delete\') {\n' +
'                passwordAction.textContent = \'请输入密码以删除图片\';\n' +
'            } else if (action === \'announcement\') {\n' +
'                passwordAction.textContent = \'请输入密码以编辑公告\';\n' +
'            }\n' +
'            passwordInput.value = \'\';\n' +
'            passwordModal.classList.add(\'active\');\n' +
'            document.body.style.overflow = \'hidden\';\n' +
'            currentAlbumId = albumId;\n' +
'        }\n' +
'\n' +
'        function hidePasswordModal() {\n' +
'            passwordModal.classList.remove(\'active\');\n' +
'            document.body.style.overflow = \'auto\';\n' +
'            pendingAction = null;\n' +
'            currentAlbumId = null;\n' +
'        }\n' +
'\n' +
'        function verifyPassword() {\n' +
'            const password = passwordInput.value.trim();\n' +
'            \n' +
'            if (pendingAction === \'delete\' && password === PASSWORD) {\n' +
'                deleteAlbum(currentAlbumId);\n' +
'                hidePasswordModal();\n' +
'            } else if (pendingAction === \'announcement\' && password === ANNOUNCEMENT_PASSWORD) {\n' +
'                hidePasswordModal();\n' +
'                showEditAnnouncementModal();\n' +
'            } else {\n' +
'                alert(\'密码错误！\');\n' +
'                passwordInput.value = \'\';\n' +
'                passwordInput.focus();\n' +
'            }\n' +
'        }\n' +
'\n' +
'        function deleteAlbum(id) {\n' +
'            albums = albums.filter(album => album.id !== id);\n' +
'            renderAlbums();\n' +
'            \n' +
'            // 发送删除请求到后端\n' +
'            fetch(\'/api/delete\', {\n' +
'                method: \'POST\',\n' +
'                headers: {\n' +
'                    \'Content-Type\': \'application/json\',\n' +
'                },\n' +
'                body: JSON.stringify({ id: id })\n' +
'            }).catch(error => {\n' +
'                console.error(\'删除请求失败:\', error);\n' +
'            });\n' +
'        }\n' +
'\n' +
'        // 图片操作相关函数\n' +
'        function flipImageCard() {\n' +
'            imageCard.classList.toggle(\'flipped\');\n' +
'        }\n' +
'    </script>\n' +
'</body>\n' +
'</html>';
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
            date: metadata.date || new Date().toISOString().split('T')[0], // 修正：确保日期是字符串
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
