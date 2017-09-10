export default class Orc {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.color = "rgb(10,200,10)";

        this.health = 5 + level * 10;
        this.speed = .2 + level / 100;
        this.strength = Math.round(level + Math.random() * (1+level));
        this.xp = 3 * level;

        this.attackCd = 0;
        this.attackCdTime = 45;
        this.type = 'orc';
    }

    update(world, player) {
        let dist = { x: Math.floor(player.x) - Math.floor(this.x), y: Math.floor(player.y) - Math.floor(this.y) };
        if (Math.abs(dist.x) <= 1 && Math.abs(dist.y) <= 1) return;
        for (let i=-1;i<=1;i++) {
            for(let j=-1;j<=1;j++) {
                let good = true;
                if (world.map[Math.floor(player.y)+j][Math.floor(player.x)+i] != world.tileTypes.floor)
                    good = false;
                if(good) {
                    for(let enemy of world.enemies) {
                        if(Math.floor(enemy.x) == Math.floor(player.x+i) && Math.floor(enemy.y) == Math.floor(player.y+j)) {
                            good = false;
                            break;
                        }
                    }
                }
                if(good) {
                    let newDist = { x: Math.floor(player.x+i) - Math.floor(this.x), y: Math.floor(player.y+j) - Math.floor(this.y) };
                    if(!dist || Math.abs(dist.x)+Math.abs(dist.y) > Math.abs(newDist.x)+Math.abs(newDist.y)) {
                        dist = newDist;
                    }
                }
            }
        }
        if (Math.abs(dist.x) + Math.abs(dist.y) < 200) {
            let destination = { x: this.x + Math.sign(dist.x) * this.speed, y: this.y + Math.sign(dist.y) * this.speed }
            let canMove = true;

            if (world.map[Math.floor(destination.y)][Math.floor(this.x)] == world.tileTypes.floor) {
                let canMove = true;
                for (let enemy of world.enemies) {
                    if (enemy != this && Math.floor(enemy.x) == Math.floor(destination.x) && Math.floor(enemy.y) == Math.floor(destination.y))
                        canMove = false;
                }
                if (canMove && (Math.floor(destination.y) != Math.floor(player.y) || Math.floor(destination.x) != Math.floor(player.x))) {
                    this.y = destination.y;
                }
            }
            if (world.map[Math.floor(this.y)][Math.floor(destination.x)] == world.tileTypes.floor) {
                let canMove = true;
                for (let enemy of world.enemies) {
                    if (enemy != this && Math.floor(enemy.x) == Math.floor(destination.x) && Math.floor(enemy.y) == Math.floor(destination.y))
                        canMove = false;
                }
                if (canMove && (Math.floor(destination.y) != Math.floor(player.y) || Math.floor(destination.x) != Math.floor(player.x))) {
                    this.x = destination.x;
                }
            }
        }
    }
}