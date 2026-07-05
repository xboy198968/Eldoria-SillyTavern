// index.js - MoonExtension 入口 v3.0
// 新增：种族选择器，支持快速开始和向导模式

(function() {
  'use strict';

  console.log('MoonExtension v3.0 entry point loaded');

  // 种族配置
  const RACES = [
    { id: '人类', name: '人类', card: '玩家-人类.png', icon: '👤', color: '#4a90d9',
      desc: '适应之道，魅力50/繁育50，新手首选' },
    { id: '精灵', name: '精灵', card: '玩家_精灵.png', icon: '🧝', color: '#5cb85c',
      desc: '魅力至上，魅力90/繁育30，精品路线' },
    { id: '哥布林', name: '哥布林', card: '玩家-哥布林.png', icon: '👺', color: '#5cb85c',
      desc: '数量为王，魅力35/繁育85，快速繁衍' },
    { id: '吸血鬼', name: '吸血鬼', card: '玩家_吸血鬼.png', icon: '🧛', color: '#8b0000',
      desc: '永恒之血，魅力80/繁育45，血之契约' },
    { id: '牛头人', name: '牛头人', card: '玩家-牛头人.png', icon: '🐂', color: '#d2691e',
      desc: '力量征服，魅力45/繁育70，NTR之道' }
  ];

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
    }
    // v3.0: 无论模块是否加载，都显示按钮
    addStartGameButton();
  }

  // 添加"开始游戏"按钮到 SillyTavern 顶部栏
  function addStartGameButton() {
    if (document.getElementById('moon-start-game-btn')) return;

    const selectors = ['#top-bar', '.top-bar', '#top_menu_holder', '#sheld > div:first-child', 'body'];
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
    btn.onclick = showGameMenu;

    if (topBar.tagName === 'BODY') {
      btn.style.position = 'fixed';
      btn.style.top = '10px';
      btn.style.right = '200px';
      document.body.appendChild(btn);
    } else {
      const target = topBar.querySelector('#right-nav-panel') || topBar.querySelector('.topBar') || topBar;
      target.appendChild(btn);
    }
    console.log('MoonExtension: 开始游戏按钮已添加');
  }

  // 显示游戏菜单（快速开始 / 向导模式）
  function showGameMenu() {
    // 移除已存在的菜单
    const existing = document.getElementById('moon-game-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'moon-game-menu';
    menu.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;';

    const content = document.createElement('div');
    content.style.cssText = 'background:linear-gradient(180deg,#1a1a2e,#16213e);border:2px solid #6d28d9;border-radius:16px;padding:32px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 0 40px rgba(109,40,217,0.4);color:#fff;';

    // 标题
    const title = document.createElement('h2');
    title.innerHTML = '☽ 星之暗面 ☽';
    title.style.cssText = 'text-align:center;margin:0 0 8px 0;font-size:28px;background:linear-gradient(90deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;';
    content.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = '选择你的游戏方式';
    subtitle.style.cssText = 'text-align:center;color:#aaa;margin:0 0 24px 0;font-size:14px;';
    content.appendChild(subtitle);

    // 快速开始按钮
    const quickStartBtn = createModeButton('⚡ 快速开始', '直接选择种族，立即进入冒险', '#f59e0b');
    quickStartBtn.onclick = () => { menu.remove(); showRaceSelector(); };
    content.appendChild(quickStartBtn);

    // 向导模式按钮
    const guideBtn = createModeButton('🧙 向导模式', '通过对话与向导互动，体验完整引导', '#6d28d9');
    guideBtn.onclick = () => { menu.remove(); startGuideMode(); };
    content.appendChild(guideBtn);

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '取消';
    closeBtn.style.cssText = 'width:100%;margin-top:16px;padding:10px;background:#333;color:#aaa;border:1px solid #444;border-radius:8px;cursor:pointer;font-size:14px;transition:all 0.2s;';
    closeBtn.onmouseenter = () => { closeBtn.style.background = '#444'; };
    closeBtn.onmouseleave = () => { closeBtn.style.background = '#333'; };
    closeBtn.onclick = () => menu.remove();
    content.appendChild(closeBtn);

    menu.appendChild(content);
    document.body.appendChild(menu);
  }

  function createModeButton(title, desc, color) {
    const btn = document.createElement('button');
    btn.style.cssText = `width:100%;margin-bottom:12px;padding:16px;background:linear-gradient(135deg,${color}22,${color}11);border:2px solid ${color}66;border-radius:12px;cursor:pointer;text-align:left;transition:all 0.2s;color:#fff;`;
    btn.onmouseenter = () => { btn.style.borderColor = color; btn.style.transform = 'translateX(4px)'; };
    btn.onmouseleave = () => { btn.style.borderColor = color + '66'; btn.style.transform = 'translateX(0)'; };
    btn.innerHTML = `<div style="font-size:18px;font-weight:bold;margin-bottom:4px;">${title}</div><div style="font-size:13px;color:#aaa;">${desc}</div>`;
    return btn;
  }

  // 显示种族选择器
  function showRaceSelector() {
    const menu = document.createElement('div');
    menu.id = 'moon-race-selector';
    menu.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;';

    const content = document.createElement('div');
    content.style.cssText = 'background:linear-gradient(180deg,#1a1a2e,#16213e);border:2px solid #6d28d9;border-radius:16px;padding:32px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 0 40px rgba(109,40,217,0.4);color:#fff;';

    const title = document.createElement('h2');
    title.innerHTML = '⚡ 快速开始 — 选择种族';
    title.style.cssText = 'text-align:center;margin:0 0 8px 0;font-size:24px;color:#f59e0b;';
    content.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = '选择后将直接进入冒险，跳过向导引导';
    subtitle.style.cssText = 'text-align:center;color:#aaa;margin:0 0 20px 0;font-size:13px;';
    content.appendChild(subtitle);

    // 种族卡片网格
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:16px;';

    RACES.forEach(race => {
      const card = document.createElement('button');
      card.style.cssText = `background:linear-gradient(180deg,${race.color}22,transparent);border:2px solid ${race.color}44;border-radius:12px;padding:16px;cursor:pointer;text-align:center;transition:all 0.2s;color:#fff;`;
      card.onmouseenter = () => { card.style.borderColor = race.color; card.style.transform = 'scale(1.03)'; };
      card.onmouseleave = () => { card.style.borderColor = race.color + '44'; card.style.transform = 'scale(1)'; };
      card.innerHTML = `<div style="font-size:32px;margin-bottom:8px;">${race.icon}</div><div style="font-size:16px;font-weight:bold;margin-bottom:4px;">${race.name}</div><div style="font-size:11px;color:#aaa;line-height:1.4;">${race.desc}</div>`;
      card.onclick = () => { menu.remove(); startAdventure(race); };
      grid.appendChild(card);
    });

    content.appendChild(grid);

    // 返回按钮
    const backBtn = document.createElement('button');
    backBtn.textContent = '← 返回';
    backBtn.style.cssText = 'width:100%;padding:10px;background:#333;color:#aaa;border:1px solid #444;border-radius:8px;cursor:pointer;font-size:14px;transition:all 0.2s;';
    backBtn.onmouseenter = () => { backBtn.style.background = '#444'; };
    backBtn.onmouseleave = () => { backBtn.style.background = '#333'; };
    backBtn.onclick = () => { menu.remove(); showGameMenu(); };
    content.appendChild(backBtn);

    menu.appendChild(content);
    document.body.appendChild(menu);
  }

  // 启动冒险：切换到对应玩家角色并开始新聊天
  async function startAdventure(race) {
    console.log('MoonExtension: 启动冒险，种族=', race.name);
    showToast(`正在启动 ${race.name} 冒险...`, race.color);

    try {
      // 步骤1: 打开角色列表
      const charBtn = document.getElementById('rm_button_characters');
      if (charBtn) charBtn.click();
      await new Promise(r => setTimeout(r, 800));

      // 步骤2: 查找目标角色
      const charList = document.getElementById('rm_print_characters_block');
      if (!charList) throw new Error('找不到角色列表');

      const charItems = charList.querySelectorAll('.character_select');
      let targetChar = null;

      // 先精确匹配文件名
      for (const item of charItems) {
        const nameEl = item.querySelector('.ch_name');
        if (!nameEl) continue;
        const text = nameEl.textContent.trim();
        // 匹配角色卡名称（去掉.png后缀）
        const cardName = race.card.replace('.png', '');
        if (text === cardName || text === race.name || text.includes(race.name)) {
          targetChar = item;
          break;
        }
      }

      if (!targetChar) {
        // 模糊匹配
        for (const item of charItems) {
          const nameEl = item.querySelector('.ch_name');
          if (nameEl && nameEl.textContent.trim().includes(race.id)) {
            targetChar = item;
            break;
          }
        }
      }

      if (!targetChar) {
        throw new Error(`找不到「${race.name}」角色卡，请确认已安装：${race.card}`);
      }

      targetChar.click();
      console.log('MoonExtension: 已选择角色', race.name);
      await new Promise(r => setTimeout(r, 600));

      // 步骤3: 开始新聊天
      const newChatBtn = document.getElementById('option_start_new_chat');
      if (newChatBtn) {
        newChatBtn.click();
      } else {
        const altBtns = document.querySelectorAll('[data-i18n="Start new chat"], [title*="new chat"], [title*="New Chat"]');
        if (altBtns.length > 0) altBtns[0].click();
        else throw new Error('找不到开始新聊天按钮');
      }

      showToast(`✅ ${race.name} 冒险已启动！`, '#5cb85c');
      console.log('MoonExtension: 冒险启动完成');

    } catch (e) {
      console.error('MoonExtension: 启动冒险失败', e);
      showToast('启动失败: ' + e.message, '#d9534f');
    }
  }

  // 向导模式（原v2.2逻辑）
  async function startGuideMode() {
    console.log('MoonExtension: 启动向导模式');
    showToast('正在启动向导...', '#6d28d9');

    try {
      const charBtn = document.getElementById('rm_button_characters');
      if (charBtn) charBtn.click();
      await new Promise(r => setTimeout(r, 800));

      const charList = document.getElementById('rm_print_characters_block');
      if (!charList) throw new Error('找不到角色列表');

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
        for (const item of charItems) {
          const nameEl = item.querySelector('.ch_name');
          if (nameEl && nameEl.textContent.trim().includes('向导')) {
            targetChar = item;
            break;
          }
        }
      }

      if (!targetChar) throw new Error('找不到向导角色');

      targetChar.click();
      await new Promise(r => setTimeout(r, 600));

      const newChatBtn = document.getElementById('option_start_new_chat');
      if (newChatBtn) {
        newChatBtn.click();
      } else {
        const altBtns = document.querySelectorAll('[data-i18n="Start new chat"], [title*="new chat"], [title*="New Chat"]');
        if (altBtns.length > 0) altBtns[0].click();
        else throw new Error('找不到开始新聊天按钮');
      }

      showToast('✅ 向导模式已启动！选择种族后请手动切换到对应角色卡', '#6d28d9');

    } catch (e) {
      console.error('MoonExtension: 启动向导失败', e);
      showToast('启动失败: ' + e.message, '#d9534f');
    }
  }

  // 显示临时提示
  function showToast(message, color) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:${color}dd;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;z-index:20000;box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:fadeInUp 0.3s ease;`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; }, 3000);
    setTimeout(() => toast.remove(), 3500);
  }

  // 添加CSS动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity:0; transform:translateX(-50%) translateY(20px); }
      to { opacity:1; transform:translateX(-50%) translateY(0); }
    }
    #moon-game-menu button:hover, #moon-race-selector button:hover {
      filter: brightness(1.1);
    }
  `;
  document.head.appendChild(style);

  setTimeout(checkAllModules, 500);
  setTimeout(checkAllModules, 1500);
  setTimeout(checkAllModules, 3000);
})();
