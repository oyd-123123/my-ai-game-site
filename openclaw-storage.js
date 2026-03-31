// openclaw-storage.js - OpenClaw云端存储服务集成

const OPENCLAW_API_URL = 'http://127.0.0.1:18789';

// OpenClaw存储对象
const openclawStorage = {
  // 检查OpenClaw服务是否可用
  async checkConnection() {
    try {
      const response = await fetch(`${OPENCLAW_API_URL}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.log('OpenClaw服务不可用:', error.message);
      return false;
    }
  },

  // 保存游戏到OpenClaw云端
  async saveGameToCloud(game) {
    try {
      // 检查服务是否可用
      const isAvailable = await this.checkConnection();
      if (!isAvailable) {
        console.log('OpenClaw服务不可用，跳过云端同步');
        return { success: false, error: '服务不可用' };
      }

      const response = await fetch(`${OPENCLAW_API_URL}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: game.id,
          name: game.name,
          description: game.description,
          code: game.code,
          createdAt: game.createdAt,
          updatedAt: game.updatedAt,
          versions: game.versions
        })
      });

      if (response.ok) {
        console.log(`游戏 "${game.name}" 同步到OpenClaw云端成功`);
        return { success: true };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('同步到OpenClaw云端失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 从OpenClaw云端获取所有游戏
  async getAllGamesFromCloud() {
    try {
      const isAvailable = await this.checkConnection();
      if (!isAvailable) {
        console.log('OpenClaw服务不可用');
        return { success: false, games: [], error: '服务不可用' };
      }

      const response = await fetch(`${OPENCLAW_API_URL}/api/games`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`从OpenClaw云端获取 ${data.games?.length || 0} 个游戏`);
        return { success: true, games: data.games || [] };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('从OpenClaw云端获取游戏失败:', error);
      return { success: false, games: [], error: error.message };
    }
  },

  // 从OpenClaw云端恢复游戏到本地
  async restoreGamesFromCloud() {
    try {
      const result = await this.getAllGamesFromCloud();
      if (!result.success) {
        return result;
      }

      // 将云端游戏保存到本地IndexedDB
      for (const game of result.games) {
        await storage.saveGame(game);
      }

      console.log(`成功从OpenClaw云端恢复 ${result.games.length} 个游戏到本地`);
      return { success: true, count: result.games.length };
    } catch (error) {
      console.error('从OpenClaw云端恢复游戏失败:', error);
      return { success: false, error: error.message };
    }
  },

  // 获取云端存储状态
  async getCloudStorageStatus() {
    try {
      const isAvailable = await this.checkConnection();
      if (!isAvailable) {
        return { 
          available: false, 
          gameCount: 0, 
          lastSync: null,
          error: '服务不可用'
        };
      }

      const result = await this.getAllGamesFromCloud();
      return {
        available: true,
        gameCount: result.games?.length || 0,
        lastSync: new Date().toISOString(),
        error: null
      };
    } catch (error) {
      console.error('获取OpenClaw云端存储状态失败:', error);
      return { 
        available: false, 
        gameCount: 0, 
        lastSync: null,
        error: error.message 
      };
    }
  }
};

// 暴露全局对象
window.openclawStorage = openclawStorage;
