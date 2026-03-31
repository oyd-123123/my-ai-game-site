// inject-games.js - 将openclawcopy.txt中的游戏数据注入到IndexedDB

// 游戏数据
const gamesData = [
  {
    id: "g1",
    name: "太空射击",
    description: "经典太空射击游戏，方向键控制飞船，空格键射击",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [],
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>太空射击</title>
<style>
*{margin:0;padding:0}
body{background:#050510;display:flex;justify-content:center;align-items:center;height:100vh}
canvas{border:2px solid #0ff;box-shadow:0 0 30px #0ff}
</style>
</head>
<body>
<canvas id="c" width="500" height="700"></canvas>
<script>
const c=document.getElementById("c"),ctx=c.getContext("2d");
const W=c.width,H=c.height;
let score=0,lives=3,over=false,frame=0;
let player={x:W/2,y:H-80};
let bullets=[],enemies=[];
let keys={};
document.addEventListener("keydown",e=>{keys[e.key]=true;if(e.key===" ")e.preventDefault();});
document.addEventListener("keyup",e=>keys[e.key]=false);
let fireTimer=0;
function update(){
if(over)return;
frame++;
if(keys.ArrowLeft)player.x-=6;
if(keys.ArrowRight)player.x+=6;
player.x=Math.max(20,Math.min(W-20,player.x));
fireTimer++;
if((keys[" "]||keys.ArrowUp)&&fireTimer>8){bullets.push({x:player.x,y:player.y-20});fireTimer=0;}
bullets.forEach(b=>b.y-=10);
bullets=bullets.filter(b=>b.y>0);
if(frame%40===0)enemies.push({x:Math.random()*(W-40)+20,y:-20,vx:(Math.random()-0.5)*3,vy:2+Math.random()*2});
enemies.forEach(e=>{e.x+=e.vx;e.y+=e.vy;if(e.x<20||e.x>W-20)e.vx=-e.vx;});
bullets.forEach(b=>enemies.forEach(e=>{if(Math.abs(b.x-e.x)<20&&Math.abs(b.y-e.y)<20){b.y=-999;e.y=H+99;score+=10;}}));
enemies=enemies.filter(e=>e.y<H+50);
enemies.forEach(e=>{if(Math.abs(player.x-e.x)<25&&Math.abs(player.y-e.y)<25){lives--;e.y=H+99;if(lives<=0)over=true;}});
}
function draw(){
ctx.fillStyle="#050510";
ctx.fillRect(0,0,W,H);
for(let i=0;i<60;i++)ctx.fillStyle="rgba(255,255,255,0.15)",ctx.fillRect((i*97+frame*0.2)%W,(i*73+frame*0.3)%H,1,1);
ctx.fillStyle="#0ff";
ctx.shadowColor="#0ff";
ctx.shadowBlur=20;
ctx.beginPath();
ctx.moveTo(player.x,player.y-18);
ctx.lineTo(player.x-14,player.y+14);
ctx.lineTo(player.x,player.y+6);
ctx.lineTo(player.x+14,player.y+14);
ctx.closePath();
ctx.fill();
ctx.shadowBlur=0;
ctx.fillStyle="#ff0";
bullets.forEach(b=>{ctx.beginPath();ctx.arc(b.x,b.y,3,0,Math.PI*2);ctx.fill();});
ctx.fillStyle="#f0f";
enemies.forEach(e=>{ctx.beginPath();ctx.arc(e.x,e.y,15,0,Math.PI*2);ctx.fill();});
ctx.fillStyle="#fff";
ctx.font="20px Arial";
ctx.fillText("Score: "+score,10,30);
ctx.fillText("Lives: "+lives,10,60);
if(over){
ctx.fillStyle="rgba(0,0,0,0.7)";
ctx.fillRect(0,0,W,H);
ctx.fillStyle="#f00";
ctx.font="40px Arial";
ctx.fillText("GAME OVER",W/2-100,H/2);
ctx.font="20px Arial";
ctx.fillText("Press R to Restart",W/2-80,H/2+40);
}
}
function loop(){update();draw();requestAnimationFrame(loop);}
loop();
document.addEventListener("keydown",e=>{if(e.key==="r"&&over){score=0;lives=3;over=false;frame=0;player.x=W/2;bullets=[];enemies=[];}});
</script>
</body>
</html>`
  }
];

// 注入游戏数据到IndexedDB
async function injectGames() {
  if (typeof storage === 'undefined') {
    console.error('storage对象未定义，请先加载storage.js');
    return;
  }

  try {
    for (const game of gamesData) {
      // 确保游戏有版本信息
      if (!game.versions || game.versions.length === 0) {
        game.versions = [{
          id: Date.now().toString(),
          code: game.code,
          createdAt: game.createdAt
        }];
      }
      
      await storage.saveGame(game);
      console.log(`游戏 "${game.name}" 注入成功`);
    }
    console.log('所有游戏数据注入完成！');
    alert('游戏数据注入完成！');
  } catch (error) {
    console.error('注入游戏数据失败', error);
    alert('注入游戏数据失败: ' + error.message);
  }
}

// 暴露全局函数
window.injectGames = injectGames;
