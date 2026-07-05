// Moon_Stats.js - 属性面板渲染
class MoonStats {
  constructor(core) {
    this.core = core;
    this.panel = null;
    this.init();
  }

  init() {
    this.core.eventBus.addEventListener('stateChange', () => this.update());
    this.core.eventBus.addEventListener('gameLoaded', () => this.update());
    setTimeout(() => this.render(), 2000);
  }

  render() {
    if (document.getElementById('moon-stats-panel')) return;
    const container = document.createElement('div');
    container.id = 'moon-stats-panel';
    container.style.cssText = 'position:fixed;left:0;top:60px;width:260px;max-height:90vh;overflow-y:auto;background:#1a1a2e;color:#fff;padding:10px;border-right:2px solid #6d28d9;z-index:1000;font-family:system-ui,sans-serif;';
    document.body.appendChild(container);
    this.update();
  }

  update() {
    const panel = document.getElementById('moon-stats-panel');
    if (!panel) return;
    const player = this.core.state.player;
    const companions = this.core.state.companions || [];
    const moodLabels = { joyful: '愉快', happy: '开心', calm: '平静', anxious: '焦虑', fearful: '恐惧', furious: '狂怒', desperate: '绝望' };
    const covenantNames = ['', '束缚', '信赖', '交融', '共生', '永恒'];

    let html = '<div style="color:#6d28d9;font-size:16px;font-weight:bold;margin-bottom:10px;">☽ 星之暗面</div>';

    // 玩家属性
    html += '<div style="margin-bottom:12px;padding:8px;background:#16213e;border-radius:6px;">';
    html += '<div style="font-size:11px;color:#aaa;margin-bottom:4px;">玩家属性</div>';
    html += this.renderBar('魅力', player.charm, 100, '#ec4899');
    html += this.renderBar('繁育', player.breedAbility, 100, '#8b5cf6');
    html += this.renderBar('寿命', player.lifespan, 100, '#3b82f6');
    html += '<div style="font-size:11px;margin-top:3px;">💰 金币: ' + player.gold + '</div>';
    html += '<div style="font-size:11px;">⚖️ 道德: ' + (player.morality > 0 ? '+' : '') + player.morality + '</div>';
    html += '<div style="font-size:11px;color:#aaa;">📍 ' + player.location + ' | ' + this.seasonName(player.season) + '</div>';
    html += '</div>';

    // 伴侣列表
    if (companions.length > 0) {
      html += '<div style="font-size:11px;color:#aaa;margin-bottom:4px;">契约伴侣 (' + companions.length + ')</div>';
      companions.forEach(comp => {
        const moodColor = { joyful: '#10b981', happy: '#34d399', calm: '#6b7280', anxious: '#f59e0b', fearful: '#ef4444', furious: '#dc2626', desperate: '#991b1b' }[comp.mood] || '#6b7280';
        html += '<div style="margin-bottom:6px;padding:6px;background:#16213e;border-radius:4px;font-size:11px;">';
        html += '<div style="font-weight:bold;display:flex;justify-content:space-between;"><span>' + comp.name + '</span><span style="color:#888;">' + covenantNames[comp.covenantLevel || 1] + '</span></div>';
        html += this.renderMiniBar('HP', comp.hp, comp.maxHp, '#ef4444');
        html += this.renderMiniBar('忠诚', comp.loyalty, 100, '#8b5cf6');
        html += this.renderMiniBar('压力', comp.stress, 200, '#f59e0b');
        html += '<div style="color:' + moodColor + ';font-size:10px;">心情: ' + (moodLabels[comp.mood] || comp.mood) + '</div>';
        html += '</div>';
      });
    } else {
      html += '<div style="font-size:11px;color:#666;padding:8px;text-align:center;">暂无契约伴侣</div>';
    }

    // 快捷按钮
    html += '<div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">';
    html += '<button onclick="window.moonUI.showSave()" style="background:#6d28d9;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:10px;cursor:pointer;">💾存档</button>';
    html += '<button onclick="window.moonUI.showLoad()" style="background:#4b5563;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:10px;cursor:pointer;">📂读档</button>';
    html += '<button onclick="window.moonUI.showHelp()" style="background:#374151;color:#fff;border:none;padding:4px 8px;border-radius:4px;font-size:10px;cursor:pointer;">❓帮助</button>';
    html += '</div>';

    panel.innerHTML = html;
  }

  renderBar(label, value, max, color) {
    const pct = Math.min(100, (value / max) * 100);
    return '<div style="font-size:11px;margin-bottom:2px;">' + label + ': <span style="display:inline-block;width:60px;height:6px;background:#333;border-radius:3px;overflow:hidden;vertical-align:middle;"><span style="display:block;height:100%;width:' + pct + '%;background:' + color + ';"></span></span> ' + value + '</div>';
  }

  renderMiniBar(label, value, max, color) {
    const pct = Math.min(100, (value / max) * 100);
    return '<div style="font-size:10px;margin-bottom:1px;">' + label + ': <span style="display:inline-block;width:50px;height:4px;background:#333;border-radius:2px;overflow:hidden;vertical-align:middle;"><span style="display:block;height:100%;width:' + pct + '%;background:' + color + ';"></span></span> ' + value + '/' + max + '</div>';
  }

  seasonName(s) {
    return { spring: '春', summer: '夏', autumn: '秋', winter: '冬' }[s] || s;
  }
}

// UI交互
class MoonUI {
  constructor(core) {
    this.core = core;
  }

  showSave() {
    const slots = this.core.state.saveSlots.map((s, i) => {
      return s ? (i + ': ' + s.name + ' ' + new Date(s.timestamp).toLocaleString()) : (i + ': [空]');
    }).join('\n');
    const slot = prompt('选择存档槽位 (0-9):\n' + slots);
    if (slot !== null) {
      const name = prompt('存档名称:', '手动存档 ' + new Date().toLocaleDateString());
      if (name) {
        this.core.saveGame(parseInt(slot), name).then(r => toastr.info(r.message));
      }
    }
  }

  showLoad() {
    const slots = this.core.state.saveSlots.map((s, i) => {
      return s ? (i + ': ' + s.name + ' ' + new Date(s.timestamp).toLocaleString()) : (i + ': [空]');
    }).join('\n');
    const slot = prompt('选择读档槽位 (0-9):\n' + slots);
    if (slot !== null) {
      this.core.loadGame(parseInt(slot)).then(r => toastr.info(r.message));
    }
  }

  showHelp() {
    alert('星之暗面 - 常用指令\n\n/status - 查看状态\n/save [槽] - 存档\n/load [槽] - 读档\n/travel [地点] - 旅行\n/rest - 休息\n/combat [目标] - 战斗\n/attack [伴侣] [目标] - 攻击\n/covenant [目标] - 缔结契约\n/gift [伴侣] [物品] - 送礼\n/punish [伴侣] - 惩罚\n/reward [伴侣] - 奖励\n/help - 显示帮助');
  }
}

// 初始化 - 扩展加载时DOM已经ready，直接初始化
if (window.moonCore) {
  const stats = new MoonStats(window.moonCore);
  window.moonUI = new MoonUI(window.moonCore);
  console.log('MoonStats initialized');
} else {
  console.warn('MoonStats: moonCore not available yet, retrying...');
  const checkInterval = setInterval(() => {
    if (window.moonCore) {
      clearInterval(checkInterval);
      const stats = new MoonStats(window.moonCore);
      window.moonUI = new MoonUI(window.moonCore);
      console.log('MoonStats initialized (delayed)');
    }
  }, 100);
  setTimeout(() => clearInterval(checkInterval), 5000);
}
document.addEventListener('DOMContentLoaded', () => {
  if (window.moonCore) {
    const stats = new MoonStats(window.moonCore);
    window.moonUI = new MoonUI(window.moonCore);
    console.log('MoonStats initialized');
  }
});
