// index.js - MoonExtension 入口 v2.2
// 修复：使用 DOM 操作触发角色选择，不再依赖 window.characters

(function() {
  'use strict';

  console.log('MoonExtension v2.2 entry point loaded');

  function checkAllModules() {
    const modules = {
      core: typeof window.moonCore !== 'undefined',
      memory: typeof window.moonMemory !== 'undefined',
      stats: typeof window.moonUI !== 'undefined',
      combat: typeof window.MoonCombat !== 'undefined'
    };

    const allLoaded = Object.values(modules).every(v => v);
    if (allLoaded) {
      console.log('MoonExtension: 所有模块加载完成', modules);
      window.moonExtensionReady = true;

      if (window.eventSource) {
        window.eventSource.dispatchEvent(new CustomEvent('moon_extension_ready'));
      }

      addStartGameButton();
    } else {
      console.log('MoonExtension: 等待模块加载...', modules);
    }
  }

  // 添加"开始游戏"按钮到 SillyTavern 顶部栏
  function addStartGameButton() {
    if (document.getElementById('moon-start-game-btn')) return;

    // 优先查找顶部栏的各种可能选择器
    const selectors = [
      '#top-bar',
      '.top-bar',
      '#top_menu_holder',
      '#sheld > div:first-child',
      'body'
    ];

    let topBar = null;
    for (const sel of selectors) {
      topBar = document.querySelector(sel);
      if (topBar) break;
    }

    if (!topBar) {
      console.warn('MoonExtension: 找不到顶部栏，2秒后重试');
      setTimeout(addStartGameButton, 2000);
      return;
    }

    const btn = document.createElement('div');
    btn.id = 'moon-start-game-btn';
    btn.innerHTML = '🎮 开始游戏';
    btn.style.cssText = 'background:linear-gradient(135deg,#6d28d9,#a855f7);color:#fff;border:none;padding:8px 18px;border-radius:8px;font-size:14px;font-weight:bold;cursor:pointer;margin:4px 8px;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 12px rgba(109,40,217,0.5);transition:transform 0.2s,box-shadow 0.2s;user-select:none;z-index:9999;';
    btn.onmouseenter = () => { btn.style.transform = 'scale(1.05)'; btn.style.boxShadow = '0 4px 20px rgba(109,40,217,0.7)'; };
    btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; btn.style.boxShadow = '0 2px 12px rgba(109,40,217,0.5)'; };
    btn.onclick = startGame;

    // 如果顶部栏是 body，使用 fixed 定位
    if (topBar.tagName === 'BODY') {
      btn.style.position = 'fixed';
      btn.style.top = '10px';
      btn.style.right = '200px';
      document.body.appendChild(btn);
    } else {
      // 否则插入到顶部栏
      const target = topBar.querySelector('#right-nav-panel') || topBar.querySelector('.topBar') || topBar;
      target.appendChild(btn);
    }
    console.log('MoonExtension: 开始游戏按钮已添加到', topBar.tagName || topBar.id);
  }

  // 通过 DOM 操作启动游戏
  async function startGame() {
    console.log('MoonExtension: 开始游戏按钮被点击');

    try {
      // 步骤 1: 打开角色列表
      const charBtn = document.getElementById('rm_button_characters');
      if (charBtn) {
        charBtn.click();
        console.log('MoonExtension: 已打开角色列表');
      } else {
        console.warn('MoonExtension: 找不到角色列表按钮');
      }

      // 等待列表加载
      await new Promise(r => setTimeout(r, 800));

      // 步骤 2: 在角色列表中查找"星之暗面-向导"
      const charList = document.getElementById('rm_print_characters_block');
      if (!charList) {
        throw new Error('找不到角色列表容器');
      }

      let targetChar = null;
      const charItems = charList.querySelectorAll('.character_select');
      for (const item of charItems) {
        const nameEl = item.querySelector('.ch_name');
        if (nameEl && nameEl.textContent.trim() === '星之暗面-向导') {
          targetChar = item;
          break;
        }
      }

      if (!targetChar) {
        // 尝试部分匹配
        for (const item of charItems) {
          const nameEl = item.querySelector('.ch_name');
          if (nameEl && nameEl.textContent.trim().includes('向导')) {
            targetChar = item;
            break;
          }
        }
      }

      if (targetChar) {
        targetChar.click();
        console.log('MoonExtension: 已选择"星之暗面-向导"角色');
      } else {
        throw new Error('在角色列表中找不到"星之暗面-向导"');
      }

      // 等待角色选择完成
      await new Promise(r => setTimeout(r, 600));

      // 步骤 3: 触发"开始新聊天"
      const newChatBtn = document.getElementById('option_start_new_chat');
      if (newChatBtn) {
        newChatBtn.click();
        console.log('MoonExtension: 已触发"开始新聊天"');
      } else {
        // 备用方案：查找其他可能的新聊天按钮
        const altBtns = document.querySelectorAll('[data-i18n="Start new chat"], [title*="new chat"], [title*="New Chat"]');
        if (altBtns.length > 0) {
          altBtns[0].click();
          console.log('MoonExtension: 已点击备用新聊天按钮');
        } else {
          throw new Error('找不到"开始新聊天"按钮');
        }
      }

      console.log('MoonExtension: 游戏启动流程完成！');

    } catch (e) {
      console.error('MoonExtension: 自动启动失败', e);
      alert('自动启动游戏失败：' + e.message + '\n\n请手动操作：\n1. 点击左侧"角色"图标\n2. 找到"星之暗面-向导"\n3. 点击角色\n4. 点击左下角菜单 → "Start new chat"');
    }
  }

  setTimeout(checkAllModules, 500);
  setTimeout(checkAllModules, 1500);
  setTimeout(checkAllModules, 3000);
})();
