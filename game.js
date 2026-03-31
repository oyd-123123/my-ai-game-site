// game.js - 内置可玩小游戏：太空收集者

(function() {
  const canvas = document.getElementById('builtinCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  let player, stars, enemies, score, lives, gameOver, animId, level;
  let keys = {};

  function init() {
    player = { x: W / 2, y: H - 60, w: 40, h: 40, speed: 5, color: '#00f5ff' };
    stars = [];
    enemies = [];
    score = 0;
    lives = 3;
    level = 1;
    gameOver = false;
    for (let i = 0; i < 8; i++) spawnStar();
    if (animId) cancelAnimationFrame(animId);
    loop();
  }

  function spawnStar() {
    stars.push({
      x: Math.random() * (W - 20) + 10,
      y: Math.random() * (H / 2),
      r: Math.random() * 8 + 6,
      color: `hsl(${Math.random() * 60 + 40}, 100%, 60%)`,
      pulse: Math.random() * Math.PI * 2
    });
  }

  function spawnEnemy() {
    enemies.push({
      x: Math.random() * (W - 30) + 15,
      y: -30,
      w: 30, h: 30,
      speed: 1.5 + level * 0.3 + Math.random(),
      color: '#ff4444'
    });
  }

  function loop() {
    update();
    draw();
    if (!gameOver) animId = requestAnimationFrame(loop);
  }

  let frameCount = 0;
  function update() {
    if (gameOver) return;
    frameCount++;

    // 移动玩家
    if ((keys['ArrowLeft'] || keys['a']) && player.x > 0) player.x -= player.speed;
    if ((keys['ArrowRight'] || keys['d']) && player.x < W - player.w) player.x += player.speed;
    if ((keys['ArrowUp'] || keys['w']) && player.y > H / 2) player.y -= player.speed;
    if ((keys['ArrowDown'] || keys['s']) && player.y < H - player.h) player.y += player.speed;

    // 生成敌人
    if (frameCount % Math.max(60 - level * 5, 20) === 0) spawnEnemy();

    // 更新星星脉冲
    stars.forEach(s => s.pulse += 0.05);

    // 更新敌人
    enemies.forEach(e => e.y += e.speed);
    enemies = enemies.filter(e => e.y < H + 50);

    // 收集星星
    stars = stars.filter(s => {
      const dx = player.x + player.w / 2 - s.x;
      const dy = player.y + player.h / 2 - s.y;
      if (Math.sqrt(dx * dx + dy * dy) < s.r + 20) {
        score += 10;
        if (score % 100 === 0) { level++; }
        spawnStar();
        return false;
      }
      return true;
    });
    if (stars.length < 3) spawnStar();

    // 碰撞敌人
    enemies.forEach((e, i) => {
      if (player.x < e.x + e.w && player.x + player.w > e.x &&
          player.y < e.y + e.h && player.y + player.h > e.y) {
        lives--;
        enemies.splice(i, 1);
        if (lives <= 0) gameOver = true;
      }
    });
  }

  function draw() {
    // 背景
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    // 背景星点
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect((i * 137 + frameCount * 0.1) % W, (i * 97 + frameCount * 0.05) % H, 1, 1);
    }

    if (gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, H / 2 - 30);
      ctx.fillStyle = '#00f5ff';
      ctx.font = '24px monospace';
      ctx.fillText(`最终得分: ${score}`, W / 2, H / 2 + 20);
      ctx.fillStyle = '#aaa';
      ctx.font = '18px monospace';
      ctx.fillText('按 R 重新开始', W / 2, H / 2 + 60);
      ctx.textAlign = 'left';
      return;
    }

    // 星星
    stars.forEach(s => {
      const glow = Math.sin(s.pulse) * 3;
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r + glow);
      grad.addColorStop(0, s.color);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r + glow, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    // 敌人
    enemies.forEach(e => {
      ctx.fillStyle = e.color;
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.shadowBlur = 0;
      // 眼睛
      ctx.fillStyle = '#fff';
      ctx.fillRect(e.x + 5, e.y + 8, 8, 8);
      ctx.fillRect(e.x + 17, e.y + 8, 8, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(e.x + 8, e.y + 11, 4, 4);
      ctx.fillRect(e.x + 20, e.y + 11, 4, 4);
    });

    // 玩家飞船
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.w / 2, player.y);
    ctx.lineTo(player.x + player.w, player.y + player.h);
    ctx.lineTo(player.x + player.w / 2, player.y + player.h - 10);
    ctx.lineTo(player.x, player.y + player.h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // HUD
    ctx.fillStyle = '#00f5ff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`分数: ${score}`, 15, 30);
    ctx.fillText(`等级: ${level}`, 15, 55);
    ctx.fillStyle = '#ff4444';
    ctx.fillText(`❤️ ${lives}`, W - 80, 30);
  }

  document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === 'r' || e.key === 'R') { if (gameOver) init(); }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  });
  document.addEventListener('keyup', e => keys[e.key] = false);

  // 触摸控制
  let touchStartX = 0, touchStartY = 0;
  canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    player.x = Math.max(0, Math.min(W - player.w, player.x + dx * 0.5));
    player.y = Math.max(H / 2, Math.min(H - player.h, player.y + dy * 0.5));
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });

  init();
})();
