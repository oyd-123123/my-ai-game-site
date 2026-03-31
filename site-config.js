// config.js - 站点配置（本地使用，不提交到 git）
// 敏感信息填在这里，页面加载时自动读取

var API_CONFIG = {
  apiKey: "",  // 从页面输入框读取，或在此填写
  endpoint: "ep-20260312161928-thlqj",
  apiUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
};

// GitHub Gist Token（发布公共游戏库用），可选
// 若不填写，则无法发布游戏到公共库
// const GIST_TOKEN = ""; 