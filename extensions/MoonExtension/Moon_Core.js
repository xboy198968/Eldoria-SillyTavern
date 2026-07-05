// Moon_Core.js - 星之暗面核心状态管理器
// 版本: 2.0

const VERSION = '2.0.0';

class MoonCore {
  constructor() {
    this.state = {
      player: {
        name: '玩家',
        race: 'human',
        subrace: 'commoner',
        trait: 'adaptable',
        charm: 50,
        breedAbility: 50,
        lifespan: 70,
        gold: 500,
        morality: 0,
        region: 'east',
        location: '金曦城外围',
        day: 1,
        season: 'spring'
      },
      companions: [],
      housing: { level: 1, facilities: [], comfort: 50, maintenance: 10 },
      inventory: [
        { name: '金币', type: 'currency', count: 500 },
        { name: '银母碎屑', type: 'material', count: 3 },
        { name: '契约卷轴', type: 'tool', count: 1 }
      ],
      quests: [
        { id: 'q001', name: '初次的邂逅', status: 'active', progress: 0, target: '在任意地区遇到第一位雌性并缔结契约' }
      ],
      reputation: {
        east: 10, south: 0, west: 0, north: 0, center: 0, sea: 0, islands: 0
      },
      factions: {
        golden_dawn: 0, // 金曦城贵族
        dark_guild: 0,  // 暗心海盗贼
        goblin_queen: -10, // 哥布林女王
        frost_elder: 0, // 霜精灵长老
        flora_spirit: 5  // 花语森林意志
      },
      saveSlots: Array(10).fill(null),
      autoSaves: Array(3).fill(null),
      specialSave: null,
      events: {},
      offspring: []
    };
    this.eventBus = new EventTarget();
    this.db = null;
    this.init();
  }

  async init() {
    try {
      // 使用 IndexedDB
      const request = indexedDB.open('moon_core', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('state')) db.createObjectStore('state', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('saves')) db.createObjectStore('saves', { keyPath: 'slot' });
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.loadState();
      };
      request.onerror = (e) => {
        console.error('MoonCore: IndexedDB error', e);
        this.loadFallback();
      };
    } catch (err) {
      console.error('MoonCore: init failed', err);
      this.loadFallback();
    }
  }

  loadFallback() {
    const saved = localStorage.getItem('moon_core_state');
    if (saved) {
      try { this.state = JSON.parse(saved); } catch (e) {}
    }
  }

  async loadState() {
    if (!this.db) return this.loadFallback();
    try {
      const tx = this.db.transaction('state', 'readonly');
      const store = tx.objectStore('state');
      const req = store.get('main');
      req.onsuccess = () => {
        if (req.result) this.state = req.result.data;
      };
    } catch (e) { this.loadFallback(); }
  }

  async saveState() {
    try {
      localStorage.setItem('moon_core_state', JSON.stringify(this.state));
      if (this.db) {
        const tx = this.db.transaction('state', 'readwrite');
        tx.objectStore('state').put({ id: 'main', data: this.state });
      }
    } catch (e) {
      console.error('MoonCore: save failed', e);
    }
  }

  getState(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }

  setState(path, value) {
    const keys = path.split('.');
    let obj = this.state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    this.saveState();
    this.eventBus.dispatchEvent(new CustomEvent('stateChange', { detail: { path, value } }));
  }

  async saveGame(slot, name) {
    const saveData = {
      slot, name, timestamp: Date.now(), version: VERSION,
      data: JSON.parse(JSON.stringify(this.state))
    };
    try {
      if (this.db) {
        const tx = this.db.transaction('saves', 'readwrite');
        tx.objectStore('saves').put(saveData);
      }
      this.state.saveSlots[slot] = { name, timestamp: saveData.timestamp };
      await this.saveState();
      return { success: true, message: `存档已保存到槽位 ${slot}: ${name}` };
    } catch (e) {
      return { success: false, message: '存档失败: ' + e.message };
    }
  }

  async loadGame(slot) {
    try {
      if (!this.db) return { success: false, message: '数据库未初始化' };
      const tx = this.db.transaction('saves', 'readonly');
      const req = tx.objectStore('saves').get(slot);
      return new Promise((resolve) => {
        req.onsuccess = () => {
          if (!req.result) return resolve({ success: false, message: '存档不存在' });
          this.state = req.result.data;
          this.saveState();
          this.eventBus.dispatchEvent(new CustomEvent('gameLoaded'));
          resolve({ success: true, message: `已读取存档 ${slot}: ${req.result.name}` });
        };
        req.onerror = () => resolve({ success: false, message: '读取失败' });
      });
    } catch (e) {
      return { success: false, message: '读取失败: ' + e.message };
    }
  }

  addCompanion(companion) {
    const id = 'comp_' + Date.now();
    companion.id = id;
    companion.hp = companion.maxHp || companion.baseHp || 100;
    companion.maxHp = companion.maxHp || companion.baseHp || 100;
    companion.loyalty = companion.loyalty || companion.loyaltyDefault || 20;
    companion.mood = companion.mood || companion.moodDefault || 'calm';
    companion.stress = companion.stress || companion.stressDefault || 30;
    companion.covenantLevel = 1;
    companion.active = false;
    companion.quirks = companion.quirks || [];
    this.state.companions.push(companion);
    this.saveState();
    return id;
  }

  getCompanion(id) {
    return this.state.companions.find(c => c.id === id);
  }

  modifyCompanion(id, field, delta, reason) {
    const comp = this.getCompanion(id);
    if (!comp) return null;
    comp[field] = (comp[field] || 0) + delta;
    if (field === 'loyalty') {
      comp.loyalty = Math.max(0, Math.min(100, comp.loyalty));
      const oldLevel = comp.covenantLevel || 1;
      const newLevel = comp.loyalty >= 90 ? 5 : comp.loyalty >= 70 ? 4 : comp.loyalty >= 50 ? 3 : comp.loyalty >= 20 ? 2 : 1;
      if (newLevel > oldLevel) {
        comp.covenantLevel = newLevel;
        this.eventBus.dispatchEvent(new CustomEvent('covenantLevelUp', { detail: { companion: comp, oldLevel, newLevel } }));
      }
    }
    if (field === 'stress') comp.stress = Math.max(0, Math.min(200, comp.stress));
    if (field === 'hp') comp.hp = Math.max(0, Math.min(comp.maxHp, comp.hp));
    this.saveState();
    return comp;
  }

  exportSave() {
    return JSON.stringify({ version: VERSION, data: this.state });
  }

  importSave(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      this.state = parsed.data;
      this.saveState();
      return { success: true };
    } catch (e) {
      return { success: false, message: '导入失败: ' + e.message };
    }
  }
}

const moonCore = new MoonCore();
window.moonCore = moonCore;
console.log('MoonCore v' + VERSION + ' initialized');
