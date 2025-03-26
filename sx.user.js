// ==UserScript==
// @name         页面自动刷新
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  带有开始/停止控制的自动刷新脚本
// @author       xuexim
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const REFRESH_DELAY = 1000; // 刷新间隔（毫秒）
    const STORAGE_KEY = 'autoRefreshActive';
    let refreshInterval = null;

    // Toast提示函数
    function showToast(msg, duration = 3000) {
        const existingToast = document.querySelector('.refresh-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'refresh-toast';
        toast.innerHTML = msg;
        toast.style.cssText = `
            font-size: .8rem;
            color: rgb(255, 255, 255);
            background-color: rgba(0, 0, 0, 0.6);
            padding: 50px 150px;
            border-radius: 4px;
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            text-align: center;
            transition: opacity 0.3s;
            z-index: 10000;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // 开始刷新
    function startRefresh() {
        if (refreshInterval) return;

        GM_setValue(STORAGE_KEY, true); // 保存刷新状态
        refreshInterval = setInterval(() => {
            window.location.reload();
        }, REFRESH_DELAY);

        showToast(`已开启自动刷新（${REFRESH_DELAY/1000}秒）`, 2000);
        updateMenu();
    }

    // 停止刷新
    function stopRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
            GM_setValue(STORAGE_KEY, false); // 更新刷新状态
            showToast('已停止自动刷新', 2000);
            updateMenu();
        }
    }

    // 更新菜单
    function updateMenu() {
        // 清除现有菜单
        menuIds.forEach(id => GM_unregisterMenuCommand(id));
        menuIds = [];

        // 根据状态添加新菜单
        if (GM_getValue(STORAGE_KEY, false)) {
            menuIds.push(GM_registerMenuCommand('停止刷新', stopRefresh));
        } else {
            menuIds.push(GM_registerMenuCommand('开始刷新', startRefresh));
        }
    }

    // 初始化
    let menuIds = []; // 存储菜单项ID
    try {
        // 检查保存的状态并恢复
        if (GM_getValue(STORAGE_KEY, false)) {
            refreshInterval = setInterval(() => {
                window.location.reload();
            }, REFRESH_DELAY);
        }
        updateMenu();
    } catch (e) {
        console.error('刷新脚本初始化失败:', e);
        showToast('脚本初始化失败', 3000);
    }

    // 清理
    window.addEventListener('unload', () => {
        if (refreshInterval && !GM_getValue(STORAGE_KEY, false)) {
            clearInterval(refreshInterval);
        }
    });
})();