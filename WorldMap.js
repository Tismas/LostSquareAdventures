import Orc from './Orc';
import King from './King';


let rand_color = () => {
    return `rgba(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},1.0)`;
}

function* generateId() {
    let id = 0;
    while (true) {
        yield id++;
    }
}

let generator = generateId();

class Tile {
    constructor(tile, isBlocking) {
        if(tile.includes('.png')) {
            this.image = new Image();
            this.image.src = tile;
            this.miniMapColor = '#634a00';
        }
        else 
            this.miniMapColor = this.color = tile;
        this.blocking = isBlocking;
    }
}

class Node {
    constructor(value, parent = null) {
        this.parent = parent;
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class Tree {
    constructor() {
        this.root = null;
        this.elements = [];
        this.cachedLeafs = [];
        this.cached = true;
    }

    add(node, side = 'left') {
        this.cached = false;
        this.elements.push(node);
        if (!this.root) {
            this.root = node;
        }
        else if (side === 'left') {
            node.parent.left = node;
        }
        else {
            node.parent.right = node;
        }
    }

    getLeafs(node = this.root) {
        if (this.cached) {
            return this.cachedLeafs;
        }
        let leafs = [];
        if (node) {
            if (node.left) {
                leafs.push(...this.getLeafs(node.left));
            }
            if (node.right) {
                leafs.push(...this.getLeafs(node.right));
            }
            if (!node.left && !node.right) {
                leafs.push(node);
            }
        }
        return leafs;
    }
}

class Room {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = generator.next().value;
        this.connectedID = -1;
    }

    getArea() {
        return this.width * this.height;
    }

    getClosestPoints(otherRoom, world) {
        let result = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
        let minDist = -1;
        for (let y = this.y; y < this.y + this.height; y++) {
            for (let x = this.x; x < this.x + this.width; x++) {
                if (world.map[y][x] == world.tileTypes.wall) {
                    for (let oy = otherRoom.y; oy < otherRoom.y + otherRoom.height; oy++) {
                        for (let ox = otherRoom.x; ox < otherRoom.x + otherRoom.width; ox++) {
                            if (world.map[oy][ox] == world.tileTypes.wall) {
                                let dist = Math.abs(oy - y) + Math.abs(ox - x);
                                if (dist < minDist || minDist == -1) {
                                    minDist = dist;
                                    result.start.x = x;
                                    result.start.y = y;
                                    result.end.x = ox;
                                    result.end.y = oy;
                                }
                            }
                        }
                    }
                }
            }
        }

        let found = false;
        for (let y = result.start.y - 1; y <= result.start.y + 1; y++) {
            for (let x = result.start.x - 1; x <= result.start.x + 1; x++) {
                if (world.map[y][x] == world.tileTypes.floor) {
                    result.start.x = x;
                    result.start.y = y;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        found = false;
        for (let y = result.end.y - 1; y <= result.end.y + 1; y++) {
            for (let x = result.end.x - 1; x <= result.end.x + 1; x++) {
                if (world.map[y][x] == world.tileTypes.floor) {
                    result.end.x = x;
                    result.end.y = y;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        return result;
    }

    connect(otherRoom, world) {
        this.connectedID = otherRoom.id;
        otherRoom.connectedID = this.id;
        let corridorSize = 2;

        let connectPoints = this.getClosestPoints(otherRoom, world);
        let lastX = connectPoints.start.x;
        let cornerY = connectPoints.start.y;
        let dir = { x: Math.sign(connectPoints.end.x - connectPoints.start.x), y: Math.sign(connectPoints.end.y - connectPoints.start.y) };
        for (let x = lastX; x != connectPoints.end.x + dir.x; x += dir.x) {
            if (world.map[cornerY][x + dir.x] == world.tileTypes.blank || world.map[cornerY][x] == world.tileTypes.blank || world.map[cornerY][x] == world.tileTypes.wall) {
                world.map[cornerY][x] = world.tileTypes.floor;
                for (let i = 1; i <= corridorSize; i++) {
                    let fill = world.tileTypes.floor;
                    if (i == corridorSize) fill = world.tileTypes.wall
                    world.map[cornerY + i][x] = fill;
                    world.map[cornerY - i][x] = fill;
                }
            }
            lastX = x;
        }
        if (dir.y != 0) {
            for (let a = -1; a <= 1; a += 1) {
                for (let b = -1; b <= 1; b += 1) {
                    if (world.map[cornerY + a][lastX + b] == world.tileTypes.blank) {
                        world.map[cornerY + a][lastX + b] = world.tileTypes.wall;
                    }
                }
            }
        }
        for (let y = cornerY; y != connectPoints.end.y + dir.y; y += dir.y) {
            if (world.map[y + dir.y][lastX] == world.tileTypes.blank || world.map[y][lastX] == world.tileTypes.blank || world.map[y][lastX] == world.tileTypes.wall) {
                world.map[y][lastX] = world.tileTypes.floor;
                for (let i = 1; i <= corridorSize; i++) {
                    let fill = world.tileTypes.floor;
                    if (i == corridorSize) fill = world.tileTypes.wall
                    world.map[y][lastX - i] = fill;
                    world.map[y][lastX + i] = fill;
                }
            }
            world.map[y][lastX] = world.tileTypes.floor;
        }
    }
}

export default class WorldMap {
    constructor(width, height, loading, render, cb) {
        this.tileTypes = {
            wall: new Tile(`rgba(220, 220, 220, 1.0)`, true),
            floor: new Tile(`assets/dirt.png`, false),
            blank: new Tile(`rgba(0, 0, 0, 1.0)`, true),
            exit: new Tile(`assets/doors.png`, false),
            redCarpet: new Tile(`rgba(128, 0, 0, 1.0)`, false),
        };
        this.level = 0;
        this.minRoomSize = 15;
        this.maxRoomSize = 40;
        this.minSpaceBetween = 5;
        this.width = width;
        this.height = height;
        this.levelUp(loading, render, cb);
    }

    levelUp(loading, render, cb) {
        loading.val = true;
        loading.progress = 0;
        this.map = [];
        this.miniMap = [];
        this.level++;
        this.rooms = new Tree();
        this.enemies = [];
        this.mainRoom = null;

        render();
        if (this.level < 5)
            setTimeout(this.generateMap.bind(this, this.width, this.height, loading, render, cb), 0);
        else
            setTimeout(this.generateFinalRoom.bind(this, loading, render, cb), 0);
    }

    generateFinalRoom(loading, render, cb) {
        this.width = 50;
        this.height = 50;
        for(let y=0; y<this.height; y++) {
            this.map[y] = [];
            this.miniMap[y] = [];
            for(let x=0;x<this.width;x++) {
                this.miniMap[y][x] = true;
                if(y == 0 || x == 0 || y == this.height-1 || x == this.width - 1) 
                    this.map[y][x] = this.tileTypes.wall;
                else if(x == Math.floor(this.width/2) || x == Math.floor(this.width/2 - 1) || x == Math.floor(this.width/2 + 1)) 
                    this.map[y][x] = this.tileTypes.redCarpet;
                else
                    this.map[y][x] = this.tileTypes.floor;
            }
        }
        this.enemies.push(new King(this));

        loading.progress = 1;
        render();
        loading.val = false;
        cb();
    }

    addExit(loading, render, cb) {
        let rooms = this.rooms.getLeafs(),
            farest = null,
            farestDist = -1;
        for (let room of rooms) {
            let dist = Math.abs(this.mainRoom.x - room.value.x) + Math.abs(this.mainRoom.y - room.value.y);
            if (!farest || dist > farestDist) {
                farest = room;
                farestDist = dist;
            }
        }
        this.map[Math.floor(farest.value.y + farest.value.height/2)][Math.floor(farest.value.x + farest.value.width/2)] = this.tileTypes.exit;
        this.map[Math.floor(farest.value.y + farest.value.height/2)+1][Math.floor(farest.value.x + farest.value.width/2)] = this.tileTypes.exit;
        this.map[Math.floor(farest.value.y + farest.value.height/2)][Math.floor(farest.value.x + farest.value.width/2)+1] = this.tileTypes.exit;
        this.map[Math.floor(farest.value.y + farest.value.height/2)+1][Math.floor(farest.value.x + farest.value.width/2)+1] = this.tileTypes.exit;
        
        loading.progress = 7/7;
        render();
        loading.val = false;
        cb();
    }

    addEnemies(loading, render, cb) {
        while (this.enemies.length < this.level * 4) {
            for (let y = 1; y < this.map.length - 1; y++) {
                for (let x = 1; x < this.map[y].length - 1; x++) {
                    if (Math.random() < .0005 * this.level) {
                        let p = { x: this.mainRoom.x + this.mainRoom.width / 2, y: this.mainRoom.y + this.mainRoom.height / 2 };
                        let distToPlayer = Math.abs(p.x - x) + Math.abs(p.y - y);
                        if (distToPlayer > 50 && this.map[y][x] == this.tileTypes.floor) {
                            this.enemies.push(new Orc(x, y, this.level));
                        }
                    }
                }
            }
        }

        loading.progress = 6/7;
        render();
        setTimeout(this.addExit.bind(this, loading, render, cb), 0);        
    }

    removeGlitches(loading, render, cb) {
        for (let y = 1; y < this.map.length - 1; y++) {
            for (let x = 1; x < this.map[y].length - 1; x++) {
                if (this.map[y][x] == this.tileTypes.wall) {
                    let ok = false;
                    for (let a = -1; a <= 1; a++) {
                        for (let b = -1; b <= 1; b++) {
                            if (this.map[y + a][x + b] == this.tileTypes.blank) {
                                ok = true;
                                break;
                            }
                        }
                        if (ok) break;
                    }
                    if (!ok) {
                        this.map[y][x] = this.tileTypes.floor;
                    }
                }
            }
        }

        loading.progress = 5/7;
        render();
        setTimeout(this.addEnemies.bind(this, loading, render, cb), 0);
    }

    generateMap(width, height, loading, render, cb) {
        for (let i = 0; i < height; i++) {
            this.map[i] = [];
            this.miniMap[i] = [];
            for (let j = 0; j < width; j++) {
                this.map[i][j] = this.tileTypes.blank;
                this.miniMap[i][j] = false;
            }
        }

        this.rooms.add(new Node(new Room(0, 0, width, height)));
        let canAdd = true;
        let minLeafSpace = Math.floor(this.minRoomSize * 1.5) + this.minSpaceBetween * 2;
        while (canAdd) {
            canAdd = false;
            let leafs = this.rooms.getLeafs();
            for (let i = 0; i < leafs.length; i++) {
                let addingTo = leafs[i];
                let parentRoom = addingTo.value;
                if (parentRoom.width > this.maxRoomSize * 2 || parentRoom.height > this.maxRoomSize * 2) {
                    let randomValue = Math.random() < .5;
                    if (randomValue < .5 && parentRoom.width > this.maxRoomSize * 2) {
                        let w = minLeafSpace + Math.floor((parentRoom.width - minLeafSpace * 2) * Math.random());
                        this.rooms.add(new Node(new Room(parentRoom.x, parentRoom.y, w, parentRoom.height), addingTo), 'left');
                        this.rooms.add(new Node(new Room(parentRoom.x + w, parentRoom.y, parentRoom.width - w, parentRoom.height), addingTo), 'right');
                        canAdd = true;
                    }
                    else if (randomValue >= .5 && parentRoom.height > this.maxRoomSize * 2) {
                        let h = minLeafSpace + Math.floor((parentRoom.height - minLeafSpace * 2) * Math.random());
                        this.rooms.add(new Node(new Room(parentRoom.x, parentRoom.y, parentRoom.width, h), addingTo), 'left');
                        this.rooms.add(new Node(new Room(parentRoom.x, parentRoom.y + h, parentRoom.width, parentRoom.height - h), addingTo), 'right');
                        canAdd = true;
                    }
                }
            }
        }
        this.rooms.cachedLeafs = this.rooms.getLeafs();
        this.rooms.cached = true;

        loading.progress = 1/7;
        render();
        setTimeout(this.shrinkRooms.bind(this, loading, render, cb), 0);        
    }

    shrinkRooms(loading, render, cb) {
        let rooms = this.rooms.getLeafs();
        for (let room of rooms) {
            room = room.value;
            let leftShrink = Math.floor(this.minSpaceBetween / 2 + (room.width - this.minRoomSize) * Math.random());
            let topShrink = Math.floor(this.minSpaceBetween / 2 + (room.height - this.minRoomSize) * Math.random());
            room.x += leftShrink;
            room.y += topShrink;
            room.width -= leftShrink;
            room.height -= topShrink;

            if (room.width > this.minRoomSize) {
                room.width -= Math.floor(this.minSpaceBetween / 2 + (room.width - this.minRoomSize) * Math.random());
            }
            if (room.height > this.minRoomSize) {
                room.height -= Math.floor(this.minSpaceBetween / 2 + (room.height - this.minRoomSize) * Math.random());
            }

            if (!this.mainRoom || this.mainRoom.getArea() < room.getArea()) this.mainRoom = room;
        }

        loading.progress = 2/7;
        render();
        setTimeout(this.tranferRoomsToMap.bind(this, loading, render, cb), 0);
    }

    tranferRoomsToMap(loading, render, cb) {
        let rooms = this.rooms.getLeafs();
        for (let room of rooms) {
            room = room.value;
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    if (x == room.x || y == room.y || x == room.x + room.width - 1 || y == room.y + room.height - 1) {
                        this.map[y][x] = this.tileTypes.wall;
                    }
                    else {
                        this.map[y][x] = this.tileTypes.floor;
                    }
                }
            }
        }

        loading.progress = 3/7;
        render();
        setTimeout(this.connectRooms.bind(this, loading, render, cb), 0);
    }

    connectRooms(loading, render, cb) {
        let rooms = this.rooms.getLeafs();
        let visitedParents = [];
        for (let room of rooms) {
            if (visitedParents.indexOf(room.parent) == -1) {
                if (!room.parent.left.left && !room.parent.left.right && !room.parent.right.left && !room.parent.right.right) {
                    visitedParents.push(room.parent);
                    room.parent.left.value.connect(room.parent.right.value, this);
                }
            }
        }
        while (visitedParents.length) {
            let newParents = [];
            for (let room of visitedParents) {
                if (room.parent && newParents.indexOf(room.parent) == -1) {
                    newParents.push(room.parent);
                    room.parent.left.value.connect(room.parent.right.value, this);
                }
            }
            visitedParents = newParents;
        }

        loading.progress = 4/7;
        render();
        setTimeout(this.removeGlitches.bind(this, loading, render, cb), 0);
    }

    draw(canvas, ctx, player, toRenderW, toRenderH, tileSize) {
        let exitDrawn = false;
        for (let i = 0; i < toRenderH; i++) {
            for (let j = 0; j < toRenderW; j++) {
                let x = Math.floor(player.x) + j - Math.floor(toRenderW / 2),
                    y = Math.floor(player.y) + i - Math.floor(toRenderH / 2),
                    image = false;
                if (Math.floor(player.x) == x && Math.floor(player.y) == y) {
                    ctx.fillStyle = player.color;
                }
                else {
                    let color = ((this.map[y] || [])[x] || { color: "rgba(0, 0, 0, 1.0)" }).color;
                    if (color)
                        ctx.fillStyle = color;
                    else
                        image = true;
                }
                if (image) {
                    if (this.map[y][x] == this.tileTypes.exit) {
                        if (!exitDrawn) {
                            ctx.drawImage(this.map[y][x].image, j*tileSize, i*tileSize, tileSize*2, tileSize*2);
                            exitDrawn = true;
                        }
                    }
                    else 
                        ctx.drawImage(this.map[y][x].image, j*tileSize, i*tileSize);
                }
                else
                    ctx.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
            }
        }
        for (let enemy of this.enemies) {
            ctx.fillStyle = enemy.color;
            let x = Math.floor(enemy.x) - Math.floor(player.x) + Math.floor(toRenderW / 2),
                y = Math.floor(enemy.y) - Math.floor(player.y) + Math.floor(toRenderH / 2);
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }

        var radialGradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 20, canvas.width / 2, canvas.height / 2, 400);
        radialGradient.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
        radialGradient.addColorStop(1.0, 'rgba(0, 0, 0, 1.0)');
        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgb(0,128,0)";
        ctx.fillRect(0, canvas.height - 20, Math.round(canvas.width * player.health / player.maxHealth), 10);
        ctx.fillStyle = "rgb(0,0,128)";
        ctx.fillRect(0, canvas.height - 10, Math.round(canvas.width * player.xp / player.xpNeeded), 10);

        ctx.fillStyle = "rgb(255,255,255)";
        ctx.font = '14px Monospace';
        let text = `${player.health}/${player.maxHealth}`;
        ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height - 10);
        text = `${player.xp}/${player.xpNeeded}`;
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, canvas.height);
    }
}