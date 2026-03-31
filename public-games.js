// public-games.js - 公共游戏列表（基于 GitHub Gist 实时同步）

const PUBLIC_GAMES_CONFIG = {
  gistId: '3b957cf4aea0a7b8a2a2435452917b93',
  gistOwner: 'oyd-123123',
  filename: 'games-db.json',
  tokenGistId: '72a59e22f75354461958cbbb5eb1b6a0', // 存 Token 的私有 gist
  _token: null,

  get rawUrl() {
    return `https://gist.githubusercontent.com/${this.gistOwner}/${this.gistId}/raw/${this.filename}?t=${Date.now()}`;
  },
  get apiUrl() {
    return `https://api.github.com/gists/${this.gistId}`;
  },

  // Token 从页面顶部输入框或 localStorage 读取
  get token() {
    return localStorage.getItem('GIST_TOKEN') || '';
  },

  // 设置 Token
  setToken(token) {
    localStorage.setItem('GIST_TOKEN', token);
    this._token = token;
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
      if (!res.ok) throw new Error('fetch failed ' + res.status);
      const data = await res.json();
      this._cache = data.games || [];
      this._cacheTime = now;
      return this._cache;
    } catch (e) {
      console.warn('公共游戏列表加载失败', e);
      return this._cache || [];
    }
  },

  // 发布游戏到公共库（直接写入 Gist）
  async addGame(game) {
    const token = PUBLIC_GAMES_CONFIG.token;
    if (!token) {
      // 没有 Token，跳过发布到公共库，只存本地
      console.log('无 Gist Token，仅本地保存');
      return false;
    }

    // 先读取最新列表
    this._cache = null; // 强制刷新
    const games = await this.getAll();

    // 去重（同 id 则更新）
    const publicGame = {
      id: game.id,
      name: game.name,
      description: game.description || '',
      code: game.code,
      createdAt: game.createdAt,
      updatedAt: new Date().toISOString(),
      author: 'anonymous'
    };
    const idx = games.findIndex(g => g.id === game.id);
    if (idx >= 0) {
      games[idx] = publicGame;
    } else {
      games.unshift(publicGame);
    }

    // 写入 Gist
    const newContent = JSON.stringify({ games, updatedAt: new Date().toISOString() }, null, 2);
    const res = await fetch(PUBLIC_GAMES_CONFIG.apiUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({
        files: {
          [PUBLIC_GAMES_CONFIG.filename]: { content: newContent }
        }
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gist 写入失败');
    }

    // 更新本地缓存
    this._cache = games;
    this._cacheTime = Date.now();
    return true;
  },

  // 从公共库删除游戏（仅站长用）
  async removeGame(gameId) {
    const token = PUBLIC_GAMES_CONFIG.token;
    if (!token) {
      console.log('无 Gist Token，无法删除');
      return false;
    }
    this._cache = null;
    const games = await this.getAll();
    const filtered = games.filter(g => g.id !== gameId);
    const newContent = JSON.stringify({ games: filtered, updatedAt: new Date().toISOString() }, null, 2);
    const res = await fetch(PUBLIC_GAMES_CONFIG.apiUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json'
      },
      body: JSON.stringify({
        files: {
          [PUBLIC_GAMES_CONFIG.filename]: { content: newContent }
        }
      })
    });
    if (!res.ok) throw new Error('删除失败');
    this._cache = filtered;
    this._cacheTime = Date.now();
    return true;
  }
};

window.publicGames = publicGames;
