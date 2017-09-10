export default class King {
    constructor(world) {
        this.x = Math.floor(world.width / 2);
        this.y = Math.floor(3);
        this.health = 150;
        this.strength = 5;
        this.speed = 1;
        this.color = 'yellow';

        this.attackCd = 0;
        this.attackCdTime = 20;
        this.xp = 0;
        this.type = 'king';
    }

    update(world, player) {
        let dist = { x: Math.floor(player.x) - Math.floor(this.x), y: Math.floor(player.y) - Math.floor(this.y) };
        if (Math.abs(dist.x) + Math.abs(dist.y) < 200) {
            let destination = { x: this.x + Math.sign(dist.x) * this.speed, y: this.y + Math.sign(dist.y) * this.speed }
            if (world.map[Math.floor(destination.y)][Math.floor(this.x)] == world.tileTypes.floor) {
                if (Math.floor(destination.y) != Math.floor(player.y) || Math.floor(destination.x) != Math.floor(player.x)) {
                    this.y = destination.y;
                }
            }
            if (world.map[Math.floor(this.y)][Math.floor(destination.x)] == world.tileTypes.floor) {
                if (Math.floor(destination.y) != Math.floor(player.y) || Math.floor(destination.x) != Math.floor(player.x)) {
                    this.x = destination.x;
                }
            }
        }
    }
}