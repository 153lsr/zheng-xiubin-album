export function getHTML() {
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
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5);
            pointer-events: none;
            padding: 5px 15px;
            border-radius: 20px;
            background: rgba(0,0,0,0.3);
            animation: danmuMove 8s linear forwards;
        }

        @keyframes danmuMove {
            0% {
                right: -300px;
            }
            100% {
                right: calc(100vw + 300px);
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

        /* 编辑故事按钮 */
        .edit-story-btn {
            margin-top: 15px;
            background: linear-gradient(45deg, #FFA500, #FF8C00);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .edit-story-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 140, 0, 0.5);
        }

        /* 编辑故事弹窗 */
        .story-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .story-modal.active {
            opacity: 1;
            pointer-events: all;
        }

        .story-modal-content {
            background: linear-gradient(135deg, #fff9c4 0%, #ffe0b2 100%);
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6);
            border: 3px solid #FFD700;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }

        .story-modal.active .story-modal-content {
            transform: scale(1);
        }

        .story-modal-content h3 {
            color: #E65F5C;
            margin-bottom: 20px;
            font-size: 1.5rem;
            text-align: center;
        }

        .story-textarea {
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

        .story-textarea:focus {
            border-color: #FF8A65;
            box-shadow: 0 0 15px rgba(255, 138, 101, 0.5);
        }

        .story-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
        }

        .story-btn {
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            flex: 1;
        }

        .story-save {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
        }

        .story-cancel {
            background: linear-gradient(45deg, #f44336, #da190b);
            color: white;
        }

        .story-btn:hover {
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

        .batch-preview-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-bottom: 15px;
        }

        .batch-info {
            text-align: center;
            font-size: 1.1rem;
            color: #E65F5C;
            font-weight: bold;
            margin-bottom: 15px;
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

        /* 分页样式 */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin: 30px 0;
            padding: 20px;
        }

        .pagination-btn {
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid #FFA500;
            color: #333;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }

        .pagination-btn:hover:not(:disabled) {
            background: #FFA500;
            color: white;
            transform: translateY(-2px);
        }

        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .pagination-numbers {
            display: flex;
            gap: 5px;
        }

        .pagination-number {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #FFA500;
            color: #333;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .pagination-number:hover {
            background: #FFA500;
            color: white;
        }

        .pagination-number.active {
            background: #FFA500;
            color: white;
            border-color: #FFA500;
        }

        .pagination-info {
            color: #fff;
            font-size: 14px;
            margin-left: 10px;
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
                <p>支持 JPG, PNG, GIF 格式（可多选）</p>
                <input type="file" id="file-input" accept="image/*" multiple>
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

        <!-- 分页按钮 -->
        <div class="pagination" id="pagination" style="display:none;">
            <button class="pagination-btn" id="prev-page" disabled>上一页</button>
            <div class="pagination-numbers" id="pagination-numbers"></div>
            <button class="pagination-btn" id="next-page">下一页</button>
            <span class="pagination-info">第 <span id="current-page-num">1</span> 页 / 共 <span id="total-page-num">1</span> 页</span>
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
                            <button class="edit-story-btn" id="edit-story-btn" style="display:none;">
                                <i class="fas fa-edit"></i> 编辑故事
                            </button>
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

        <!-- 编辑图片故事弹窗 -->
        <div class="story-modal" id="story-modal">
            <div class="story-modal-content">
                <h3><i class="fas fa-book-open"></i> 编辑图片故事</h3>
                <textarea class="story-textarea" id="story-textarea" placeholder="写下这张照片的故事..."></textarea>
                <div class="story-buttons">
                    <button class="story-btn story-cancel" id="story-cancel">取消</button>
                    <button class="story-btn story-save" id="story-save">保存</button>
                </div>
            </div>
        </div>
        
        <!-- 酷炫可爱的上传编辑弹窗 -->
        <div class="edit-modal" id="edit-modal">
            <div class="edit-content">
                <h3>每一次用心编辑都是爱的具象化</h3>
                <div id="batch-preview-container" class="batch-preview-container">
                    <img id="preview-image" class="preview-image" src="" alt="预览图片">
                </div>
                <div id="batch-info" class="batch-info" style="display:none;">
                    <span id="current-upload-index">1</span> / <span id="total-upload-count">1</span>
                </div>
                <form id="edit-form">
                    <div class="edit-form-group">
                        <label for="edit-title"><i class="fas fa-heading"></i> 图片标题:</label>
                        <input type="text" id="edit-title" required placeholder="给这张美美的照片起个名字吧~">
                        <div class="error-message" id="title-error">图片名称已存在,请使用其他名称</div>
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
                            <option value="2026">2026</option>
                            <option value="2025" selected>2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
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
                            <option value="08">8月</option>
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
                        <button type="submit" class="edit-btn edit-save" id="edit-save-btn">
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
        // XSS 防护：HTML 转义函数
        function escapeHtml(text) {
            if (text === null || text === undefined) return '';
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        }

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

        // 随机颜色数组
        const danmuColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D9E5', '#FFB347', '#B19CD9', '#FF6961'
        ];

        // 页面加载完成后初始化

        // ================================
        // UI 事件绑定 & 缺失函数补全
        // ================================

        // 当前弹窗需要密码确认的动作
        let pendingPassword = { type: null, albumId: null };

        function showPasswordModal(type, albumId) {
            pendingPassword = { type: type, albumId: albumId || null };
            passwordInput.value = '';
            if (type === 'delete') {
                passwordAction.textContent = '删除图片需要管理员密码';
            } else if (type === 'announcement') {
                passwordAction.textContent = '编辑公告需要公告密码';
            } else {
                passwordAction.textContent = '请输入密码以继续';
            }
            passwordModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            passwordInput.focus();
        }

        function hidePasswordModal() {
            passwordModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            pendingPassword = { type: null, albumId: null };
        }

        async function deleteAlbum(albumId, password) {
            if (!albumId) return;
            try {
                const resp = await fetch('/api/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: albumId, password: password })
                });
                const json = await resp.json().catch(function() { return null; });
                if (!resp.ok || !json || !json.success) {
                    const msg = (json && json.error) ? json.error : ('删除失败（HTTP ' + resp.status + '）');
                    throw new Error(msg);
                }
                await loadAlbums(currentPage);
                // 如果正在筛选，重新应用筛选
                if (isFiltering) {
                    applyFilters();
                } else {
                    renderAlbums();
                }
                alert('删除成功');
            } catch (err) {
                alert('删除失败：' + String(err && err.message ? err.message : err));
            }
        }

        function showAnnouncementModal() {
            const modal = document.getElementById('announcement-modal');
            if (!modal) return;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function hideAnnouncementModal() {
            const modal = document.getElementById('announcement-modal');
            if (!modal) return;
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        async function saveAnnouncement(password) {
            const textEl = document.getElementById('announcement-textarea');
            if (!textEl) return;

            const content = String(textEl.value || '').trim();
            try {
                const resp = await fetch('/api/announcement', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: content, password: password })
                });
                const json = await resp.json().catch(function() { return null; });
                if (!resp.ok || !json || !json.success) {
                    const msg = (json && json.error) ? json.error : ('保存失败（HTTP ' + resp.status + '）');
                    throw new Error(msg);
                }

                await loadAnnouncement();
                hideAnnouncementModal();
                alert('公告已更新');
            } catch (err) {
                alert('保存公告失败：' + String(err && err.message ? err.message : err));
            }
        }

        // 批量上传相关变量
        let batchFiles = [];
        let currentBatchIndex = 0;

        function openEditModal(files) {
            if (!files || files.length === 0) return;

            // 转换为数组
            batchFiles = Array.from(files);
            currentBatchIndex = 0;

            // 显示批量信息
            const batchInfo = document.getElementById('batch-info');
            const currentIndex = document.getElementById('current-upload-index');
            const totalCount = document.getElementById('total-upload-count');

            if (batchFiles.length > 1) {
                batchInfo.style.display = 'block';
                totalCount.textContent = batchFiles.length;
            } else {
                batchInfo.style.display = 'none';
            }

            // 显示第一张图片
            showCurrentFile();

            editModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function showCurrentFile() {
            if (currentBatchIndex >= batchFiles.length) return;

            const file = batchFiles[currentBatchIndex];
            tempUploadFile = file;

            // 预览
            const preview = document.getElementById('preview-image');
            if (preview) preview.src = URL.createObjectURL(file);

            // 默认标题（去掉扩展名）
            const baseName = String(file.name || '').replace(/\.[^.]+$/, '');
            editTitle.value = baseName;
            editDesc.value = '';

            // 默认：生活照、当前年月
            const now = new Date();
            editCategory.value = 'candid';
            editYear.value = String(now.getFullYear());
            editMonth.value = String(now.getMonth() + 1).padStart(2, '0');

            titleError.style.display = 'none';
            uploadError.textContent = '';
            progressBar.style.width = '0%';

            // 更新批量索引显示
            const currentIndexEl = document.getElementById('current-upload-index');
            if (currentIndexEl) currentIndexEl.textContent = currentBatchIndex + 1;

            // 更新按钮文字
            const saveBtn = document.getElementById('edit-save-btn');
            if (saveBtn) {
                if (currentBatchIndex < batchFiles.length - 1) {
                    saveBtn.innerHTML = '<i class="fas fa-arrow-right"></i> 保存并继续';
                } else {
                    saveBtn.innerHTML = '<i class="fas fa-heart"></i> 保存';
                }
            }
        }

        function closeEditModal() {
            editModal.classList.remove('active');
            document.body.style.overflow = 'auto';

            tempUploadFile = null;
            batchFiles = [];
            currentBatchIndex = 0;
            fileInput.value = '';
            progressBar.style.width = '0%';
        }

        // 筛选状态
        let isFiltering = false;

        async function applyFilters() {
            const cat = categoryFilter.value;
            const year = yearFilter.value;
            const month = monthFilter.value;

            // 如果有筛选条件，需要加载全部数据
            if (cat !== 'all' || year !== 'all' || month !== 'all') {
                isFiltering = true;
                // 加载全部数据用于筛选
                try {
                    const response = await fetch('/api/albums?page=1&limit=10000');
                    if (response.ok) {
                        const data = await response.json();
                        albums = data.albums;
                    }
                } catch (e) {
                    console.error('加载数据失败:', e);
                }
            } else {
                // 重置筛选，恢复分页加载
                isFiltering = false;
                currentPage = 1;
                await loadAlbums(1);
                renderAlbums();
                return;
            }

            const filtered = albums.filter(function(a) {
                const d = new Date(a.date);
                const y = String(d.getFullYear());
                const m = String(d.getMonth() + 1).padStart(2, '0');

                if (cat !== 'all' && a.category !== cat) return false;
                if (year !== 'all' && y !== year) return false;
                if (month !== 'all' && m !== month) return false;
                return true;
            });

            // 筛选时隐藏分页
            const pagination = document.getElementById('pagination');
            if (pagination) pagination.style.display = 'none';

            renderAlbums(filtered);
        }

        function bindUIEvents() {
            // 筛选按钮
            applyFilterBtn.addEventListener('click', applyFilters);
            resetFilterBtn.addEventListener('click', function() {
                categoryFilter.value = 'all';
                yearFilter.value = 'all';
                monthFilter.value = 'all';
                applyFilters();
            });

            // 上传区域：点击/拖拽
            uploadArea.addEventListener('click', function() { fileInput.click(); });

            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', function() { uploadArea.classList.remove('dragover'); });
            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
                if (files && files.length > 0) openEditModal(files);
            });

            fileInput.addEventListener('change', function() {
                const files = fileInput.files;
                if (files && files.length > 0) openEditModal(files);
            });

            uploadBtn.addEventListener('click', function() { fileInput.click(); });

            // 编辑弹窗：取消、点击遮罩
            editCancel.addEventListener('click', closeEditModal);
            editModal.addEventListener('click', function(e) {
                if (e.target === editModal) {
                    closeEditModal();
                    closeLightboxUI();
                }
            });

            // 密码弹窗：取消/确认
            passwordCancel.addEventListener('click', hidePasswordModal);
            passwordModal.addEventListener('click', function(e) { if (e.target === passwordModal) hidePasswordModal(); });

            passwordConfirm.addEventListener('click', async function() {
                const pwd = passwordInput.value.trim();
                if (!pendingPassword.type) return hidePasswordModal();

                const type = pendingPassword.type;
                const id = pendingPassword.albumId;
                hidePasswordModal();

                // 密码验证交给后端处理
                if (type === 'delete') {
                    await deleteAlbum(id, pwd);
                }
                if (type === 'announcement') {
                    // 保存密码用于后续保存公告时使用
                    window._announcementPassword = pwd;
                    showAnnouncementModal();
                }
            });

            // 公告浮层：关闭/编辑
            const announcementFloat = document.getElementById('announcement-float');
            const closeAnnouncementBtn = document.getElementById('close-announcement-btn');
            const editAnnouncementBtn = document.getElementById('edit-announcement-btn');

            if (closeAnnouncementBtn && announcementFloat) {
                closeAnnouncementBtn.addEventListener('click', function() {
                    announcementFloat.style.display = 'none';
                });
            }

            if (editAnnouncementBtn) {
                editAnnouncementBtn.addEventListener('click', function() {
                    // 需要公告密码（避免把密码逻辑暴露在按钮逻辑中）
                    showPasswordModal('announcement', null);
                });
            }

            // 公告编辑弹窗：保存/取消/遮罩
            const annSave = document.getElementById('announcement-save');
            const annCancel = document.getElementById('announcement-cancel');
            const annModal = document.getElementById('announcement-modal');

            if (annSave) annSave.addEventListener('click', function() {
                const pwd = window._announcementPassword || '';
                saveAnnouncement(pwd);
                window._announcementPassword = '';
            });
            if (annCancel) annCancel.addEventListener('click', hideAnnouncementModal);
            if (annModal) annModal.addEventListener('click', function(e) { if (e.target === annModal) hideAnnouncementModal(); });

            // 编辑故事弹窗相关
            const storyModal = document.getElementById('story-modal');
            const storyTextarea = document.getElementById('story-textarea');
            const storySaveBtn = document.getElementById('story-save');
            const storyCancelBtn = document.getElementById('story-cancel');
            const editStoryBtn = document.getElementById('edit-story-btn');

            if (editStoryBtn) editStoryBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                openStoryModal();
            });
            if (storySaveBtn) storySaveBtn.addEventListener('click', saveStory);
            if (storyCancelBtn) storyCancelBtn.addEventListener('click', closeStoryModal);
            if (storyModal) storyModal.addEventListener('click', function(e) {
                if (e.target === storyModal) closeStoryModal();
            });

// Lightbox：关闭/上一张/下一张/点赞/弹幕
if (closeLightbox) closeLightbox.addEventListener('click', closeLightboxUI);
if (lightbox) lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightboxUI(); });

if (prevBtn) prevBtn.addEventListener('click', function() {
    if (!albums || !albums.length) return;
    currentIndex = (currentIndex - 1 + albums.length) % albums.length;
    openLightbox(albums[currentIndex]);
});

if (nextBtn) nextBtn.addEventListener('click', function() {
    if (!albums || !albums.length) return;
    currentIndex = (currentIndex + 1) % albums.length;
    openLightbox(albums[currentIndex]);
});

if (likeBtn) likeBtn.addEventListener('click', handleLikeClick);
if (toggleDanmuBtn) toggleDanmuBtn.addEventListener('click', toggleDanmu);
if (danmuSubmit) danmuSubmit.addEventListener('click', sendDanmu);
if (danmuInput) danmuInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendDanmu();
    }
});

// 图片卡片：点击翻面（看“故事”）
if (imageCard) imageCard.addEventListener('click', function() {
    imageCard.classList.toggle('flipped');
});

// 登录弹窗：确认/取消/回车/遮罩
if (loginConfirm) loginConfirm.addEventListener('click', login);
if (loginCancel) loginCancel.addEventListener('click', hideLoginModal);
if (loginModal) loginModal.addEventListener('click', function(e) { if (e.target === loginModal) hideLoginModal(); });
if (loginPassword) loginPassword.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        login();
    }
});


            // ESC 关闭所有弹窗
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    hidePasswordModal();
                    hideAnnouncementModal();
                    closeEditModal();
                    closeLightboxUI();
                }
            });

            // 改进的上传表单提交函数（支持批量上传）
            if (editForm) {
                editForm.addEventListener('submit', async function(e) {
                    e.preventDefault();

                    if (!tempUploadFile) return;

                    const title = editTitle.value.trim();

                    // 检查名称是否已存在
                    if (isTitleExists(title)) {
                        titleError.style.display = 'block';
                        return;
                    }

                    // 检查是否有上传权限（需要管理员密码）
                    if (!window._batchUploadPassword) {
                        window._batchUploadPassword = window._adminPassword || prompt('请输入上传密码：');
                    }
                    if (!window._batchUploadPassword) {
                        alert('需要密码才能上传');
                        return;
                    }

                    // 隐藏错误提示
                    titleError.style.display = 'none';
                    uploadError.style.display = 'none';

                    // 获取年月
                    const year = editYear.value;
                    const month = editMonth.value;
                    const day = new Date().getDate().toString().padStart(2, '0');
                    const dateStr = year + '-' + month + '-' + day;

                    // 准备上传数据
                    const formData = new FormData();
                    formData.append('file', tempUploadFile);
                    formData.append('password', window._batchUploadPassword);
                    formData.append('metadata', JSON.stringify({
                        title: title || "未命名图片",
                        desc: editDesc.value || "",
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

                        // 尝试解析JSON
                        let result;
                        try {
                            result = await response.json();
                        } catch (jsonError) {
                            const textResponse = await response.text();
                            console.error('非JSON响应:', textResponse);
                            throw new Error('服务器返回了无效的响应格式');
                        }

                        if (result.success) {
                            progressBar.style.width = "100%";

                            // 添加到相册数组开头
                            albums.unshift(result.data);

                            // 检查是否还有更多文件要上传
                            currentBatchIndex++;
                            if (currentBatchIndex < batchFiles.length) {
                                // 继续下一张
                                setTimeout(() => {
                                    showCurrentFile();
                                }, 300);
                            } else {
                                // 全部上传完成
                                window._batchUploadPassword = null;
                                closeEditModal();

                                // 重置分页状态并重新加载
                                currentPage = 1;
                                isFiltering = false;
                                await loadAlbums(1);
                                renderAlbums();

                                // 显示成功提示
                                const count = batchFiles.length;
                                setTimeout(() => {
                                    alert(count > 1 ? '成功上传 ' + count + ' 张图片！' : '图片上传成功！');
                                }, 300);
                            }
                        } else {
                            // 密码错误时清除保存的密码，让用户可以重新输入
                            if (result.error && result.error.includes('密码')) {
                                window._batchUploadPassword = null;
                            }
                            throw new Error(result.error || '上传失败');
                        }
                    } catch (error) {
                        console.error('上传失败:', error);
                        uploadError.textContent = '上传失败：' + error.message;
                        uploadError.style.display = 'block';
                        progressBar.style.width = "0%";
                    }
                });
            }
        }


        document.addEventListener('DOMContentLoaded', async function() {
            // 绑定页面事件（只需一次）
            bindUIEvents();

            // 初始化登录状态显示
            updateLoginDisplay();

            // 加载相册和公告数据
            await loadAlbums();
            await loadAnnouncement();

            // 渲染相册
            renderAlbums();

            // 绑定分页按钮事件
            bindPaginationEvents();
        });

        // 分页状态
        let currentPage = 1;
        let totalPages = 1;
        let totalAlbums = 0;
        let isLoading = false;
        const PAGE_SIZE = 20;

        // 加载相册数据（支持分页）
        async function loadAlbums(page = 1) {
            if (isLoading) return;
            isLoading = true;

            try {
                const response = await fetch('/api/albums?page=' + page + '&limit=' + PAGE_SIZE);
                if (response.ok) {
                    const data = await response.json();
                    albums = data.albums;
                    totalAlbums = data.total || 0;
                    totalPages = Math.ceil(totalAlbums / PAGE_SIZE) || 1;
                    currentPage = page;

                    // 显示分页按钮
                    renderPagination();
                } else {
                    console.error('加载相册失败:', response.status);
                    albums = [];
                    totalAlbums = 0;
                    totalPages = 1;
                }
            } catch (error) {
                console.error('加载相册失败:', error);
                albums = [];
                totalAlbums = 0;
                totalPages = 1;
            } finally {
                isLoading = false;
            }
        }

        // 渲染分页按钮
        function renderPagination() {
            const pagination = document.getElementById('pagination');
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');
            const numbersContainer = document.getElementById('pagination-numbers');
            const currentPageNum = document.getElementById('current-page-num');
            const totalPagesNum = document.getElementById('total-page-num');

            if (!pagination) return;

            // 如果没有数据或只有一页，隐藏分页
            if (totalAlbums <= PAGE_SIZE) {
                pagination.style.display = 'none';
                return;
            }

            pagination.style.display = 'flex';

            // 更新页码信息
            currentPageNum.textContent = currentPage;
            totalPagesNum.textContent = totalPages;

            // 更新按钮状态
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;

            // 生成页码按钮
            numbersContainer.innerHTML = '';
            const maxButtons = 5; // 最多显示5个页码按钮

            let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
            let endPage = Math.min(totalPages, startPage + maxButtons - 1);

            if (endPage - startPage < maxButtons - 1) {
                startPage = Math.max(1, endPage - maxButtons + 1);
            }

            // 第一页
            if (startPage > 1) {
                addPageNumber(numbersContainer, 1);
                if (startPage > 2) {
                    addEllipsis(numbersContainer);
                }
            }

            // 中间页码
            for (let i = startPage; i <= endPage; i++) {
                addPageNumber(numbersContainer, i);
            }

            // 最后一页
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    addEllipsis(numbersContainer);
                }
                addPageNumber(numbersContainer, totalPages);
            }
        }

        function addPageNumber(container, pageNum) {
            const btn = document.createElement('button');
            btn.className = 'pagination-number' + (pageNum === currentPage ? ' active' : '');
            btn.textContent = pageNum;
            btn.addEventListener('click', () => goToPage(pageNum));
            container.appendChild(btn);
        }

        function addEllipsis(container) {
            const span = document.createElement('span');
            span.className = 'pagination-ellipsis';
            span.textContent = '...';
            span.style.color = '#fff';
            span.style.padding = '0 5px';
            container.appendChild(span);
        }

        // 跳转到指定页面
        async function goToPage(page) {
            if (page < 1 || page > totalPages || page === currentPage || isLoading) return;
            await loadAlbums(page);
            renderAlbums();
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 绑定分页按钮事件
        function bindPaginationEvents() {
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
            }
        }

        // 加载公告数据
        async function loadAnnouncement() {
            try {
                const response = await fetch('/api/announcement');
                if (response.ok) {
                    const data = await response.json();
                    announcementContent = data.content;
                    // 使用 textContent 防止 XSS
                    document.getElementById('announcement-content').textContent = announcementContent;
                }
            } catch (error) {
                console.error('加载公告失败:', error);
            }
        }

        // 更新登录显示
        function updateLoginDisplay() {
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
                document.getElementById('logout-btn').addEventListener('click', logout);
            } else {
                loginSection.innerHTML = \`
                    <button class="login-btn" id="login-btn" title="管理员登录">
                        <i class="fas fa-user-lock"></i>
                    </button>
                \`;
                document.getElementById('login-btn').addEventListener('click', showLoginModal);
            }
        }

        // 显示登录弹窗
        function showLoginModal() {
            loginPassword.value = '';
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // 隐藏登录弹窗
        function hideLoginModal() {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // 登录（通过后端验证）
        async function login() {
            const password = loginPassword.value.trim();
            if (!password) {
                alert('请输入密码');
                return;
            }

            // 尝试通过后端验证密码（使用删除 API 测试密码是否正确）
            try {
                const resp = await fetch('/api/verify-admin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: password })
                });
                const json = await resp.json().catch(function() { return null; });

                if (resp.ok && json && json.success) {
                    isAdmin = true;
                    window._adminPassword = password; // 保存密码用于后续操作
                    hideLoginModal();
                    updateLoginDisplay();
                    alert('管理员登录成功！');
                } else {
                    alert('密码错误！');
                    loginPassword.value = '';
                    loginPassword.focus();
                }
            } catch (err) {
                alert('登录失败：' + (err.message || err));
            }
        }

        // 登出
        function logout() {
            isAdmin = false;
            window._adminPassword = '';
            updateLoginDisplay();
            alert('已退出管理员账户');
        }

        // 翻转头像卡片
        profileCard.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });

        // 渲染相册（支持追加模式和懒加载）
        function renderAlbums(filteredAlbums = albums, append = false) {
            if (!append) {
                gallery.innerHTML = '';
            }

            if (filteredAlbums.length === 0 && !append) {
                gallery.innerHTML = '<div class="loading">暂无相册数据</div>';
                return;
            }

            // 如果是追加模式，只渲染新增的部分
            const startIndex = append ? gallery.querySelectorAll('.album-item').length : 0;
            const albumsToRender = append ? filteredAlbums.slice(startIndex) : filteredAlbums;

            albumsToRender.forEach((album, index) => {
                const albumItem = document.createElement('div');
                albumItem.className = 'album-item';
                albumItem.style.setProperty('--delay', index);

                // 格式化日期显示
                const dateObj = new Date(album.date);
                const formattedDate =
                    dateObj.getFullYear() + "年" +
                    (dateObj.getMonth() + 1) + "月" +
                    dateObj.getDate() + "日";

                // 使用 escapeHtml 转义用户输入防止 XSS
                // 使用 loading="lazy" 实现原生懒加载
                albumItem.innerHTML =
                    '<img class="album-img" src="' + escapeHtml(album.img) + '" alt="' + escapeHtml(album.title) + '" data-id="' + escapeHtml(album.id) + '" loading="lazy">' +
                    '<div class="album-overlay">' +
                        '<h3 class="album-title">' + escapeHtml(album.title) + '</h3>' +
                        '<p class="album-desc">' + escapeHtml(album.desc) + '</p>' +
                        '<div class="album-meta">' +
                            '<span><i class="fas fa-heart"></i> ' + (album.likes || 0) + '</span>' +
                            '<span><i class="fas fa-comment"></i> ' + (album.comments ? album.comments.length : 0) + '</span>' +
                        '</div>' +
                        '<div class="album-date">' + escapeHtml(formattedDate) + '</div>' +
                    '</div>' +
                    '<button class="delete-btn" data-id="' + escapeHtml(album.id) + '"><i class="fas fa-trash"></i></button>';


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

                // 删除按钮事件处理
                const deleteBtn = albumItem.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isAdmin && window._adminPassword) {
                        // 管理员使用登录时的密码
                        deleteAlbum(album.id, window._adminPassword);
                    } else {
                        // 普通用户需要输入密码
                        showPasswordModal('delete', album.id);
                    }
                });

                gallery.appendChild(albumItem);
            });

            // 延迟添加visible类以触发动画
            setTimeout(() => {
                document.querySelectorAll('.album-item:not(.visible)').forEach(item => {
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
                imageStory.textContent = album.desc;
                imageStory.classList.remove('empty-story');
            } else {
                imageStory.textContent = "秀斌也有自己的小秘密~";
                imageStory.classList.add('empty-story');
            }

            // 显示/隐藏编辑故事按钮（仅管理员可见）
            const editStoryBtn = document.getElementById('edit-story-btn');
            if (editStoryBtn) {
                editStoryBtn.style.display = isAdmin ? 'inline-block' : 'none';
            }

            // 清空弹幕容器
            danmuContainer.innerHTML = '';

            // 加载已有评论作为弹幕显示
            if (album.comments && album.comments.length > 0) {
                album.comments.forEach(function(comment, index) {
                    setTimeout(function() {
                        if (!danmuContainer) return;
                        const item = document.createElement('div');
                        item.className = 'danmu-item';
                        item.textContent = comment.text || '';
                        const randomColor = danmuColors[Math.floor(Math.random() * danmuColors.length)];
                        item.style.color = randomColor;
                        item.style.top = (5 + Math.floor(Math.random() * 70)) + '%';
                        const duration = 6 + Math.random() * 4;
                        item.style.animationDuration = duration + 's';
                        danmuContainer.appendChild(item);
                        item.addEventListener('animationend', function() {
                            if (item && item.parentNode) item.parentNode.removeChild(item);
                        });
                    }, index * 800); // 每条弹幕间隔800ms依次出现
                });
            }

            // 更新点赞信息
            updateLikeInfo(album);

            // 显示弹幕（如果之前被隐藏）
            danmuVisible = true;
            updateToggleDanmuButton();

            // 设置当前索引
            currentIndex = albums.findIndex(a => a.id === album.id);
        }


// ===== Lightbox / 弹幕 / 点赞：缺失的辅助函数（保证按钮有响应） =====
function closeLightboxUI() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updateLikeInfo(album) {
    if (!album) return;
    if (likeCount) likeCount.textContent = String(album.likes || 0);
    if (likeBtn) {
        // 仅做前端态展示：liked 表示本地已点过赞（不影响后端累计）
        if (album.liked) likeBtn.classList.add('liked');
        else likeBtn.classList.remove('liked');
    }
}

function updateToggleDanmuButton() {
    if (!toggleDanmuBtn) return;
    toggleDanmuBtn.textContent = danmuVisible ? '隐藏弹幕' : '显示弹幕';
}

function toggleDanmu() {
    danmuVisible = !danmuVisible;
    if (danmuContainer) danmuContainer.style.display = danmuVisible ? 'block' : 'none';
    updateToggleDanmuButton();
}

async function handleLikeClick() {
    const album = albums[currentIndex];
    if (!album) return;

    // 本地 UI 立即反馈
    album.liked = !album.liked;
    album.likes = (album.likes || 0) + (album.liked ? 1 : -1);
    if (album.likes < 0) album.likes = 0;
    updateLikeInfo(album);

    // 尝试写回后端（失败也不阻塞 UI）
    try {
        await fetch('/api/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ albumId: album.id })
        });
    } catch (e) {}
}

// ===== 编辑图片故事功能 =====
function openStoryModal() {
    if (!currentAlbumId) return;

    const storyModal = document.getElementById('story-modal');
    const storyTextarea = document.getElementById('story-textarea');

    // 获取当前图片的描述
    const album = albums.find(a => a.id === currentAlbumId);
    if (storyTextarea) {
        storyTextarea.value = album && album.desc ? album.desc : '';
    }

    if (storyModal) storyModal.classList.add('active');
}

function closeStoryModal() {
    const storyModal = document.getElementById('story-modal');
    if (storyModal) storyModal.classList.remove('active');
}

async function saveStory() {
    if (!currentAlbumId || !window._adminPassword) {
        alert('需要管理员权限');
        return;
    }

    const storyTextarea = document.getElementById('story-textarea');
    const newDesc = storyTextarea ? storyTextarea.value.trim() : '';

    try {
        const response = await fetch('/api/update-story', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentAlbumId,
                desc: newDesc,
                password: window._adminPassword
            })
        });

        const result = await response.json();
        if (result.success) {
            // 更新本地数据
            const album = albums.find(a => a.id === currentAlbumId);
            if (album) album.desc = newDesc;

            // 更新显示
            if (imageStory) {
                if (newDesc) {
                    imageStory.textContent = newDesc;
                    imageStory.classList.remove('empty-story');
                } else {
                    imageStory.textContent = "秀斌也有自己的小秘密~";
                    imageStory.classList.add('empty-story');
                }
            }

            closeStoryModal();
            alert('故事已更新！');
        } else {
            throw new Error(result.error || '保存失败');
        }
    } catch (error) {
        alert('保存失败：' + error.message);
    }
}

async function sendDanmu() {
    const txt = (danmuInput && danmuInput.value) ? danmuInput.value.trim() : '';
    if (!txt) return;

    if (danmuInput) danmuInput.value = '';

    // 先本地展示一条弹幕
    if (danmuContainer) {
        const item = document.createElement('div');
        item.className = 'danmu-item';
        item.textContent = txt;

        // 随机颜色
        const randomColor = danmuColors[Math.floor(Math.random() * danmuColors.length)];
        item.style.color = randomColor;

        // 随机高度（避免重叠）
        item.style.top = (5 + Math.floor(Math.random() * 70)) + '%';

        // 随机速度（6-10秒）
        const duration = 6 + Math.random() * 4;
        item.style.animationDuration = duration + 's';

        danmuContainer.appendChild(item);

        // 动画结束后移除
        item.addEventListener('animationend', function() {
            if (item && item.parentNode) item.parentNode.removeChild(item);
        });
    }

    // 写入后端评论
    try {
        await fetch('/api/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                albumId: currentAlbumId,
                comment: {
                    author: isAdmin ? '管理员' : '匿名用户',
                    text: txt,
                    time: new Date().toLocaleString('zh-CN')
                }
            })
        });
    } catch (e) {}
}

        // 更新图片变换
        function updateImageTransform() {
            lightboxImg.style.transform = 'scale(' + scale + ') translate(' + translateX + 'px, ' + translateY + 'px)';
        }

        // ... 其他JavaScript函数保持不变 ...


function isTitleExists(title) {
    if (!title) return false;
    const t = String(title).trim();
    return albums.some(function(a) { return a && a.title && String(a.title).trim() === t; });
}

        // ... 其他函数保持不变 ...
    </script>
</body>
</html>`;
}
