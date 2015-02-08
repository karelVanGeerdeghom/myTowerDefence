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
            oGame.board.setValues();
            oGame.setValues();
            oGame.showPlayer();
            oGame.showHex(hex);
        }
        if (id === oGame.board.heart) {
            eHex.empty();
            oGame.board.setValues();
            oGame.setValues();
            oGame.showPlayer();
            oGame.showRange();
            oGame.showHex(hex);
        }
    });
});

function Game(eCanvas, ePlayer, eHex) {
    this.eCanvas = eCanvas;
    this.ePlayer = ePlayer;
    this.eHex = eHex;
    this.player = new Player;
    this.runeTypes = ["dam", "as", "cc", "cd", "range", "gold","ll", "chain", "slow", "split"];
}
Game.prototype.init = function() {
    this.createSvg();
    this.createDefs();
    this.eCanvas.appendChild(this.eSvg);
    this.eSvg.appendChild(this.eDefs);
    
    this.center = new Punt(0, 0);
    this.board = new Board(this.eSvg, this.center, 4, 24);
    this.board.hexCreate();
    this.board.hexDraw();
    this.board.runeCreate();
    this.board.runeDraw(this.eDefs);
};
Game.prototype.createSvg = function() {
    this.eSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.eSvg.setAttributeNS('http://www.w3.org/2000/svg','xlink','http://www.w3.org/1999/xlink');
    this.eSvg.setAttributeNS(null, "width", 800);
    this.eSvg.setAttributeNS(null, "height", 800);
    this.eSvg.setAttributeNS(null, "viewBox", "-400 -400 800 800");
};
Game.prototype.createDefs = function() {
    this.eDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
};
Game.prototype.setValues = function() {
    var dam = this.player.dam * ((100 + this.board.dam) / 100);
    var cc = this.player.cc + this.board.cc;
    var cd = this.player.cd + this.board.cd;
    var totalDamage = dam * (cc * (100 + cd) / 10000) + dam * ((100 - cc) / 100);
    this.damage = Math.round(totalDamage * 100) / 100;
    this.as =  Math.round(this.player.as * ((100 + this.board.as) / 100) * 100) / 100;
    this.ms = Math.round(1000 / this.as);
    this.cc = Math.round((this.player.cc + this.board.cc) * 100) / 100;
    this.cd = Math.round((this.player.cd + this.board.cd) * 100) / 100;
    this.range = this.player.range * ((100 + this.board.range) / 100);
    this.dps = Math.round(this.damage * (Math.round(this.player.as * ((100 + this.board.as) / 100) * 100) / 100) * 100) / 100;
    this.gold = this.board.gold;
    this.ll = this.board.ll;
    this.chain = this.board.chain;
    this.chainEffect = this.board.chainEffect;
    this.slow = this.board.slow;
    this.slowEffect = this.board.slowEffect;
    this.split = this.board.split;
    this.splitEffect = this.board.splitEffect;
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
    var eTotalrange = $('<p>Total Range: ' + this.range + '</p>');
    var eTotalDps = $('<p>Total DPS: ' + this.dps + '</p>');
    var eTotalDam = $('<p>Total Damage: ' + this.damage + '</p>');
    var eTotalAs = $('<p>Total Attack Speed: 1 per ' + this.ms + 'ms | ' + this.as + '/s</p>');
    var eTotalCc = $('<p>Total Critical Chance: ' + this.cc + '</p>');
    var eTotalCd = $('<p>Total Critical Damage: ' + this.cd + '</p>');
    var eTotalGold = $('<p>Total Gold Bonus: ' + this.gold + ' %</p>');
    var eTotalLl = $('<p>Total Lifeleach Bonus: ' + this.ll + ' %</p>');
    var eChain = $('<p>Chaining: ' + this.chainEffect + '</p>');
    var eSlow = $('<p>Slowing: ' + this.slowEffect + '</p>');
    var eSplit = $('<p>Splitting: ' + this.splitEffect + '</p>');
    
    var eStartWave = $('<button type="button" id="waveStart">Wave</button>');

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
        .append(eTotalGold)
        .append(eTotalLl)
        .append(eChain)
        .append(eSlow)
        .append(eSplit)
        .append(eStartWave);

    $(eStartWave).click(function() {
        me.waveCreate();
        me.waveStart();
        me.playerStartAttacking();
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
    svgRange.setAttribute('stroke-width', '2px');
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
        var eRange = $('<button type="button" id="rangeButton">Range</button>');
        var eCc = $('<button type="button" id="ccButton">CC</button>');
        var eCd = $('<button type="button" id="cdButton">CD</button>');
        var eGold = $('<button type="button" id="goldButton">Gold</button>');
        var eLl = $('<button type="button" id="llButton">Lifeleach</button>');
        var eChain = $('<button type="button" id="chainButton">Chain</button>');
        var eSlow = $('<button type="button" id="slowButton">Slow</button>');   
        var eSplit = $('<button type="button" id="splitButton">Split</button>');
        
        if (this.player.gold >= 100) {
            this.eHex.append(eDamage).append(eAs).append(eRange);
        }
        if (this.player.gold >= 150) {
            this.eHex.append(eCc).append(eCd).append(eGold).append(eLl);
        }
        if (this.player.gold >= 250) {
            if (this.chain !== true) { this.eHex.append(eChain); }
            if (this.slow !== true) { this.eHex.append(eSlow); }
            if (this.split !== true) { this.eHex.append(eSplit); }
        }
        $(eDamage).click(function() { me.runeBuy(0, hex); });
        $(eAs).click(function() { me.runeBuy(1, hex); });
        $(eCc).click(function() { me.runeBuy(2, hex); });
        $(eCd).click(function() { me.runeBuy(3, hex); });
        $(eRange).click(function() { me.runeBuy(4, hex); });
        $(eGold).click(function() { me.runeBuy(5, hex); });
        $(eLl).click(function() { me.runeBuy(6, hex); });
        $(eChain).click(function() { me.runeBuy(7, hex); });
        $(eSlow).click(function() { me.runeBuy(8, hex); });
        $(eSplit).click(function() { me.runeBuy(9, hex); });
    }
    else if (hex.rune !== "heart") {
        var eSell = $('<button type="button" id="sellButton">Sell</button>');
        var eUpgrade = $('<button type="button" id="upgradeButton">Upgrade</button>');
        this.eHex.append(eSell);
        $(eSell).click(function() {
            me.runeSell(hex);
        });
        if (hex.tier < 4 && hex.runeSet < 7) {
            this.eHex.append(eUpgrade);
            $(eUpgrade).click(function() { me.runeUpgrade(hex); });
        }
    }
};
Game.prototype.runeBuy = function(rune, hex) {
    hex.rune = this.runeTypes[rune];
    hex.runeSet = rune;
    if (this.board.hexCheckConnected(hex)) {
        hex.tier = 1;
        hex.heartConnected = true;
    }
    this.board.hexCheckDisconnected(hex);
    this.board.runeRemove();
    this.board.hexConnect();
    this.board.runeCreate();
    this.board.runeDraw(this.eDefs);
    this.board.setValues();
    this.setValues();
    this.showPlayer();
    this.showRange();
    this.showHex(hex);
};
Game.prototype.runeSell = function(hex) {
    for (var i = 0; i < this.board.hexes.length; i++) {
        if (i !== this.board.heart) {
            this.board.hexes[i].heartConnected = false;
        }
        this.board.hexes[i].connections = [];
        this.board.hexes[i].directions = [];
    }

    hex.runeSet = null;
    hex.rune = "";
    hex.tier = 0;
    hex.dam = 0;
    hex.as = 0;
    hex.cc = 0;
    hex.cd = 0;
    hex.range = 0;
    hex.ll = 0;
    hex.element.setAttribute("fill", "black");
    
    for (var i = 0; i < this.board.hexes.length; i++) {
        if (this.board.hexes[i].rune !== "" && this.board.hexes[i].rune !== "heart") {
            if (this.board.hexCheckConnected(this.board.hexes[i])) {
                this.board.hexes[i].heartConnected = true;
            }
            this.board.hexCheckDisconnected(this.board.hexes[i]);
        }
    }
    this.board.runeRemove();
    this.board.hexConnect();
    this.board.runeCreate();
    this.board.runeDraw(this.eDefs);
    this.board.setValues();
    this.setValues();
    this.showPlayer();
    this.showRange();
    this.showHex(hex);
};
Game.prototype.runeUpgrade = function(hex) {
    hex.tier += 1;
    this.board.runeRemove();
    this.board.hexConnect();
    this.board.runeCreate();
    this.board.runeDraw(this.eDefs);
    this.board.setValues();
    this.setValues();
    this.showPlayer();
    this.showRange();
    this.showHex(hex);
};
Game.prototype.waveCreate = function() {
    this.board.enemies = [];
    for (var i = 0; i < 10; i++) {
        var randomAngle = Math.random() * 2 * Math.PI;
        var sine = Math.round(Math.sin(randomAngle) * Math.pow(10, 12)) / Math.pow(10, 12);
        var cosine = Math.round(Math.cos(randomAngle) * Math.pow(10, 12)) / Math.pow(10, 12);
        var punt = new Punt(sine * (i * 10 + 566), cosine * (i * 10 + 566));
        var enemy = new Enemy(this.board.center, punt);
        this.board.enemies.push(enemy);
    }
//    var punt1 = new Punt(40, 90);
//    var enemy1 = new Enemy(this.board.center, punt1);
//    this.board.enemies.push(enemy1);
//    var punt2 = new Punt(-50, 100);
//    var enemy2 = new Enemy(this.board.center, punt2);
//    this.board.enemies.push(enemy2);
//    var punt3 = new Punt(50, -120);
//    var enemy3 = new Enemy(this.board.center, punt3);
//    this.board.enemies.push(enemy3);
//    var punt4 = new Punt(-40, -110);
//    var enemy4 = new Enemy(this.board.center, punt4);
//    this.board.enemies.push(enemy4);
};
Game.prototype.waveStart = function() {
    var center = this.board.center;
    for (var i = 0; i < this.board.enemies.length; i ++) {
        this.eSvg.appendChild(this.board.enemies[i].element());
        this.enemyStartMoving(this.board.enemies[i], center);
    }
};
Game.prototype.enemyStartMoving = function(enemy, to, distance) {
    var me = this;
    enemy.interval = setInterval(function() {
        me.enemyMove(enemy, to);
    }, 35);
};
Game.prototype.enemyMove = function (enemy, to) {
    if (!enemy.freeze) {
        var slow = 1;
        if (this.slowEffect === true && getDistance(enemy.center, to) <= this.range) { slow = 0.5; }
        var x = enemy.center.x + enemy.cosine * enemy.speed * slow;
        var y = enemy.center.y + enemy.sine * enemy.speed * slow;
        var from = new Punt(x, y);
        enemy.element.setAttribute('cx', x);
        enemy.element.setAttribute('cy', y);
        enemy.center = from;
        if (getDistance(enemy.center, to) < 50) {
            this.player.health -= enemy.damage;
            this.showPlayer();
            this.board.enemies.splice(this.board.enemies.indexOf(enemy), 1);
            enemy.element.remove();
            clearInterval(enemy.interval);
        }
    }
};
Game.prototype.playerStartAttacking = function() {
    var me = this;
    var freezeTime = 100;
    var color = "white";
    this.player.interval = setInterval(function() {
        var idClosest = me.enemyClosest(me.board.center, me.range);
        if (idClosest >= 0) {
            var oClosestPunt = new Punt(me.board.enemies[idClosest].center.x, me.board.enemies[idClosest].center.y);
            me.board.enemies[idClosest].freeze = true;
            setTimeout(function() {
                if (me.board.enemies[idClosest]) {
                    me.board.enemies[idClosest].freeze = false;
                }
            }, freezeTime);
            me.board.showAttack(me.board.center, oClosestPunt, color);
            me.playerAttack(me.board.enemies[idClosest]);
            if (me.chainEffect === true) {
                var idClosestChained = me.enemyFurthest(oClosestPunt, me.range / 2);
                if (idClosestChained >= 0) {
                    me.board.enemies[idClosestChained].freeze = true;
                    setTimeout(function() {
                        if (me.board.enemies[idClosestChained]) {
                            me.board.enemies[idClosestChained].freeze = false;
                        }
                    }, freezeTime);
                    me.board.showAttack(oClosestPunt, me.board.enemies[idClosestChained].center, color);
                    me.playerAttack(me.board.enemies[idClosestChained]);
                }
            }
        }
        if (me.splitEffect === true) {
            var idFurthest = me.enemyFurthest(me.board.center, me.range);
            if (idFurthest >= 0) {
                var oFurthestPunt = new Punt(me.board.enemies[idFurthest].center.x, me.board.enemies[idFurthest].center.y);
                me.board.enemies[idFurthest].freeze = true;
                setTimeout(function() {
                    if (me.board.enemies[idFurthest]) {
                        me.board.enemies[idFurthest].freeze = false;
                    }
                }, freezeTime);
                me.board.showAttack(me.board.center, oFurthestPunt, color);
                me.playerAttack(me.board.enemies[idFurthest]);
                if (me.chainEffect === true) {
                    var idFurthestChained = me.enemyFurthest(oFurthestPunt, me.range / 2);
                    if (idFurthestChained >= 0) {
                        me.board.enemies[idFurthestChained].freeze = true;
                        setTimeout(function() {
                            if (me.board.enemies[idFurthestChained]) {
                                me.board.enemies[idFurthestChained].freeze = false;
                            }
                        }, freezeTime);
                        me.board.showAttack(oFurthestPunt, me.board.enemies[idFurthestChained].center, color);
                        me.playerAttack(me.board.enemies[idFurthestChained]);
                    }
                }
            }
        }
        if (me.board.enemies.length === 0) {
            clearInterval(me.player.interval);
        }
    }, this.ms);
};
Game.prototype.enemyClosest = function(from, range) {
    var nClosest = 500;
    var idClosest = -1;
    for (var i = 0; i < this.board.enemies.length; i++) {
        var nEnemyDistance = getDistance(from, this.board.enemies[i].center);
        if (nEnemyDistance < range && nEnemyDistance < nClosest) {
            nClosest = nEnemyDistance;
            idClosest = i;
        }
    }
    return idClosest;
};
Game.prototype.enemyFurthest = function(from, range) {
    var nFurthest = 0;
    var idFurthest = -1;
    for (var i = 0; i < this.board.enemies.length; i++) {
        var nEnemyDistance = getDistance(from, this.board.enemies[i].center);
        if (nEnemyDistance < range && nEnemyDistance > nFurthest) {
            nFurthest = nEnemyDistance;
            idFurthest = i;
        }
    }
    return idFurthest;
}
Game.prototype.playerAttack = function(enemy) {
    if (this.ll > 0) {
        this.player.health += this.damage * (this.ll / 100);
        this.showPlayer();
    }
    enemy.health -= this.damage;
    if (enemy.health <= 0) {
        this.board.enemies.splice(this.board.enemies.indexOf(enemy), 1);
        enemy.element.remove();
        clearInterval(enemy.interval);
    }
};

function Board(canvas, center, radius, side) {
    this.canvas = canvas;
    this.center = center;
    this.radius = radius;
    this.side = side;
    this.height = Math.sqrt(3 * this.side * this.side);
    this.hexes = [];
    this.enemies = [];
    this.runeStats = [10, 10, 1, 10, 5, 5, 1];
};
Board.prototype.hexCreate = function() {
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
Board.prototype.hexDraw = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        this.canvas.appendChild(this.hexes[i].element());
    }
};
Board.prototype.hexConnect = function() {
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
Board.prototype.hexCheckConnected = function(hex) {
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
Board.prototype.hexCheckDisconnected = function(hex) {
    for (var i = 0; i < this.hexes.length; i++ ) {
        if ((Math.abs(hex.xid - this.hexes[i].xid) < 2) && (Math.abs(hex.yid - this.hexes[i].yid) < 2)) {
            if (Math.abs(hex.xid + hex.yid - (this.hexes[i].xid + this.hexes[i].yid)) === Math.abs(hex.xid - this.hexes[i].xid) + Math.abs(hex.yid - this.hexes[i].yid)) {
                if (this.hexes[i].rune !== "" && this.hexes[i].heartConnected === false && hex.heartConnected === true) {
                    this.hexes[i].heartConnected = true;
                    this.hexCheckDisconnected(this.hexes[i]);
                }
            }
        }  
    }
};
Board.prototype.runeCreate = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        this.hexes[i].dam = 0;
        this.hexes[i].as = 0;
        this.hexes[i].cc = 0;
        this.hexes[i].cd = 0;
        this.hexes[i].range = 0;
        this.hexes[i].gold = 0;
        this.hexes[i].chain = false;
        this.hexes[i].slow = false;
        this.hexes[i].split = false;
        if (this.hexes[i].xid === this.radius && this.hexes[i].yid === this.radius) {
            this.hexes[i].rune = "heart";
        }
        if (this.hexes[i].rune !== "" && this.hexes[i].rune !== "heart") {
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
                case 5:
                    this.hexes[i].gold = this.runeStats[5] * this.hexes[i].tier;
                    break;
                case 6:
                    this.hexes[i].ll = this.runeStats[6] * this.hexes[i].tier;
                    break; 
                case 7:
                    this.hexes[i].chain = true;
                    break;
                case 8:
                    this.hexes[i].slow = true;
                    break;
                case 9:
                    this.hexes[i].split = true;
                    break;
            }
        }
    }
};
Board.prototype.runeDraw = function(defs) {
    for (var i = 0; i < this.hexes.length; i++ ) {
        if (this.hexes[i].rune !== "") {
            defs.appendChild(this.hexes[i].pattern());
        }
    }
};
Board.prototype.runeRemove = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        delete this.hexes[i]["pattern"];
        $('#pattern' + this.hexes[i].id).remove();
    }
};
Board.prototype.setValues = function() {
    this.dam = 0;
    this.as = 0;
    this.cc = 0;
    this.cd = 0;
    this.range = 0;
    this.gold = 0;
    this.ll = 0;
    this.chain = false;
    this.chainEffect = false;
    this.slow = false;
    this.slowEffect = false;
    this.split = false;
    this.splitEffect = false;
    for (var i = 0; i < this.hexes.length; i++) {
        if (this.hexes[i].rune !== "" && this.hexes[i].rune !== "heart") {
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
            this.gold += hex.gold * asc;
            this.ll += hex.ll * desc;
            if (hex.chain === true) {
                this.chain = true;
                if (hex.heartConnected === true) { this.chainEffect = true; }
            }
            if (hex.slow === true) {
                this.slow = true;
                if (hex.heartConnected === true) { this.slowEffect = true; }
            }
            if (hex.split === true) {
                this.split = true;
                if (hex.heartConnected === true) { this.splitEffect = true; }
            }
        }
    }
};
Board.prototype.showAttack = function(source, target, color) {
    var attack = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    attack.setAttribute('x1', source.x);
    attack.setAttribute('y1', source.y);
    attack.setAttribute('x2', target.x);
    attack.setAttribute('y2', target.y);
    attack.setAttribute('stroke', color);
    attack.setAttribute('stroke-width', '2px');
    this.canvas.appendChild(attack);
    setTimeout(function() {
        attack.remove();
    }, 100);
};

function Player() {
    this.health = 100;
    this.range = 150;
    this.gold = 1000;
    this.dam = 10;
    this.cc = 5;
    this.cd = 50;
    this.as = 5;
};
function getDistance(from, to) {
    return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
}
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
    this.gold = 0;
    this.ll = 0;
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

    var tier = this.tier;
    if (this.heartConnected === false) {
        tier = 0;
    }

    var iRune = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    iRune.setAttribute("width", this.side * 3.6);
    iRune.setAttribute("height", this.side * 3.6);
    iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + this.rune + tier + '.png');
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
function Enemy(to, center) {
    this.damage = 5;
    var mod = Math.round((Math.random() + 1) * 100) / 100;
    this.health = 15 * mod;
    this.radius = 10 * mod;
    this.speed = 5 / mod;
    this.center = center;
    this.angleRadians = Math.atan2(to.y - this.center.y, to.x - this.center.x);
    this.sine = Math.sin(this.angleRadians);
    this.cosine = Math.cos(this.angleRadians);
    this.freeze = false;
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