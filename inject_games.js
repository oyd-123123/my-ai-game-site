// 更多融合游戏 - 保存到 localStorage 后刷新页面即可见
// 在浏览器控制台(F12)执行此脚本

const moreGames = [
  {
    id: 'fusion_snake_brick',
    name: '蛇形弹球',
    description: '贪吃蛇 + 打砖块：球拍跟随蛇头移动，碰撞砖块得分，蛇身越长球拍越大',
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>蛇形弹球</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#050510;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace}canvas{border:2px solid #0ff;box-shadow:0 0 20px #0ff}#hud{color:#0ff;font-size:1.3rem;margin-bottom:10px;text-shadow:0 0 10px #0ff}</style></head>
<body>
<div id="hud">得分: <span id="s">0</span> | 蛇身: <span id="l">3</span></div>
<canvas id="c" width="640" height="520"></canvas>
<script>
const c=document.getElementById("c"),ctx=c.getContext("2d");
const W=c.width,H=c.height;
const COLS=8,ROWS=4,BW=76,BH=22,GP=5;
const OX=(W-COLS*(BW+GP))/2,OY=35;
let snake=[],dir={x:1,y:0},score=0;
let ball={x:W/2,y:H/2,r:8,dx:3,dy:-3};
let bricks=[],over=false,clicked=false;
const COLORS=["#f0f","#0ff","#ff0","#0f0"];
function initBricks(){bricks=[];for(let r=0;r<ROWS;r++)for(let col=0;col<COLS;col++)bricks.push({x:OX+col*(BW+GP),y:OY+r*(BH+GP),w:BW,h:BH,color:COLORS[r],alive:true});}
function initSnake(){snake=[];for(let i=0;i<3;i++)snake.push({x:W/2-i*12,y:H-60});}
function draw(){
ctx.fillStyle="#050510";ctx.fillRect(0,0,W,H);
bricks.forEach(b=>{if(!b.alive)return;ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=10;ctx.fillRect(b.x,b.y,b.w,b.h);});ctx.shadowBlur=0;
snake.forEach((s,i)=>{const t=i/snake.length;ctx.fillStyle="rgba(0,255,255,"+(0.3+t*0.7)+")";ctx.shadowColor="#0ff";ctx.shadowBlur=i===0?15:5;ctx.beginPath();ctx.arc(s.x,s.y,10-i*0.2,0,Math.PI*2);ctx.fill();});ctx.shadowBlur=0;
ctx.fillStyle="#fff";ctx.shadowColor="#fff";ctx.shadowBlur=20;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
}
function update(){
if(over||!clicked)return;
const head={x:snake[0].x+dir.x*6,y:snake[0].y+dir.y*6};
if(head.x<15||head.x>W-15)dir.x=-dir.x;
if(head.y<15||head.y>H-15)dir.y=-dir.y;
snake.unshift(head);
bricks.forEach(b=>{if(!b.alive)return;if(ball.x+b.r>b.x&&ball.x-b.r<b.x+b.w&&ball.y+b.r>b.y&&ball.y-b.r<b.y+b.h){b.alive=false;ball.dy=-ball.dy;score+=20;}});
ball.x+=ball.dx;ball.y+=ball.dy;
if(ball.x<ball.r||ball.x>W-ball.r)ball.dx=-ball.dx;
if(ball.y<ball.r){ball.dy=-ball.dy;}
if(ball.y>H){if(snake.length>1){snake.pop();ball.y=H-60;ball.dx=(Math.random()-0.5)*6;}else{over=true;ctx.fillStyle="rgba(0,0,0,0.7)";ctx.fillRect(0,0,W,H);ctx.fillStyle="#f00";ctx.font="bold 36px monospace";ctx.textAlign="center";ctx.fillText("GAME OVER! Score:"+score,W/2,H/2);ctx.textAlign="left";return;}}
if(ball.y+ball.r>H-45&&Math.abs(ball.x-snake[0].x)<60+snake.length*3){ball.dy=-Math.abs(ball.dy);ball.dx=6*(ball.x-snake[0].x)/60;snake.push({x:snake[snake.length-1].x,y:snake[snake.length-1].y});document.getElementById("l").textContent=snake.length;}
if(ball.x<snake[0].x-4)dir.x=-1;else if(ball.x>snake[0].x+4)dir.x=1;
if(ball.y<snake[0].y-4)dir.y=-1;else if(ball.y>snake[0].y+4)dir.y=1;
document.getElementById("s").textContent=score;}
function loop(){update();draw();if(!over)requestAnimationFrame(loop);}
c.addEventListener("click",()=>{if(!clicked){clicked=true;initBricks();initSnake();loop();}else if(over){score=0;clicked=true;over=false;initBricks();initSnake();document.getElementById("s").textContent=score;document.getElementById("l").textContent=snake.length;loop();}});
document.addEventListener("keydown",e=>{if(e.key==="r"||e.key==="R"){score=0;over=false;initBricks();initSnake();document.getElementById("s").textContent=score;document.getElementById("l").textContent=snake.length;clicked=true;loop();}});
initBricks();initSnake();draw();
<\/script></body></html>`,
    time: new Date().toLocaleString(),
    version: 1,
    fusion: ['经典贪吃蛇', '霓虹打砖块']
  },
  {
    id: 'fusion_bullet_2048',
    name: '弹幕2048',
    description: '2048 + 飞行障碍：控制飞船收集数字融合，躲避红色障碍物',
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>弹幕2048</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#050510;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:monospace}canvas{border:2px solid #0ff;box-shadow:0 0 20px #0ff}#hud{color:#0ff;font-size:1.3rem;margin-bottom:10px;text-shadow:0 0 10px #0ff}</style></head>
<body>
<div id="hud">得分: <span id="sc">0</span> | 最高: <span id="b">0</span></div>
<canvas id="c" width="420" height="600"></canvas>
<script>
const c=document.getElementById("c"),ctx=c.getContext("2d");
const W=c.width,H=c.height;
let player={x:W/2,y:H-80},score=0,best=0,frame=0,over=false,clicked=false;
let items=[],obstacles=[];
const CL={2:"#0ff",4:"#0f0",8:"#ff0",16:"#f80",32:"#f00",64:"#f0f"};
best=parseInt(localStorage.getItem("b2048Best")||"0");
function spawn(){const v=[2,2,2,4,4,8][Math.floor(Math.random()*6)];items.push({x:Math.random()*(W-40)+20,y:-20,v,vy:2+Math.random()});if(Math.random()<0.12)obstacles.push({x:Math.random()*(W-30)+15,y:-20,w:30,h:30,vy:2+score/300});}
function reset(){player={x:W/2,y:H-80};items=[];obstacles=[];score=0;over=false;frame=0;}
function draw(){
ctx.fillStyle="#050510";ctx.fillRect(0,0,W,H);
for(let i=0;i<40;i++)ctx.fillStyle="rgba(255,255,255,0.1)",ctx.fillRect((i*97+frame*0.1)%W,(i*73+frame*0.05)%H,1,1);
items.forEach(it=>{const cl=CL[it.v]||"#aaa";ctx.fillStyle=cl;ctx.shadowColor=cl;ctx.shadowBlur=15;ctx.beginPath();ctx.arc(it.x,it.y,18,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle=it.v>8?"#000":"#fff";ctx.font="bold 14px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(it.v,it.x,it.y);});
obstacles.forEach(o=>{ctx.fillStyle="#f00";ctx.shadowColor="#f00";ctx.shadowBlur=10;ctx.fillRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h);ctx.shadowBlur=0;});
ctx.fillStyle="#0ff";ctx.shadowColor="#0ff";ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(player.x,player.y-18);ctx.lineTo(player.x-14,player.y+14);ctx.lineTo(player.x,player.y+6);ctx.lineTo(player.x+14,player.y+14);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
if(over){ctx.fillStyle="rgba(0,0,0,0.7)";ctx.fillRect(0,0,W,H);ctx.fillStyle="#f00";ctx.font="bold 36px monospace";ctx.textAlign="center";ctx.fillText("GAME OVER",W/2,H/2-20);ctx.fillStyle="#0ff";ctx.font="24px monospace";ctx.fillText("Score:"+score+" Best:"+best,W/2,H/2+20);ctx.textAlign="left";}}
function update(){
if(over||!clicked)return;
frame++;
if(frame%28===0)spawn();
if(keys.ArrowLeft||keys.a)player.x-=5;
if(keys.ArrowRight||keys.d)player.x+=5;
if(keys.ArrowUp||keys.w)player.y-=3;
if(keys.ArrowDown||keys.s)player.y+=3;
player.x=Math.max(20,Math.min(W-20,player.x));
player.y=Math.max(40,Math.min(H-30,player.y));
items.forEach(it=>it.y+=it.vy);
items=items.filter(it=>{const dx=player.x-it.x,dy=player.y-it.y;if(Math.sqrt(dx*dx+dy*dy)<25){let merged=false;items.forEach(other=>{if(other!==it&&other.v===it.v&&Math.sqrt((other.x-it.x)**2+(other.y-it.y)**2)<40){other.v*=2;score+=other.v;merged=true;}});if(!merged)score+=it.v;return false;}return it.y<H+30;});
obstacles.forEach(o=>{o.y+=o.vy;if(Math.abs(player.x-o.x)<20&&Math.abs(player.y-o.y)<25){over=true;if(score>best){best=score;localStorage.setItem("b2048Best",best);}}});
document.getElementById("sc").textContent=score;}
let keys={};
document.addEventListener("keydown",e=>{keys[e.key]=true;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))e.preventDefault();if(e.key==="r"||e.key==="R"){reset();document.getElementById("sc").textContent=score;clicked=true;}});
document.addEventListener("keyup",e=>keys[e.key]=false);
c.addEventListener("click",()=>{if(!clicked){clicked=true;loop();}else if(over){reset();clicked=true;}});
function loop(){update();draw();if(!over)requestAnimationFrame(loop);}
document.getElementById("sc").textContent=score;document.getElementById("b").textContent=best;loop();
<\/script></body></html>`,
    time: new Date().toLocaleString(),
    version: 1,
    fusion: ['2048 数字融合', '飞行障碍赛']
  },
  {
    id: 'fusion_thunder_snake',
    name: '雷电贪吃',
    description: '雷电飞行 + 贪吃蛇：收集能量球得分，蛇身越长火力越强，可发射更多子弹',
    code: `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>雷电贪吃</title>
<style>*{margin:0;padding:0}body{background:#050510;display:flex;justify-content:center;align-items:center;height:100vh}canvas{border:2px solid #9f0;box-shadow:0 0 30px #9f0}</style></head>
<body><canvas id="c" width="500" height="700"></canvas>
<script>
const c=document.getElementById("c"),ctx=c.getContext("2d");
const W=c.width,H=c.height;
let score=0,over=false,frame=0;
let player={x:W/2,y:H-100,fire:0};
let bullets=[],enemies=[],foods=[],tails=[];
let keys={};
document.addEventListener("keydown",e=>keys[e.key]=true);
document.addEventListener("keyup",e=>keys[e.key]=false);
function update(){
if(over)return;
frame++;
if(keys.ArrowLeft||keys.a)player.x-=6;
if(keys.ArrowRight||keys.d)player.x+=6;
if(keys.ArrowUp||keys.w)player.y-=4;
if(keys.ArrowDown||keys.s)player.y+=4;
player.x=Math.max(20,Math.min(W-20,player.x));
player.y=Math.max(40,Math.min(H-30,player.y));
player.fire++;
const fireRate=Math.max(3,8-tails.length);
if(player.fire%fireRate===0)bullets.push({x:player.x,y:player.y,vy:-10});
bullets.forEach(b=>b.y+=b.vy);
bullets=bullets.filter(b=>b.y>0);
if(frame%50===0)foods.push({x:Math.random()*(W-40)+20,y:-20,v:2+Math.floor(frame/500)});
foods.forEach(f=>f.y+=2);
foods=foods.filter(f=>{if(Math.abs(player.x-f.x)<25&&Math.abs(player.y-f.y)<25){score+=f.v;tails.push({x:player.x,y:player.y});return false;}return f.y<H+30;});
if(frame%40===0){const type=Math.random()>0.7?1:0;enemies.push({x:Math.random()*(W-40)+20,y:-30,w:type===1?40:30,h:type===1?40:30,hp:type===1?2:1,type,vx:(Math.random()-0.5)*2,vy:2+Math.random()*2});}
enemies.forEach(e=>{e.x+=e.vx;e.y+=e.vy;if(e.x<20||e.x>W-20)e.vx=-e.vx;});
enemies=enemies.filter(e=>e.y<H+50&&e.hp>0);
bullets.forEach(b=>enemies.forEach(e=>{if(b.x>e.x-e.w/2&&b.x<e.x+e.w/2&&Math.abs(b.y-e.y)<e.h/2){e.hp--;b.y=-999;if(e.hp<=0)score+=e.type===1?30:10;}}));
enemies.forEach(e=>{if(Math.abs(player.x-e.x)<25&&Math.abs(player.y-e.y)<25)over=true;});
}
function draw(){
ctx.fillStyle="#050510";ctx.fillRect(0,0,W,H);
for(let i=0;i<50;i++)ctx.fillStyle="rgba(255,255,255,0.12)",ctx.fillRect((i*97+frame*0.02)%W,(i*73+frame*0.03)%H,1,1);
foods.forEach(f=>{ctx.fillStyle="#ff0";ctx.shadowColor="#ff0";ctx.shadowBlur=15;ctx.beginPath();ctx.arc(f.x,f.y,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="#000";ctx.font="bold 10px monospace";ctx.textAlign="center";ctx.fillText(f.v,f.x,f.y+4);});ctx.shadowBlur=0;
enemies.forEach(e=>{ctx.fillStyle=e.type===1?"#f0f":"#f80";ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=10;ctx.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);});ctx.shadowBlur=0;
tails.forEach((t,i)=>{ctx.fillStyle="rgba(0,255,0,"+(0.8-i*0.05)+")";ctx.shadowColor="#0f0";ctx.shadowBlur=8;ctx.beginPath();ctx.arc(t.x,t.y,Math.max(3,8-i*0.3),0,Math.PI*2);ctx.fill();});ctx.shadowBlur=0;
ctx.fillStyle="#9f0";ctx.shadowColor="#9f0";ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(player.x,player.y-18);ctx.lineTo(player.x-14,player.y+14);ctx.lineTo(player.x,player.y+6);ctx.lineTo(player.x+14,player.y+14);ctx.closePath();ctx.fill();ctx.shadowBlur=0;
bullets.forEach(b=>{ctx.fillStyle="#0f0";ctx.shadowColor="#0f0";ctx.shadowBlur=8;ctx.fillRect(b.x-2,b.y-6,4,12);});ctx.shadowBlur=0;
ctx.fillStyle="#9f0";ctx.font="bold 16px monospace";ctx.fillText("SCORE:"+score,W/2,25);
ctx.fillStyle="#0ff";ctx.fillText("Tails:"+tails.length+" Fire:"+Math.max(1,tails.length+1)+"x",W/2,50);
if(over){ctx.fillStyle="rgba(0,0,0,0.7)";ctx.fillRect(0,0,W,H);ctx.fillStyle="#f00";ctx.font="bold 40px monospace";ctx.textAlign="center";ctx.fillText("GAME OVER",W/2,H/2-20);ctx.fillStyle="#0ff";ctx.font="24px monospace";ctx.fillText("Score:"+score,W/2,H/2+20);ctx.font="18px monospace";ctx.fillStyle="#ff0";ctx.fillText("Tails:"+tails.length+" | Fire:"+Math.max(1,tails.length+1)+"x",W/2,H/2+50);ctx.fillText("Click to restart",W/2,H/2+80);ctx.textAlign="left";}}
function loop(){update();draw();if(!over)requestAnimationFrame(loop);}
c.addEventListener("click",()=>{if(over){score=0;frame=0;player={x:W/2,y:H-100,fire:0};bullets=[];enemies=[];foods=[];tails=[];over=false;loop();}else loop();});
document.addEventListener("keydown",e=>{if((e.key==="r"||e.key==="R")&&over){score=0;frame=0;player={x:W/2,y:H-100,fire:0};bullets=[];enemies=[];foods=[];tails=[];over=false;loop();}});
loop();
<\/script></body></html>`,
    time: new Date().toLocaleString(),
    version: 1,
    fusion: ['雷电飞行射击', '经典贪吃蛇']
  }
];

// 合并到现有游戏列表
let existing = JSON.parse(localStorage.getItem('GAMEDEV_GAMES') || '[]');
let added = 0;
moreGames.forEach(g => {
  if (!existing.find(e => e.name === g.name)) {
    existing.push(g);
    added++;
  }
});
localStorage.setItem('GAMEDEV_GAMES', JSON.stringify(existing));
console.log('添加了 ' + added + ' 个融合游戏！');
console.log('当前共 ' + existing.length + ' 个游戏：');
existing.forEach((g, i) => console.log((i+1) + '. ' + g.name + (g.fusion ? ' [融合:' + g.fusion.join('+') + ']' : '')));
