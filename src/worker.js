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
        
        /* 用户管理样式 */
        .admin-panel {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            padding: 30px;
            margin: 30px auto;
            max-width: 800px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            text-align: center;
            backdrop-filter: blur(10px);
            display: none;
        }
        
        .admin-panel.active {
            display: block;
        }
        
        .admin-panel h2 {
            color: #FF8C00;
            margin-bottom: 20px;
        }
        
        .users-list {
            text-align: left;
            margin: 20px 0;
        }
        
        .user-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            margin: 10px 0;
        }
        
        .user-actions {
            display: flex;
            gap: 10px;
        }
        
        .make-admin-btn, .remove-admin-btn, .delete-user-btn {
            padding: 5px 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .make-admin-btn {
            background: #4CAF50;
            color: white;
        }
        
        .remove-admin-btn {
            background: #FF9800;
            color: white;
        }
        
        .delete-user-btn {
            background: #f44336;
            color: white;
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
        
        <!-- 管理员面板 -->
        <div class="admin-panel" id="admin-panel">
            <h2><i class="fas fa-cog"></i> 用户管理面板</h2>
            <div class="users-list" id="users-list">
                <!-- 用户列表将在这里动态生成 -->
            </div>
        </div>
        
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
                <h3><i class="fas fa-user-lock"></i> 用户登录</h3>
                <input type="text" class="login-input" id="login-username" placeholder="请输入用户名">
                <input type="password" class="login-input" id="login-password" placeholder="请输入密码">
                <div class="login-buttons">
                    <button class="login-btn-modal login-cancel" id="login-cancel">取消</button>
                    <button class="login-btn-modal login-confirm" id="login-confirm">登录</button>
                </div>
                <p style="margin-top: 15px; font-size: 0.9rem;">
                    <a href="#" id="register-link" style="color: #FF8C00;">还没有账户？点击注册</a>
                </p>
            </div>
        </div>
        
        <!-- 注册弹窗 -->
        <div class="login-modal" id="register-modal">
            <div class="login-content">
                <h3><i class="fas fa-user-plus"></i> 用户注册</h3>
                <input type="text" class="login-input" id="register-username" placeholder="请输入用户名">
                <input type="password" class="login-input" id="register-password" placeholder="请输入密码">
                <input type="password" class="login-input" id="register-confirm-password" placeholder="请确认密码">
                <div class="login-buttons">
                    <button class="login-btn-modal login-cancel" id="register-cancel">取消</button>
                    <button class="login-btn-modal login-confirm" id="register-confirm">注册</button>
                </div>
                <p style="margin-top: 15px; font-size: 0.9rem;">
                    <a href="#" id="back-to-login" style="color: #FF8C00;">已有账户？点击登录</a>
                </p>
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
        let currentUser = null;
        let users = [];

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
        const adminPanel = document.getElementById('admin-panel');
        const usersList = document.getElementById('users-list');
        
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

        // 密码弹窗元素
        const passwordModal = document.getElementById('password-modal');
        const passwordInput = document.getElementById('password-input');
        const passwordConfirm = document.getElementById('password-confirm');
        const passwordCancel = document.getElementById('password-cancel');
        const passwordAction = document.getElementById('password-action');

        // 登录弹窗元素
        const loginModal = document.getElementById('login-modal');
        const loginUsername = document.getElementById('login-username');
        const loginPassword = document.getElementById('login-password');
        const loginConfirm = document.getElementById('login-confirm');
        const loginCancel = document.getElementById('login-cancel');
        const registerLink = document.getElementById('register-link');

        // 注册弹窗元素
        const registerModal = document.getElementById('register-modal');
        const registerUsername = document.getElementById('register-username');
        const registerPassword = document.getElementById('register-password');
        const registerConfirmPassword = document.getElementById('register-confirm-password');
        const registerConfirmBtn = document.getElementById('register-confirm');
        const registerCancel = document.getElementById('register-cancel');
        const backToLogin = document.getElementById('back-to-login');

        // 当前查看的相册ID和临时上传文件
        let currentAlbumId = null;
        let tempUploadFile = null;
        let isZoomed = false;
        let pendingAction = null; // 'upload' 或 'delete' 或 'announcement'
        let clickCount = 0;
        let clickTimer = null;
        let scale = 1;
        let startX, startY, isDragging = false;
        let translateX = 0, translateY = 0;
        let startTranslateX = 0, startTranslateY = 0;
        let isAdmin = false; // 管理员状态
        let danmuVisible = true; // 弹幕显示状态
        let currentIndex = 0; // 当前图片索引
        let startXSwipe = 0; // 触摸开始位置
        let isSwiping = false; // 是否正在滑动

        // 预设密码
        const ADMIN_PASSWORD = "admin123"; // 管理员密码

        // 随机颜色数组
        const danmuColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D9E5', '#FFB347', '#B19CD9', '#FF6961'
        ];

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', async function() {
            // 初始化登录状态显示
            updateLoginDisplay();
            
            // 加载相册和公告数据
            await loadAlbums();
            await loadAnnouncement();
            await loadUsers();
            
            // 渲染相册
            renderAlbums();
        });

        // 加载相册数据
        async function loadAlbums() {
            try {
                const response = await fetch('/api/albums');
                if (response.ok) {
                    albums = await response.json();
                } else {
                    console.error('加载相册失败:', response.status);
                    // 使用默认数据作为后备
                    albums = [];
                }
            } catch (error) {
                console.error('加载相册失败:', error);
                // 使用默认数据作为后备
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
                    document.getElementById('announcement-content').innerHTML = announcementContent;
                }
            } catch (error) {
                console.error('加载公告失败:', error);
            }
        }

        // 加载用户数据
        async function loadUsers() {
            try {
                const response = await fetch('/api/users');
                if (response.ok) {
                    users = await response.json();
                }
            } catch (error) {
                console.error('加载用户失败:', error);
                users = [];
            }
        }

        // 更新登录显示
        function updateLoginDisplay() {
            loginSection.innerHTML = '';
            
            if (currentUser) {
                loginSection.innerHTML = `
                    <div class="user-info" title="用户: ${currentUser.username}">
                        <i class="fas fa-user"></i>
                    </div>
                    <button class="logout-btn" id="logout-btn" title="退出登录">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                `;
                document.getElementById('logout-btn').addEventListener('click', logout);
                
                // 如果是管理员，显示管理员面板
                if (currentUser.isAdmin) {
                    adminPanel.classList.add('active');
                    renderUsersList();
                } else {
                    adminPanel.classList.remove('active');
                }
            } else {
                loginSection.innerHTML = `
                    <button class="login-btn" id="login-btn" title="用户登录">
                        <i class="fas fa-user"></i>
                    </button>
                `;
                document.getElementById('login-btn').addEventListener('click', showLoginModal);
            }
        }

        // 显示登录弹窗
        function showLoginModal() {
            loginUsername.value = '';
            loginPassword.value = '';
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // 隐藏登录弹窗
        function hideLoginModal() {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // 显示注册弹窗
        function showRegisterModal() {
            registerUsername.value = '';
            registerPassword.value = '';
            registerConfirmPassword.value = '';
            registerModal.classList.add('active');
            document.body.style.overflow = 'auto';
        }

        // 隐藏注册弹窗
        function hideRegisterModal() {
            registerModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // 登录
        async function login() {
            const username = loginUsername.value.trim();
            const password = loginPassword.value.trim();
            
            if (!username || !password) {
                alert('请输入用户名和密码！');
                return;
            }
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentUser = result.user;
                    hideLoginModal();
                    updateLoginDisplay();
                    alert('登录成功！');
                } else {
                    alert('登录失败：' + result.error);
                }
            } catch (error) {
                console.error('登录失败:', error);
                alert('登录失败：' + error.message);
            }
        }

        // 注册
        async function register() {
            const username = registerUsername.value.trim();
            const password = registerPassword.value.trim();
            const confirmPassword = registerConfirmPassword.value.trim();
            
            if (!username || !password) {
                alert('请输入用户名和密码！');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致！');
                return;
            }
            
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentUser = result.user;
                    hideRegisterModal();
                    updateLoginDisplay();
                    alert('注册成功！');
                } else {
                    alert('注册失败：' + result.error);
                }
            } catch (error) {
                console.error('注册失败:', error);
                alert('注册失败：' + error.message);
            }
        }

        // 登出
        function logout() {
            currentUser = null;
            updateLoginDisplay();
            alert('已退出登录');
        }

        // 翻转头像卡片
        profileCard.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });

        // 渲染用户列表
        function renderUsersList() {
            if (!currentUser || !currentUser.isAdmin) return;
            
            let html = '';
            users.forEach(user => {
                html += `
                    <div class="user-item">
                        <div>
                            <strong>${user.username}</strong>
                            ${user.isAdmin ? '<span style="color: #FF8C00;">(管理员)</span>' : ''}
                        </div>
                        <div class="user-actions">
                            ${!user.isAdmin ? 
                                `<button class="make-admin-btn" data-username="${user.username}">设为管理员</button>` :
                                `<button class="remove-admin-btn" data-username="${user.username}">取消管理员</button>`
                            }
                            <button class="delete-user-btn" data-username="${user.username}">删除用户</button>
                        </div>
                    </div>
                `;
            });
            
            usersList.innerHTML = html;
            
            // 绑定事件
            document.querySelectorAll('.make-admin-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const username = this.getAttribute('data-username');
                    makeAdmin(username);
                });
            });
            
            document.querySelectorAll('.remove-admin-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const username = this.getAttribute('data-username');
                    removeAdmin(username);
                });
            });
            
            document.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const username = this.getAttribute('data-username');
                    deleteUser(username);
                });
            });
        }

        // 设置管理员
        async function makeAdmin(username) {
            if (!confirm(`确定要将用户 "${username}" 设为管理员吗？`)) return;
            
            try {
                const response = await fetch('/api/make-admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    await loadUsers();
                    renderUsersList();
                    alert('设置管理员成功！');
                } else {
                    alert('设置管理员失败：' + result.error);
                }
            } catch (error) {
                console.error('设置管理员失败:', error);
                alert('设置管理员失败：' + error.message);
            }
        }

        // 取消管理员
        async function removeAdmin(username) {
            if (!confirm(`确定要取消用户 "${username}" 的管理员权限吗？`)) return;
            
            try {
                const response = await fetch('/api/remove-admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    await loadUsers();
                    renderUsersList();
                    alert('取消管理员成功！');
                } else {
                    alert('取消管理员失败：' + result.error);
                }
            } catch (error) {
                console.error('取消管理员失败:', error);
                alert('取消管理员失败：' + error.message);
            }
        }

        // 删除用户
        async function deleteUser(username) {
            if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复！`)) return;
            
            try {
                const response = await fetch('/api/delete-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    await loadUsers();
                    renderUsersList();
                    alert('删除用户成功！');
                } else {
                    alert('删除用户失败：' + result.error);
                }
            } catch (error) {
                console.error('删除用户失败:', error);
                alert('删除用户失败：' + error.message);
            }
        }

        // 渲染相册
        function renderAlbums(filteredAlbums = albums) {
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
                const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth()+1}月${dateObj.getDate()}日`;
                
                albumItem.innerHTML = `
                    <img class="album-img" src="${album.img}" alt="${album.title}" data-id="${album.id}">
                    <div class="album-overlay">
                        <h3 class="album-title">${album.title}</h3>
                        <p class="album-desc">${album.desc}</p>
                        <div class="album-meta">
                            <span><i class="fas fa-heart"></i> ${album.likes || 0}</span>
                            <span><i class="fas fa-comment"></i> ${album.comments ? album.comments.length : 0}</span>
                        </div>
                        <div class="album-date">${formattedDate}</div>
                    </div>
                    ${(currentUser && currentUser.isAdmin) ? `<button class="delete-btn" data-id="${album.id}"><i class="fas fa-trash"></i></button>` : ''}
                `;
                
                // 图片点击事件处理
                const imgElement = albumItem.querySelector('.album-img');
                imgElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openLightbox(album);
                });
                
                const overlayElement = albumItem.querySelector('.album-overlay');
                overlayElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openLightbox(album);
                });
                
                // 删除按钮事件处理（仅管理员）
                if (currentUser && currentUser.isAdmin) {
                    const deleteBtn = albumItem.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteAlbum(album.id);
                    });
                }
                
                gallery.appendChild(albumItem);
            });
            
            // 延迟添加visible类以触发动画
            setTimeout(() => {
                document.querySelectorAll('.album-item').forEach(item => {
                    item.classList.add('visible');
                });
            }, 100);
        }

        // 打开灯箱
        function openLightbox(album) {
            currentAlbumId = album.id;
            lightboxImg.src = album.img;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            isZoomed = false;
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
            
            // 重置图片卡片状态
            imageCard.classList.remove('flipped');
            
            // 设置图片故事内容
            if (album.desc && album.desc.trim() !== "") {
                imageStory.innerHTML = album.desc;
                imageStory.classList.remove('empty-story');
            } else {
                imageStory.innerHTML = "秀斌也有自己的小秘密~";
                imageStory.classList.add('empty-story');
            }
            
            // 清空弹幕容器
            danmuContainer.innerHTML = '';
            
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
            lightboxImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        }

        // 图片点击计数器（三击翻转）
        lightboxImg.addEventListener('click', function(e) {
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                    // 单击逻辑（如果有）
                }, 300);
            } else if (clickCount === 2) {
                clearTimeout(clickTimer);
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                    // 双击放大/缩小
                    if (scale === 1) {
                        scale = 2;
                    } else {
                        scale = 1;
                        translateX = 0;
                        translateY = 0;
                    }
                    updateImageTransform();
                }, 300);
            } else if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                // 三击翻转图片
                imageCard.classList.toggle('flipped');
            }
        });

        // 鼠标滚轮缩放
        lightboxImg.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const rect = lightboxImg.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 计算缩放中心点
            const centerX = (x - rect.width / 2) / scale;
            const centerY = (y - rect.height / 2) / scale;
            
            // 缩放
            scale *= delta;
            scale = Math.max(0.1, Math.min(scale, 10)); // 限制缩放范围
            
            // 调整位置以保持缩放中心点不变
            translateX = centerX * (1 - scale) + (translateX * scale);
            translateY = centerY * (1 - scale) + (translateY * scale);
            
            updateImageTransform();
        });

        // 鼠标拖拽移动
        lightboxImg.addEventListener('mousedown', function(e) {
            if (scale > 1) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                startTranslateX = translateX;
                startTranslateY = translateY;
                lightboxImg.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                translateX = startTranslateX + deltaX / scale;
                translateY = startTranslateY + deltaY / scale;
                updateImageTransform();
            }
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                lightboxImg.style.cursor = 'grab';
            }
        });

        // 触摸事件支持（手机端滑动切换图片）
        lightboxImg.addEventListener('touchstart', function(e) {
            if (scale === 1) {
                // 只有在未缩放状态下才允许滑动切换
                isSwiping = true;
                startXSwipe = e.touches[0].clientX;
                e.preventDefault();
            } else if (scale > 1) {
                // 缩放状态下允许拖拽移动
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                startTranslateX = translateX;
                startTranslateY = translateY;
                e.preventDefault();
            }
        });

        document.addEventListener('touchmove', function(e) {
            if (isSwiping && e.touches.length === 1) {
                // 滑动切换图片
                e.preventDefault();
            } else if (isDragging && e.touches.length === 1) {
                // 拖拽移动图片
                const deltaX = e.touches[0].clientX - startX;
                const deltaY = e.touches[0].clientY - startY;
                translateX = startTranslateX + deltaX / scale;
                translateY = startTranslateY + deltaY / scale;
                updateImageTransform();
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', function(e) {
            if (isSwiping) {
                if (e.changedTouches.length > 0) {
                    const endX = e.changedTouches[0].clientX;
                    const diffX = startXSwipe - endX;
                    
                    // 判断滑动方向和距离
                    if (Math.abs(diffX) > 50) { // 最小滑动距离
                        if (diffX > 0) {
                            // 向左滑动，显示下一张
                            nextImage();
                        } else {
                            // 向右滑动，显示上一张
                            prevImage();
                        }
                    }
                }
                isSwiping = false;
            }
            
            if (isDragging) {
                isDragging = false;
            }
        });

        // 上一张图片
        function prevImage() {
            if (currentIndex > 0) {
                currentIndex--;
                const album = albums[currentIndex];
                updateLightboxContent(album);
            }
        }

        // 下一张图片
        function nextImage() {
            if (currentIndex < albums.length - 1) {
                currentIndex++;
                const album = albums[currentIndex];
                updateLightboxContent(album);
            }
        }

        // 更新灯箱内容
        function updateLightboxContent(album) {
            currentAlbumId = album.id;
            lightboxImg.src = album.img;
            
            // 重置缩放和位置
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
            
            // 重置图片卡片状态
            imageCard.classList.remove('flipped');
            
            // 设置图片故事内容
            if (album.desc && album.desc.trim() !== "") {
                imageStory.innerHTML = album.desc;
                imageStory.classList.remove('empty-story');
            } else {
                imageStory.innerHTML = "秀斌也有自己的小秘密~";
                imageStory.classList.add('empty-story');
            }
            
            // 更新点赞信息
            updateLikeInfo(album);
        }

        // 更新点赞信息
        function updateLikeInfo(album) {
            likeCount.textContent = album.likes || 0;
            if (album.liked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
        }

        // 点赞功能
        likeBtn.addEventListener('click', async function() {
            if (!currentAlbumId) return;
            
            if (!currentUser) {
                alert('请先登录后再点赞！');
                showLoginModal();
                return;
            }
            
            const album = albums.find(a => a.id === currentAlbumId);
            if (album) {
                const newLiked = !album.liked;
                const newLikes = newLiked ? (album.likes || 0) + 1 : Math.max(0, (album.likes || 0) - 1);
                
                try {
                    const response = await fetch('/api/like', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            albumId: currentAlbumId,
                            liked: newLiked,
                            likes: newLikes
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        album.likes = newLikes;
                        album.liked = newLiked;
                        updateLikeInfo(album);
                        
                        // 同时更新网格中的显示
                        const albumItem = document.querySelector(`.album-item .album-img[data-id="${currentAlbumId}"]`);
                        if (albumItem) {
                            const likeSpan = albumItem.nextElementSibling.querySelector('.album-meta span:first-child');
                            if (likeSpan) {
                                likeSpan.innerHTML = `<i class="fas fa-heart"></i> ${newLikes}`;
                            }
                        }
                    } else {
                        alert('点赞失败：' + result.error);
                    }
                } catch (error) {
                    console.error('点赞失败:', error);
                    alert('点赞失败：' + error.message);
                }
            }
        });

        // 发送弹幕
        async function sendDanmu() {
            const text = danmuInput.value.trim();
            if (text && currentAlbumId) {
                if (!currentUser) {
                    alert('请先登录后再发送弹幕！');
                    showLoginModal();
                    return;
                }
                
                try {
                    const response = await fetch('/api/comment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            albumId: currentAlbumId,
                            comment: {
                                author: currentUser.username,
                                text: text,
                                time: new Date().toLocaleString('zh-CN')
                            }
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // 创建弹幕元素
                        const danmuItem = document.createElement('div');
                        danmuItem.className = 'danmu-item';
                        danmuItem.textContent = text;
                        
                        // 随机颜色和位置
                        const randomColor = danmuColors[Math.floor(Math.random() * danmuColors.length)];
                        danmuItem.style.color = randomColor;
                        danmuItem.style.top = Math.random() * 60 + 10 + '%'; // 在10%-70%之间
                        
                        // 随机透明度
                        danmuItem.style.opacity = (Math.random() * 0.5 + 0.3).toString();
                        
                        // 随机动画时长（5-10秒）
                        const duration = Math.random() * 5 + 5;
                        danmuItem.style.animationDuration = duration + 's';
                        
                        // 添加到容器
                        danmuContainer.appendChild(danmuItem);
                        
                        // 清空输入框
                        danmuInput.value = '';
                        
                        // 3秒后淡出并移除
                        setTimeout(() => {
                            danmuItem.style.transition = 'opacity 1s';
                            danmuItem.style.opacity = '0';
                            setTimeout(() => {
                                if (danmuItem.parentNode) {
                                    danmuItem.parentNode.removeChild(danmuItem);
                                }
                            }, 1000);
                        }, duration * 1000 - 1000);
                    } else {
                        alert('发送评论失败：' + result.error);
                    }
                } catch (error) {
                    console.error('发送评论失败:', error);
                    alert('发送评论失败：' + error.message);
                }
            }
        }

        // 弹幕输入事件
        danmuSubmit.addEventListener('click', sendDanmu);
        danmuInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendDanmu();
            }
        });

        // 隐藏/显示弹幕
        toggleDanmuBtn.addEventListener('click', function() {
            danmuVisible = !danmuVisible;
            danmuContainer.style.display = danmuVisible ? 'block' : 'none';
            updateToggleDanmuButton();
        });

        function updateToggleDanmuButton() {
            const icon = toggleDanmuBtn.querySelector('i');
            if (danmuVisible) {
                icon.className = 'fas fa-eye-slash';
                toggleDanmuBtn.title = '隐藏弹幕';
            } else {
                icon.className = 'fas fa-eye';
                toggleDanmuBtn.title = '显示弹幕';
            }
        }

        // 图片导航按钮事件
        prevBtn.addEventListener('click', prevImage);
        nextBtn.addEventListener('click', nextImage);

        // 键盘左右箭头切换图片
        document.addEventListener('keydown', function(e) {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    prevImage();
                } else if (e.key === 'ArrowRight') {
                    nextImage();
                }
            }
        });

        // 删除相册项
        async function deleteAlbum(id) {
            if (!currentUser || !currentUser.isAdmin) {
                alert('您没有权限删除图片！');
                return;
            }
            
            if (!confirm('确定要删除这张图片吗？此操作不可恢复！')) return;
            
            try {
                const response = await fetch('/api/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: id })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    albums = albums.filter(album => album.id !== id);
                    renderAlbums();
                } else {
                    alert('删除失败：' + result.error);
                }
            } catch (error) {
                console.error('删除失败:', error);
                alert('删除失败：' + error.message);
            }
        }

        // 应用筛选
        function applyFilters() {
            const category = categoryFilter.value;
            const year = yearFilter.value;
            const month = monthFilter.value;
            
            let filteredAlbums = [...albums];
            
            // 类型筛选
            if (category !== 'all') {
                filteredAlbums = filteredAlbums.filter(album => album.category === category);
            }
            
            // 年份筛选
            if (year !== 'all') {
                filteredAlbums = filteredAlbums.filter(album => {
                    const albumYear = new Date(album.date).getFullYear().toString();
                    return albumYear === year;
                });
            }
            
            // 月份筛选
            if (month !== 'all') {
                filteredAlbums = filteredAlbums.filter(album => {
                    const albumMonth = String(new Date(album.date).getMonth() + 1).padStart(2, '0');
                    return albumMonth === month;
                });
            }
            
            renderAlbums(filteredAlbums);
        }

        // 重置筛选
        function resetFilters() {
            categoryFilter.value = 'all';
            yearFilter.value = 'all';
            monthFilter.value = 'all';
            renderAlbums();
        }

        // 上传区域点击事件
        uploadArea.addEventListener('click', (e) => {
            // 只有点击区域本身时才触发文件选择
            if (e.target === uploadArea || e.target.tagName === 'I' || e.target.tagName === 'P') {
                fileInput.click();
            }
        });

        // 拖拽上传功能
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'rgba(255, 215, 0, 0.3)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = 'rgba(255, 255, 255, 0.7)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'rgba(255, 255, 255, 0.7)';
            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        });

        // 文件输入变化事件
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFiles(e.target.files);
            }
        });

        // 上传按钮点击事件
        uploadBtn.addEventListener('click', () => {
            if (!currentUser) {
                alert('请先登录后再上传图片！');
                showLoginModal();
                return;
            }
            
            if (fileInput.files.length) {
                handleFiles(fileInput.files);
            } else {
                alert('请先选择要上传的图片');
            }
        });

        // 筛选按钮事件
        applyFilterBtn.addEventListener('click', applyFilters);
        resetFilterBtn.addEventListener('click', resetFilters);

        // 处理文件上传
        function handleFiles(files) {
            if (files.length === 0) return;
            
            const file = files[0];
            
            if (!file.type.match('image.*')) {
                alert('请只上传图片文件');
                return;
            }
            
            // 保存文件数据
            tempUploadFile = {
                name: file.name,
                file: file
            };
            
            showEditModal(tempUploadFile);
        }

        // 检查图片名称是否已存在
        function isTitleExists(title) {
            return albums.some(album => album.title === title);
        }

        // 显示编辑弹窗
        function showEditModal(fileData) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                editTitle.value = fileData.name.replace(/\.[^/.]+$/, ""); // 移除文件扩展名
                editDesc.value = "";
                editCategory.value = "candid"; // 默认分类为生活照
                
                // 设置默认年月为当前年月
                const now = new Date();
                editYear.value = now.getFullYear();
                editMonth.value = String(now.getMonth() + 1).padStart(2, '0');
                
                progressBar.style.width = "0%";
                
                // 隐藏错误提示
                titleError.style.display = 'none';
                
                tempUploadFile = fileData;
                
                editModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // 添加装饰元素
                createDecorations();
            };
            reader.readAsDataURL(fileData.file);
        }

        // 创建装饰元素（爱心和星星）
        function createDecorations() {
            // 清除之前的装饰
            document.querySelectorAll('.heart, .star').forEach(el => el.remove());
            
            // 创建爱心
            for (let i = 0; i < 6; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.innerHTML = '<i class="fas fa-heart"></i>';
                heart.style.left = Math.random() * 100 + '%';
                heart.style.top = Math.random() * 100 + '%';
                heart.style.animationDelay = Math.random() * 3 + 's';
                heart.style.fontSize = (15 + Math.random() * 10) + 'px';
                editModal.appendChild(heart);
            }
            
            // 创建星星
            for (let i = 0; i < 8; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.innerHTML = '<i class="fas fa-star"></i>';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 2 + 's';
                star.style.fontSize = (10 + Math.random() * 8) + 'px';
                editModal.appendChild(star);
            }
        }

        // 关闭编辑弹窗
        function closeEditModal() {
            editModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            tempUploadFile = null;
            
            // 移除装饰元素
            setTimeout(() => {
                document.querySelectorAll('.heart, .star').forEach(el => el.remove());
            }, 500);
        }

        // 取消按钮事件
        editCancel.addEventListener('click', closeEditModal);

        // 表单提交事件
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!tempUploadFile) return;
            
            const title = editTitle.value.trim();
            
            // 检查名称是否已存在
            if (isTitleExists(title)) {
                titleError.style.display = 'block';
                return;
            }
            
            // 隐藏错误提示
            titleError.style.display = 'none';
            
            // 获取年月
            const year = editYear.value;
            const month = editMonth.value;
            const day = new Date().getDate().toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            // 准备上传数据
            const formData = new FormData();
            formData.append('file', tempUploadFile.file);
            formData.append('metadata', JSON.stringify({
                title: title || "未命名图片",
                desc: editDesc.value || "用户上传的照片",
                category: editCategory.value,
                date: dateStr
            }));
            
            try {
                // 显示上传进度
                progressBar.style.width = "30%";
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                progressBar.style.width = "70%";
                
                const result = await response.json();
                
                if (result.success) {
                    progressBar.style.width = "100%";
                    
                    // 添加到相册数组开头
                    albums.unshift(result.data);
                    
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
                console.error('上传失败:', error);
                alert('图片上传失败：' + error.message);
                progressBar.style.width = "0%";
            }
        });

        // 公告功能
        document.getElementById('edit-announcement-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            if (!currentUser || !currentUser.isAdmin) {
                alert('只有管理员才能编辑公告！');
                return;
            }
            showAnnouncementModal();
        });

        document.getElementById('close-announcement-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            document.getElementById('announcement-float').style.display = 'none';
        });

        function showAnnouncementModal() {
            document.getElementById('announcement-textarea').value = announcementContent;
            document.getElementById('announcement-modal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function hideAnnouncementModal() {
            document.getElementById('announcement-modal').classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        document.getElementById('announcement-save').addEventListener('click', async function() {
            if (!currentUser || !currentUser.isAdmin) {
                alert('只有管理员才能编辑公告！');
                return;
            }
            
            try {
                const content = document.getElementById('announcement-textarea').value.trim() || 
                               "欢迎来到郑秀彬专属相册集！这里珍藏着秀彬的每一个精彩瞬间。请尽情欣赏并留下您的宝贵评论。";
                
                const response = await fetch('/api/announcement', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: content })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    announcementContent = content;
                    document.getElementById('announcement-content').innerHTML = announcementContent;
                    if (announcementContent === "欢迎来到郑秀彬专属相册集！这里珍藏着秀彬的每一个精彩瞬间。请尽情欣赏并留下您的宝贵评论。") {
                        document.getElementById('announcement-content').classList.add('empty');
                    } else {
                        document.getElementById('announcement-content').classList.remove('empty');
                    }
                    hideAnnouncementModal();
                } else {
                    alert('保存公告失败：' + result.error);
                }
            } catch (error) {
                console.error('保存公告失败:', error);
                alert('保存公告失败：' + error.message);
            }
        });

        document.getElementById('announcement-cancel').addEventListener('click', hideAnnouncementModal);

        // 密码弹窗事件
        passwordConfirm.addEventListener('click', function() {
            // 简化处理，直接跳过密码验证
            if (pendingAction) {
                if (pendingAction.action === 'upload') {
                    // 执行上传操作
                    if (tempUploadFile) {
                        showEditModal(tempUploadFile);
                    }
                } else if (pendingAction.action === 'delete') {
                    // 执行删除操作
                    deleteAlbum(pendingAction.data);
                } else if (pendingAction.action === 'announcement') {
                    // 执行编辑公告操作
                    showAnnouncementModal();
                }
            }
            
            // 清空pendingAction
            pendingAction = null;
            passwordModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
        passwordCancel.addEventListener('click', function() {
            passwordModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        // 登录弹窗事件
        loginConfirm.addEventListener('click', login);
        loginCancel.addEventListener('click', hideLoginModal);
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            hideLoginModal();
            showRegisterModal();
        });

        // 注册弹窗事件
        registerConfirmBtn.addEventListener('click', register);
        registerCancel.addEventListener('click', hideRegisterModal);
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            hideRegisterModal();
            showLoginModal();
        });

        // 点击关闭灯箱
        closeLightbox.addEventListener('click', function() {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
            currentAlbumId = null;
            isZoomed = false;
            scale = 1;
            translateX = 0;
            translateY = 0;
            updateImageTransform();
            imageCard.classList.remove('flipped');
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
                currentAlbumId = null;
                isZoomed = false;
                scale = 1;
                translateX = 0;
                translateY = 0;
                updateImageTransform();
                imageCard.classList.remove('flipped');
            }
        });

        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (lightbox.classList.contains('active')) {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    currentAlbumId = null;
                    isZoomed = false;
                    scale = 1;
                    translateX = 0;
                    translateY = 0;
                    updateImageTransform();
                    imageCard.classList.remove('flipped');
                } else if (editModal.classList.contains('active')) {
                    closeEditModal();
                } else if (passwordModal.classList.contains('active')) {
                    passwordModal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                } else if (document.getElementById('announcement-modal').classList.contains('active')) {
                    hideAnnouncementModal();
                } else if (loginModal.classList.contains('active')) {
                    hideLoginModal();
                } else if (registerModal.classList.contains('active')) {
                    hideRegisterModal();
                }
            }
        });

        // 点击弹窗外部关闭弹窗
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });

        passwordModal.addEventListener('click', (e) => {
            if (e.target === passwordModal) {
                passwordModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        document.getElementById('announcement-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('announcement-modal')) {
                hideAnnouncementModal();
            }
        });

        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                hideLoginModal();
            }
        });

        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) {
                hideRegisterModal();
            }
        });
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
            case '/api/register':
                return handleRegister(request, env);
            case '/api/login':
                return handleLogin(request, env);
            case '/api/users':
                return handleGetUsers(env);
            case '/api/make-admin':
                return handleMakeAdmin(request, env);
            case '/api/remove-admin':
                return handleRemoveAdmin(request, env);
            case '/api/delete-user':
                return handleDeleteUser(request, env);
            default:
                return new Response('API Not Found', { status: 404 });
        }
    } catch (error) {
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
        return new Response(JSON.stringify([]), {
            headers: CORS_HEADERS
        });
    }
}

// 上传图片
async function handleUpload(request, env) {
    try {
        const contentType = request.headers.get('content-type') || '';
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
        const metadata = JSON.parse(formData.get('metadata'));
        
        if (!file) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '缺少文件' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }

        // 生成唯一文件名
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
        
        // 上传到R2
        await env.IMAGE_BUCKET.put(fileName, file);
        
        const albumId = Date.now().toString();
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
        
        await env.ALBUM_KV2.put(`album_${albumId}`, JSON.stringify(albumData));
        
        return new Response(JSON.stringify({ 
            success: true, 
            data: albumData 
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
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
        await env.ALBUM_KV2.delete(`album_${id}`);
        
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

        const albumKey = `album_${albumId}`;
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

        const albumKey = `album_${albumId}`;
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

// 用户注册
async function handleRegister(request, env) {
    try {
        const data = await request.json();
        const { username, password } = data;
        
        if (!username || !password) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '用户名和密码不能为空' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }
        
        // 检查用户名是否已存在
        const existingUser = await env.ALBUM_KV2.get(`user_${username}`);
        if (existingUser) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '用户名已存在' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }
        
        // 创建新用户（密码简单存储，实际应该加密）
        const user = {
            username: username,
            password: password, // 实际应该哈希存储
            isAdmin: false,
            createdAt: new Date().toISOString()
        };
        
        await env.ALBUM_KV2.put(`user_${username}`, JSON.stringify(user));
        
        // 不返回密码
        const userResponse = { ...user };
        delete userResponse.password;
        
        return new Response(JSON.stringify({ 
            success: true,
            user: userResponse
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '注册失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}

// 用户登录
async function handleLogin(request, env) {
    try {
        const data = await request.json();
        const { username, password } = data;
        
        if (!username || !password) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '用户名和密码不能为空' 
            }), {
                status: 400,
                headers: CORS_HEADERS
            });
        }
        
        // 获取用户信息
        const userData = await env.ALBUM_KV2.get(`user_${username}`);
        if (!userData) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '用户不存在' 
            }), {
                status: 404,
                headers: CORS_HEADERS
            });
        }
        
        const user = JSON.parse(userData);
        
        // 验证密码
        if (user.password !== password) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '密码错误' 
            }), {
                status: 401,
                headers: CORS_HEADERS
            });
        }
        
        // 不返回密码
        const userResponse = { ...user };
        delete userResponse.password;
        
        return new Response(JSON.stringify({ 
            success: true,
            user: userResponse
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '登录失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}

// 获取所有用户（仅管理员）
async function handleGetUsers(env) {
    try {
        const keys = await env.ALBUM_KV2.list({ prefix: 'user_' });
        const users = [];
        
        for (const key of keys.keys) {
            const value = await env.ALBUM_KV2.get(key.name);
            if (value) {
                const user = JSON.parse(value);
                // 不返回密码
                delete user.password;
                users.push(user);
            }
        }
        
        return new Response(JSON.stringify(users), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify([]), {
            headers: CORS_HEADERS
        });
    }
}

// 设置管理员权限
async function handleMakeAdmin(request, env) {
    try {
        const data = await request.json();
        const { username } = data;
        
        // 获取用户信息
        const userData = await env.ALBUM_KV2.get(`user_${username}`);
        if (!userData) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '用户不存在' 
            }), {
                status: 404,
                headers: CORS_HEADERS
            });
        }
        
        const user = JSON.parse(userData);
        user.isAdmin = true;
        
        await env.ALBUM_KV2.put(`user_${username}`, JSON.stringify(user));
        
        // 不返回密码
        const userResponse = { ...user };
        delete userResponse.password;
        
        return new Response(JSON.stringify({ 
            success: true,
            user: userResponse
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '设置管理员失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}

// 取消管理员权限
async function handleRemoveAdmin(request, env) {
    try {
        const data = await request.json();
        const { username } = data;
        
        // 获取用户信息
        const userData = await env.ALBUM_KV2.get(`user_${username}`);
        if (!userData) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: '用户不存在' 
            }), {
                status: 404,
                headers: CORS_HEADERS
            });
        }
        
        const user = JSON.parse(userData);
        user.isAdmin = false;
        
        await env.ALBUM_KV2.put(`user_${username}`, JSON.stringify(user));
        
        // 不返回密码
        const userResponse = { ...user };
        delete userResponse.password;
        
        return new Response(JSON.stringify({ 
            success: true,
            user: userResponse
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '取消管理员失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}

// 删除用户
async function handleDeleteUser(request, env) {
    try {
        const data = await request.json();
        const { username } = data;
        
        // 删除用户
        await env.ALBUM_KV2.delete(`user_${username}`);
        
        return new Response(JSON.stringify({ 
            success: true,
            message: '用户删除成功' 
        }), {
            headers: CORS_HEADERS
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: '删除用户失败: ' + error.message 
        }), {
            status: 500,
            headers: CORS_HEADERS
        });
    }
}
