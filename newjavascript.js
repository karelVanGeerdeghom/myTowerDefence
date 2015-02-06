'use strict';

$(function() {
    var eCanvas = document.getElementById('canvas');
    var ePlayer = $('#playerStats');
    var eHex = $('#hexStats');
    
    var oGame = new Game(eCanvas, ePlayer, eHex);
    oGame.init();

    $("polygon").on("click", function() {
        var id = parseInt($(this).attr("id"));
        var hex = oGame.board.hexes[id];
        if (id !== oGame.board.heart) {
            eHex.empty();
            oGame.showHex(hex);
        }
        if (id === oGame.board.heart) {
            eHex.empty();
            oGame.showHex(hex);
            oGame.board.getValues();
            oGame.showPlayer();
            oGame.showRange();
        }
    });
});

function Game(eCanvas, ePlayer, eHex) {
    this.eCanvas = eCanvas;
    this.ePlayer = ePlayer;
    this.eHex = eHex;
    this.player = new Player;
    this.runeTypes = ["dam", "as", "cc", "cd", "range", "gold", "chain", "slow", "split"];
}
Game.prototype.createSvg = function() {
    this.eSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.eSvg.setAttributeNS('http://www.w3.org/2000/svg','xlink','http://www.w3.org/1999/xlink');
    this.eSvg.setAttributeNS(null, "width", 800);
    this.eSvg.setAttributeNS(null, "height", 800);
};
Game.prototype.createDefs = function() {
    this.eDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
};
Game.prototype.calculateDps = function() {
    var dam = this.player.dam * ((100 + this.board.dam) / 100);
    var as = this.player.as * ((100 + this.board.as) / 100);
    var cc = this.player.cc + this.board.cc;
    var cd = this.player.cd + this.board.cd;
    var totalDps = (dam * (cc * (100 + cd) / 10000) + dam * ((100 - cc) / 100)) * as;
    return Math.round(Math.pow(totalDps / 10, 5)) / 100;
};
Game.prototype.showPlayer = function() {
    var me = this;
    this.ePlayer.empty();
    var eHealth = $('<p>Player Health: ' + this.player.health + '</p>');
    var eGold = $('<p>Player Gold: ' + this.player.gold + '</p>');
    var eRange = $('<p>Player Range: ' + this.player.range + '</p>');
    var eDamage = $('<p>Player Damage: ' + this.player.dam + '</p>');
    var eAs = $('<p>Player Attack Speed: ' + this.player.as + ' / second</p>');
    var eCc = $('<p>Player Critical Chance: ' + this.player.cc + '</p>');
    var eCd = $('<p>Player Critical Damage: ' + this.player.cd + '</p>');
    var eTotalrange = $('<p>Total Range: ' + this.player.range * ((100 + this.board.range) / 100) + '</p>');
    var eTotalDps = $('<p>Total DPS: ' + this.calculateDps() + '</p>');
    var eTotalDam = $('<p>Total Damage: ' + this.player.dam * ((100 + this.board.dam) / 100) + '</p>');
    var eTotalAs = $('<p>Total Attack Speed: ' + this.player.as * ((100 + this.board.as) / 100) + ' / second</p>');
    var eTotalCc = $('<p>Total Critical Chance: ' + parseFloat(this.player.cc + this.board.cc) + '</p>');
    var eTotalCd = $('<p>Total Critical Damage: ' + parseInt(this.player.cd + this.board.cd) + '</p>');
    var eStartWave = $('<button type="button" id="startWave">Wave</button>');

    this.ePlayer.append(eHealth)
        .append(eGold)
        .append(eRange)
        .append(eDamage)
        .append(eAs)
        .append(eCc)
        .append(eCd)
        .append(eTotalrange)
        .append(eTotalDps)
        .append(eTotalDam)
        .append(eTotalAs)
        .append(eTotalCc)
        .append(eTotalCd)
        .append(eStartWave);

    $(eStartWave).click(function() {
        me.board.createWave();
        me.board.startWave();
        me.board.enemies[0].move();
    });
};
Game.prototype.showRange = function() {
    var eRange = $('#playerRange');
    eRange.remove();
    var svgRange = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    svgRange.setAttribute('cx', this.center.x);
    svgRange.setAttribute('cy', this.center.y);
    svgRange.setAttribute('r', this.player.range * ((100 + this.board.range) / 100));
    svgRange.setAttribute('stroke', 'green');
    svgRange.setAttribute('stroke-width', '1px');
    svgRange.setAttribute('fill', 'none');
    svgRange.setAttribute('id', 'playerRange');
    this.eSvg.appendChild(svgRange);    
};
Game.prototype.showHex = function(hex) {
    this.eHex.empty();
    var eRune = $('<p>Rune: ' + hex.rune + '</p>');
    var eTier = $('<p>Tier: ' + hex.tier + '</p>');
    var eHeartConnected = $('<p>Connected: ' + hex.heartConnected + '</p>');
    this.eHex.append(eRune).append(eTier).append(eHeartConnected);
    var me = this;
    if (hex.rune === "") {
        var eDamage = $('<button type="button" id="damButton">Dam</button>');
        var eAs = $('<button type="button" id="asButton">AS</button>');
        var eCc = $('<button type="button" id="ccButton">CC</button>');
        var eCd = $('<button type="button" id="cdButton">CD</button>');
        var eRange = $('<button type="button" id="rangeButton">Range</button>');
        if (me.player.gold >= 100) {
            me.eHex.append(eDamage).append(eAs).append(eRange);
        }
        if (me.player.gold >= 150) {
            me.eHex.append(eCc).append(eCd);
        }
        $(eDamage).click(function() {
            me.buyRune(0, hex);
        });
        $(eAs).click(function() {
            me.buyRune(1, hex);
        });
        $(eCc).click(function() {
            me.buyRune(2, hex);
        });
        $(eCd).click(function() {
            me.buyRune(3, hex);
        });
        $(eRange).click(function() {
            me.buyRune(4, hex);
        });
    }
    else if (hex.rune !== "heart") {
        var eSell = $('<button type="button" id="sellButton">Sell</button>');
        var eUpgrade = $('<button type="button" id="upgradeButton">Upgrade</button>');
        me.eHex.append(eSell);
        $(eSell).click(function() {
            me.sellRune(hex);
        });
        if (hex.tier < 4) {
            me.eHex.append(eUpgrade);
            $(eUpgrade).click(function() {
                me.upgradeRune(hex);
            });
        }
    }
};
Game.prototype.buyRune = function(rune, hex) {
    hex.rune = this.runeTypes[rune];
    hex.runeSet = rune;
    if (this.board.checkConnectedToHeart(hex)) { hex.heartConnected = true; }
    this.board.checkDisConnectedFromHeart(hex);
    this.board.removeRunes();
    this.board.connectHexes();
    this.board.createRunes();
    this.board.drawRunes(this.eDefs);
    this.board.getValues();
    this.showPlayer();
    this.showRange();
    this.showHex(hex);
};
Game.prototype.sellRune = function(hex) {
//    for (var i = 0; i < this.board.hexes.length; i++) {
//        if (i !== this.board.heart) {
//            this.board.hexes[i].heartConnected = false;
//        }
//        this.board.hexes[i].connections = [];
//        this.board.hexes[i].directions = [];
//        this.board.checkDisConnectedFromHeart(this.board.hexes[i]);
//    }
//    for (var i = 0; i < this.board.hexes.length; i++) {
//        if (this.board.checkConnectedToHeart(this.board.hexes[i]) && this.board.hexes[i].rune !== "") {
//            this.board.hexes[i].heartConnected = true;
//        }
//    }
    hex.runeSet = null;
    hex.heartConnected = false;
    hex.rune = "";
    hex.tier = 1;
    hex.dam = 0;
    hex.as = 0;
    hex.cc = 0;
    hex.cd = 0;

    hex.element.setAttribute("fill", "black");
    this.board.checkDisConnectedFromHeart(hex);
    this.board.removeRunes();
    this.board.connectHexes();
    this.board.createRunes();
    this.board.drawRunes(this.eDefs);
    this.board.getValues();
    this.showPlayer();
    this.showRange();
    this.showHex(hex);
};
Game.prototype.upgradeRune = function(hex) {
    hex.tier += 1;
    this.board.removeRunes();
    this.board.connectHexes();
    this.board.createRunes();
    this.board.drawRunes(this.eDefs);
    this.board.getValues();
    this.showPlayer();
    this.showRange();
    this.showHex(hex);
};
Game.prototype.init = function() {
    this.createSvg();
    this.createDefs();
    this.eCanvas.appendChild(this.eSvg);
    this.eSvg.appendChild(this.eDefs);
    
    this.center = new Punt(400, 400);
    this.board = new Board(this.eSvg, this.center, 3, 30);
    this.board.createHexes();
    this.board.drawHexes();
    this.board.createRunes();
    this.board.drawRunes(this.eDefs);
};

function Board(canvas, center, radius, side) {
    this.canvas = canvas;
    this.center = center;
    this.radius = radius;
    this.side = side;
    this.height = Math.sqrt(3 * this.side * this.side);
    this.hexes = [];
    this.enemies = [];
    this.runeStats = [1, 1, 1, 10, 3];
};
Board.prototype.createHexes = function() {
    var x = this.center.x - this.height * (this.radius + this.radius);
    var y = this.center.y - this.side * this.radius * 3; 
    for (var j = 0; j <= this.radius * 2; j++) {
        var offSet = Math.abs(j - this.radius);
        var xId = 0;
        if(j - this.radius > 0) {
            xId = j - this.radius;
        }
        for (var i = 0; i <= this.radius * 2 - offSet; i++) {
            var punt = new Punt(x + this.height * (2 * i + offSet), y + 3 * j * this.side);
            var hex = new Hex(this.hexes.length, i + xId, j, punt, this.side);
            if (i === this.radius && j === this.radius) {
                this.heart = this.hexes.length;
                hex.heartConnected = true;
            }
            this.hexes.push(hex);
        }
    }
};
Board.prototype.drawHexes = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        this.canvas.appendChild(this.hexes[i].element());
    }
};
Board.prototype.connectHexes = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        for (var j = 0; j < this.hexes.length; j++ ) {
            if (this.hexes[i].rune !== "" && this.hexes[j].rune !== "") {
                if (this.hexes[i].heartConnected === true && this.hexes[j].heartConnected === true) {
                    if(this.hexes[i].xid == this.hexes[j].xid - 1 && this.hexes[i].yid == this.hexes[j].yid) {
                        if (this.hexes[i].connections.indexOf(j) === -1) { this.hexes[i].connections.push(j); }
                        if (this.hexes[i].directions.indexOf(1) === -1) { this.hexes[i].directions.push(1); }
                    }
                    if(this.hexes[i].xid == this.hexes[j].xid + 1 && this.hexes[i].yid == this.hexes[j].yid) {
                        if (this.hexes[i].connections.indexOf(j) === -1) { this.hexes[i].connections.push(j); }
                        if (this.hexes[i].directions.indexOf(4) === -1) { this.hexes[i].directions.push(4); }
                    }
                    if(this.hexes[i].xid == this.hexes[j].xid + 1 && this.hexes[i].yid == this.hexes[j].yid + 1) {
                        if (this.hexes[i].connections.indexOf(j) === -1) { this.hexes[i].connections.push(j); }
                        if (this.hexes[i].directions.indexOf(5) === -1) { this.hexes[i].directions.push(5); }
                    }
                    if(this.hexes[i].xid == this.hexes[j].xid - 1 && this.hexes[i].yid == this.hexes[j].yid - 1) {
                        if (this.hexes[i].connections.indexOf(j) === -1) { this.hexes[i].connections.push(j); }
                        if (this.hexes[i].directions.indexOf(2) === -1) { this.hexes[i].directions.push(2); }
                    }
                    if(this.hexes[i].xid == this.hexes[j].xid && this.hexes[i].yid == this.hexes[j].yid + 1) {
                        if (this.hexes[i].connections.indexOf(j) === -1) { this.hexes[i].connections.push(j); }
                        if (this.hexes[i].directions.indexOf(6) === -1) { this.hexes[i].directions.push(6); }
                    }
                    if(this.hexes[i].xid == this.hexes[j].xid && this.hexes[i].yid == this.hexes[j].yid - 1) {
                        if (this.hexes[i].connections.indexOf(j) === -1) { this.hexes[i].connections.push(j); }
                        if (this.hexes[i].directions.indexOf(3) === -1) { this.hexes[i].directions.push(3); }
                    }
                }
            }
        }
    }
};
Board.prototype.checkConnectedToHeart = function(hex) {
    for (var i = 0; i < this.hexes.length; i++ ) {
        if ((Math.abs(hex.xid - this.hexes[i].xid) < 2) && (Math.abs(hex.yid - this.hexes[i].yid) < 2)) {
            if (Math.abs(hex.xid + hex.yid - (this.hexes[i].xid + this.hexes[i].yid)) === Math.abs(hex.xid - this.hexes[i].xid) + Math.abs(hex.yid - this.hexes[i].yid)) {
                if(this.hexes[i].heartConnected === true) {
                    return true;
                }
            }
        }  
    }
    return false;
};
Board.prototype.checkDisConnectedFromHeart = function(hex) {
    for (var i = 0; i < this.hexes.length; i++ ) {
        if ((Math.abs(hex.xid - this.hexes[i].xid) < 2) && (Math.abs(hex.yid - this.hexes[i].yid) < 2)) {
            if (Math.abs(hex.xid + hex.yid - (this.hexes[i].xid + this.hexes[i].yid)) === Math.abs(hex.xid - this.hexes[i].xid) + Math.abs(hex.yid - this.hexes[i].yid)) {
                if (this.hexes[i].rune !== "" && this.hexes[i].heartConnected === false && hex.heartConnected === true) {
                    this.hexes[i].heartConnected = true;
                    this.checkDisConnectedFromHeart(this.hexes[i]);
                }
            }
        }  
    }
};
Board.prototype.createRunes = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        this.hexes[i].dam = 0;
        this.hexes[i].as = 0;
        this.hexes[i].cc = 0;
        this.hexes[i].cd = 0;
        this.hexes[i].range = 0;
        if (this.hexes[i].xid === this.radius && this.hexes[i].yid === this.radius) {
            this.hexes[i].rune = "heart";
        }
        if (this.hexes[i].rune !== "") {
            switch (this.hexes[i].runeSet) {
                case 0:
                    this.hexes[i].dam = this.runeStats[0] * this.hexes[i].tier;
                    break;
                case 1:
                    this.hexes[i].as = this.runeStats[1] * this.hexes[i].tier;
                    break;
                case 2:
                    this.hexes[i].cc = this.runeStats[2] * this.hexes[i].tier;
                    break;
                case 3:
                    this.hexes[i].cd = this.runeStats[3] * this.hexes[i].tier;
                    break;
                case 4:
                    this.hexes[i].range = this.runeStats[4] * this.hexes[i].tier;
                    break;
            }
        }
    }
};
Board.prototype.removeRunes = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        delete this.hexes[i]["pattern"];
        $('#pattern' + this.hexes[i].id).remove();
    }
};
Board.prototype.drawRunes = function(defs) {
    for (var i = 0; i < this.hexes.length; i++ ) {
        if (this.hexes[i].rune !== "") {
            defs.appendChild(this.hexes[i].pattern());
        }
    }
};
Board.prototype.getValues = function() {
    this.dam = 0;
    this.as = 0;
    this.cc = 0;
    this.cd = 0;
    this.range = 0;
    for (var i = 0; i < this.hexes.length; i++) {
        if (this.hexes[i].rune !== "" && i !== this.heart) {
            var hex = this.hexes[i];
            var asc;
            var desc;
            switch (hex.connections.length) {
                case 0: asc = 0; desc = 0; break;
                case 1: asc = 0.4; desc = 2.4; break;
                case 2: asc = 0.8; desc = 2; break;
                case 3: asc = 1.2; desc = 1.6; break;
                case 4: asc = 1.6; desc = 1.2; break;
                case 5: asc = 2; desc = 0.8; break;
                case 6: asc = 2.4; desc = 0.4; break;
            }
            this.dam += hex.dam * asc;
            this.as += hex.as * asc;
            this.cc += hex.cc * desc;
            this.cd += hex.cd * desc;
            this.range += hex.range * desc;
        }
    }
};
Board.prototype.createWave = function() {
    var punt = new Punt(50, 50);
    var enemy = new Enemy(punt);
    this.enemies.push(enemy);
};
Board.prototype.startWave = function() {
    this.canvas.appendChild(this.enemies[0].element());
    var enemy = document.getElementById('enemy');
    setInterval(move(enemy, 10), 1000);
};

function Player() {
    this.health = 100;
    this.range = 150;
    this.gold = 1000;
    this.dam = 10;
    this.cc = 5;
    this.cd = 50;
    this.as = 4;
};
function Punt(x, y) {
    this.x = x;
    this.y = y;
}
function Hex(id, xid, yid, center, side){
    this.modifier = 0;
    this.center = center;
    this.side = side;
    this.height = Math.sqrt(3 * this.side * this.side);
    this.id = id;
    this.xid = xid;
    this.yid = yid;
    this.rune = "";
    this.runeSet = null;
    this.tier = 1;
    this.connections = [];
    this.directions = [];
    this.dam = 0;
    this.as = 0;
    this.cc = 0;
    this.cd = 0;
    this.range = 0;
    this.heartConnected = false;
}
Hex.prototype.element = function() {
    this.points = "";
    this.points += String(this.center.x) + "," + String(this.center.y - 2 * this.side) + " ";
    this.points += String(this.center.x - this.height) + "," + String(this.center.y - this.side) + " ";
    this.points += String(this.center.x - this.height) + "," + String(this.center.y + this.side) + " ";
    this.points += String(this.center.x) + "," + String(this.center.y + 2 * this.side) + " ";
    this.points += String(this.center.x + this.height) + "," + String(this.center.y + this.side) + " ";
    this.points += String(this.center.x + this.height) + "," + String(this.center.y - this.side);

    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    this.element.setAttribute('points', this.points);
    this.element.setAttribute('stroke', '#444');
    this.element.setAttribute('stroke-width', '1px');
    this.element.setAttribute('fill', 'transparent');
    this.element.setAttribute('id', this.id);
    this.element.setAttribute('class', 'hex');
    
    return this.element;
};
Hex.prototype.pattern = function() {
    this.pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    this.pattern.setAttribute("id", "pattern" + this.id);
    this.pattern.setAttribute("patternUnits", "userSpaceOnUse");
    this.pattern.setAttribute("x", this.center.x - 1.8 * this.side);
    this.pattern.setAttribute("y", this.center.y - 1.8 * this.side);
    this.pattern.setAttribute("width", this.side * 3.6);
    this.pattern.setAttribute("height", this.side * 3.6);

    var iRune = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    iRune.setAttribute("width", this.side * 3.6);
    iRune.setAttribute("height", this.side * 3.6);
    iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + this.rune + this.tier + '.png');
    this.pattern.appendChild(iRune);
    
    if (this.connections.length > 0 || this.rune === "heart") {
        var iCircle = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        iCircle.setAttribute("width", this.side * 3.6);
        iCircle.setAttribute("height", this.side * 3.6);
        iCircle.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/conncircle.png');
        this.pattern.appendChild(iCircle);
    }
    
    for (var i = 0; i < this.connections.length; i++) {
        var iConnect = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        iConnect.setAttribute("width", this.side * 3.6);
        iConnect.setAttribute("height", this.side * 3.6);
        iConnect.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/conn' + this.directions[i] + '.png');
        this.pattern.appendChild(iConnect);
    }
    
    this.element.setAttribute("fill", "url(#pattern" + this.id + ")");
    
    return this.pattern;
};
function Enemy(center) {
    this.health = 10;
    this.radius = 10;
    this.speed = 500;
    this.center = center;
    this.to = new Punt(400, 400);
    this.distance = Math.sqrt(Math.pow(this.to.x - this.center.x, 2) + Math.pow(this.to.y - this.center.x, 2));
}
Enemy.prototype.element = function() {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.element.setAttribute('cx', this.center.x);
    this.element.setAttribute('cy', this.center.y);
    this.element.setAttribute('r', this.radius);
    this.element.setAttribute('stroke', 'red');
    this.element.setAttribute('stroke-width', '1px');
    this.element.setAttribute('fill', 'darkred');
    this.element.setAttribute('id', 'enemy');
    
    return this.element;
};
function move(enemy, distance) {
//    var transformAttr = 'translate(' + 10 + ',' + 10 + ')';

    enemy.setAttribute('transform', 'translate(' + distance + ',' + distance + ')');
    console.log(enemy);
};