// ai-game-maker.js —— 多轮迭代版（完整）

let gameHistory = [];
let currentCode = '';
let generationCount = 0;

// ===== API Key 读取 =====
function getApiKey() {
  return document.getElementById('apiKeyInput')?.value.trim()
    || localStorage.getItem('LLM_API_KEY')
    || API_CONFIG.apiKey
    || '';
}

// ===== 加载动画 =====
function showLoading(show, text) {
  const overlay = document.getElementById('loadingIndicator');
  const loadingText = document.getElementById('loadingText');
  if (overlay) overlay.style.display = show ? 'flex' : 'none';
  if (loadingText && text) loadingText.textContent = text;
}

// ===== 核心：AI生成/迭代 =====
async function generateGameByAI(prompt, isModify = false) {
  const apiKey = getApiKey();
  if (!apiKey) {
    alert('请先在顶部输入框填写你的 API Key！');
    return '';
  }

  showLoading(true, isModify ? '🔧 AI正在迭代修改...' : '🤖 AI正在生成游戏代码...');

  const messages = [
    {
      role: "system",
      content: `你是专业的HTML5网页游戏生成器。
规则：
1. 只输出完整可运行的HTML文档代码，不要解释、不要markdown代码块、不要多余文字。
2. 游戏使用HTML5 Canvas，适配网页，操作简单流畅。
3. 必须包含：游戏开始、运行循环、结束判断、得分显示、重新开始功能。
4. 修改时必须保留原有全部功能，只按用户要求优化或新增。
5. 代码风格：深色背景，霓虹色调，好看的游戏UI。
6. 当有参考游戏时，借鉴参考游戏的风格、功能和代码结构，但不要直接复制，而是创造性地融合到新游戏中。`
    }
  ];

  // 获取参考游戏
  let referenceGameCode = '';
  const referenceGameId = document.getElementById('referenceGame')?.value;
  if (referenceGameId) {
    const games = JSON.parse(localStorage.getItem('GAMEDEV_GAMES') || '[]');
    const referenceGame = games.find(g => g.id === referenceGameId);
    if (referenceGame) {
      referenceGameCode = referenceGame.code;
    }
  }

  if (isModify && currentCode) {
    // 带上历史上下文
    if (gameHistory.length > 0) {
      messages.push(...gameHistory.slice(-10)); // 最近5轮
    }
    let content = `当前游戏代码如下：\n\`\`\`html\n${currentCode}\n\`\`\`\n\n请根据以下要求修改（保留所有原有功能）：${prompt}`;
    if (referenceGameCode) {
      content += `\n\n参考游戏代码如下（请借鉴其风格和功能）：\n\`\`\`html\n${referenceGameCode}\n\`\`\``;
    }
    messages.push({ role: "user", content: content });
  } else {
    let content = `生成一个"${prompt}"的网页游戏，输出完整HTML文档`;
    if (referenceGameCode) {
      content += `\n\n参考游戏代码如下（请借鉴其风格和功能）：\n\`\`\`html\n${referenceGameCode}\n\`\`\``;
    }
    messages.push({ role: "user", content: content });
  }

  try {
    const res = await fetch(API_CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: API_CONFIG.endpoint,
        messages: messages,
        temperature: 0.7,
        max_tokens: 6000
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`API错误 ${res.status}: ${err.error?.message || JSON.stringify(err)}`);
    }

    const data = await res.json();
    let code = data.choices?.[0]?.message?.content || '';

    // 清理markdown代码块
    code = code.replace(/^```html\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim();

    // 更新历史（使用完整 messages 中最后一条 user content，保留参考游戏上下文）
    const lastUserMsg = messages[messages.length - 1];
    gameHistory.push({ role: "user", content: lastUserMsg.content });
    gameHistory.push({ role: "assistant", content: code });
    if (gameHistory.length > 20) gameHistory = gameHistory.slice(-20);

    currentCode = code;
    generationCount++;

    // 更新历史记录UI
    addHistoryItem(isModify ? '🔧 修改' : '🚀 生成', prompt);

    return code;
  } catch (e) {
    console.error("生成失败", e);
    alert('生成失败: ' + e.message);
    return '';
  } finally {
    showLoading(false);
  }
}

// ===== 重置AI记忆 =====
function resetGameGenerator() {
  gameHistory = [];
  currentCode = '';
  generationCount = 0;
  const log = document.getElementById('historyLog');
  if (log) log.innerHTML = '<p class="empty-hint">暂无记录</p>';
}

// ===== 历史记录UI =====
function addHistoryItem(type, text) {
  const log = document.getElementById('historyLog');
  if (!log) return;
  const empty = log.querySelector('.empty-hint');
  if (empty) empty.remove();

  const div = document.createElement('div');
  div.className = 'history-item';
  // 使用 textContent 避免 XSS
  const typeSpan = document.createElement('span');
  typeSpan.className = 'history-type';
  typeSpan.textContent = type;
  const textSpan = document.createElement('span');
  textSpan.className = 'history-text';
  textSpan.textContent = text.slice(0, 40) + (text.length > 40 ? '...' : '');
  div.appendChild(typeSpan);
  div.appendChild(textSpan);
  div.onclick = () => {
    // 点击历史可以重新填入prompt
    const promptEl = document.getElementById('aiPrompt');
    if (promptEl) promptEl.value = text;
  };
  log.prepend(div);

  // 更新历史数量 badge
  const badge = document.getElementById('historyCount');
  if (badge) badge.textContent = log.querySelectorAll('.history-item').length;
}

// ===== 内置太空游戏代码 =====
function getBuiltInGameCode() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>太空收集者</title>
<style>
  body { margin:0; background:#0a0a1a; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:monospace; }
  canvas { border:1px solid rgba(0,245,255,0.3); border-radius:8px; }
  #info { color:#00f5ff; margin-bottom:12px; font-size:14px; }
</style>
</head>
<body>
<div id="info">⌨️ 方向键/WASD 移动 &nbsp;|&nbsp; R 重新开始</div>
<canvas id="c" width="700" height="480"></canvas>
<script>
const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height;
let player,stars,enemies,score,lives,gameOver,frame,keys={};
function init(){
  player={x:W/2,y:H-70,w:40,h:40,speed:5};
  stars=[];enemies=[];score=0;lives=3;gameOver=false;frame=0;
  for(let i=0;i<8;i++)spawnStar();
  requestAnimationFrame(loop);
}
function spawnStar(){
  stars.push({x:Math.random()*(W-40)+20,y:Math.random()*(H/2-40)+20,r:Math.random()*8+6,
    color:'hsl('+(Math.random()*60+40)+',100%,60%)',pulse:Math.random()*Math.PI*2});
}
function loop(){
  frame++;
  // 移动
  if((keys.ArrowLeft||keys.a)&&player.x>0)player.x-=player.speed;
  if((keys.ArrowRight||keys.d)&&player.x<W-player.w)player.x+=player.speed;
  if((keys.ArrowUp||keys.w)&&player.y>H/2)player.y-=player.speed;
  if((keys.ArrowDown||keys.s)&&player.y<H-player.h)player.y+=player.speed;
  // 生成敌人
  if(frame%Math.max(60-Math.floor(score/50)*3,20)===0)
    enemies.push({x:Math.random()*(W-30)+15,y:-30,w:28,h:28,speed:1.5+score/200});
  // 更新星星
  stars.forEach(s=>s.pulse+=0.05);
  // 收集星星
  stars=stars.filter(s=>{
    const dx=player.x+player.w/2-s.x,dy=player.y+player.h/2-s.y;
    if(Math.sqrt(dx*dx+dy*dy)<s.r+20){score+=10;spawnStar();return false;}
    return true;
  });
  if(stars.length<3)spawnStar();
  // 更新敌人
  enemies=enemies.filter(e=>{
    e.y+=e.speed;
    if(player.x<e.x+e.w&&player.x+player.w>e.x&&player.y<e.y+e.h&&player.y+player.h>e.y){
      lives--;if(lives<=0)gameOver=true;return false;
    }
    return e.y<H+50;
  });
  // 绘制
  ctx.fillStyle='#0a0a1a';ctx.fillRect(0,0,W,H);
  // 背景星点
  ctx.fillStyle='rgba(255,255,255,0.2)';
  for(let i=0;i<60;i++)ctx.fillRect((i*137+frame*0.1)%W,(i*97+frame*0.05)%H,1,1);
  if(gameOver){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ff4444';ctx.font='bold 48px monospace';ctx.textAlign='center';
    ctx.fillText('GAME OVER',W/2,H/2-30);
    ctx.fillStyle='#00f5ff';ctx.font='24px monospace';
    ctx.fillText('得分: '+score,W/2,H/2+20);
    ctx.fillStyle='#aaa';ctx.font='18px monospace';
    ctx.fillText('按 R 重新开始',W/2,H/2+60);
    ctx.textAlign='left';return;
  }
  // 星星
  stars.forEach(s=>{
    const g=Math.sin(s.pulse)*3;
    const grad=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r+g);
    grad.addColorStop(0,s.color);grad.addColorStop(1,'transparent');
    ctx.beginPath();ctx.arc(s.x,s.y,s.r+g,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();
  });
  // 敌人
  enemies.forEach(e=>{
    ctx.fillStyle='#ff4444';ctx.shadowColor='#ff0000';ctx.shadowBlur=10;
    ctx.fillRect(e.x,e.y,e.w,e.h);ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.fillRect(e.x+4,e.y+7,7,7);ctx.fillRect(e.x+15,e.y+7,7,7);
    ctx.fillStyle='#000';ctx.fillRect(e.x+7,e.y+10,3,3);ctx.fillRect(e.x+18,e.y+10,3,3);
  });
  // 玩家
  ctx.shadowColor='#00f5ff';ctx.shadowBlur=15;ctx.fillStyle='#00f5ff';
  ctx.beginPath();
  ctx.moveTo(player.x+player.w/2,player.y);
  ctx.lineTo(player.x+player.w,player.y+player.h);
  ctx.lineTo(player.x+player.w/2,player.y+player.h-10);
  ctx.lineTo(player.x,player.y+player.h);
  ctx.closePath();ctx.fill();ctx.shadowBlur=0;
  // HUD
  ctx.fillStyle='#00f5ff';ctx.font='bold 16px monospace';
  ctx.fillText('分数: '+score,15,28);
  ctx.fillText('等级: '+Math.floor(score/100+1),15,50);
  ctx.fillStyle='#ff6666';ctx.fillText('❤ '.repeat(lives),W-90,28);
  if(!gameOver)requestAnimationFrame(loop);
}
document.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if((e.key==='r'||e.key==='R')&&gameOver)init();
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();
});
document.addEventListener('keyup',e=>keys[e.key]=false);
init();
</script>
</body>
</html>`;
}
