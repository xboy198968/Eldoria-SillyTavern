// index.js - MoonExtension 入口 v3.0
// 功能：1) 开始游戏按钮 2) 快速开始/向导模式 3) 自动监听消息创建角色

(function() {
  'use strict';

  console.log('MoonExtension v3.0 entry point loaded');

  // ========== 配置 ==========
  const RACES = [
    { id: '人类', name: '人类', cardPrefix: '玩家-人类', icon: '👤', color: '#4a90d9',
      desc: '适应之道，魅力50/繁育50，新手首选' },
    { id: '精灵', name: '精灵', cardPrefix: '玩家_精灵', icon: '🧝', color: '#5cb85c',
      desc: '魅力至上，魅力90/繁育30，精品路线' },
    { id: '哥布林', name: '哥布林', cardPrefix: '玩家-哥布林', icon: '👺', color: '#5cb85c',
      desc: '数量为王，魅力35/繁育85，快速繁衍' },
    { id: '吸血鬼', name: '吸血鬼', cardPrefix: '玩家_吸血鬼', icon: '🧛', color: '#8b0000',
      desc: '永恒之血，魅力80/繁育45，血之契约' },
    { id: '牛头人', name: '牛头人', cardPrefix: '玩家-牛头人', icon: '🐂', color: '#d2691e',
      desc: '力量征服，魅力45/繁育70，NTR之道' }
  ];

  // ========== 初始化 ==========
  function init() {
    console.log('MoonExtension: 初始化...');
    addStartGameButton();
    setupMessageListener();
  }

  // ========== UI: 开始游戏按钮 ==========
  function addStartGameButton() {
    if (document.getElementById('moon-start-game-btn')) return;

    const selectors = ['#top-bar', '.top-bar', '#top_menu_holder', '#sheld > div:first-child', 'body'];
    let topBar = null;
    for (const sel of selectors) {
      topBar = document.querySelector(sel);
      if (topBar) break;
    }

    if (!topBar) {
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

  // ========== UI: 游戏菜单 ==========
  function showGameMenu() {
    const existing = document.getElementById('moon-game-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'moon-game-menu';
    menu.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;';

    const content = document.createElement('div');
    content.style.cssText = 'background:linear-gradient(180deg,#1a1a2e,#16213e);border:2px solid #6d28d9;border-radius:16px;padding:32px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 0 40px rgba(109,40,217,0.4);color:#fff;';

    content.innerHTML = `
      <h2 style="text-align:center;margin:0 0 8px 0;font-size:28px;background:linear-gradient(90deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">☽ 星之暗面 ☽</h2>
      <p style="text-align:center;color:#aaa;margin:0 0 24px 0;font-size:14px;">选择你的游戏方式</p>
      <button id="moon-btn-quick" style="width:100%;margin-bottom:12px;padding:16px;background:linear-gradient(135deg,#f59e0b22,transparent);border:2px solid #f59e0b66;border-radius:12px;cursor:pointer;text-align:left;transition:all 0.2s;color:#fff;">
        <div style="font-size:18px;font-weight:bold;margin-bottom:4px;">⚡ 快速开始</div>
        <div style="font-size:13px;color:#aaa;">直接选择种族，立即进入冒险</div>
      </button>
      <button id="moon-btn-guide" style="width:100%;margin-bottom:12px;padding:16px;background:linear-gradient(135deg,#6d28d922,transparent);border:2px solid #6d28d966;border-radius:12px;cursor:pointer;text-align:left;transition:all 0.2s;color:#fff;">
        <div style="font-size:18px;font-weight:bold;margin-bottom:4px;">🧙 向导模式</div>
        <div style="font-size:13px;color:#aaa;">通过对话与向导互动，体验完整引导</div>
      </button>
      <button id="moon-btn-cancel" style="width:100%;padding:10px;background:#333;color:#aaa;border:1px solid #444;border-radius:8px;cursor:pointer;font-size:14px;">取消</button>
    `;

    menu.appendChild(content);
    document.body.appendChild(menu);

    content.querySelector('#moon-btn-quick').onclick = () => { menu.remove(); showRaceSelector(); };
    content.querySelector('#moon-btn-guide').onclick = () => { menu.remove(); startGuideMode(); };
    content.querySelector('#moon-btn-cancel').onclick = () => menu.remove();
  }

  // ========== UI: 种族选择器（快速开始） ==========
  function showRaceSelector() {
    const menu = document.createElement('div');
    menu.id = 'moon-race-selector';
    menu.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;';

    const content = document.createElement('div');
    content.style.cssText = 'background:linear-gradient(180deg,#1a1a2e,#16213e);border:2px solid #6d28d9;border-radius:16px;padding:32px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 0 40px rgba(109,40,217,0.4);color:#fff;';

    let html = `
      <h2 style="text-align:center;margin:0 0 8px 0;font-size:24px;color:#f59e0b;">⚡ 快速开始 — 选择种族</h2>
      <p style="text-align:center;color:#aaa;margin:0 0 20px 0;font-size:13px;">选择后将直接进入冒险，跳过向导引导</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:16px;">
    `;

    RACES.forEach(race => {
      html += `
        <button class="moon-race-card" data-race="${race.id}" style="background:linear-gradient(180deg,${race.color}22,transparent);border:2px solid ${race.color}44;border-radius:12px;padding:16px;cursor:pointer;text-align:center;transition:all 0.2s;color:#fff;">
          <div style="font-size:32px;margin-bottom:8px;">${race.icon}</div>
          <div style="font-size:16px;font-weight:bold;margin-bottom:4px;">${race.name}</div>
          <div style="font-size:11px;color:#aaa;line-height:1.4;">${race.desc}</div>
        </button>
      `;
    });

    html += `</div><button id="moon-btn-back" style="width:100%;padding:10px;background:#333;color:#aaa;border:1px solid #444;border-radius:8px;cursor:pointer;font-size:14px;">← 返回</button>`;
    content.innerHTML = html;
    menu.appendChild(content);
    document.body.appendChild(menu);

    content.querySelectorAll('.moon-race-card').forEach(card => {
      card.onmouseenter = () => { card.style.borderColor = card.querySelector('div:last-child').style.color || '#fff'; card.style.transform = 'scale(1.03)'; };
      card.onmouseleave = () => { card.style.transform = 'scale(1)'; };
      card.onclick = () => { menu.remove(); startAdventureQuick(card.dataset.race); };
    });
    content.querySelector('#moon-btn-back').onclick = () => { menu.remove(); showGameMenu(); };
  }

  // ========== 快速开始：直接加载预设角色卡 ==========
  async function startAdventureQuick(raceId) {
    const race = RACES.find(r => r.id === raceId);
    if (!race) { showToast('未知种族', '#d9534f'); return; }

    showToast(`正在启动 ${race.name} 冒险...`, race.color);

    try {
      // 打开角色列表
      const charBtn = document.getElementById('rm_button_characters');
      if (charBtn) charBtn.click();
      await sleep(800);

      // 查找角色
      const charList = document.getElementById('rm_print_characters_block');
      if (!charList) throw new Error('找不到角色列表');

      const charItems = charList.querySelectorAll('.character_select');
      let targetChar = null;

      for (const item of charItems) {
        const nameEl = item.querySelector('.ch_name');
        if (!nameEl) continue;
        const text = nameEl.textContent.trim();
        if (text === race.cardPrefix || text.includes(race.name)) {
          targetChar = item;
          break;
        }
      }

      if (!targetChar) {
        throw new Error(`找不到「${race.name}」角色卡。请先与向导对话创建角色，或安装角色卡包。`);
      }

      targetChar.click();
      await sleep(600);

      // 开始新聊天
      const newChatBtn = document.getElementById('option_start_new_chat');
      if (newChatBtn) {
        newChatBtn.click();
      } else {
        const altBtns = document.querySelectorAll('[data-i18n="Start new chat"], [title*="new chat"], [title*="New Chat"]');
        if (altBtns.length > 0) altBtns[0].click();
        else throw new Error('找不到开始新聊天按钮');
      }

      showToast(`✅ ${race.name} 冒险已启动！`, '#5cb85c');

    } catch (e) {
      console.error('MoonExtension: 启动冒险失败', e);
      showToast('启动失败: ' + e.message, '#d9534f');
    }
  }

  // ========== 向导模式 ==========
  async function startGuideMode() {
    showToast('正在启动向导...', '#6d28d9');
    try {
      const charBtn = document.getElementById('rm_button_characters');
      if (charBtn) charBtn.click();
      await sleep(800);

      const charList = document.getElementById('rm_print_characters_block');
      if (!charList) throw new Error('找不到角色列表');

      let targetChar = null;
      const charItems = charList.querySelectorAll('.character_select');
      for (const item of charItems) {
        const nameEl = item.querySelector('.ch_name');
        if (nameEl && nameEl.textContent.trim().includes('向导')) {
          targetChar = item;
          break;
        }
      }

      if (!targetChar) throw new Error('找不到向导角色');

      targetChar.click();
      await sleep(600);

      const newChatBtn = document.getElementById('option_start_new_chat');
      if (newChatBtn) {
        newChatBtn.click();
      } else {
        const altBtns = document.querySelectorAll('[data-i18n="Start new chat"], [title*="new chat"], [title*="New Chat"]');
        if (altBtns.length > 0) altBtns[0].click();
        else throw new Error('找不到开始新聊天按钮');
      }

      showToast('✅ 向导模式已启动！完成选择后将自动创建角色', '#6d28d9');

    } catch (e) {
      console.error('MoonExtension: 启动向导失败', e);
      showToast('启动失败: ' + e.message, '#d9534f');
    }
  }

  // ========== 核心功能：监听消息，自动创建角色 ==========
  function setupMessageListener() {
    // 检查 SillyTavern 的事件系统是否可用
    if (typeof window.SillyTavern === 'undefined' || !window.SillyTavern.getContext) {
      console.warn('MoonExtension: SillyTavern API 不可用，自动角色创建功能未启用');
      return;
    }

    // 尝试获取 eventSource
    const ctx = window.SillyTavern.getContext();
    const eventSource = ctx.eventSource || window.eventSource;
    const eventTypes = ctx.eventTypes || window.event_types;

    if (!eventSource || !eventTypes || !eventTypes.MESSAGE_RECEIVED) {
      console.warn('MoonExtension: 事件系统不可用，自动角色创建功能未启用');
      return;
    }

    console.log('MoonExtension: 消息监听器已注册');

    eventSource.on(eventTypes.MESSAGE_RECEIVED, async (messageId, type) => {
      try {
        const context = window.SillyTavern.getContext();
        const chat = context.chat;

        if (!chat || !chat[messageId]) return;

        const message = chat[messageId];
        const mesText = message.mes || '';

        // 检查是否是向导的消息（角色名包含"向导"）
        const charName = message.name || '';
        if (!charName.includes('向导')) return;

        // 检查是否包含角色数据标记
        const dataMatch = mesText.match(/\[CHARACTER_DATA\]([\s\S]*?)\[\/CHARACTER_DATA\]/);
        if (!dataMatch) return;

        console.log('MoonExtension: 检测到角色数据，开始创建角色...');

        // 解析 JSON
        let charData;
        try {
          charData = JSON.parse(dataMatch[1].trim());
        } catch (e) {
          console.error('MoonExtension: JSON 解析失败', e);
          showToast('角色数据解析失败，请检查向导输出格式', '#d9534f');
          return;
        }

        // 创建角色
        await createCharacterFromData(charData);

      } catch (e) {
        console.error('MoonExtension: 处理消息时出错', e);
      }
    });
  }

  // ========== 调用 API 创建角色 ==========
  async function createCharacterFromData(data) {
    showToast('📝 正在创建角色...', '#6d28d9');

    const characterData = {
      ch_name: data.name || '未命名角色',
      description: data.description || '',
      personality: data.personality || '',
      scenario: data.scenario || '',
      first_mes: data.first_mes || '',
      mes_example: data.mes_example || '',
      creator_notes: data.creatorcomment || '',
      character_version: data.character_version || '1.0',
      tags: data.tags || [],
      talkativeness: '0.5',
      world: '',
      extensions: '{}',
    };

    try {
      const response = await fetch('/api/characters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const avatarKey = await response.text();
      console.log('MoonExtension: 角色创建成功，avatarKey=', avatarKey);

      // 刷新角色列表并切换到新角色
      await selectNewCharacter(avatarKey, data.name);

    } catch (e) {
      console.error('MoonExtension: 创建角色失败', e);
      showToast('创建角色失败: ' + e.message, '#d9534f');
    }
  }

  // ========== 选择新角色并开始新聊天 ==========
  async function selectNewCharacter(avatarKey, charName) {
    showToast('🔄 正在切换到新角色...', '#6d28d9');

    try {
      // 刷新角色列表
      const context = window.SillyTavern.getContext();

      // 尝试刷新角色列表（通过触发字符列表重载）
      if (typeof window.getCharacters === 'function') {
        await window.getCharacters();
      }

      await sleep(1000);

      // 查找新创建的角色索引
      let charIndex = -1;
      if (context.characters) {
        charIndex = context.characters.findIndex(c => c.avatar === avatarKey);
      }

      if (charIndex === -1 && window.characters) {
        charIndex = window.characters.findIndex(c => c.avatar === avatarKey);
      }

      if (charIndex === -1) {
        console.warn('MoonExtension: 无法在角色列表中找到新角色，尝试通过名称查找');
        if (context.characters) {
          charIndex = context.characters.findIndex(c => c.name === charName);
        }
        if (charIndex === -1 && window.characters) {
          charIndex = window.characters.findIndex(c => c.name === charName);
        }
      }

      if (charIndex !== -1) {
        // 使用 SillyTavern 的 selectCharacterById
        const selectFn = context.selectCharacterById || window.selectCharacterById;
        if (selectFn) {
          await selectFn(charIndex);
          console.log('MoonExtension: 已切换到角色', charName);

          await sleep(800);

          // 开始新聊天
          const newChatBtn = document.getElementById('option_start_new_chat');
          if (newChatBtn) {
            newChatBtn.click();
            showToast(`✅ 角色「${charName}」已创建，冒险开始！`, '#5cb85c');
          } else {
            showToast(`✅ 角色「${charName}」已创建！请点击"开始新聊天"`, '#5cb85c');
          }
        } else {
          showToast(`✅ 角色「${charName}」已创建！请手动选择角色`, '#f59e0b');
        }
      } else {
        showToast(`✅ 角色「${charName}」已创建！请手动选择角色`, '#f59e0b');
      }

    } catch (e) {
      console.error('MoonExtension: 切换角色失败', e);
      showToast('角色已创建，但切换失败，请手动选择', '#f59e0b');
    }
  }

  // ========== 工具函数 ==========
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function showToast(message, color) {
    const existing = document.getElementById('moon-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'moon-toast';
    toast.textContent = message;
    toast.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:${color}dd;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;z-index:20000;box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:moonFadeInUp 0.3s ease;`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; }, 4000);
    setTimeout(() => toast.remove(), 4500);
  }

  function getCSRFToken() {
    // 尝试从 cookie 或 meta 标签获取
    const cookieMatch = document.cookie.match(/csrf-token=([^;]+)/);
    if (cookieMatch) return cookieMatch[1];

    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) return metaTag.content;

    return '';
  }

  // ========== CSS 动画 ==========
  const style = document.createElement('style');
  style.textContent = `
    @keyframes moonFadeInUp {
      from { opacity:0; transform:translateX(-50%) translateY(20px); }
      to { opacity:1; transform:translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // ========== 启动 ==========
  setTimeout(init, 500);
  setTimeout(init, 1500);
  setTimeout(init, 3000);
})();
