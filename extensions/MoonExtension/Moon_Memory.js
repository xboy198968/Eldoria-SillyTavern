// Moon_Memory.js - 星之暗面三层记忆系统 v2.2
// 修复：初始化延迟、IndexedDB 加载可靠性、存储超限处理

const MEMORY_VERSION = '2.2.0';
const MAX_SHORT_TERM_ENTRIES = 50;
const SHORT_TERM_EXPIRY_DAYS = 7;
const MAX_LONG_TERM_ENTRIES = 200;
const RELATIONSHIP_TRACK_DEPTH = 100;
const COMPRESSION_THRESHOLD = 30;

class MoonMemory {
  constructor(core) {
    this.core = core;
    this.memories = {
      longTerm: [],
      shortTerm: [],
      relationships: {}
    };
    this.init();
  }

  async init() {
    await this.loadMemories();
    // 每5分钟自动清理过期短期记忆
    setInterval(() => this.cleanupShortTerm(), 5 * 60 * 1000);
    // 每30分钟自动压缩长期记忆
    setInterval(() => this.compressLongTerm(), 30 * 60 * 1000);
  }

  // ========== 记忆存储 ==========

  addShortTerm(content, category = 'scene', importance = 1) {
    const entry = {
      id: 'stm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      content,
      category,
      importance,
      timestamp: Date.now(),
      day: this.core.state.player.day || 1,
      location: this.core.state.player.location || 'unknown'
    };
    this.memories.shortTerm.push(entry);
    this.enforceShortTermLimit();
    this.saveMemories();
    return entry.id;
  }

  addLongTerm(content, category = 'lore', tags = [], sourceShortTermId = null) {
    const entry = {
      id: 'ltm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      content,
      category,
      tags,
      timestamp: Date.now(),
      day: this.core.state.player.day || 1,
      accessCount: 0,
      sourceId: sourceShortTermId
    };
    this.memories.longTerm.push(entry);
    this.enforceLongTermLimit();
    this.saveMemories();
    return entry.id;
  }

  updateRelationship(npcId, npcName, interaction, sentimentDelta = 0, details = {}) {
    if (!this.memories.relationships[npcId]) {
      this.memories.relationships[npcId] = {
        npcName,
        history: [],
        sentiment: 0,
        covenantLevel: 0,
        intimateCount: 0,
        firstMet: Date.now(),
        lastInteraction: Date.now(),
        preferences: {},
        secrets: [],
        sharedEvents: []
      };
    }
    const rel = this.memories.relationships[npcId];
    if (rel.history.length >= RELATIONSHIP_TRACK_DEPTH) {
      rel.history = rel.history.slice(-(RELATIONSHIP_TRACK_DEPTH - 1));
    }

    rel.history.push({
      timestamp: Date.now(),
      day: this.core.state.player.day || 1,
      interaction,
      sentimentDelta,
      details
    });
    rel.sentiment = Math.max(-100, Math.min(100, rel.sentiment + sentimentDelta));
    rel.lastInteraction = Date.now();

    if (Math.abs(sentimentDelta) >= 10 || details.isMajor) {
      this.addLongTerm(
        `与 ${npcName} 的重要事件：${interaction}`,
        'event',
        [npcId, 'relationship', details.category || 'general']
      );
    }

    this.saveMemories();
  }

  // ========== 记忆检索 ==========

  getRelevantShortTerm(location = null, limit = 10) {
    const loc = location || this.core.state.player.location;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    return this.memories.shortTerm
      .filter(m => {
        const locMatch = m.location === loc;
        const timeRelevance = Math.max(0, 1 - (now - m.timestamp) / (SHORT_TERM_EXPIRY_DAYS * oneDay));
        return locMatch || timeRelevance > 0.3;
      })
      .sort((a, b) => {
        const scoreA = a.importance * 2 + (a.location === loc ? 5 : 0);
        const scoreB = b.importance * 2 + (b.location === loc ? 5 : 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  searchLongTerm(query, tags = [], limit = 10) {
    const results = this.memories.longTerm
      .filter(m => {
        const tagMatch = tags.length === 0 || tags.some(t => m.tags.includes(t));
        const textMatch = !query || m.content.toLowerCase().includes(query.toLowerCase());
        return tagMatch && textMatch;
      })
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, limit);

    results.forEach(r => { r.accessCount = (r.accessCount || 0) + 1; });
    this.saveMemories();
    return results;
  }

  getRelationshipSummary(npcId, detailLevel = 'medium') {
    const rel = this.memories.relationships[npcId];
    if (!rel) return null;

    const recentHistory = rel.history.slice(-10);
    const sentimentLabel = rel.sentiment > 50 ? '亲密' : rel.sentiment > 20 ? '友好' : rel.sentiment > -20 ? '中立' : rel.sentiment > -50 ? '冷淡' : '敌对';

    if (detailLevel === 'brief') {
      return `${rel.npcName}: ${sentimentLabel} (关系值${rel.sentiment})`;
    }

    return {
      name: rel.npcName,
      sentiment: rel.sentiment,
      sentimentLabel,
      covenantLevel: rel.covenantLevel,
      intimateCount: rel.intimateCount,
      daysKnown: Math.floor((Date.now() - rel.firstMet) / (24 * 60 * 60 * 1000)),
      recentInteractions: recentHistory.map(h => `${h.day}日: ${h.interaction}`),
      secretsKnown: rel.secrets.length,
      preferences: rel.preferences
    };
  }

  generateMemoryPrompt() {
    const lines = [];
    const player = this.core.state.player;

    const lore = this.searchLongTerm(null, ['lore'], 3);
    const recentEvents = this.memories.longTerm
      .filter(m => m.category === 'event')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    if (lore.length > 0) {
      lines.push('[世界认知]');
      lore.forEach(m => lines.push(`- ${m.content}`));
    }

    if (recentEvents.length > 0) {
      lines.push('[近期重要事件]');
      recentEvents.forEach(m => lines.push(`- 第${m.day}天: ${m.content}`));
    }

    const shortTerm = this.getRelevantShortTerm(null, 5);
    if (shortTerm.length > 0) {
      lines.push('[当前记忆]');
      shortTerm.forEach(m => lines.push(`- ${m.content}`));
    }

    const companions = this.core.state.companions || [];
    if (companions.length > 0) {
      lines.push('[伴侣关系]');
      companions.forEach(comp => {
        const rel = this.memories.relationships[comp.id];
        if (rel) {
          lines.push(`- ${comp.name}: ${rel.sentimentLabel} (忠诚度${comp.loyalty}/100, 契约${comp.covenantLevel}级)`);
        }
      });
    }

    return lines.join('\n');
  }

  // ========== 记忆管理 ==========

  cleanupShortTerm() {
    const now = Date.now();
    const expiry = SHORT_TERM_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const before = this.memories.shortTerm.length;

    this.memories.shortTerm = this.memories.shortTerm.filter(m => {
      if (m.importance >= 4) return true;
      return (now - m.timestamp) < expiry;
    });

    const removed = before - this.memories.shortTerm.length;
    if (removed > 0) {
      console.log(`MoonMemory: 清理了 ${removed} 条过期短期记忆`);
      this.saveMemories();
    }
  }

  enforceShortTermLimit() {
    if (this.memories.shortTerm.length > MAX_SHORT_TERM_ENTRIES) {
      this.memories.shortTerm.sort((a, b) => {
        const scoreA = a.importance * 1000000 + a.timestamp;
        const scoreB = b.importance * 1000000 + b.timestamp;
        return scoreB - scoreA;
      });
      const removed = this.memories.shortTerm.splice(MAX_SHORT_TERM_ENTRIES);
      removed.filter(m => m.importance >= 3).forEach(m => {
        this.addLongTerm(m.content, 'event', ['auto_promoted'], m.id);
      });
    }
  }

  compressLongTerm() {
    if (this.memories.longTerm.length <= COMPRESSION_THRESHOLD) return;

    const byCategory = {};
    this.memories.longTerm.forEach(m => {
      if (!byCategory[m.category]) byCategory[m.category] = [];
      byCategory[m.category].push(m);
    });

    Object.keys(byCategory).forEach(cat => {
      const entries = byCategory[cat];
      if (entries.length > 20) {
        entries.sort((a, b) => {
          const scoreA = (a.accessCount || 0) * 10 + a.timestamp;
          const scoreB = (b.accessCount || 0) * 10 + b.timestamp;
          return scoreB - scoreA;
        });
        byCategory[cat] = entries.slice(0, 20);
      }
    });

    this.memories.longTerm = Object.values(byCategory).flat();
    console.log(`MoonMemory: 长期记忆已压缩至 ${this.memories.longTerm.length} 条`);
    this.saveMemories();
  }

  enforceLongTermLimit() {
    if (this.memories.longTerm.length > MAX_LONG_TERM_ENTRIES) {
      this.memories.longTerm.sort((a, b) => {
        const scoreA = (a.accessCount || 0) * 10 + a.timestamp;
        const scoreB = (b.accessCount || 0) * 10 + b.timestamp;
        return scoreB - scoreA;
      });
      this.memories.longTerm = this.memories.longTerm.slice(0, MAX_LONG_TERM_ENTRIES);
    }
  }

  // ========== 持久化 ==========

  async saveMemories() {
    try {
      const data = JSON.stringify(this.memories);
      localStorage.setItem('moon_memory', data);

      if (this.core.db) {
        const tx = this.core.db.transaction('state', 'readwrite');
        tx.objectStore('state').put({ id: 'memory', data: this.memories });
      }
    } catch (e) {
      console.error('MoonMemory: save failed', e);
      if (e.name === 'QuotaExceededError' || (e.message && e.message.includes('quota'))) {
        console.warn('MoonMemory: 存储超限，清理短期记忆...');
        this.memories.shortTerm = this.memories.shortTerm.slice(-20);
        try {
          localStorage.setItem('moon_memory', JSON.stringify(this.memories));
        } catch (e2) {
          console.error('MoonMemory: 即使清理后仍超限', e2);
        }
      }
    }
  }

  async loadMemories() {
    try {
      // 先尝试从 localStorage 加载（更快，更可靠）
      const saved = localStorage.getItem('moon_memory');
      if (saved) {
        try {
          this.memories = JSON.parse(saved);
          console.log(`MoonMemory: loaded from localStorage (LTM:${this.memories.longTerm.length}, STM:${this.memories.shortTerm.length}, REL:${Object.keys(this.memories.relationships).length})`);
        } catch (e) {
          console.error('MoonMemory: localStorage parse error', e);
          this.memories = { longTerm: [], shortTerm: [], relationships: {} };
        }
      }

      // 然后尝试从 IndexedDB 加载（可能更新）
      if (this.core.db) {
        const tx = this.core.db.transaction('state', 'readonly');
        const req = tx.objectStore('state').get('memory');
        req.onsuccess = () => {
          if (req.result?.data) {
            this.memories = req.result.data;
            console.log('MoonMemory: updated from IndexedDB');
          }
        };
      }
    } catch (e) {
      console.error('MoonMemory: load failed', e);
      this.memories = { longTerm: [], shortTerm: [], relationships: {} };
    }
  }

  export() { return JSON.stringify(this.memories); }

  import(jsonStr) {
    try {
      this.memories = JSON.parse(jsonStr);
      this.saveMemories();
      return true;
    } catch (e) { return false; }
  }

  getStats() {
    const rels = Object.values(this.memories.relationships);
    return {
      longTerm: this.memories.longTerm.length,
      shortTerm: this.memories.shortTerm.length,
      relationships: rels.length,
      totalHistoryEntries: rels.reduce((sum, r) => sum + r.history.length, 0),
      estimatedSize: JSON.stringify(this.memories).length
    };
  }
}

// 初始化 - 修复：延迟初始化，确保 moonCore 存在
function initMoonMemory() {
  if (window.moonCore) {
    window.moonMemory = new MoonMemory(window.moonCore);
    console.log('MoonMemory v' + MEMORY_VERSION + ' initialized');
    return true;
  } else {
    console.warn('MoonMemory: moonCore 尚未就绪，100ms 后重试...');
    setTimeout(initMoonMemory, 100);
    return false;
  }
}
initMoonMemory();
