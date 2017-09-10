import WorldMap from './WorldMap';
import Player from './Player';

let canvas = document.getElementById('game'),
    ctx = canvas.getContext('2d'),
    gameOver = { val: false },
    gameWon = { val: false },
    loading = { val: true, progress: 0 },
    lastUpdate = null,
    toRenderW = 0,
    toRenderH = 0,
    tileSize = 16,
    world = null,
    player = null,
    dmgDisplays = [],
    runningIntro = true,
    introPart = 1,
    renderingText = true,
    currentText = 0,
    lettersDisplayed = 0,
    lastLetterTime = null,
    keys = [];


let resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    toRenderH = Math.ceil(canvas.height / tileSize);
    toRenderW = Math.ceil(canvas.width / tileSize);
}

let keydown = (e) => {
    keys[e.keyCode] = true;
}
let keyup = (e) => {
    keys[e.keyCode] = false;
}

let clear = (color = "#000") => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let reloadGame = () => {
    world = new WorldMap(250, 250, loading, render, initPlayer);
    dmgDisplays = [];
    gameOver.val = false;
}

let drawMinimap = () => {
    let miniMapSize = 200;
    for (let y = Math.floor(player.y - miniMapSize / 2), endy = player.y + miniMapSize / 2; y <= endy; y++) {
        for (let x = Math.floor(player.x - miniMapSize / 2), endx = player.x + miniMapSize / 2; x <= endx; x++) {
            if (world.map[y] && world.map[y][x] && world.miniMap[y][x]) {
                ctx.fillStyle = world.map[y][x].miniMapColor;
                ctx.fillRect(Math.floor(canvas.width - miniMapSize - player.x + miniMapSize / 2 + x), Math.floor(y - player.y + miniMapSize / 2), 1, 1);
            }
        }
    }
}

let runIntro = () => {
    if(introPart == 1) runIntroPart1();
    else runIntroPart2();

    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = '20px Monospace';
    ctx.fillText('Press space to skip', 10, canvas.height - 20);
}

let runIntroPart1 = () => {
    let texts = ['Hello adventurer.', 'Are you having fun playing games?', 'So do I.', 'I threw you into this dungeon and now you are lost', 'But let\'s play a little game, find me and I will free you.'];
    if(!lastLetterTime) lastLetterTime = new Date();
    if (new Date() - lastLetterTime > 100 && renderingText) {
        lastLetterTime = new Date();
        lettersDisplayed++;
        if(texts[currentText][lettersDisplayed] == ' ') lettersDisplayed++;
        if(lettersDisplayed > texts[currentText].length) {
            currentText++;
            lettersDisplayed = 0;
            if(currentText >= texts.length) {
                setTimeout(() => {introPart = 2; renderingText = true; currentText = 0; lettersDisplayed = 0;}, 1000);
                renderingText = false;
                return;
            }
        }
    }
    for(let i=0; i<currentText; i++) {
        let text = texts[i];
        ctx.font = '30px Monospace';
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2 - 10 - (currentText-i-(renderingText?0:1)) * 30);
    }
    if(!renderingText) return;
    let text = texts[currentText].slice(0, lettersDisplayed);
    ctx.font = '30px Monospace';
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2 - 10);
}

let runIntroPart2 = () => {
    let texts = ['You can find me on the 5th floor.', 'Let\'s see if you are as good as you think you are.', 'Get me if you can!'];
    if(!lastLetterTime) lastLetterTime = new Date();
    if (new Date() - lastLetterTime > 100 && renderingText) {
        lastLetterTime = new Date();
        lettersDisplayed++;
        if(texts[currentText][lettersDisplayed] == ' ') lettersDisplayed++;
        if(lettersDisplayed > texts[currentText].length) {
            currentText++;
            lettersDisplayed = 0;
            if(currentText >= texts.length) {
                setTimeout(() => {runningIntro = false; lastLetterTime = null; renderingText = true; currentText = 0; lettersDisplayed = 0;}, 1000);
                renderingText = false;
                return;
            }
        }
    }
    for(let i=0; i<currentText; i++) {
        let text = texts[i];
        ctx.font = '30px Monospace';
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2 - 10 - (currentText-i-(renderingText?0:1)) * 30);
    }
    if(!renderingText) return;
    let text = texts[currentText].slice(0, lettersDisplayed);
    ctx.font = '30px Monospace';
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2 - 10);
}

let runEnding = () => {
    let texts = ['You\'ve defeated me...', 'Unbelievable...', 'But as I promised...', 'You are free now'];
    if(!lastLetterTime) lastLetterTime = new Date();
    if (new Date() - lastLetterTime > 100 && renderingText) {
        lastLetterTime = new Date();
        lettersDisplayed++;
        if(texts[currentText][lettersDisplayed] == ' ') lettersDisplayed++;
        if(lettersDisplayed > texts[currentText].length) {
            currentText++;
            lettersDisplayed = 0;
            if(currentText >= texts.length) {
                renderingText = false;
                return;
            }
        }
    }
    for(let i=0; i<currentText; i++) {
        let text = texts[i];
        ctx.font = '30px Monospace';
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2 - 10 - (currentText-i-(renderingText?0:1)) * 30);
    }
    if(!renderingText) return;
    let text = texts[currentText].slice(0, lettersDisplayed);
    ctx.font = '30px Monospace';
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2 - 10);
}

let render = () => {
    clear();

    if (gameWon.val) {
        runEnding();
    }
    else if (loading.val) {
        ctx.fillStyle = "rgb(10,200,10)";
        ctx.fillRect(0, canvas.height - 10, loading.progress * canvas.width, 10);

        ctx.fillStyle = "rgb(255,255,255)";
        ctx.font = '20px Monospace';
        let text = `${Math.floor(loading.progress * 100)}%`;
        ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height - 30);

        text = `Loading...`;
        ctx.font = '40px Monospace';
        ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2, canvas.height/2 - 20);
    }
    else if (runningIntro) {
        runIntro();
    }
    else if (gameOver.val) {
        ctx.fillStyle = "#fff";
        ctx.font = '20px Monospace';
        ctx.fillText("Game Over", canvas.width / 2 - ctx.measureText("Game Over").width / 2, canvas.height / 2 - 10);
        ctx.font = '15px Monospace';
        ctx.fillText("Press space to play again", canvas.width / 2 - ctx.measureText("Press space to play again").width / 2, canvas.height / 2 + 30);
    }
    else {
        world.draw(canvas, ctx, player, toRenderW, toRenderH, tileSize);
        for (let damageDisplay of dmgDisplays) {
            damageDisplay.draw(ctx, dmgDisplays);
        }
        drawMinimap();

        ctx.fillStyle = "rgb(255,255,255)";
        ctx.font = '14px Monospace';
        ctx.fillText(`Floor: ${world.level}`, 10, canvas.height - 30);
    }
    if(!loading.val)
        setTimeout(update, 1000 / 60);
}

let update = () => {
    if(!lastUpdate) lastUpdate = new Date();
    let timePast = new Date() - lastUpdate;
    while (timePast > 1000 / 60) {
        lastUpdate = new Date(lastUpdate.getTime() + 1000 / 60);
        timePast = new Date() - lastUpdate;

        if (gameOver.val) {
            if (keys[32]) {
                reloadGame();
            }
        }
        else if (runningIntro) {
            if (keys[32]) {
                runningIntro = false;
                renderingText = true;
                lastLetterTime = null;
                currentText = 0;
                lettersDisplayed = 0;
            }
        }
        else if(!loading.val) {
            player.update(world, keys, dmgDisplays, toRenderW, toRenderH, tileSize, gameOver, gameWon, loading, render);
            for (let enemy of world.enemies) {
                enemy.update(world, player);
            }
        }
    }
    render();
}

let init = () => {
    resize();
    window.onresize = resize;
    window.onkeydown = keydown;
    window.onkeyup = keyup;
    world = new WorldMap(250, 250, loading, render, initPlayer);
}

let initPlayer = () => {
    player = new Player(world);
    render();
}

init();