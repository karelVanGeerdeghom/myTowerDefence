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
            oGame.board.showHex(oGame, hex);
        }
        if (id === oGame.board.heart) {
            eHex.empty();
            oGame.showPlayer();
        }
    });
});

function Game(eCanvas, ePlayer, eHex) {
    this.eCanvas = eCanvas;
    this.ePlayer = ePlayer;
    this.eHex = eHex;
    this.player = new Player;
}
Game.prototype.svg = function() {
    this.eSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.eSvg.setAttributeNS('http://www.w3.org/2000/svg','xlink','http://www.w3.org/1999/xlink');
    this.eSvg.setAttributeNS(null, "width", 800);
    this.eSvg.setAttributeNS(null, "height", 800);
};
Game.prototype.defs = function() {
    this.eDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
};
Game.prototype.build = function() {
    var x = this.center.x - this.board.height * (this.board.radius + this.board.radius);
    var y = this.center.y - this.board.side * this.board.radius * 3; 
    for (var j = 0; j <= this.board.radius * 2; j++) {
        var offSet = Math.abs(j - this.board.radius);
        var xId = 0;
        if(j - this.board.radius > 0) {
            xId = j - this.board.radius;
        }
        for (var i = 0; i <= this.board.radius * 2 - offSet; i++) {
            var punt = new Punt(x + this.board.height * (2 * i + offSet), y + 3 * j * this.board.side);
            var hex = new Hex(this.board.hexes.length, i + xId, j, punt, this.board.side);
            if (i === this.board.radius && j === this.board.radius) {
                this.board.heart = this.board.hexes.length;
            }
            this.board.hexes.push(hex);
        }
    }
};
Game.prototype.draw = function() {
    for (var i = 0; i < this.board.hexes.length; i++ ) {
        this.eSvg.appendChild(this.board.hexes[i].element());
    }
};
Game.prototype.rune = function() {
    this.board.runes = [];
    for (var i = 0; i < this.board.hexes.length; i++ ) {
        this.board.hexes[i].dam = 0;
        this.board.hexes[i].as = 0;
        this.board.hexes[i].cc = 0;
        this.board.hexes[i].cd = 0;
        if (this.board.hexes[i].xid === this.board.radius && this.board.hexes[i].yid === this.board.radius) {
            this.board.hexes[i].rune = "heart";
            this.board.hexes[i].tier = 1;
        }
        if (this.board.hexes[i].rune !== "") {
            this.eDefs.appendChild(this.board.hexes[i].pattern());
            if (this.board.hexes[i].rune !== "heart") {
                this.board.runes.push(i);
            }
            switch (this.board.hexes[i].runeSet) {
                case 0:
                    this.board.hexes[i].dam = this.board.runeStats[0] * this.board.hexes[i].tier;
                    break;
                case 1:
                    this.board.hexes[i].as = this.board.runeStats[1] * this.board.hexes[i].tier;
                    break;
                case 2:
                    this.board.hexes[i].cc = this.board.runeStats[2] * this.board.hexes[i].tier;
                    break;
                case 3:
                    this.board.hexes[i].cd = this.board.runeStats[3] * this.board.hexes[i].tier;
                    break;
            }
        }
    }
};
Game.prototype.showPlayer = function() {
    this.ePlayer.empty();
    var eHealth = $('<p>Player Health: ' + this.player.health + '</p>');
    var eGold = $('<p>Player Gold: ' + this.player.gold + '</p>');
    var eRadius = $('<p>Player Range: ' + this.player.radius + '</p>');
    var eDamage = $('<p>Player Damage: ' + this.player.dam + '</p>');
    var eAs = $('<p>Player Attack Speed: ' + this.player.as + ' / second</p>');
    var eCc = $('<p>Player Critical Chance: ' + this.player.cc + '</p>');
    var eCd = $('<p>Player Critical Damage: ' + this.player.cd + '</p>');
    var eDps = $('<p>Total DPS: ' + this.board.dps(this) + '</p>');
    var eRunes = $('<p>Runes: ' + this.board.runes + '</p>');
    var eBoardDam = $('<p>Total Damage: ' + this.player.dam * ((100 + this.board.dam) / 100) + '</p>');
    var eBoardAs = $('<p>Total Attack Speed: ' + this.player.as * ((100 + this.board.as) / 100) + ' / second</p>');
    var eBoardCc = $('<p>Total Critical Chance: ' + parseFloat(this.player.cc + this.board.cc) + '</p>');
    var Cd = $('<p>Total Critical Damage: ' + parseInt(this.player.cd + this.board.cd) + '</p>');

    this.ePlayer.append(eHealth)
        .append(eGold)
        .append(eRadius)
        .append(eDamage)
        .append(eAs)
        .append(eCc)
        .append(eCd)
        .append(eDps)
        .append(eRunes)
        .append(eBoardDam)
        .append(eBoardAs)
        .append(eBoardCc)
        .append(Cd);
};
Game.prototype.init = function() {
    this.svg();
    this.defs();
    this.eCanvas.appendChild(this.eSvg);
    this.eSvg.appendChild(this.eDefs);
    
    this.center = new Punt(400, 400);
    this.board = new Board(this.eSvg, this.center, 4, 24);
    this.build();
    this.draw();
    this.rune();
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

function Board(canvas, center, radius, side) {
    this.canvas = canvas;
    this.center = center;
    this.radius = radius;
    this.side = side;
    this.height = Math.sqrt(3 * this.side * this.side);
    this.hexes = [];
    this.runeStats = [1, 1, 1, 10];
};
Board.prototype.defs = function() {
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.canvas.appendChild(this.defs);
};
Board.prototype.build = function() {
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
            }
            this.hexes.push(hex);
        }
    }
};
Board.prototype.draw = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        this.canvas.appendChild(this.hexes[i].element());
    }
};
Board.prototype.connect = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        for (var j = 0; j < this.hexes.length; j++ ) {
            if (this.hexes[i].rune !== "" && this.hexes[j].rune !== "") {
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
};
Board.prototype.unrune = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        delete this.hexes[i]["pattern"];
        $('#pattern' + this.hexes[i].id).remove();
    }
};
Board.prototype.rune = function(game) {
    this.runes = [];
    for (var i = 0; i < this.hexes.length; i++ ) {
        this.hexes[i].dam = 0;
        this.hexes[i].as = 0;
        this.hexes[i].cc = 0;
        this.hexes[i].cd = 0;
        if (this.hexes[i].xid === this.radius && this.hexes[i].yid === this.radius) {
            this.hexes[i].rune = "heart";
            this.hexes[i].tier = 1;
        }
        if (this.hexes[i].rune !== "") {
            game.eDefs.appendChild(this.hexes[i].pattern());
            if (this.hexes[i].rune !== "heart") {
                this.runes.push(i);
            }
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
            }
        }
    }
};
Board.prototype.dps = function(game) {
    this.dam = 0;
    this.as = 0;
    this.cc = 0;
    this.cd = 0;
    for (var i = 0; i < this.runes.length; i++) {
        var hex = this.hexes[this.runes[i]];
        var asc;
        var desc;
        switch (hex.connections.length) {
            case 0: asc = 0; break;
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
    }
    var dam = game.player.dam * ((100 + this.dam) / 100);
    var as = game.player.as * ((100 + this.as) / 100);
    var cc = game.player.cc + this.cc;
    var cd = game.player.cd + this.cd;
    var totalDps = (dam * (cc * (100 + cd) / 10000) + dam * ((100 - cc) / 100)) * as;
    return Math.round(Math.pow(totalDps / 10, 10)) / 100;
};
Board.prototype.showPlayer = function(game) {
    game.ePlayer.empty();
    var eHealth = $('<p>Player Health: ' + game.player.health + '</p>');
    var eGold = $('<p>Player Gold: ' + game.player.gold + '</p>');
    var eRadius = $('<p>Player Range: ' + game.player.radius + '</p>');
    var eDamage = $('<p>Player Damage: ' + game.player.dam + '</p>');
    var eAs = $('<p>Player Attack Speed: ' + game.player.as + ' / second</p>');
    var eCc = $('<p>Player Critical Chance: ' + game.player.cc + '</p>');
    var eCd = $('<p>Player Critical Damage: ' + game.player.cd + '</p>');
    var eDps = $('<p>Total DPS: ' + this.dps(game) + '</p>');
    var eRunes = $('<p>Runes: ' + this.runes + '</p>');
    var eBoardDam = $('<p>Total Damage: ' + game.player.dam * ((100 + this.dam) / 100) + '</p>');
    var eBoardAs = $('<p>Total Attack Speed: ' + game.player.as * ((100 + this.as) / 100) + ' / second</p>');
    var eBoardCc = $('<p>Total Critical Chance: ' + parseFloat(game.player.cc + this.cc) + '</p>');
    var Cd = $('<p>Total Critical Damage: ' + parseInt(game.player.cd + this.cd) + '</p>');

    game.ePlayer.append(eHealth)
        .append(eGold)
        .append(eRadius)
        .append(eDamage)
        .append(eAs)
        .append(eCc)
        .append(eCd)
        .append(eDps)
        .append(eRunes)
        .append(eBoardDam)
        .append(eBoardAs)
        .append(eBoardCc)
        .append(Cd);
};
Board.prototype.showHex = function(game, hex) {
    var me = this;
    var runes = ["dam", "as", "cc", "cd", "range", "gold"];
    var eRune = $('<p>Rune: ' + hex.rune + '</p>');
    var eTier = $('<p>Tier: ' + hex.tier + '</p>');
    game.eHex.empty();
    game.eHex.append(eRune).append(eTier);
    if (hex.rune === "") {
        var eDamage = $('<p><button type="button" id="damButton">Buy Damage Rune</button></p>');
        var eAs = $('<p><button type="button" id="asButton">Buy Attack Speed Rune</button></p>');
        var eCc = $('<p><button type="button" id="ccButton">Buy Critical Chance Rune</button></p>');
        var eCd = $('<p><button type="button" id="cdButton">Buy Critical Damage Rune</button></p>');
        if (game.player.gold >= 100) {
            game.eHex.append(eDamage).append(eAs);
        }
        if (game.player.gold >= 150) {
            game.eHex.append(eCc).append(eCd);
        }

        $(eDamage).click(function() {
            hex.rune = runes[0];
            hex.runeSet = 0;
            me.unrune();
            me.connect();
            me.rune(game);
//            player.gold -= 100;
            me.showPlayer(game);
            me.showHex(game, hex);
        });
        $(eAs).click(function() {
            hex.rune = runes[1];
            hex.runeSet = 1;
            me.unrune();
            me.connect();
            me.rune(game);
//            player.gold -= 100;
            me.showPlayer(game);
            me.showHex(game, hex);
        });
        $(eCc).click(function() {
            hex.rune = runes[2];
            hex.runeSet = 2;
            me.unrune();
            me.connect();
            me.rune(game);
//            player.gold -= 150;
            me.showPlayer(game);
            me.showHex(game, hex);
        });
        $(eCd).click(function() {
            hex.rune = runes[3];
            hex.runeSet = 3;
            me.unrune();
            me.connect();
            me.rune(game);
//            player.gold -= 150;
            me.showPlayer(game);
            me.showHex(game, hex);
        });
    }
    else {
//        var eSell = $('<p><button type="button" id="sellButton">Sell Rune</button></p>');
        var eUpgrade = $('<p><button type="button" id="upgradeButton">Upgrade Rune</button></p>');
//        hexel.append(eSell);
//        $(eSell).click(function() {
//            hex.rune = "";
//            hex.tier = 1;
//            this.dam = 0;
//            this.as = 0;
//            this.cc = 0;
//            this.cd = 0;
//            this.connections = [];
//            this.directions = [];
//            this.setAttribute('fill', 'black');
//            hex.runeSet = null;
//            me.unrune();
//            me.connect();
//            me.rune();
////            player.gold -= 150;
//            me.showPlayer(playerel, player);
//            me.showHex(playerel, hexel, player, hex)
//        });
        if (hex.tier < 4) {
            game.eHex.append(eUpgrade);
            $(eUpgrade).click(function() {
                hex.tier += 1;
                me.unrune();
                me.connect();
                me.rune(game);
    //            player.gold -= 150;
                me.showPlayer(game);
                me.showHex(game, hex);
            });
        }
    }
};

function Player() {
    this.health = 100;
    this.radius = 100;
    this.gold = 1000;
    this.dam = 10;
    this.cc = 5;
    this.cd = 50;
    this.as = 2;
};
// 1.158775
// 1.163547 - 9
// 1.165176 - 8
// 1.169858 - 10
// 1.169820 - 7