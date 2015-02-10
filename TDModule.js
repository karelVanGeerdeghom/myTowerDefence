'use strict';

$(function() {
    var eCanvas = document.getElementById('canvas');
    var ePlayer = $('#playerStats');
    var eHex = $('#hexStats');
    
    var myGame = (function() {
        var eSvg, eDefs;
        var board, player;
        var damage, as, ms, cc, cd, range, dps;
        var ml, ll, chain, chainEffect, slow, slowEffect, split, splitEffect;
/////////////////////////////////////////////////////////////////////////////// GAME FUNCTIONS
        function initialize() {
            createSvg();
            createDefs();
            eSvg.appendChild(eDefs);
            eCanvas.appendChild(eSvg);
            board = new Board(eSvg, new Punt(0, 0), 4, 24);
            player = new Player();
            board.hexCreate();
            board.runeCreate();
            board.hexDraw();
            board.runeDraw();

            $("polygon").on("click", function() {
                var id = parseInt($(this).attr("id"));
                var hex = board.hexes[id];
                if (id !== board.heart) {
                    eHex.empty();
                    board.setBoardValues();
                    setGameValues();
                    showPlayer();
                    showHex(hex);
                }
                if (id === board.heart) {
                    eHex.empty();
                    board.setBoardValues();
                    setGameValues();
                    showPlayer();
                    showRange();
                    showHex(hex);
                }
            });
        };
        function createSvg() {
            eSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            eSvg.setAttributeNS('http://www.w3.org/2000/svg','xlink','http://www.w3.org/1999/xlink');
            eSvg.setAttributeNS(null, "width", 800);
            eSvg.setAttributeNS(null, "height", 800);
            eSvg.setAttributeNS(null, "viewBox", "-400 -400 800 800");
        };
        function createDefs() {
            eDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        };
        function setGameValues() {
            var damCalc = player.dam * ((100 + board.dam) / 100);
            var ccCalc = player.cc + board.cc;
            var cdCalc = player.cd + board.cd;
            var totalDamage = damCalc * (ccCalc * (100 + cdCalc) / 10000) + damCalc * ((100 - ccCalc) / 100);
            damage = Math.round(totalDamage * 100) / 100;
            as =  Math.round(player.as * ((100 + board.as) / 100) * 100) / 100;
            ms = Math.round(1000 / as);
            cc = Math.round((player.cc + board.cc) * 100) / 100;
            cd = Math.round((player.cd + board.cd) * 100) / 100;
            range = player.range * ((100 + board.range) / 100);
            dps = Math.round(damage * (Math.round(player.as * ((100 + board.as) / 100) * 100) / 100) * 100) / 100;
            ml = board.ml;
            ll = board.ll;
            chain = board.chain;
            chainEffect = board.chainEffect;
            slow = board.slow;
            slowEffect = board.slowEffect;
            split = board.split;
            splitEffect = board.splitEffect;
        };
        function showPlayer() {
            var me = this;
            ePlayer.empty();
            var eHealth = $('<p>Player Health: ' + player.health + '</p>');
            var eMana = $('<p>Player Mana: ' + player.mana + '</p>');
            var eRange = $('<p>Player Range: ' + player.range + '</p>');
            var eDamage = $('<p>Player Damage: ' + player.dam + '</p>');
            var eAs = $('<p>Player Attack Speed: 1 per ' + 1000 / player.as + 'ms | ' + player.as + ' / second</p>');
            var eCc = $('<p>Player Critical Chance: ' + player.cc + '%</p>');
            var eCd = $('<p>Player Critical Damage: ' + player.cd + '%</p>');
            var eTotalrange = $('<p>Total Range: ' + range + '</p>');
            var eTotalDps = $('<p>Total DPS: ' + dps + '</p>');
            var eTotalDam = $('<p>Total Damage: ' + damage + '</p>');
            var eTotalAs = $('<p>Total Attack Speed: 1 per ' + ms + 'ms | ' + as + '/s</p>');
            var eTotalCc = $('<p>Total Critical Chance: ' + cc + '%</p>');
            var eTotalCd = $('<p>Total Critical Damage: ' + cd + '%</p>');
            var eTotalMl = $('<p>Total Manaleech: ' + ml + ' %</p>');
            var eTotalLl = $('<p>Total Lifeleech: ' + ll + ' %</p>');
            var eChain = $('<p>Chaining: ' + chainEffect + '</p>');
            var eSlow = $('<p>Slowing: ' + slowEffect + '</p>');
            var eSplit = $('<p>Splitting: ' + splitEffect + '</p>');

            var eStartWave = $('<button type="button" id="waveStart">Wave</button>');

            ePlayer.append(eHealth)
                .append(eMana)
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
                .append(eTotalMl)
                .append(eTotalLl)
                .append(eChain)
                .append(eSlow)
                .append(eSplit)
                .append(eStartWave);

            $(eStartWave).click(function() {
                waveCreate();
                waveStart();
                playerStartAttacking();
            });
        };
        function showRange() {
            var eRange = $('#playerRange');
            eRange.remove();
            var svgRange = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            svgRange.setAttribute('cx', board.center.x);
            svgRange.setAttribute('cy', board.center.y);
            svgRange.setAttribute('r', range);
            svgRange.setAttribute('stroke', 'green');
            svgRange.setAttribute('stroke-width', '2px');
            svgRange.setAttribute('fill', 'none');
            svgRange.setAttribute('id', 'playerRange');
            eSvg.appendChild(svgRange);    
        };
        function showHex(hex) {
            eHex.empty();
            if (hex.rune) {
                var eRune = $('<p>Rune: ' + hex.rune.name + '</p>');
                var eTier = $('<p>Tier: ' + hex.rune.tier + '</p>');
                var eHeartConnected = $('<p>Connected: ' + hex.heartConnected + '</p>');
                eHex.append(eRune).append(eTier).append(eHeartConnected);
            }
            if (!hex.rune) {
                var eDamage = $('<button type="button" id="damButton">Dam</button>');
                var eAs = $('<button type="button" id="asButton">AS</button>');
                var eRange = $('<button type="button" id="rangeButton">Range</button>');
                var eCc = $('<button type="button" id="ccButton">CC</button>');
                var eCd = $('<button type="button" id="cdButton">CD</button>');
                var eMl = $('<button type="button" id="mlButton">Manaleech</button>');
                var eLl = $('<button type="button" id="llButton">Lifeleech</button>');
                var eChain = $('<button type="button" id="chainButton">Chain</button>');
                var eSlow = $('<button type="button" id="slowButton">Slow</button>');   
                var eSplit = $('<button type="button" id="splitButton">Split</button>');

                if (player.mana >= 100) {
                    eHex.append(eDamage).append(eAs).append(eRange);
                }
                if (player.mana >= 150) {
                    eHex.append(eCc).append(eCd).append(eMl).append(eLl);
                }
                if (player.mana >= 250) {
                    if (chain !== true) { eHex.append(eChain); }
                    if (slow !== true) { eHex.append(eSlow); }
                    if (split !== true) { eHex.append(eSplit); }
                }
                $(eDamage).click(function() { runeBuy(1, hex); });
                $(eAs).click(function() { runeBuy(2, hex); });
                $(eCc).click(function() { runeBuy(3, hex); });
                $(eCd).click(function() { runeBuy(4, hex); });
                $(eRange).click(function() { runeBuy(5, hex); });
                $(eMl).click(function() { runeBuy(6, hex); });
                $(eLl).click(function() { runeBuy(7, hex); });
                $(eChain).click(function() { runeBuy(8, hex); });
                $(eSlow).click(function() { runeBuy(9, hex); });
                $(eSplit).click(function() { runeBuy(10, hex); });
            }
            else if (hex.rune.id !== 0) {
                var eSell = $('<button type="button" id="sellButton">Sell</button>');
                var eUpgrade = $('<button type="button" id="upgradeButton">Upgrade</button>');
                eHex.append(eSell);
                $(eSell).click(function() {
                    runeSell(hex);
                });
                if (hex.rune.tier < 4 && hex.rune.id < 8) {
                    eHex.append(eUpgrade);
                    $(eUpgrade).click(function() { runeUpgrade(hex); });
                }
            }
        };
        function runeBuy(id, hex) {
            hex.rune = new Rune(id);
            if (board.hexCheckConnected(hex)) {
                hex.rune.tier = 1;
                hex.heartConnected = true;
            }
            board.hexCheckDisconnected(hex);
            board.runeRemove();
            board.hexConnect();
            board.runeCreate();
            board.runeDraw();
            board.setBoardValues();
            setGameValues();
            showPlayer();
            showRange();
            showHex(hex);
        };
        function runeSell(hex) {
            delete hex.rune;
            hex.element.setAttribute("fill", "black");
            for (var i = 0; i < board.hexes.length; i++) {
                if (i !== board.heart) {
                    board.hexes[i].heartConnected = false;
                }
                board.hexes[i].connections = [];
                board.hexes[i].directions = [];
            }
            for (var i = 0; i < board.hexes.length; i++) {
                if (board.hexes[i].rune && i !== board.heart) {
                    if (board.hexCheckConnected(board.hexes[i])) {
                        board.hexes[i].heartConnected = true;
                    }
                    board.hexCheckDisconnected(board.hexes[i]);
                }
            }
            board.runeRemove();
            board.hexConnect();
            board.runeCreate();
            board.runeDraw();
            board.setBoardValues();
            setGameValues();
            showPlayer();
            showRange();
            showHex(hex);
        };
        function runeUpgrade(hex) {
            hex.rune.tier += 1;
            board.runeRemove();
            board.hexConnect();
            board.runeCreate();
            board.runeDraw();
            board.setBoardValues();
            setGameValues();
            showPlayer();
            showRange();
            showHex(hex);
        };
        function waveCreate() {
            board.enemies = [];
            for (var i = 0; i < 40; i++) {
                var randomAngle = Math.random() * 2 * Math.PI;
                var sine = Math.sin(randomAngle);
                var cosine = Math.cos(randomAngle);
                var punt = new Punt(sine * (600), cosine * (600));
                var enemy = new Enemy(i, board.center, punt);
                board.enemies.push(enemy);
            }
        };
        function waveStart() {
            for (var i = 0; i < board.enemies.length; i ++) {
                eSvg.appendChild(board.enemies[i].element());
                eDefs.appendChild(board.enemies[i].pattern());
                enemyStartMoving(board.enemies[i], board.center);
            }
        };
        function enemyStartMoving(enemy, to) {
            enemy.interval = setInterval(function() {
                enemyMove(enemy, to);
            }, 35);
        };
        function enemyMove(enemy, to) {
            enemy.freeze -= 1;
            if (enemy.freeze <= 0) {
                var slow = 1;
                if (slowEffect === true && getDistance(enemy.center, to) <= range) { slow = 0.5; }
                var x = enemy.center.x + enemy.cosine * enemy.speed * slow;
                var y = enemy.center.y + enemy.sine * enemy.speed * slow;
                var from = new Punt(x, y);
                enemy.pattern.setAttribute("x", x);
                enemy.pattern.setAttribute("y", y);
                enemy.element.setAttribute('cx', x);
                enemy.element.setAttribute('cy', y);
                enemy.element.setAttribute('x', x);
                enemy.element.setAttribute('y', y);
                enemy.center = from;
                enemy.animate += 1;
                if (enemy.animate % Math.floor(enemy.mod * 5) === 0) {
                    enemy.step += 1;
                    enemy.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/invader-' + enemy.type + '-' + enemy.direction + '-' + enemy.step % 6 + '.svg');
        //            enemy.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/invader-' + enemy.type + '-' + enemy.step % 2 + '.svg');
                }
                if (getDistance(enemy.center, to) < 50) {
                    player.health -= enemy.damage;
        //            this.showPlayer();
                    delete enemy["pattern"];
                    $('#enemy' + enemy.id).remove();
                    board.enemies.splice(board.enemies.indexOf(enemy), 1);
                    enemy.element.remove();
                    clearInterval(enemy.interval);
                }
            }
        };
        function enemyClosest(from, range) {
            var nClosest = 500;
            var idClosest = -1;
            for (var i = 0; i < board.enemies.length; i++) {
                var nEnemyDistance = getDistance(from, board.enemies[i].center);
                if (nEnemyDistance < range && nEnemyDistance < nClosest) {
                    nClosest = nEnemyDistance;
                    idClosest = i;
                }
            }
            return idClosest;
        };
        function enemyFurthest(from, range) {
            var nFurthest = 0;
            var idFurthest = -1;
            for (var i = 0; i < board.enemies.length; i++) {
                var nEnemyDistance = getDistance(from, board.enemies[i].center);
                if (nEnemyDistance < range && nEnemyDistance > nFurthest) {
                    nFurthest = nEnemyDistance;
                    idFurthest = i;
                }
            }
            return idFurthest;
        };
        function playerStartAttacking() {
            var me = this;
            var freezeCount = 0;
            var color = "red";
            var chainColor = "white";
            player.interval = setInterval(function() {
                var idClosest = enemyClosest(board.center, range);
                if (idClosest >= 0) {
                    var oClosestPunt = new Punt(board.enemies[idClosest].center.x, board.enemies[idClosest].center.y);
                    board.enemies[idClosest].freeze = freezeCount;
                    board.showAttack(board.center, oClosestPunt, color);
                    playerAttack(board.enemies[idClosest]);
                    if (chainEffect === true) {
                        var idClosestChained = enemyFurthest(oClosestPunt, range / 2);
                        if (idClosestChained >= 0) {
                            board.enemies[idClosestChained].freeze = freezeCount;
                            board.showAttack(oClosestPunt, board.enemies[idClosestChained].center, color);
                            playerAttack(board.enemies[idClosestChained]);
                        }
                    }
                }
                if (splitEffect === true) {
                    var idFurthest = enemyFurthest(board.center, range);
                    if (idFurthest >= 0) {
                        var oFurthestPunt = new Punt(board.enemies[idFurthest].center.x, board.enemies[idFurthest].center.y);
                        board.enemies[idFurthest].freeze = freezeCount;
                        board.showAttack(board.center, oFurthestPunt, color);
                        playerAttack(board.enemies[idFurthest]);
                        if (chainEffect === true) {
                            var idFurthestChained = enemyFurthest(oFurthestPunt, range / 2);
                            if (idFurthestChained >= 0) {
                                board.enemies[idFurthestChained].freeze = freezeCount;
                                board.showAttack(oFurthestPunt, board.enemies[idFurthestChained].center, color);
                                playerAttack(board.enemies[idFurthestChained]);
                            }
                        }
                    }
                }
                if (board.enemies.length === 0) {
                    clearInterval(player.interval);
                }
            }, ms);
        };
        function playerAttack(enemy) {
            if (ml > 0 || ll > 0) {
                if (ml > 0) {
                    player.mana += damage * (ml / 100);
                }
                if (ll > 0) {
                    player.health += damage * (ll / 100);
                }
        //        this.showPlayer();
            }
            enemy.health -= damage;
            if (enemy.health <= 0) {
                board.enemies.splice(board.enemies.indexOf(enemy), 1);
                delete enemy["pattern"];
                $('#enemy' + enemy.id).remove();
                enemy.element.remove();
                clearInterval(enemy.interval);
            }
        };
        function getDistance(from, to) {
            return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
        };
/////////////////////////////////////////////////////////////////////////////// OBJECTS AND METHODS
        function Punt(x, y) {
            this.x = x;
            this.y = y;
        };
        function Player() {
            this.health = 100;
            this.range = 150;
            this.mana = 1000;
            this.dam = 10;
            this.cc = 5;
            this.cd = 50;
            this.as = 5;
        };
        function Rune(id){
            this.runeTypes = ["heart", "dam", "as", "cc", "cd", "range", "ml", "ll", "chain", "slow", "split"];
            this.id = id;
            this.name = this.runeTypes[id];
            this.tier = 1;
            this.dam = 0;
            this.as = 0;
            this.cc = 0;
            this.cd = 0;
            this.range = 0;
            this.ml = 0;
            this.ll = 0;
            this.stats = [0, 10, 10, 1, 10, 5, 1, 1];// heart dam as cc cd range ml ll
        };
        function Board(canvas, center, radius, side) {
            this.canvas = canvas;
            this.center = center;
            this.radius = radius;
            this.side = side;
            this.height = Math.sqrt(3 * this.side * this.side);
            this.hexes = [];
            this.enemies = [];
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
                        hex.rune = new Rune(0);
                        hex.heartConnected = true;
                    }
                    this.hexes.push(hex);
                }
            }
        };
        Board.prototype.hexDraw = function() {
            for (var i = 0; i < this.hexes.length; i++ ) {
                eSvg.appendChild(this.hexes[i].element());
            }
        };
        Board.prototype.hexConnect = function() {
            for (var i = 0; i < this.hexes.length; i++ ) {
                for (var j = 0; j < this.hexes.length; j++ ) {
                    if (this.hexes[i].rune && this.hexes[j].rune) {
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
                        if (this.hexes[i].rune && this.hexes[i].heartConnected === false && hex.heartConnected === true) {
                            this.hexes[i].heartConnected = true;
                            this.hexCheckDisconnected(this.hexes[i]);
                        }
                    }
                }  
            }
        };
        Board.prototype.runeCreate = function() {
            for (var i = 0; i < this.hexes.length; i++ ) {
                if (this.hexes[i].rune && this.hexes[i].rune.id !== 0) {
                    this.hexes[i].rune.dam = 0;
                    this.hexes[i].rune.as = 0;
                    this.hexes[i].rune.cc = 0;
                    this.hexes[i].rune.cd = 0;
                    this.hexes[i].rune.range = 0;
                    this.hexes[i].rune.ml = 0;
                    this.hexes[i].rune.chain = false;
                    this.hexes[i].rune.slow = false;
                    this.hexes[i].rune.split = false;

                    switch (this.hexes[i].rune.id) {
                        case 1:
                            this.hexes[i].rune.dam = this.hexes[i].rune.stats[1] * this.hexes[i].rune.tier;
                            break;
                        case 2:
                            this.hexes[i].rune.as = this.hexes[i].rune.stats[2] * this.hexes[i].rune.tier;
                            break;
                        case 3:
                            this.hexes[i].rune.cc = this.hexes[i].rune.stats[3] * this.hexes[i].rune.tier;
                            break;
                        case 4:
                            this.hexes[i].rune.cd = this.hexes[i].rune.stats[4] * this.hexes[i].rune.tier;
                            break;
                        case 5:
                            this.hexes[i].rune.range = this.hexes[i].rune.stats[5] * this.hexes[i].rune.tier;
                            break;
                        case 6:
                            this.hexes[i].rune.ml = this.hexes[i].rune.stats[6] * this.hexes[i].rune.tier;
                            break;
                        case 7:
                            this.hexes[i].rune.ll = this.hexes[i].rune.stats[7] * this.hexes[i].rune.tier;
                            break; 
                        case 8:
                            this.hexes[i].rune.chain = true;
                            break;
                        case 9:
                            this.hexes[i].rune.slow = true;
                            break;
                        case 10:
                            this.hexes[i].rune.split = true;
                            break;
                    }
                }
            }
        };
        Board.prototype.runeDraw = function() {
            for (var i = 0; i < this.hexes.length; i++ ) {
                if (this.hexes[i].rune) {
                    eDefs.appendChild(this.hexes[i].pattern());
                }
            }
        };
        Board.prototype.runeRemove = function() {
            for (var i = 0; i < this.hexes.length; i++ ) {
                delete this.hexes[i]["pattern"];
                $('#pattern' + this.hexes[i].id).remove();
            }
        };
        Board.prototype.setBoardValues = function() {
            this.dam = 0;
            this.as = 0;
            this.cc = 0;
            this.cd = 0;
            this.range = 0;
            this.ml = 0;
            this.ll = 0;
            this.chain = false;
            this.chainEffect = false;
            this.slow = false;
            this.slowEffect = false;
            this.split = false;
            this.splitEffect = false;
            for (var i = 0; i < this.hexes.length; i++) {
                if (this.hexes[i].rune && this.heart !== i) {
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
                    this.dam += hex.rune.dam * asc;
                    this.as += hex.rune.as * asc;
                    this.cc += hex.rune.cc * desc;
                    this.cd += hex.rune.cd * desc;
                    this.range += hex.rune.range * desc;
                    this.ml += hex.rune.ml * desc;
                    this.ll += hex.rune.ll * desc;
                    if (hex.rune.chain === true) {
                        this.chain = true;
                        if (hex.heartConnected === true) { this.chainEffect = true; }
                    }
                    if (hex.rune.slow === true) {
                        this.slow = true;
                        if (hex.heartConnected === true) { this.slowEffect = true; }
                    }
                    if (hex.rune.split === true) {
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
        function Hex(id, xid, yid, center, side){
            this.modifier = 0;
            this.center = center;
            this.side = side;
            this.height = Math.sqrt(3 * this.side * this.side);
            this.id = id;
            this.xid = xid;
            this.yid = yid;
            this.connections = [];
            this.directions = [];
            this.heartConnected = false;
        };
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

            var tier = this.rune.tier;
            if (this.heartConnected === false) { tier = 0; }

            var iRune = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            iRune.setAttribute("width", this.side * 3.6);
            iRune.setAttribute("height", this.side * 3.6);
            iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + this.rune.name + tier + '.png');

            this.pattern.appendChild(iRune);

            if (this.connections.length > 0 || this.rune.id === 0) {
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
        function Enemy(id, to, center) {
           this.id = id;
           this.damage = 5;
           this.mod = Math.random() + 1;
           this.health = 15 * this.mod;
           this.radius = 10 * this.mod;
           this.speed = 5 / this.mod;
           this.center = center;
           this.angleRadians = Math.atan2(to.y - this.center.y, to.x - this.center.x);
           this.angleDegrees = Math.atan2(to.y - this.center.y, to.x - this.center.x) * 180 / Math.PI;
           this.sine = Math.sin(this.angleRadians);
           this.cosine = Math.cos(this.angleRadians);
           this.direction = Math.round(Math.random());
           this.type = Math.floor(Math.random() * 4);
           this.size = 17;
           this.animate = 0;
           this.step = 0;
           this.freeze = 0;
       };
        Enemy.prototype.element = function() {
           this.element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
           this.element.setAttribute('cx', this.center.x);
           this.element.setAttribute('cy', this.center.y);
           this.element.setAttribute('x', this.center.x);
           this.element.setAttribute('y', this.center.y);
           this.element.setAttribute('width', this.size * 2 * this.mod);
           this.element.setAttribute('height', this.size * 2 * this.mod);
           this.element.setAttribute('transform', 'translate(-' + this.size * this.mod + ' -' + this.size * this.mod + ')');
           this.element.setAttribute('id', 'enemy');

           return this.element;
       };
        Enemy.prototype.pattern = function() {
           this.pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
           this.pattern.setAttribute("id", "enemy" + this.id);
           this.pattern.setAttribute("patternUnits", "userSpaceOnUse");
           this.pattern.setAttribute("x", this.center.x + this.mod * 15);
           this.pattern.setAttribute("y", this.center.y + this.mod * 15);
           this.pattern.setAttribute("width", this.size * 2 * this.mod);
           this.pattern.setAttribute("height", this.size * 2 * this.mod);

           this.image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
           this.image.setAttribute("width", this.size * 2 * this.mod);
           this.image.setAttribute("height", this.size * 2 * this.mod);
           this.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/invader-' + this.type + '-' + this.direction + '-' + this.step % 6 + '.svg');
       //    this.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/invader-' + this.type + '-' + this.step % 2 + '.svg');
           this.image.setAttribute('transform', 'rotate(' + parseFloat(this.angleDegrees - 90) + ' ' + this.size * this.mod + ' ' + this.size * this.mod + ')');

           this.pattern.appendChild(this.image);

           this.element.setAttribute("fill", "url(#enemy" + this.id + ")");

           return this.pattern;
       };
/////////////////////////////////////////////////////////////////////////////// RETURN
        return {
            init: initialize()
        };
    })();
});