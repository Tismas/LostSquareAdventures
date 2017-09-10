export default class DamageDisplay {
    constructor(x, y, damage, player, toRenderW, toRenderH, tileSize) {
        this.x = (Math.floor(x) - Math.floor(player.x) + Math.floor(toRenderW / 2)) * tileSize;
        this.y = (Math.floor(y) - Math.floor(player.y) + Math.floor(toRenderH / 2)) * tileSize;
        this.damage = damage;
        this.alpha = 1.0;
    }

    draw(ctx, dmgDisplays) {
        ctx.fillStyle = `rgba(255,50,50,${this.alpha})`;
        ctx.font = "16px Monospace";
        ctx.fillText(this.damage, this.x + ctx.measureText(this.damage).width / 2, this.y);
        this.y--;
        this.alpha -= 0.05;
        if (this.alpha <= 0) {
            dmgDisplays.splice(dmgDisplays.indexOf(this), 1);
        }
    }
}