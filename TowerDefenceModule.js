'use strict'; 
var gameModule = (function() {
    var oGame;
    var oViews = {
        tower: {
            elements: {
                "wave": "Wave: ",
                "dps": "Tower DPS: ",
                "dam": "Tower Damage: ",
                "as": "Tower Attack Speed: ",
                "range": "Tower Range: ",
                "cc": "Tower Critical Chance: ",
                "cd": "Tower  Critical Damage: ",
                "ll": "Tower Lifeleech: ",
                "ml": "Tower Manaleech: ",
                "chainEffect": "Chaining: ",
                "splitEffect": "Splitting: ",
                "slowEffect": "Slowing: "
            }
        },
        player: {
            elements: {
                "level": "Player Level: ",
                "experience": "Player Experience: ",
                "maxExperience": "Experience Needed: ",
                "skillPoints": "Player Skillpoints: ",
                "health": "Player Health: ",
                "mana": "Player Mana: ",
                "dam": "Player Damage: ",
                "as": "Player Attack Speed: ",
                "range": "Player Range: ",
                "cc": "Player Critical Chance: ",
                "cd": "Player  Critical Damage: "
            }
        },
        skill: {
            elements: {
                "dam": {
                    "name": "Damage Rune",
                    "number": 4
                },
                "as": {
                    "name": "Attack Speed Rune",
                    "number": 4
                },
                "range": {
                    "name": "Range Rune",
                    "number": 4
                },
                "cc": {
                    "name": "Critical Chance Rune",
                    "number": 4
                },
                "cd": {
                    "name": "Critical Damage Rune",
                    "number": 4
                },
                "ll": {
                    "name": "Lifeleech Rune",
                    "number": 4
                },
                "ml": {
                    "name": "Manaleech Rune",
                    "number": 4
                },
                "chain": {
                    "name": "Chaining Rune",
                    "number": 1
                },
                "slow": {
                    "name": "Slowing Rune",
                    "number": 1
                },
                "split": {
                    "name": "Splitting Rune",
                    "number": 1
                }
            }
        },
        hex: {
            buttons: {
                "dam": {
                    "name": "Damage",
                    "upgrade": true
                },
                "as": {
                    "name": "Attack Speed",
                    "upgrade": true
                },
                "range": {
                    "name": "Range",
                    "upgrade": true
                },
                "cc": {
                    "name": "Critical Chance",
                    "upgrade": true
                },
                "cd": {
                    "name": "Critical Damage",
                    "upgrade": true
                },
                "ll": {
                    "name": "Lifeleech",
                    "upgrade": true
                },
                "ml": {
                    "name": "Manaleech",
                    "upgrade": true
                },
                "chain": {
                    "name": "Chaining",
                    "upgrade": false
                },
                "split": {
                    "name": "Splitting",
                    "upgrade": false
                },
                "slow": {
                    "name": "Slowing",
                    "upgrade": false
                },
                "sell": {
                    "name": "Sell"
                },
                "upgrade": {
                    "name": "Upgrade"
                }
            }
        }
    };
    var oSettings =  {
        "size": 800,
        "radius": 4,
        "side": 25,
        "health": 100,
        "mana": 200,
        "range": 150,
        "dam": 10,
        "as": 5,
        "cc": 5,
        "cd": 50,
        "runeTypes": ["tower", "dam", "as", "range", "cc", "cd", "ll", "ml", "chain", "slow", "split"],
        "runeCosts": [0, 100, 100, 100, 150, 150, 200, 200, 250, 250, 250],
        "runeStats": [0, 7.5, 7.5, 2, 20, 5, 0.5, 0.5],
        "enemydam": 5,
        "enemymana": 5,
        "enemyexperience": 3
    };
    var towerController = new Controller('tower');
    var playerController = new Controller('player');
    var skillController = new Controller('skill');
    var hexController = new Controller('hex');

    var init = function(container) {
        var eContainer = document.getElementById(container);
        var eCanvas = document.createElement('div');
        eCanvas.setAttribute('id', 'canvas');
        eCanvas.setAttribute('class', 'canvas');
        var eControl = document.createElement('div');
        eControl.setAttribute('id','control-stats');
        eControl.setAttribute('class','stats');
        var eHex = document.createElement('div');
        eHex.setAttribute('id','hex-stats');
        eHex.setAttribute('class','stats');
        var eTower = document.createElement('div');
        eTower.setAttribute('id','tower-stats');
        eTower.setAttribute('class','stats');
        var ePlayer = document.createElement('div');
        ePlayer.setAttribute('id','player-stats');
        ePlayer.setAttribute('class','stats');
        var eSkill = document.createElement('div');
        eSkill.setAttribute('id','skill-stats');
        eSkill.setAttribute('class','stats');
        eContainer.appendChild(eCanvas);
        eContainer.appendChild(eControl);
        eContainer.appendChild(eHex);
        eContainer.appendChild(eTower);
        eContainer.appendChild(ePlayer);
        eContainer.appendChild(eSkill);
        createGame();
    };
    var createGame = function() {
        var eCanvas = document.getElementById('canvas');
        var ePlayer = document.getElementById('playerStats');
        var eHex = document.getElementById('hexStats');
        oGame = new Game(eCanvas, ePlayer, eHex);
        oGame.create();
        oGame.board.setValues();
        oGame.setValues();
        towerController.init('tower');
        towerController.createAllStats();
        towerController.showAllStats();
        playerController.init('player');
        playerController.createAllStats();
        playerController.showAllStats();
        skillController.init('skill');
        skillController.createAllSkills();
        skillController.showAllSkills();
        hexController.init('hex');
        oGame.showRange();
        oGame.createHealth();
        oGame.createMana();

        var hexes = document.getElementsByTagName("polygon");
        for (var i = 0; i < hexes.length; i++) {
            hexes[i].addEventListener("click", function() {
                oGame.board.selected = this.id;
                if (this.id !== oGame.board.tower) {
                    hexController.createAllButtons(oGame.board.hexes[this.id]);
                }
            });
        }
        
        var eControl = document.getElementById('control-stats');
        var eWave = document.createElement('button');
        eWave.setAttribute('class', 'button');
        var sWave = document.createTextNode('Start Wave');
        eWave.appendChild(sWave);
        eControl.appendChild(eWave);
        eWave.addEventListener("click", function() {
            oGame.waveCreate();
            oGame.waveStart();
            oGame.playerStartAttacking();
        });
    };
    var buyRune = function() {
        var nId = this.id.split("-")[1];
        var nStat = this.id.split("-")[2];
        var runeId = oSettings.runeTypes.indexOf(nStat);
        
        oGame.runeBuy(runeId, oGame.board.hexes[nId]);
        hexController.createAllButtons(oGame.board.hexes[nId]);
    };
    var sellRune = function() {
        var nId = this.id.split("-")[1];
        oGame.runeSell(oGame.board.hexes[nId]);
        hexController.createAllButtons(oGame.board.hexes[nId]);
    };
    var upgradeRune = function() {
        var nId = this.id.split("-")[1];
        oGame.runeUpgrade(oGame.board.hexes[nId]);
        hexController.createAllButtons(oGame.board.hexes[nId]);
    };
    var spendPoint = function(stat) {
        if (oGame.player.skillPoints > 0) {
            oGame.player.skill[stat] += 1;
            oGame.player.skillPoints -= 1;
            playerController.showStat("skillPoints");
            skillController.showSkill(stat);
            if (oGame.board.selected !== -1) {
                hexController.createAllButtons(oGame.board.hexes[oGame.board.selected]);
            }
        }
    };

    function Controller(name) {
        this.name = name;
    };
    Controller.prototype.init = function(view) {
        this.view = oViews[view];
    };
    Controller.prototype.createAllStats = function() {
        for (var stat in this.view['elements']) {
            this.createStat(stat);
        }
    };
    Controller.prototype.createStat = function(stat) {
        var eStat = document.createElement('p');
        var sStat = document.createTextNode(this.view['elements'][stat]);
        eStat.setAttribute('id', this.name + '-' + stat);
        eStat.appendChild(sStat);
        
        var eParent = document.getElementById(this.name + '-stats');
        eParent.appendChild(eStat);
    };
    Controller.prototype.showAllStats = function() {
        for (var stat in this.view['elements']) {
            this.showStat(stat);
        }
    };
    Controller.prototype.showStat = function(stat) {
        var eStat = document.getElementById(this.name + '-' + stat);
        if (eStat.childNodes[1]) {
            eStat.removeChild(eStat.childNodes[1]);
        }
        var sStat = document.createTextNode(oGame[this.name][stat]);
        eStat.appendChild(sStat);
    };
    Controller.prototype.createAllButtons = function(hex) {
        var eParent = document.getElementById(this.name + '-stats');
        while (eParent.lastChild) {
            eParent.lastChild.removeEventListener("click", buyRune);
            eParent.lastChild.removeEventListener("click", sellRune);
            eParent.lastChild.removeEventListener("click", upgradeRune);
            eParent.removeChild(eParent.lastChild);
        }
        if (parseInt(hex.id) !== oGame.board.tower) {
            if (!hex.rune) {
                for (var rune in this.view['buttons']) {
                    if (oGame.player.skill[rune] > 0 && oGame.player.mana >= oSettings.runeCosts[oSettings.runeTypes.indexOf(rune)]) {
                        this.createButton(hex, rune, buyRune);
                    } 
                }
            }
            else {
                this.createButton(hex, 'sell', sellRune);
                if (
                    hex.rune.tier < 4 
                    && this.view['buttons'][hex.rune.name]["upgrade"] === true
                    && oGame.player.mana >= oSettings.runeCosts[hex.rune.id]
                    && oGame.player.skill[hex.rune.name] > hex.rune.tier
                ) {
                    this.createButton(hex, 'upgrade', upgradeRune);
                }
            }
        }
    };
    Controller.prototype.createButton = function(hex, stat, action) {
        var eParent = document.getElementById(this.name + '-stats');
        if (stat === "chain" && oGame.tower.chain === true) { return; }
        if (stat === "split" && oGame.tower.split === true) {  return; }
        if (stat === "slow" && oGame.tower.slow === true) { return; }

        var eButton = document.createElement('button');
        var sButton = document.createTextNode(this.view['buttons'][stat]["name"]);
        eButton.setAttribute('id', this.name + '-' + hex.id + '-' + stat);
        eButton.setAttribute('class', 'button ' + stat);
        eButton.appendChild(sButton);
        eParent.appendChild(eButton);
        eButton.addEventListener("click", action);
    };
    Controller.prototype.createAllSkills = function() {
        for (var skill in this.view['elements']) {
            this.createSkill(skill);
        }
    };
    Controller.prototype.createSkill = function(stat) {
        var eSkillBar = document.createElement('div');
        eSkillBar.setAttribute('id', 'skill-' + stat);
        eSkillBar.setAttribute('class', 'skillBar');
        var eSkillName = document.createElement('div');
        var sSkillName = document.createTextNode(this.view['elements'][stat]["name"]);
        var eSkillIcons = document.createElement('div');
        eSkillIcons.setAttribute('id', 'skill-' + stat + '-all');
        
        eSkillName.appendChild(sSkillName);
        eSkillBar.appendChild(eSkillName);
        eSkillBar.appendChild(eSkillIcons);
        
        var eParent = document.getElementById(this.name + '-stats');
        eParent.appendChild(eSkillBar);
        
        eSkillIcons.addEventListener("click", function() {
            spendPoint(stat);
        });
    };
    Controller.prototype.showAllSkills = function() {
        for (var skill in this.view['elements']) {
            this.showSkill(skill);
        }
    };
    Controller.prototype.showSkill = function(stat) {
        var eParent = document.getElementById('skill-' + stat + '-all');
        while (eParent.lastChild) {
            eParent.removeChild(eParent.lastChild);
        }
        for (var i = 1; i <= this.view['elements'][stat]["number"]; i++) {
            var tier = i;
            if (oGame.player.skill[stat] < i) {
                tier = 0;
            }
            var eTier = document.createElement('div');
            eTier.setAttribute('id', 'skill-' + stat + '-' + i);
            eTier.setAttribute('class', 'skillIcon ' + stat + tier);
            
            eParent.appendChild(eTier);
        }
    };
 
    function Game(eCanvas, ePlayer, eHex) {
        this.eCanvas = eCanvas;
        this.ePlayer = ePlayer;
        this.eHex = eHex;
        this.player = new Player;
    };
    Game.prototype.create = function() {
        this.createSvg();
        this.createDefs();
        this.eCanvas.appendChild(this.eSvg);
        this.eSvg.appendChild(this.eDefs);

        this.center = new Punt(0, 0);
        this.tower = new Tower();
        this.board = new Board(this.eSvg, this.center, oSettings.radius, oSettings.side);
        this.board.hexCreate();
        this.board.runeCreate();
        this.board.hexDraw();
        this.board.runeDraw(this.eDefs);
    };
    Game.prototype.createSvg = function() {
        this.eSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.eSvg.setAttributeNS('http://www.w3.org/2000/svg','xlink','http://www.w3.org/1999/xlink');
        this.eSvg.setAttributeNS(null, "width", oSettings.size);
        this.eSvg.setAttributeNS(null, "height", oSettings.size);
        this.eSvg.setAttributeNS(null, "viewBox", "-" + oSettings.size / 2 + " -" + oSettings.size / 2 + " " + oSettings.size + " " + oSettings.size + "");
    };
    Game.prototype.createDefs = function() {
        this.eDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    };
    Game.prototype.setValues = function() {
        var dam = this.player.dam * ((100 + this.board.dam) / 100);
        var cc = this.player.cc + this.board.cc;
        var cd = this.player.cd + this.board.cd;
        var totalDamage = dam * (cc * (100 + cd) / 10000) + dam * ((100 - cc) / 100);
        this.tower.dam = Math.round(totalDamage * 100) / 100;
        this.tower.as =  Math.round(this.player.as * ((100 + this.board.as) / 100) * 100) / 100;
        this.tower.ms = Math.round(1000 / this.tower.as);
        this.tower.range = this.player.range * ((100 + this.board.range) / 100);
        this.tower.cc = Math.round((this.player.cc + this.board.cc) * 100) / 100;
        this.tower.cd = Math.round((this.player.cd + this.board.cd) * 100) / 100;
        this.tower.dps = Math.round(this.tower.dam * (Math.round(this.player.as * ((100 + this.board.as) / 100) * 100) / 100) * 100) / 100;
        this.tower.ml = this.board.ml;
        this.tower.ll = this.board.ll;
        this.tower.chain = this.board.chain;
        this.tower.chainEffect = this.board.chainEffect;
        this.tower.slow = this.board.slow;
        this.tower.slowEffect = this.board.slowEffect;
        this.tower.split = this.board.split;
        this.tower.splitEffect = this.board.splitEffect;
    };
    Game.prototype.showRange = function() {
        var svgRange = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        svgRange.setAttribute('cx', this.board.center.x);
        svgRange.setAttribute('cy', this.board.center.y);
        svgRange.setAttribute('r', this.tower.range);
        svgRange.setAttribute('stroke', 'green');
        svgRange.setAttribute('stroke-width', '1px');
        svgRange.setAttribute('fill', 'none');
        svgRange.setAttribute('id', 'towerRange');
        this.eSvg.appendChild(svgRange);  
    };
    Game.prototype.createHealth = function() {
        var svgHealth = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        svgHealth.setAttribute('cx', -325);
        svgHealth.setAttribute('cy', 325);
        svgHealth.setAttribute('r', 70);
        svgHealth.setAttribute('stroke', '#444');
        svgHealth.setAttribute('stroke-width', '1px');
        svgHealth.setAttribute('fill', 'none');
        svgHealth.setAttribute('id', 'healthglobe');
        this.eSvg.appendChild(svgHealth);
        
        var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute("id", "health");
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("x", -395);
        pattern.setAttribute("y", 75);
        pattern.setAttribute("width", 160);
        pattern.setAttribute("height", 320);

        var image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute("width", 160);
        image.setAttribute("height", 320);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/globe-health.png');

        pattern.appendChild(image);
        this.eDefs.appendChild(pattern);

        svgHealth.setAttribute("fill", "url(#health)");
    };
    Game.prototype.createMana = function() {
        var svgHealth = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        svgHealth.setAttribute('cx', 325);
        svgHealth.setAttribute('cy', 325);
        svgHealth.setAttribute('r', 70);
        svgHealth.setAttribute('stroke', '#444');
        svgHealth.setAttribute('stroke-width', '2px');
        svgHealth.setAttribute('fill', 'none');
        svgHealth.setAttribute('id', 'managlobe');
        this.eSvg.appendChild(svgHealth);  
        
        var pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute("id", "mana");
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("x", -185);
        pattern.setAttribute("y", 75);
        pattern.setAttribute("width", 160);
        pattern.setAttribute("height", 320);

        var image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute("width", 160);
        image.setAttribute("height", 320);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/globe-mana.png');
//        image.setAttribute('transform', 'translate(' + parseFloat(this.angleDegrees - 90) + ' ' + this.size + ' ' + this.size + ')');

        pattern.appendChild(image);
        this.eDefs.appendChild(pattern);

        svgHealth.setAttribute("fill", "url(#mana)");
    };
    Game.prototype.showHealth = function() {
        var health = document.getElementById('health');
        health.setAttribute("y", 75 + ((1 - (oGame.player.health / oGame.player.maxHealth)) * 145));
    };
    Game.prototype.showMana = function() {
        
    };
    Game.prototype.resetRange = function() {
        var svgRange = document.getElementById('towerRange');
        svgRange.setAttribute('r', this.tower.range);
    };
    Game.prototype.runeBuy = function(id, hex) {
        hex.rune = new Rune(id);
        this.player.mana -= oSettings.runeCosts[id];
        playerController.showStat("mana");
        if (this.board.hexCheckConnected(hex)) {
            hex.rune.tier = 1;
            hex.towerConnected = true;
        }
        this.board.hexCheckDisconnected(hex);
        this.board.runeRemove(this.eDefs);
        this.board.hexConnect();
        this.board.runeCreate();
        this.board.runeDraw(this.eDefs);
        this.board.setValues();
        this.setValues();
        this.resetRange();
        towerController.showAllStats();
    };
    Game.prototype.runeSell = function(hex) {
        this.player.mana += oSettings.runeCosts[hex.rune.id] * hex.rune.tier;
        playerController.showStat("mana");
        delete hex.rune;
        hex.element.setAttribute("fill", "black");
        for (var i = 0; i < this.board.hexes.length; i++) {
            if (i !== this.board.tower) {
                this.board.hexes[i].towerConnected = false;
            }
            this.board.hexes[i].connections = [];
            this.board.hexes[i].directions = [];
        }
        for (var i = 0; i < this.board.hexes.length; i++) {
            if (this.board.hexes[i].rune && i !== this.board.tower) {
                if (this.board.hexCheckConnected(this.board.hexes[i])) {
                    this.board.hexes[i].towerConnected = true;
                }
                this.board.hexCheckDisconnected(this.board.hexes[i]);
            }
        }
        this.board.runeRemove(this.eDefs);
        this.board.hexConnect();
        this.board.runeCreate();
        this.board.runeDraw(this.eDefs);
        this.board.setValues();
        this.setValues();
        this.resetRange();
        towerController.showAllStats();
    };
    Game.prototype.runeUpgrade = function(hex) {
        hex.rune.tier += 1;
        this.player.mana -= oSettings.runeCosts[hex.rune.id];
        playerController.showStat("mana");
        this.board.runeRemove(this.eDefs);
        this.board.hexConnect();
        this.board.runeCreate();
        this.board.runeDraw(this.eDefs);
        this.board.setValues();
        this.setValues();
        this.resetRange();
        towerController.showAllStats();
    };
    Game.prototype.waveCreate = function() {
        this.board.enemies = [];
        this.tower.wave += 1;
        this.wave = new Wave(this.tower.wave);
        console.log(this.tower.wave + " | " + this.wave.parameter);
        towerController.showStat("wave");
        for (var i = 0; i < this.wave.number; i++) {
            var randomAngle = Math.random() * 2 * Math.PI;
            var sine = Math.sin(randomAngle);
            var cosine = Math.cos(randomAngle);
            var punt = new Punt(sine * (600), cosine * (600));
            var enemy = new Enemy(i, this.board.center, punt, this.wave);
            this.board.enemies.push(enemy);
        }
    };
    Game.prototype.waveStart = function() {
        var center = this.board.center;
        for (var i = 0; i < this.board.enemies.length; i ++) {
            this.eSvg.appendChild(this.board.enemies[i].element());
            this.eDefs.appendChild(this.board.enemies[i].pattern());
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
        enemy.freeze -= 1;
        if (enemy.freeze <= 0) {
            var slow = 1;
            if (this.tower.slowEffect === true && this.getDistance(enemy.center, to) <= this.tower.range) { slow = 0.5; }
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
            }
            if (this.getDistance(enemy.center, to) < 50) {
                this.player.health -= enemy.damage;
                playerController.showStat("health");
                oGame.showHealth();
                delete enemy["pattern"];
                var eEnemy = document.getElementById('enemy' + enemy.id);
                if (eEnemy) { this.eDefs.removeChild(eEnemy); }
                this.board.enemies.splice(this.board.enemies.indexOf(enemy), 1);
                enemy.element.remove();
                clearInterval(enemy.interval);
            }
        }
    };
    Game.prototype.enemyClosest = function(from, range) {
        var nClosest = 500;
        var idClosest = -1;
        for (var i = 0; i < this.board.enemies.length; i++) {
            var nEnemyDistance = this.getDistance(from, this.board.enemies[i].center);
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
            var nEnemyDistance = this.getDistance(from, this.board.enemies[i].center);
            if (nEnemyDistance < range && nEnemyDistance > nFurthest) {
                nFurthest = nEnemyDistance;
                idFurthest = i;
            }
        }
        return idFurthest;
    };
    Game.prototype.playerStartAttacking = function() {
        var me = this;
        var freezeCount = 0;
        var color = "red";
        var chainColor = "white";
        this.player.interval = setInterval(function() {
            var idClosest = me.enemyClosest(me.board.center, me.tower.range);
            if (idClosest >= 0) {
                var oClosestPunt = new Punt(me.board.enemies[idClosest].center.x, me.board.enemies[idClosest].center.y);
                me.board.enemies[idClosest].freeze = freezeCount;
                me.board.showAttack(me.board.center, oClosestPunt, color);
                me.playerAttack(me.board.enemies[idClosest]);
                if (me.tower.chainEffect === true) {
                    var idClosestChained = me.enemyFurthest(oClosestPunt, me.tower.range / 2);
                    if (idClosestChained >= 0) {
                        me.board.enemies[idClosestChained].freeze = freezeCount;
                        me.board.showAttack(oClosestPunt, me.board.enemies[idClosestChained].center, color);
                        me.playerAttack(me.board.enemies[idClosestChained]);
                    }
                }
            }
            if (me.tower.splitEffect === true) {
                var idFurthest = me.enemyFurthest(me.board.center, me.tower.range);
                if (idFurthest >= 0) {
                    var oFurthestPunt = new Punt(me.board.enemies[idFurthest].center.x, me.board.enemies[idFurthest].center.y);
                    me.board.enemies[idFurthest].freeze = freezeCount;
                    me.board.showAttack(me.board.center, oFurthestPunt, color);
                    me.playerAttack(me.board.enemies[idFurthest]);
                    if (me.tower.chainEffect === true) {
                        var idFurthestChained = me.enemyFurthest(oFurthestPunt, me.tower.range / 2);
                        if (idFurthestChained >= 0) {
                            me.board.enemies[idFurthestChained].freeze = freezeCount;
                            me.board.showAttack(oFurthestPunt, me.board.enemies[idFurthestChained].center, color);
                            me.playerAttack(me.board.enemies[idFurthestChained]);
                        }
                    }
                }
            }
            if (me.board.enemies.length === 0) {
                clearInterval(me.player.interval);
            }
        }, this.tower.ms);
    };
    Game.prototype.playerAttack = function(enemy) {
        if (this.tower.ll > 0 || this.tower.ml > 0) {
            if (this.tower.ll > 0) {
                this.player.health += this.tower.dam * (this.tower.ll / 100);
                if (this.player.health > this.player.maxHealth) {
                    this.player.health = this.player.maxHealth;
                }
                playerController.showStat("health");
            }
            if (this.tower.ml > 0) {
                this.player.mana += this.tower.dam * (this.tower.ml / 100);
                playerController.showStat("mana");
            }
        }
        enemy.health -= this.tower.dam;
        if (enemy.health <= 0) {
            this.player.mana += enemy.mana;
            if (oGame.board.selected !== -1 && this.player.mana >= 100) {
                hexController.createAllButtons(oGame.board.hexes[oGame.board.selected]);
            }
            this.player.experience += enemy.experience;
            if (this.player.experience >= this.player.maxExperience) {
                this.player.levelUp();
            };
            playerController.showStat("mana");
            playerController.showStat("experience");
            this.board.enemies.splice(this.board.enemies.indexOf(enemy), 1);
            delete enemy["pattern"];
            var eEnemy = document.getElementById('enemy' + enemy.id);
            if (eEnemy) { this.eDefs.removeChild(eEnemy); }
            enemy.element.remove();
            clearInterval(enemy.interval);
        }
    };
    Game.prototype.getDistance = function(from, to) {
        return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
    };

    function Board(canvas, center, radius, side) {
        this.canvas = canvas;
        this.center = center;
        this.radius = radius;
        this.side = side;
        this.height = Math.sqrt(3 * this.side * this.side);
        this.hexes = [];
        this.enemies = [];
        this.selected = -1;
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
                    this.tower = this.hexes.length;
                    hex.rune = new Rune(0);
                    hex.towerConnected = true;
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
                if (this.hexes[i].rune && this.hexes[j].rune) {
                    if (this.hexes[i].towerConnected === true && this.hexes[j].towerConnected === true) {
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
                    if(this.hexes[i].towerConnected === true) {
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
                    if (this.hexes[i].rune && this.hexes[i].towerConnected === false && hex.towerConnected === true) {
                        this.hexes[i].towerConnected = true;
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
                this.hexes[i].rune.range = 0;
                this.hexes[i].rune.cc = 0;
                this.hexes[i].rune.cd = 0;
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
                        this.hexes[i].rune.range = this.hexes[i].rune.stats[5] * this.hexes[i].rune.tier;
                        break;
                    case 4:
                        this.hexes[i].rune.cc = this.hexes[i].rune.stats[3] * this.hexes[i].rune.tier;
                        break;
                    case 5:
                        this.hexes[i].rune.cd = this.hexes[i].rune.stats[4] * this.hexes[i].rune.tier;
                        break;
                    case 6:
                        this.hexes[i].rune.ll = this.hexes[i].rune.stats[6] * this.hexes[i].rune.tier;
                        break;
                    case 7:
                        this.hexes[i].rune.ml = this.hexes[i].rune.stats[7] * this.hexes[i].rune.tier;
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
    Board.prototype.runeDraw = function(defs) {
        for (var i = 0; i < this.hexes.length; i++ ) {
            if (this.hexes[i].rune) {
                defs.appendChild(this.hexes[i].pattern());
            }
        }
    };
    Board.prototype.runeRemove = function(defs) {
        for (var i = 0; i < this.hexes.length; i++ ) {
            delete this.hexes[i]["pattern"];
            var eThisHex = document.getElementById('pattern' + this.hexes[i].id);
            if (eThisHex) { defs.removeChild(eThisHex); }
        }
    };
    Board.prototype.setValues = function() {
        this.dam = 0;
        this.as = 0;
        this.range = 0;
        this.cc = 0;
        this.cd = 0;
        this.ll = 0;
        this.ml = 0;
        this.chain = false;
        this.chainEffect = false;
        this.slow = false;
        this.slowEffect = false;
        this.split = false;
        this.splitEffect = false;
        for (var i = 0; i < this.hexes.length; i++) {
            if (this.hexes[i].rune && this.tower !== i) {
                var hex = this.hexes[i];
                var asc;
                var desc;
                switch (hex.connections.length) {
                    case 0: asc = 0; desc = 0; break;
                    case 1: asc = 0.3; desc = 1.8; break;
                    case 2: asc = 0.6; desc = 1.5; break;
                    case 3: asc = 0.9; desc = 1.2; break;
                    case 4: asc = 1.2; desc = 0.9; break;
                    case 5: asc = 1.5; desc = 0.6; break;
                    case 6: asc = 1.8; desc = 0.3; break;
                }
                this.dam += hex.rune.dam * asc;
                this.as += hex.rune.as * asc;
                this.range += hex.rune.range * desc;
                this.cc += hex.rune.cc * desc;
                this.cd += hex.rune.cd * desc;
                this.ll += hex.rune.ll * asc;
                this.ml += hex.rune.ml * asc;
                if (hex.rune.chain === true) {
                    this.chain = true;
                    if (hex.towerConnected === true) { this.chainEffect = true; }
                }
                if (hex.rune.slow === true) {
                    this.slow = true;
                    if (hex.towerConnected === true) { this.slowEffect = true; }
                }
                if (hex.rune.split === true) {
                    this.split = true;
                    if (hex.towerConnected === true) { this.splitEffect = true; }
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
        }, 50);
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
        this.towerConnected = false;
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
        if (this.towerConnected === false) { tier = 0; }

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

    function Enemy(id, to, center, wave) {
        this.id = id;
        this.damage = oSettings.enemydam;
        this.mana = oSettings.enemymana;
        this.experience = oSettings.enemyexperience;
        this.mod = Math.random() + 1;
        this.health = wave.health * this.mod;
        this.speed = wave.speed / this.mod;
        this.center = center;
        this.angleRadians = Math.atan2(to.y - this.center.y, to.x - this.center.x);
        this.angleDegrees = Math.atan2(to.y - this.center.y, to.x - this.center.x) * 180 / Math.PI;
        this.sine = Math.sin(this.angleRadians);
        this.cosine = Math.cos(this.angleRadians);
        this.direction = 0;//Math.round(Math.random());
        this.type = 0;//Math.floor(Math.random() * 4);
        this.size = 17 * this.mod;
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
        this.element.setAttribute('width', this.size * 2);
        this.element.setAttribute('height', this.size * 2);
        this.element.setAttribute('transform', 'translate(-' + this.size + ' -' + this.size + ')');
        this.element.setAttribute('id', 'enemy');

        return this.element;
    };
    Enemy.prototype.pattern = function() {
        this.pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        this.pattern.setAttribute("id", "enemy" + this.id);
        this.pattern.setAttribute("patternUnits", "userSpaceOnUse");
        this.pattern.setAttribute("x", this.center.x + this.mod * 15);
        this.pattern.setAttribute("y", this.center.y + this.mod * 15);
        this.pattern.setAttribute("width", this.size * 2);
        this.pattern.setAttribute("height", this.size * 2);

        this.image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        this.image.setAttribute("width", this.size * 2);
        this.image.setAttribute("height", this.size * 2);
        this.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/invader-' + this.type + '-' + this.direction + '-' + this.step % 6 + '.svg');
        this.image.setAttribute('transform', 'rotate(' + parseFloat(this.angleDegrees - 90) + ' ' + this.size + ' ' + this.size + ')');

        this.pattern.appendChild(this.image);

        this.element.setAttribute("fill", "url(#enemy" + this.id + ")");

        return this.pattern;
    };

    function Player() {
        this.level = 1;
        this.experience = 0;
        this.maxExperience = 100 + (this.level - 1) * 10;
        this.skillPoints = 0;
        this.health = oSettings.health;
        this.maxHealth = oSettings.health;
        this.mana = oSettings.mana;
        this.range = oSettings.range;
        this.dam = oSettings.dam;
        this.as = oSettings.as;
        this.cc = oSettings.cc;
        this.cd = oSettings.cd;
        this.skill = new Skill();
    };
    Player.prototype.levelUp = function() {
        this.level += 1;
        this.skillPoints += 1;
        this.health = this.maxHealth;
        this.experience = this.experience - this.maxExperience;
        this.maxExperience = 100 + (this.level - 1) * 10;
        oGame.showStat("health");
        playerController.showStat("health");
        playerController.showStat("experience");
        playerController.showStat("maxExperience");
        playerController.showStat("level");
        playerController.showStat("skillPoints");
    };

    function Wave(number) {
        this.id = number;
        this.parameter = 8 * (10 + this.id) + Math.pow(this.id / 3, 2);
        this.factor = Math.floor((Math.random() * 5) + 10);
        this.number = this.factor;
        this.health = this.parameter / this.factor;
        this.speed = 5;
    };
    function Skill() {
        this.dam = 1;
        this.as = 1;
        this.range = 0;
        this.cc = 0;
        this.cd = 0;
        this.ll = 0;
        this.ml = 0;
        this.chain = 0;
        this.slow = 0;
        this.split = 0;
    };
    function Tower() {
        this.wave = 0;
    };
    function Punt(x, y) {
        this.x = x;
        this.y = y;
    };
    function Rune(id){
        this.stats = oSettings.runeStats;
        this.id = id;
        this.name = oSettings.runeTypes[id];
        this.tier = 1;
        this.dam = 0;
        this.as = 0;
        this.cc = 0;
        this.cd = 0;
        this.range = 0;
        this.ml = 0;
        this.ll = 0;
    };

    return {
        init: init
    };
})();