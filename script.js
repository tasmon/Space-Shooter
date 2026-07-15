const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
const pauseMenu=document.getElementById("pauseMenu");

canvas.width=240;canvas.height=320;

let player,bullets,enemies,powerUps,enemyBullets,lives,score,level;
let highScore=0;let gameInterval,doubleFire=false,shield=false;
let paused=false;let shootTimer=0;let enemiesDestroyed=0;let boss=null;

// Static starfield
let stars=[];for(let i=0;i<40;i++){stars.push({x:Math.random()*240,y:Math.random()*320});}
let bgHue=220;

function startGame(){document.getElementById("menu").classList.remove("active");
canvas.style.display="block";resetGame();gameInterval=setInterval(updateGame,60);} // smoother tick

function resetGame(){
  player={x:100,y:260,width:40,height:40};
  bullets=[];enemies=[];powerUps=[];enemyBullets=[];
  lives=5;score=0;level=1;doubleFire=false;shield=false;
  paused=false;shootTimer=0;enemiesDestroyed=0;boss=null;
  pauseMenu.style.display="none";
}

function drawBackground(){
  ctx.fillStyle=`hsl(${bgHue},30%,5%)`;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="white";stars.forEach(s=>ctx.fillRect(s.x,s.y,2,2));
  bgHue+=0.03;if(bgHue>360)bgHue=0;
}

function updateGame(){
  if(paused)return;drawBackground();

  // Auto-shoot
  shootTimer++;
  if(shootTimer>15){
    bullets.push({x:player.x+player.width/2-2,y:player.y});
    if(doubleFire){
      bullets.push({x:player.x+5,y:player.y});
      bullets.push({x:player.x+player.width-5,y:player.y});
    }
    shootTimer=0;
  }

  // Player ship
  ctx.fillStyle=shield?"lime":"cyan";
  ctx.beginPath();
  ctx.moveTo(player.x+player.width/2,player.y);
  ctx.lineTo(player.x,player.y+player.height);
  ctx.lineTo(player.x+player.width,player.y+player.height);
  ctx.closePath();ctx.fill();

  // Player bullets
  ctx.fillStyle="yellow";
  bullets.forEach((b,i)=>{b.y-=3;ctx.fillRect(b.x,b.y,5,15);if(b.y<0)bullets.splice(i,1);});

  // Boss logic
  if(level%5===0&&!boss){boss={x:60,y:20,width:120,height:40,hp:40+level*5};}
  if(boss){
    ctx.fillStyle="purple";ctx.fillRect(boss.x,boss.y,boss.width,boss.height);
    boss.x+=Math.sin(Date.now()/500)*2;
    bullets.forEach((b,j)=>{if(b.x>boss.x&&b.x<boss.x+boss.width&&b.y>boss.y&&b.y<boss.y+boss.height){
      bullets.splice(j,1);boss.hp--;if(boss.hp<=0){score+=200;lives++;boss=null;level++;}}});
  }

  // Regular enemies
  if(!boss&&Math.random()<0.02+level*0.001){
    const colors=["red","orange","blue","pink","cyan","magenta"];
    enemies.push({x:Math.random()*200,y:0,size:15+level,color:colors[Math.floor(Math.random()*colors.length)]});
  }
  enemies.forEach((e,i)=>{
    e.y+=0.6+level*0.1;
    ctx.fillStyle=e.color;ctx.beginPath();ctx.arc(e.x,e.y,e.size,0,Math.PI*2);ctx.fill();

    // Enemy shooting
    if(Math.random()<0.005){enemyBullets.push({x:e.x,y:e.y,speed:2});}

    bullets.forEach((b,j)=>{if(b.x<e.x+e.size&&b.x>e.x-e.size&&b.y<e.y+e.size&&b.y>e.y-e.size){
      enemies.splice(i,1);bullets.splice(j,1);score+=10;enemiesDestroyed++;
      if(enemiesDestroyed>=15&&level<20){level++;enemiesDestroyed=0;}}});

    if(e.x<player.x+player.width&&e.x>player.x&&e.y+e.size>player.y&&e.y<player.y+player.height){
      enemies.splice(i,1);if(shield)shield=false;else{lives--;if(lives<=0)endGame();}}
    if(e.y>320)enemies.splice(i,1);
  });

  // Enemy bullets
  ctx.fillStyle="red";
  enemyBullets.forEach((eb,i)=>{
    eb.y+=eb.speed;ctx.fillRect(eb.x,eb.y,4,8);
    if(eb.y>320)enemyBullets.splice(i,1);
    if(eb.x>player.x&&eb.x<player.x+player.width&&eb.y>player.y&&eb.y<player.y+player.height){
      enemyBullets.splice(i,1);
      if(shield)shield=false;else{lives--;if(lives<=0)endGame();}
    }
  });

  // PowerUps (rarer)
  if(Math.random()<0.003){
    let type=Math.random()<0.5?"shield":"double";
    powerUps.push({x:Math.random()*200,y:0,size:12,type});
  }
  ctx.fillStyle="green";
  powerUps.forEach((p,i)=>{
    p.y+=2;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
    if(p.x<player.x+player.width&&p.x>player.x&&p.y>player.y&&p.y<player.y+player.height){
      if(p.type==="shield")shield=true;if(p.type==="double")doubleFire=true;powerUps.splice(i,1);}
    if(p.y>320)powerUps.splice(i,1);
  });

  // HUD
  ctx.fillStyle="white";ctx.font="bold 12px Arial";
  ctx.textAlign="left";ctx.fillText("Score: "+score,5,15);ctx.fillText("Level: "+level,5,30);
  ctx.textAlign="right";ctx.fillText("Lives: "+lives,235,15);ctx.fillText("High: "+highScore,235,30);
  if(boss){ctx.textAlign="center";ctx.fillText("Boss HP: "+boss.hp,120,45);}
}

function endGame(){clearInterval(gameInterval);
  if(score>highScore){highScore=score;document.getElementById("highscoreValue").innerText=highScore;}
  alert("Game Over! Score: "+score+" | Level: "+level);backToMenu();
}
function openPage(id){document.getElementById("menu").classList.remove("active");document.getElementById(id).classList.add("active");}
function backToMenu(){canvas.style.display="none";pauseMenu.style.display="none";
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("menu").classList.add("active");}
function resumeGame(){paused=false;pauseMenu.style.display="none";}
function quitGame(){clearInterval(gameInterval);backToMenu();}

// Controls with T9 keypad
document.addEventListener("keydown",e=>{
  switch(e.key){
    case"1":backToMenu();break;
    case"2":player.y=Math.max(0,player.y-10);break;
    case"8":player.y=Math.min(280,player.y+10);break;
    case"4":player.x=Math.max(0,player.x-10);break;
    case"6":player.x=Math.min(200,player.x+10);break;
    case"5":paused=!paused;pauseMenu.style.display=paused?"block":"none";break;
    case"0":paused=true;pauseMenu.style.display="block";break;
  }
});
