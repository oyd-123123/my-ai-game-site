// storage.js - IndexedDB存储管理

const DB_NAME = 'GameDevAI';
const DB_VERSION = 1;
const STORE_NAME = 'games';

let db = null;

// 初始化IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB打开失败');
      reject('IndexedDB打开失败');
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log('IndexedDB打开成功');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('创建游戏存储对象成功');
      }
    };
  });
}

// 获取数据库实例
async function getDB() {
  if (!db) {
    await initDB();
  }
  return db;
}

// 保存游戏到IndexedDB
async function saveGameToDB(game) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(game);

    request.onsuccess = () => {
      console.log('游戏保存成功');
      resolve(true);
    };

    request.onerror = () => {
      console.error('游戏保存失败');
      reject('游戏保存失败');
    };
  });
}

// 从IndexedDB获取所有游戏
async function getAllGamesFromDB() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const games = event.target.result;
      console.log('获取游戏列表成功', games.length);
      resolve(games);
    };

    request.onerror = () => {
      console.error('获取游戏列表失败');
      reject('获取游戏列表失败');
    };
  });
}

// 从IndexedDB获取单个游戏
async function getGameFromDB(gameId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(gameId);

    request.onsuccess = (event) => {
      const game = event.target.result;
      console.log('获取游戏成功', game?.name);
      resolve(game);
    };

    request.onerror = () => {
      console.error('获取游戏失败');
      reject('获取游戏失败');
    };
  });
}

// 从IndexedDB删除游戏
async function deleteGameFromDB(gameId) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(gameId);

    request.onsuccess = () => {
      console.log('游戏删除成功');
      resolve(true);
    };

    request.onerror = () => {
      console.error('游戏删除失败');
      reject('游戏删除失败');
    };
  });
}

// 迁移localStorage数据到IndexedDB
async function migrateFromLocalStorage() {
  try {
    const localStorageGames = localStorage.getItem('GAMEDEV_GAMES');
    if (localStorageGames) {
      const games = JSON.parse(localStorageGames);
      if (games.length > 0) {
        console.log('开始迁移localStorage数据到IndexedDB', games.length);
        for (const game of games) {
          await saveGameToDB(game);
        }
        console.log('数据迁移完成');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('数据迁移失败', error);
    return false;
  }
}

// 清除所有游戏数据
async function clearAllGames() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      console.log('清除所有游戏数据成功');
      resolve(true);
    };

    request.onerror = () => {
      console.error('清除所有游戏数据失败');
      reject('清除所有游戏数据失败');
    };
  });
}

// 获取存储使用情况
async function getStorageUsage() {
  try {
    const games = await getAllGamesFromDB();
    let totalSize = 0;
    games.forEach(game => {
      totalSize += JSON.stringify(game).length;
    });
    return {
      gameCount: games.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('获取存储使用情况失败', error);
    return { gameCount: 0, totalSize: 0, totalSizeMB: '0.00' };
  }
}

// 暴露全局函数
window.storage = {
  saveGame: saveGameToDB,
  getAllGames: getAllGamesFromDB,
  getGame: getGameFromDB,
  deleteGame: deleteGameFromDB,
  migrateFromLocalStorage: migrateFromLocalStorage,
  clearAllGames: clearAllGames,
  getStorageUsage: getStorageUsage
};
