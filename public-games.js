// public-games.js - 公共游戏列表（基于 GitHub Gist）
// 所有用户共享同一份游戏列表

const PUBLIC_GAMES_CONFIG = {
  gistId: '3b957cf4aea0a7b8a2a2435452917b93',
  gistOwner: 'oyd-123123',
  filename: 'games-db.json',
  // raw URL 加时间戳防缓存
  get rawUrl() {
    return `https://gist.githubusercontent.com/${this.gistOwner}/${this.gistId}/raw/${this.filename}?t=${Date.now()}`;
  }
};

const publicGames = {
  _cache: null,
  _cacheTime: 0,
  CACHE_TTL: 30000, // 30秒缓存

  // 读取公共游戏列表
  async getAll() {
    const now = Date.now();
    if (this._cache && (now - this._cacheTime) < this.CACHE_TTL) {
      return this._cache;
    }
    try {
      const res = await fetch(PUBLIC_GAMES_CONFIG.rawUrl);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      this._cache = data.games || [];
      this._cacheTime = now;
      return this._cache;
    } catch (e) {
      console.warn('公共游戏列表加载失败，使用本地缓存', e);
      return this._cache || [];
    }
  },

  // 上传游戏到公共列表（通过 gh CLI 后端接口更新 Gist）
  // 前端无法直接写 Gist（需要 token），改为：保存时同时写入一个"待同步"队列
  // 由页面提示用户，或由站长定期同步
  async addGame(game) {
    // 读取现有列表
    const games = await this.getAll();
    // 去重（同 id 则更新）
    const idx = games.findIndex(g => g.id === game.id);
    const publicGame = {
      id: game.id,
      name: game.name,
      description: game.description || '',
      code: game.code,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt || new Date().toISOString(),
      author: 'anonymous'
    };
    if (idx >= 0) {
      games[idx] = publicGame;
    } else {
      games.unshift(publicGame);
    }
    // 存入 localStorage 待同步队列
    const pending = JSON.parse(localStorage.getItem('PUBLIC_GAMES_PENDING') || '[]');
    const pidx = pending.findIndex(g => g.id === game.id);
    if (pidx >= 0) pending[pidx] = publicGame; else pending.unshift(publicGame);
    localStorage.setItem('PUBLIC_GAMES_PENDING', JSON.stringify(pending));
    // 更新本地缓存
    this._cache = games;
    return true;
  },

  // 获取待同步数量
  getPendingCount() {
    return JSON.parse(localStorage.getItem('PUBLIC_GAMES_PENDING') || '[]').length;
  }
};

window.publicGames = publicGames;
