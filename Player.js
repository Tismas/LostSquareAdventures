import DamageDisplay from './DamageDisplay';

export default class Player {
    constructor(world) {
        this.initPos(world);
        this.color = "#f00";
        
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 10;
        
        this.health = 100;
        this.maxHealth = 100;
        this.strength = 1;
        this.speed = .5;
        
        this.attackCd = 0;
        this.attackCdTime = 30;
        
        this.visionRadius = 20;
    }

    initPos(world, render) {
        if (world.mainRoom) {
            this.x = world.mainRoom.x + Math.floor(world.mainRoom.width / 2);
            this.y = world.mainRoom.y + Math.floor(world.mainRoom.height / 2);
        }
        else {
            this.x = Math.floor(world.width/2);
            this.y = world.height - 2;
        }
        if(render)
            render();
    }

    update(world, keys, dmgDisplays, toRenderW, toRenderH, tileSize, gameOver, gameWon, loading, render) {
        this.handleMovement(world, keys);
        this.handleCombat(world, dmgDisplays, toRenderW, toRenderH, tileSize, gameOver, gameWon);
        if(world.map[Math.floor(this.y)][Math.floor(this.x)] == world.tileTypes.exit) {
            world.levelUp(loading, render, this.initPos.bind(this, world, render));
        }
        for (let y = Math.floor(this.y - this.visionRadius); y <= this.y + this.visionRadius; y++) {
            for (let x = Math.floor(this.x - this.visionRadius); x <= this.x + this.visionRadius; x++) {
                let dx = x - this.x;
                let dy = y - this.y;
                if (world.map[y] && world.map[y][x] && !(world.miniMap[y][x]) && dx * dx + dy * dy <= this.visionRadius * this.visionRadius) {
                    world.miniMap[y][x] = true;
                }
            }
        }
    }

    handleCombat(world, dmgDisplays, toRenderW, toRenderH, tileSize, gameOver, gameWon) {
        if (this.attackCd > 0) this.attackCd--;
        for (let enemy of world.enemies) {
            if (!enemy) continue;
            if (enemy.attackCd > 0) enemy.attackCd--;
            let dist = { x: Math.abs(Math.floor(enemy.x) - Math.floor(this.x)), y: Math.abs(Math.floor(enemy.y) - Math.floor(this.y)) };
            if (dist.x <= 1 && dist.y <= 1) {
                if (enemy.attackCd == 0) {
                    this.health -= enemy.strength;
                    enemy.attackCd = enemy.attackCdTime;
                    dmgDisplays.push(new DamageDisplay(this.x, this.y, enemy.strength, this, toRenderW, toRenderH, tileSize));
                    if (this.health <= 0) {
                        gameOver.val = true;
                    }
                }
                if (this.attackCd == 0) {
                    enemy.health -= this.strength;
                    this.attackCd = this.attackCdTime;
                    dmgDisplays.push(new DamageDisplay(enemy.x, enemy.y, this.strength, this, toRenderW, toRenderH, tileSize));
                }
                if (enemy.health <= 0) {
                    this.xp += enemy.xp;
                    while (this.xp >= this.xpNeeded) {
                        this.level++;
                        this.xp -= this.xpNeeded;
                        this.xpNeeded = Math.floor(this.xpNeeded * 1.5);
                        this.maxHealth += 50;
                        this.health = this.maxHealth;
                        this.strength += 2;
                    }
                    if (enemy.type == 'king') {
                        gameWon.val = true;
                    }
                    world.enemies.splice(world.enemies.indexOf(enemy), 1);
                }
            }
        }
    }

    handleMovement(world, keys) {
        let destination = { x: this.x, y: this.y };
        if (keys[37] || keys[65]) {
            destination.x -= this.speed;
        }
        if (keys[39] || keys[68]) {
            destination.x += this.speed;
        }
        let canMove = true;
        for (let enemy of world.enemies) {
            if (Math.floor(enemy.x) == Math.floor(destination.x) && Math.floor(enemy.y) == Math.floor(this.y)) {
                canMove = false;
            }
        }
        if (canMove && world.map[Math.floor(this.y)][Math.floor(destination.x)] != world.tileTypes.wall) {
            this.x = destination.x;
        }
        if (keys[38] || keys[87]) {
            destination.y -= this.speed;
        }
        if (keys[40] || keys[83]) {
            destination.y += this.speed;
        }
        canMove = true;
        for (let enemy of world.enemies) {
            if (Math.floor(enemy.x) == Math.floor(this.x) && Math.floor(enemy.y) == Math.floor(destination.y)) {
                canMove = false;
            }
        }
        if (canMove && world.map[Math.floor(destination.y)][Math.floor(this.x)] != world.tileTypes.wall) {
            this.y = destination.y;
        }
    }
}