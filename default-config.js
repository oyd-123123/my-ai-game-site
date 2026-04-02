// default-config.js - 默认配置文件
// 不再包含敏感信息，所有配置从 localStorage 读取或由用户手动输入

const defaultConfig = {
  // 默认API Key（空，需要用户自行配置）
  API_KEY: '',
  
  // 默认GitHub Token（空，需要用户自行配置）
  GITHUB_TOKEN: '',
  
  // OpenClaw API URL
  OPENCLAW_API_URL: 'http://127.0.0.1:18789'
};

// 暴露配置对象
if (typeof window !== 'undefined') {
  window.defaultConfig = defaultConfig;
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = defaultConfig;
}
