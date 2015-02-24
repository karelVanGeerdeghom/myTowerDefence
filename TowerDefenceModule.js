'use strict'; 
var gameModule = (function() {
    var oGame;
    var oViews = {
        tower: {
            elements: {
                "wave": "Wave: ",
                "dps": "Tower DPS: ",
                "accuracy": "Tower Accuracy: ",
                "dam": "Tower Damage: ",
                "as": "Tower Attack Speed: ",
                "range": "Tower Range: ",
                "cc": "Tower Critical Chance: ",
                "cd": "Tower  Critical Damage: ",
                "chainEffect": "Chaining: ",
                "splitEffect": "Splitting: "
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
                "cd": "Player  Critical Damage: ",
                "kills": "Enemies Killed: ",
                "misses": "Enemies Missed: ",
                "total": "Total Enemies: ",
                "accuracy": "Accuracy: "
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
                "chain": {
                    "name": "Chaining Rune",
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
                "exit": {
                    "name": "Exit",
                    "noRune": true,
                    "hasRune": true
                },
                "dam": {
                    "name": "Damage",
                    "upgrade": true,
                    "noRune": true
                },
                "as": {
                    "name": "Attack Speed",
                    "upgrade": true,
                    "noRune": true
                },
                "range": {
                    "name": "Range",
                    "upgrade": true,
                    "noRune": true
                },
                "cc": {
                    "name": "Critical Chance",
                    "upgrade": true,
                    "noRune": true
                },
                "cd": {
                    "name": "Critical Damage",
                    "upgrade": true,
                    "noRune": true
                },
                "chain": {
                    "name": "Chaining",
                    "upgrade": false,
                    "noRune": true
                },
                "split": {
                    "name": "Splitting",
                    "upgrade": false,
                    "noRune": true
                },
                "sell": {
                    "name": "Sell",
                    "hasRune": true
                },
                "upgrade": {
                    "name": "Upgrade",
                    "hasRune": true
                }
            }
        }
    };
    var oSettings =  {
        "size": 900,
        "radius": 4,
        "side": 25,
        "health": 100,
        "mana": 200,
        "range": 200,
        "dam": 10,
        "as": 5,
        "cc": 5,
        "cd": 50,
        "skillDam": 1,
        "skillAs": 0,
        "skillRange": 0,
        "skillCc": 0,
        "skillCd": 0,
        "skillChain": 0,
        "skillSplit": 0,
        "runeTypes": ["tower", "dam", "as", "range", "cc", "cd", "chain", "split"],
        "runeCosts": [0, 100, 100, 100, 150, 150, 900, 1500],
        "runeStats": [0, 5, 5, 8, 4, 40],
        "enemyDam": 5,
        "enemyMana": 5,
        "enemyExperience": 4,
        "enemySpeed": 2.5
    };
    var towerController = new Controller('tower');
    var playerController = new Controller('player');
    var skillController = new Controller('skill');
    var hexController = new Controller('hex');

    var init = function(container, options) {
        var eContainer = document.getElementById(container);
        if (eContainer) {
            initSettings(oSettings, options);
            createElements(eContainer);
            createGame();
        }
        else {
            console.log("Container not found!");
        }
    };
    var initSettings = function(oSettings, options) {
        for (var key in options || {}) {
            if (typeof options[key] === 'object') {
                initSettings(oSettings[key], options[key]);
            }
            else {
                oSettings[key] = options[key];
            }
        }
    }
    var createElements = function(container) {
        var eCanvas = document.createElement('div');
        eCanvas.setAttribute('id', 'canvas');
        eCanvas.setAttribute('class', 'canvas');
        var eControl = document.createElement('div');
        eControl.setAttribute('id','control-stats');
        eControl.setAttribute('class','stats');
        var eTower = document.createElement('div');
        eTower.setAttribute('id','tower-stats');
        eTower.setAttribute('class','stats');
        var ePlayer = document.createElement('div');
        ePlayer.setAttribute('id','player-stats');
        ePlayer.setAttribute('class','stats');
        var eSkill = document.createElement('div');
        eSkill.setAttribute('id','skill-stats');
        eSkill.setAttribute('class','stats');
        container.appendChild(eCanvas);
        container.appendChild(eTower);
        container.appendChild(eControl);
        container.appendChild(ePlayer);
        container.appendChild(eSkill);
    };
    var createGame = function() {
        var eCanvas = document.getElementById('canvas');
        var ePlayer = document.getElementById('playerStats');
        oGame = new Game(eCanvas, ePlayer);
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
        oGame.createGaussianFilter();
        oGame.createRuneFilters();
        oGame.startRuneFilters();
        oGame.createAttackPattern();
        oGame.createExperience();
        oGame.createGlobe("health");
        oGame.createGlobe("mana");
        oGame.createRange();

        var hexes = document.getElementsByTagName("polygon");
        for (var i = 0; i < hexes.length; i++) {
            hexes[i].addEventListener("click", function() {
                oGame.board.selected = this.id;
                if (!oGame.player.attacking) {
                    if (parseInt(this.id) !== oGame.board.tower) {
                        hexController.clearRadial();
                        hexController.createRadial(oGame.board.hexes[this.id]);
                    }
                    else {
                        hexController.clearRadial();
                    }
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
            hexController.clearRadial();
            if (!oGame.player.attacking) {
                oGame.waveCreate();
                oGame.waveStart();
                oGame.playerStartAttacking();
                oGame.stopRuneFilters();
            }
        });
        
        document.onkeydown = function(event) {
            event = event || window.event;
            if (event.keyCode === 27) {
                hexController.clearRadial();
            }
        };
    };
    var buyRune = function() {
        var nId = parseInt(this.id.match(/\d+/)[0]);
        var nHexId = this.getAttribute("hex");

        oGame.runeBuy(nId, oGame.board.hexes[nHexId]);
        hexController.clearRadial();
        hexController.createRadial(oGame.board.hexes[nHexId]);
    };
    var sellRune = function() {
        var nHexId = this.getAttribute("hex");
        
        oGame.runeSell(oGame.board.hexes[nHexId]);
        hexController.clearRadial();
    };
    var upgradeRune = function() {
        var nHexId = this.getAttribute("hex");
        
        oGame.runeUpgrade(oGame.board.hexes[nHexId]);
        hexController.clearRadial();
        hexController.createRadial(oGame.board.hexes[nHexId]);
    };
    var spendPoint = function(stat) {
        if (oGame.player.skillPoints > 0) {
            oGame.player.skill[stat] += 1;
            oGame.player.skillPoints -= 1;
            playerController.showStat("skillPoints");
            skillController.showSkill(stat);
            if (oGame.board.selected !== -1 && oGame.player.mana >= 100 && oGame.radial === "open" && !oGame.player.attacking) {
                hexController.clearRadial();
                hexController.createRadial(oGame.board.hexes[oGame.board.selected]);
            }
        }
    };
    var collectBonus = function() {
        var eBonus = document.getElementById(this.id);
        oGame.player.attackBonus += 1;
        if (eBonus) {
            eBonus.removeEventListener("click", collectBonus);
            oGame.eSvg.removeChild(eBonus);
        }
    };
    
    function getDistance(from, to) {
        return Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
    };
    function getHeight(radius, amount) {
        var eps = 1e-7;
        var result = 0;
        var low = 0;
        var high = 2 * radius;
        var full = 4 * Math.pow(radius, 3) * Math.PI / 3;
        var volume = (full / 100) * amount;

        if (amount !== 0 && amount !== 50 && amount !== 100) {
            while (high - low > eps) {
                var mid = (low + high) / 2;
                var vol = Math.PI * Math.pow(mid, 2) * radius - Math.PI * Math.pow(mid, 3) / 3;

                if (vol < volume - eps) { low = mid; }
                if (vol > volume + eps) { high = mid; }
            }

            var vol = Math.PI * low * low * radius - Math.PI * low * low * low / 3;
            if (Math.abs(vol - volume) < 1e-2) { result = low; }

            return result;
        }
        if (amount === 100) {  return radius * 2; }
        if (amount === 50) { return radius; }
        if (amount === 0) { return 0; }
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
        var eParent = document.getElementById(this.name + '-stats');
        eStat.setAttribute('id', this.name + '-' + stat);
        eStat.appendChild(sStat);
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
    Controller.prototype.createRadial = function(hex) {
        var i = 0;
        var sSetting = "hasRune";
        var me = this;
        oGame.radial = "open";

        for (var rune in this.view['buttons']) {
            if (!hex.rune) { sSetting = "noRune"; }
            if (this.view['buttons'][rune][sSetting] === true) {
                var nDistance = 68;
                var nSize = 70;
                var nRadius = 25;
                var nSine = Math.sin((i * (2 / 8) * Math.PI) + ((3 / 2) * Math.PI));
                var nCosine = Math.cos((i * (2 / 8) * Math.PI) + ((3 / 2) * Math.PI));
                var nX = hex.center.x + (nCosine * nDistance);
                var nY = hex.center.y + (nSine * nDistance);

                var svgButton = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                svgButton.setAttribute('cx', nX);
                svgButton.setAttribute('cy', nY);
                svgButton.setAttribute('r', nRadius);
                svgButton.setAttribute('stroke', '#444');
                svgButton.setAttribute('stroke-width', '1px');
                svgButton.setAttribute('fill', 'url(#button-pattern-' + i + ')');
                svgButton.setAttribute('class', 'button');
                svgButton.setAttribute('id', 'button-' + i);
                svgButton.setAttribute('hex', hex.id);

                var svgPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
                svgPattern.setAttribute("id", "button-pattern-" + i);
                svgPattern.setAttribute("patternUnits", "userSpaceOnUse");
                svgPattern.setAttribute("x", nX - (nSize / 2));
                svgPattern.setAttribute("y", nY - (nSize / 2));
                svgPattern.setAttribute("width", nSize);
                svgPattern.setAttribute("height", nSize);

                var svgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                svgRect.setAttribute("width", nSize);
                svgRect.setAttribute("height", nSize);
                svgRect.setAttribute('fill', 'black');

                var iRune = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                iRune.setAttribute("width", nSize);
                iRune.setAttribute("height", nSize);

                var nTier = 0;
                if (oGame.player.skill[rune] > 0) {  nTier = 1; }
                iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + rune + nTier + '.png');
                var sAppend = "yes";
                var sEvent = "yes";
                switch (rune) {
                    case "exit":
                        svgButton.addEventListener("click", me.clearRadial);
                    break;
                    case "sell":
                        svgButton.addEventListener("click", sellRune);
                    break;
                    case "upgrade":
                        if(this.view['buttons'][hex.rune.name].upgrade === true) {
                            if (hex.rune.tier > 3) {
                                sAppend = "no";
                            }
                            else {
                                iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + hex.rune.name + '0.png');
                                if (oGame.player.skill[hex.rune.name] > hex.rune.tier && oGame.player.mana >= oSettings.runeCosts[oSettings.runeTypes.indexOf(hex.rune.name)]) {
                                    iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + hex.rune.name + (hex.rune.tier + 1) + '.png');
                                    svgButton.addEventListener("click", upgradeRune);
                                }
                            }
                        }
                        else {
                            sAppend = "no";
                        }
                    break;
                    default:
                        if (oGame.player.skill[rune] > 0 && oGame.player.mana >= oSettings.runeCosts[oSettings.runeTypes.indexOf(rune)]) {
                            if (rune === "chain" && oGame.board.chain === true) {
                                iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + rune + '0.png');
                                sEvent = "no";
                            }
                            if (rune === "split" && oGame.board.split === true) {
                                iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + rune + '0.png');
                                sEvent = "no";
                            }
                            if (sEvent === "yes") {
                                svgButton.addEventListener("click", buyRune);
                            }
                        }
                        else {
                            iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + rune + '0.png');
                        }
                }
                if (sAppend === "yes") {
                    oGame.eSvg.appendChild(svgButton); 
                    oGame.eDefs.appendChild(svgPattern);
                    svgPattern.appendChild(svgRect);
                    svgPattern.appendChild(iRune);
                }                
                i += 1;
            }
        }
    };
    Controller.prototype.clearRadial = function() {
        oGame.radial = "closed";
        var me = this;
        for (var i = 0; i < 11; i++) {
            var ePattern = document.getElementById('button-pattern-' + i);
            if (ePattern) {
                oGame.eDefs.removeChild(ePattern);
            }
            var eButton = document.getElementById('button-' + i);

            if (eButton) {
                eButton.removeEventListener("click", buyRune);
                eButton.removeEventListener("click", sellRune);
                eButton.removeEventListener("click", upgradeRune);
                eButton.removeEventListener("click", me.clearRadial);
                oGame.eSvg.removeChild(eButton);
            }
        }
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
 
    function Game(eCanvas, ePlayer) {
        this.eCanvas = eCanvas;
        this.ePlayer = ePlayer;
        this.player = new Player;
    };
    Game.prototype.setValues = function() {
        var dam = this.player.dam * ((100 + this.board.dam) / 100);
        var cc = this.player.cc + this.board.cc;
        var cd = this.player.cd + this.board.cd;
        var totalDamage = dam * (((cc / 100) * ((100 + cd) / 100)) + ((100 - cc) / 100));
        this.tower.dam = Math.round(totalDamage * 100) / 100;
        this.tower.as =  Math.round(this.player.as * ((100 + this.board.as) / 100) * 100) / 100;
        this.tower.ms = Math.round(1000 / this.tower.as);
        this.tower.range = this.player.range * ((100 + this.board.range) / 100);
        this.tower.cc = Math.round((this.player.cc + this.board.cc) * 100) / 100;
        this.tower.cd = Math.round((this.player.cd + this.board.cd) * 100) / 100;
        this.tower.dps = Math.round(this.tower.dam * (Math.round(this.player.as * ((100 + this.board.as) / 100) * 100) / 100) * 100) / 100;
        this.tower.chain = this.board.chain;
        this.tower.chainEffect = this.board.chainEffect;
        this.tower.split = this.board.split;
        this.tower.splitEffect = this.board.splitEffect;
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
    Game.prototype.createGlobe = function(stat) {
        switch (stat) {
            case "health": var nX = -1; break;
            case "mana": var nX = 1; break;
        }
        var nRadius = 70;
        var svgGlobe = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        svgGlobe.setAttribute('cx', 365 * nX);
        svgGlobe.setAttribute('cy', 370);
        svgGlobe.setAttribute('r', nRadius);
        svgGlobe.setAttribute('stroke', '#444');
        svgGlobe.setAttribute('stroke-width', '1px');
        svgGlobe.setAttribute('fill', 'none');
        this.eSvg.appendChild(svgGlobe);
        
        var svgPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        svgPattern.setAttribute("id", "pattern-globe-" + stat);
        svgPattern.setAttribute("patternUnits", "userSpaceOnUse");
        svgPattern.setAttribute("x", 265 * nX);
        svgPattern.setAttribute("y", 270);
        svgPattern.setAttribute("width", 200);
        svgPattern.setAttribute("height", 200);

        var svgFull = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgFull.setAttribute("width", 200);
        svgFull.setAttribute("height", 200);
        svgFull.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/globe-' + stat + '.png');
        
        var svgEmpty = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgEmpty.setAttribute("x", 0);
        svgEmpty.setAttribute("y", -161);
        svgEmpty.setAttribute("width", 200);
        svgEmpty.setAttribute("height", 200);
        svgEmpty.setAttribute('id', 'globe-' + stat);
        svgEmpty.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/globe-empty.png');
        

        svgPattern.appendChild(svgFull);
        svgPattern.appendChild(svgEmpty);
        this.eDefs.appendChild(svgPattern);

        svgGlobe.setAttribute("fill", "url(#pattern-globe-" + stat + ")");
    };
    Game.prototype.createExperience = function() {
        var svgExperience = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        svgExperience.setAttribute("x", -285);
        svgExperience.setAttribute("y", 375);
        svgExperience.setAttribute("width", 570);
        svgExperience.setAttribute("height", 10);
        svgExperience.setAttribute('stroke', '#444');
        svgExperience.setAttribute('stroke-width', '1px');
        svgExperience.setAttribute("fill", 'url(#pattern-experience)');

        var svgPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        svgPattern.setAttribute("id", 'pattern-experience');
        svgPattern.setAttribute("patternUnits", "userSpaceOnUse");
        svgPattern.setAttribute("x", -310);
        svgPattern.setAttribute("y", 0);
        svgPattern.setAttribute("width", 600);
        svgPattern.setAttribute("height", 10);

        var svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgImage.setAttribute("width", 600);
        svgImage.setAttribute("height", 10);
        svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/experience-full.png');
        
        var svgEmpty = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgEmpty.setAttribute("x", 15);
        svgEmpty.setAttribute("y", 0);
        svgEmpty.setAttribute("width", 600);
        svgEmpty.setAttribute("height", 10);
        svgEmpty.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/experience-empty.png');
        svgEmpty.setAttribute("id", "experience-empty");
        
        svgPattern.appendChild(svgImage);
        svgPattern.appendChild(svgEmpty);
        this.eSvg.appendChild(svgExperience);
        this.eDefs.appendChild(svgPattern);
        
    };
    Game.prototype.createRange = function() {
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
    Game.prototype.createRuneFilters = function() {
        for (var i = 0; i < 5; i++) {
            var svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
            svgFilter.setAttribute("id", "filter-" + i);
            svgFilter.setAttribute("x", "0");
            svgFilter.setAttribute("y", "0");

            var feComponentTransfer = document.createElementNS("http://www.w3.org/2000/svg", "feComponentTransfer");

            var feFuncR = document.createElementNS("http://www.w3.org/2000/svg", "feFuncR");
            feFuncR.setAttribute("id", "filter-feFuncR" + i);
            feFuncR.setAttribute("type", "linear");
            feFuncR.setAttribute("slope", "1");

            var feFuncG = document.createElementNS("http://www.w3.org/2000/svg", "feFuncG");
            feFuncG.setAttribute("id", "filter-feFuncG" + i);
            feFuncG.setAttribute("type", "linear");
            feFuncG.setAttribute("slope", "1");

            var feFuncB  = document.createElementNS("http://www.w3.org/2000/svg", "feFuncB");
            feFuncB.setAttribute("id", "filter-feFuncB" + i);
            feFuncB .setAttribute("type", "linear");
            feFuncB .setAttribute("slope", "1");

            feComponentTransfer.appendChild(feFuncR);
            feComponentTransfer.appendChild(feFuncG);
            feComponentTransfer.appendChild(feFuncB);

            svgFilter.appendChild(feComponentTransfer);

            this.eDefs.appendChild(svgFilter);
        }
    };
    Game.prototype.createGaussianFilter = function() {
        var svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        svgFilter.setAttribute('id', 'Gaussian');

        var svgGaussian = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        svgGaussian.setAttribute("stdDeviation", "1");
        svgFilter.appendChild(svgGaussian);
        this.eDefs.appendChild(svgFilter);
    };
    Game.prototype.startRuneFilters = function() {
        var feFuncR0 = document.getElementById("filter-feFuncR0");
        var feFuncG0 = document.getElementById("filter-feFuncG0");
        var feFuncB0 = document.getElementById("filter-feFuncB0");
        var feFuncR1 = document.getElementById("filter-feFuncR1");
        var feFuncG1 = document.getElementById("filter-feFuncG1");
        var feFuncB1 = document.getElementById("filter-feFuncB1");
        var feFuncR2 = document.getElementById("filter-feFuncR2");
        var feFuncG2 = document.getElementById("filter-feFuncG2");
        var feFuncB2 = document.getElementById("filter-feFuncB2");
        var feFuncR3 = document.getElementById("filter-feFuncR3");
        var feFuncG3 = document.getElementById("filter-feFuncG3");
        var feFuncB3 = document.getElementById("filter-feFuncB3");
        var feFuncR4 = document.getElementById("filter-feFuncR4");
        var feFuncG4 = document.getElementById("filter-feFuncG4");
        var feFuncB4 = document.getElementById("filter-feFuncB4");
        
        var nI0 = 1;
        var nI1 = 1;
        var nI2 = 1;
        var nI3 = 1;
        var nI4 = 1;
        var nSign0 = -1;
        var nSign1 = -1;
        var nSign2 = -1;
        var nSign3 = -1;
        var nSign4 = -1;
        this.interval = setInterval(function() {
            if (nI0 >= 1.5) { nSign0 = -1; }
            if (nI0 <= 0.5) { nSign0 = 1; }
            if (nI1 >= 1.5) { nSign1 = -1; }
            if (nI1 <= 0.5) { nSign1 = 1; }
            if (nI2 >= 1.5) { nSign2 = -1; }
            if (nI2 <= 0.5) { nSign2 = 1; }
            if (nI3 >= 1.5) { nSign3 = -1; }
            if (nI3 <= 0.5) { nSign3 = 1; }
            if (nI4 >= 1.5) { nSign4 = -1; }
            if (nI4 <= 0.5) { nSign4 = 1; }

            nI0 += nSign0  * (0.08);
            nI0 = Math.round(nI0 * 100) / 100;
            feFuncR0.setAttribute("slope", parseFloat(nI0));
            feFuncG0.setAttribute("slope", parseFloat(nI0));
            feFuncB0.setAttribute("slope", parseFloat(nI0));
            
            nI1 += nSign1  * (0.10);
            nI1 = Math.round(nI1 * 100) / 100;
            feFuncR1.setAttribute("slope", parseFloat(nI1));
            feFuncG1.setAttribute("slope", parseFloat(nI1));
            feFuncB1.setAttribute("slope", parseFloat(nI1));
            
            nI2 += nSign2  * (0.12);
            nI2 = Math.round(nI2 * 100) / 100;
            feFuncR2.setAttribute("slope", parseFloat(nI2));
            feFuncG2.setAttribute("slope", parseFloat(nI2));
            feFuncB2.setAttribute("slope", parseFloat(nI2));
            
            nI3 += nSign3  * (0.14);
            nI3 = Math.round(nI3 * 100) / 100;
            feFuncR3.setAttribute("slope", parseFloat(nI3));
            feFuncG3.setAttribute("slope", parseFloat(nI3));
            feFuncB3.setAttribute("slope", parseFloat(nI3));
            
            nI4 += nSign4  * (0.16);
            nI4 = Math.round(nI4 * 100) / 100;
            feFuncR4.setAttribute("slope", parseFloat(nI4));
            feFuncG4.setAttribute("slope", parseFloat(nI4));
            feFuncB4.setAttribute("slope", parseFloat(nI4));
        }, 100); 
    };
    Game.prototype.stopRuneFilters = function() {
        clearInterval(this.interval);
    };
    Game.prototype.showRange = function() {
        var svgRange = document.getElementById('towerRange');
        svgRange.setAttribute('r', this.tower.range);
    };
    Game.prototype.showGlobe = function(stat) {
        var nRadius = 70;
        
        switch(stat) {
            case "health": var nAmount = this.player[stat]; break;
            case "mana":
                if (this.player[stat] > 200) {
                    var nAmount = 100;
                }
                else {
                    var nAmount = this.player[stat] / 2;
                }
            break;
        }
        var svgEmpty = document.getElementById('globe-' + stat);
        var nOffset = getHeight(nRadius, nAmount);
        svgEmpty.setAttribute("y", -(21 + nOffset));
    };
    Game.prototype.showExperience = function() {
        var svgExperience = document.getElementById('experience-empty');
        var nFraction = this.player.experience / this.player.maxExperience * 550;
        svgExperience.setAttribute('x', 15 + nFraction);
    };
    Game.prototype.showText = function(text, id) {
        var nWidth = 60;
        var nHeight = 20;
        var nOffset = 50;
        switch (text) {
            case "levelup":
                var nMs = 1200;
                var nScalar = 0.24;
            break;
            case "damage":
                var nMs = 900;
                var nScalar = 0.12;
            break;
            case "mana":
                var nMs = 600;
                var nScalar = 0.08;
            break;
        }
        
        var svgLevel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        svgLevel.setAttribute("x", -nWidth / 2);
        svgLevel.setAttribute("y", -nOffset);
        svgLevel.setAttribute("width", nWidth);
        svgLevel.setAttribute("height", nHeight);
        svgLevel.setAttribute("fill", 'url(#pattern-' + text + '-' + id + ')');
        
        var svgPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        svgPattern.setAttribute("id", 'pattern-' + text + '-' + id);
        svgPattern.setAttribute("patternUnits", "userSpaceOnUse");
        svgPattern.setAttribute("x", -nWidth / 2);
        svgPattern.setAttribute("y", -nHeight / 2);
        svgPattern.setAttribute("width", nWidth);
        svgPattern.setAttribute("height", nHeight);
        
        var svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        svgImage.setAttribute("width", nWidth);
        svgImage.setAttribute("height", nHeight);
        svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/text-' + text + '.png');
  
        svgPattern.appendChild(svgImage);
        this.eSvg.appendChild(svgLevel);
        this.eDefs.appendChild(svgPattern);
        
        var nY = 1;
        var fInterval = setInterval(function() {
            nY += nScalar;
            svgLevel.setAttribute("transform", "scale( " + nY + " )");
        }, 20);
        
        var me = this;
        setTimeout(function() {
            clearInterval(fInterval);
            me.eSvg.removeChild(svgLevel);
            me.eDefs.removeChild(svgPattern);
        }, nMs);
    };
    Game.prototype.runeBuy = function(id, hex) {
        hex.rune = new Rune(id);
        this.player.mana -= oSettings.runeCosts[id];
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
        this.showRange();
        this.showGlobe("mana");
        towerController.showAllStats();
        playerController.showStat("mana");
    };
    Game.prototype.runeSell = function(hex) {
        this.player.mana += oSettings.runeCosts[hex.rune.id] * hex.rune.tier;
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
        this.showRange();
        this.showGlobe("mana");
        playerController.showStat("mana");
        towerController.showAllStats();
    };
    Game.prototype.runeUpgrade = function(hex) {
        hex.rune.tier += 1;
        this.player.mana -= oSettings.runeCosts[hex.rune.id];
        this.board.runeRemove(this.eDefs);
        this.board.hexConnect();
        this.board.runeCreate();
        this.board.runeDraw(this.eDefs);
        this.board.setValues();
        this.setValues();
        this.showRange();
        this.showGlobe("mana");
        playerController.showStat("mana");
        towerController.showAllStats();
    };
    Game.prototype.waveCreate = function() {
        this.board.enemies = [];
        this.tower.wave += 1;
        this.wave = new Wave(this.tower.wave);
        if (this.tower.wave > 10) {
            this.tower.accuracy = this.player.accuracy;
            this.board.setValues();
            this.setValues();
        }
        for (var i = 0; i < this.wave.number; i++) {
            var randomAngle = Math.random() * 2 * Math.PI;
            var sine = Math.sin(randomAngle);
            var cosine = Math.cos(randomAngle);
            var punt = new Punt(sine * (650), cosine * (650));
            var enemy = new Enemy(i, this.board.center, punt, this.wave);
            this.board.enemies.push(enemy);
        }
        towerController.showStat("wave");
        towerController.showStat("accuracy");
        towerController.showStat("dam");
        towerController.showStat("dps");
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
        var x = enemy.center.x + enemy.cosine * enemy.speed;
        var y = enemy.center.y + enemy.sine * enemy.speed;
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
        if (getDistance(enemy.center, to) < 50 && enemy.alive) {
            this.player.health -= enemy.damage;
            playerController.showStat("health");
            if (this.tower.wave > 10) {
                this.player.misses += 1;
                playerController.showStat("misses");
            }

            delete enemy["pattern"];
            var eEnemy = document.getElementById('enemy' + enemy.id);
            if (eEnemy) { this.eDefs.removeChild(eEnemy); }
            this.board.enemies.splice(this.board.enemies.indexOf(enemy), 1);
            enemy.element.remove();
            this.showText("damage", this.player.health);
            this.showGlobe("health");
            clearInterval(enemy.interval);
        }

    };
    Game.prototype.enemyClosest = function(id, from, range) {
        var nClosest = 1000;
        var idClosest = -1;
        for (var i = 0; i < this.board.enemies.length; i++) {
            if (i !== id) {
                var nEnemyDistance = getDistance(from, this.board.enemies[i].center);
                if (nEnemyDistance < range && nEnemyDistance < nClosest) {
                    nClosest = nEnemyDistance;
                    idClosest = i;
                }
            }

        }
        return idClosest;
    };
    Game.prototype.enemyFurthest = function(id, from, range) {
        var nFurthest = 0;
        var idFurthest = -1;
        for (var i = 0; i < this.board.enemies.length; i++) {
            if (i !== id) {
                var nEnemyDistance = getDistance(from, this.board.enemies[i].center);
                if (nEnemyDistance < range && nEnemyDistance > nFurthest) {
                    nFurthest = nEnemyDistance;
                    idFurthest = i;
                }
            }
        }
        return idFurthest;
    };
    Game.prototype.enemyDeath = function(enemy) {
        enemy.alive = false;
        this.board.enemies.splice(this.board.enemies.indexOf(enemy), 1);
        var me = this;
        setTimeout(function() {
            me.enemyDrop(enemy);
            delete enemy["pattern"];
            var eEnemy = document.getElementById('enemy' + enemy.id);
            if (eEnemy) { me.eDefs.removeChild(eEnemy); }
            clearInterval(enemy.interval);
            enemy.element.remove();
        }, 225);
    };
    Game.prototype.enemyDrop = function(enemy) {
        var nChance = Math.random();
        if (nChance >= 0.5) {
            var svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            svgImage.setAttribute('x', enemy.center.x - 40);
            svgImage.setAttribute('y', enemy.center.y - 40);
            svgImage.setAttribute('width', 80);
            svgImage.setAttribute('height', 80);
            svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/ball-arcane.png');
            svgImage.setAttribute('id', 'bonus-' + enemy.id);
            svgImage.setAttribute('class', "bonus");
            this.eSvg.appendChild(svgImage);
            
            svgImage.addEventListener("click", collectBonus);
            
            var me = this;
            setTimeout(function() {
                svgImage.removeEventListener("click", collectBonus);
                if (svgImage.parentNode === me.eSvg) {
                    me.eSvg.removeChild(svgImage);
                }
            }, 1500);
        }
    };
    Game.prototype.playerStartAttacking = function() {
        this.player.attacking = true;
        var me = this;
        this.player.interval = setInterval(function() {
            var idClosest = me.enemyClosest(-1, me.board.center, me.tower.range);
            if (idClosest >= 0) {
                var oClosestPunt = new Punt(me.board.enemies[idClosest].center.x, me.board.enemies[idClosest].center.y);
                me.showAttack(me.board.center, me.board.enemies[idClosest], Date.now());
                me.playerAttack(me.board.enemies[idClosest]);
                if (me.tower.chainEffect === true) {
                    setTimeout(function() {
                        var idClosestChained = me.enemyFurthest(idClosest, oClosestPunt, me.tower.range / 2);
                        if (idClosestChained >= 0) {
                            me.showAttack(oClosestPunt, me.board.enemies[idClosestChained].center, "poison");
                            me.playerAttack(me.board.enemies[idClosestChained]);
                        }
                    }, 125);
                }
            }
            if (me.tower.splitEffect === true) {
                var idFurthest = me.enemyFurthest(-1, me.board.center, me.tower.range);
                if (idFurthest >= 0) {
                    var oFurthestPunt = new Punt(me.board.enemies[idFurthest].center.x, me.board.enemies[idFurthest].center.y);
                    me.showAttack(me.board.center, me.board.enemies[idFurthest]);
                    me.playerAttack(me.board.enemies[idFurthest]);
                    if (me.tower.chainEffect === true) {
                        setTimeout(function() {
                            var idFurthestChained = me.enemyClosest(idFurthest, oFurthestPunt, me.tower.range / 2);
                            if (idFurthestChained >= 0) {
                                me.showAttack(oFurthestPunt, me.board.enemies[idFurthestChained].center, "arcane");
                                me.playerAttack(me.board.enemies[idFurthestChained]);
                            } 
                        }, 125);
                    }
                }
            }
            if (me.board.enemies.length === 0) {
                me.player.attacking = false;
                clearInterval(me.player.interval);
                me.startRuneFilters();
            }
        }, this.tower.ms);
    };
    Game.prototype.playerAttack = function(enemy) {
        enemy.health -= this.tower.dam * this.tower.accuracy;
        if (enemy.health <= 0) {
            this.enemyDeath(enemy);
            if (this.tower.wave > 10) {
                this.player.kills += 1;
                this.player.accuracy = this.player.kills / this.player.total;
            }
            this.player.mana += enemy.mana;
            this.player.experience += enemy.experience;
            if (this.player.experience >= this.player.maxExperience) {
                this.player.levelUp();
            };
            oGame.showExperience();
            oGame.showGlobe("mana");
            playerController.showStat("kills");
            playerController.showStat("accuracy");
            playerController.showStat("mana");
            playerController.showStat("experience");

        }
    };
    Game.prototype.showAttack = function(from, enemy, when) {
        var nRadius = 35;
        var nLength1 = 100;
        var nLength2 = 90;
        var nLength3 = 80;
        var nLength4 = 70;
        var nLength5 = 150;
        var nOffset1 = 6;
        var nOffset2 = 12;
        var nOffset3 = 18;
        var angleDegrees = enemy.angleAttack;
        var nDistance = getDistance(from, enemy.center) - 10;
        var nId = when;
        
        if (this.player.attackBonus >= 0) {
            var svgCenterPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sCenterPath = 'M' + parseFloat(from.x + nRadius) + ',' + from.y + ' L' + nDistance + ',' + 0 + '';
            svgCenterPath.setAttribute('d', sCenterPath);
            svgCenterPath.setAttribute('id', "svgCenterPath" + nId);
            svgCenterPath.setAttribute('class', 'attackPath');
            svgCenterPath.setAttribute('stroke', '#44FFFF');
            svgCenterPath.setAttribute('stroke-dasharray', nLength1 + ' 1000');
            svgCenterPath.setAttribute('stroke-dashoffset', nLength1);
            svgCenterPath.setAttribute('stroke-width', '4px');
            svgCenterPath.setAttribute('fill', 'none');
            svgCenterPath.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgCenterPath.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgCenterPath);
            Velocity(svgCenterPath, { "stroke-dashoffset": -nDistance }, { duration: 200 });
        }
        if (this.player.attackBonus >= 1) {
            var svgRightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sRightPath = 'M' + parseFloat(from.x + nRadius + 5) + ',' + parseFloat(from.y + nOffset1);
            sRightPath += ' Q' + parseFloat((from.y + nDistance) / 7) + ',' + nDistance / 48;
            sRightPath += ' ' + nDistance + ',' + parseFloat(from.y + nOffset1 / 4);
            svgRightPath.setAttribute('d', sRightPath);
            svgRightPath.setAttribute('id', "svgRightPath" + nId);
            svgRightPath.setAttribute('class', 'attackPath');
            svgRightPath.setAttribute('stroke', '#FF4444');
            svgRightPath.setAttribute('stroke-width', '4px');
            svgRightPath.setAttribute('stroke-dasharray', nLength2 + ' 1000');
            svgRightPath.setAttribute('stroke-dashoffset', nLength2);
            svgRightPath.setAttribute('fill', 'none');
            svgRightPath.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgRightPath.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgRightPath);
            Velocity(svgRightPath, { "stroke-dashoffset": -nDistance }, { duration: 250 });

            var svgLeftPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sLeftPath = 'M' + parseFloat(from.x + nRadius + 5) + ',' + parseFloat(from.y - nOffset1);
            sLeftPath += ' Q' + parseFloat((from.y + nDistance) / 7) + ',-' + nDistance / 48;
            sLeftPath += ' ' + nDistance + ',' + parseFloat(from.y - nOffset1 / 4);
            svgLeftPath.setAttribute('d', sLeftPath);
            svgLeftPath.setAttribute('id', "svgLeftPath" + nId);
            svgLeftPath.setAttribute('class', 'attackPath');
            svgLeftPath.setAttribute('stroke', '#FF4444');
            svgLeftPath.setAttribute('stroke-width', '4px');
            svgLeftPath.setAttribute('stroke-dasharray', nLength2 + ' 1000');
            svgLeftPath.setAttribute('stroke-dashoffset', nLength2);
            svgRightPath.setAttribute('fill', 'none');
            svgLeftPath.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgLeftPath.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgLeftPath);
            Velocity(svgLeftPath, { "stroke-dashoffset": -nDistance }, { duration: 250 });
        }
        if (this.player.attackBonus >= 2) {
            var svgRightCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sRightCurve = 'M' + parseFloat(from.x + nRadius - 2) + ',' + parseFloat(from.y + nOffset2);
            sRightCurve += ' Q' + parseFloat((from.y + nDistance) / 7) + ',' + nDistance / 12;
            sRightCurve += ' ' + nDistance + ',' + parseFloat(from.y + nOffset2 / 4);
            svgRightCurve.setAttribute('d', sRightCurve);
            svgRightCurve.setAttribute('id', "svgRightCurve" + nId);
            svgRightCurve.setAttribute('class', 'attackPath');
            svgRightCurve.setAttribute('stroke', '#44FF44');
            svgRightCurve.setAttribute('stroke-width', '4px');
            svgRightCurve.setAttribute('stroke-dasharray', nLength3 + ' 1000');
            svgRightCurve.setAttribute('stroke-dashoffset', nLength3);
            svgRightCurve.setAttribute('fill', 'none');
            svgRightCurve.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgRightCurve.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgRightCurve);
            Velocity(svgRightCurve, { "stroke-dashoffset": -nDistance }, { duration: 225 });
            
            var svgLeftCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sLeftCurve = 'M' + parseFloat(from.x + nRadius - 2) + ',' + parseFloat(from.y - nOffset2);
            sLeftCurve += ' Q' + parseFloat((from.y + nDistance) / 7) + ',-' + nDistance / 12;
            sLeftCurve += ' ' + nDistance + ',' + parseFloat(from.y - nOffset2 / 4);
            svgLeftCurve.setAttribute('d', sLeftCurve);
            svgLeftCurve.setAttribute('id', "svgLeftCurve" + nId);
            svgLeftCurve.setAttribute('class', 'attackPath');
            svgLeftCurve.setAttribute('stroke', '#44FF44');
            svgLeftCurve.setAttribute('stroke-width', '4px');
            svgLeftCurve.setAttribute('stroke-dasharray', nLength3 + ' 1000');
            svgLeftCurve.setAttribute('stroke-dashoffset', nLength3);
            svgLeftCurve.setAttribute('fill', 'none');
            svgLeftCurve.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgLeftCurve.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgLeftCurve);
            Velocity(svgLeftCurve, { "stroke-dashoffset": -nDistance }, { duration: 225 });
        }
        if (this.player.attackBonus >= 3) {
            var svgRightFarCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sRightFarCurve = 'M' + parseFloat(from.x + nRadius - 4) + ',' + parseFloat(from.y + nOffset3);
            sRightFarCurve += ' Q' + parseFloat((from.y + nDistance) / 7) + ',' + nDistance / 7;
            sRightFarCurve += ' ' + nDistance + ',' + parseFloat(from.y + nOffset3 / 4);
            svgRightFarCurve.setAttribute('d', sRightFarCurve);
            svgRightFarCurve.setAttribute('id', "svgRightFarCurve" + nId);
            svgRightFarCurve.setAttribute('class', 'attackPath');
            svgRightFarCurve.setAttribute('stroke', '#9933FF');
            svgRightFarCurve.setAttribute('stroke-width', '4px');
            svgRightFarCurve.setAttribute('stroke-dasharray', nLength4 + ' 1000');
            svgRightFarCurve.setAttribute('stroke-dashoffset', nLength4);
            svgRightFarCurve.setAttribute('fill', 'none');
            svgRightFarCurve.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgRightFarCurve.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgRightFarCurve);
            Velocity(svgRightFarCurve, { "stroke-dashoffset": -nDistance }, { duration: 275 });
            
            var svgLeftFarCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sLeftFarCurve = 'M' + parseFloat(from.x + nRadius - 4) + ',' + parseFloat(from.y - nOffset3);
            sLeftFarCurve += ' Q' + parseFloat((from.y + nDistance) / 7) + ',-' + nDistance / 7;
            sLeftFarCurve += ' ' + nDistance + ',' + parseFloat(from.y - nOffset3 / 4);
            svgLeftFarCurve.setAttribute('d', sLeftFarCurve);
            svgLeftFarCurve.setAttribute('id', "svgLeftFarCurve" + nId);
            svgLeftFarCurve.setAttribute('class', 'attackPath');
            svgLeftFarCurve.setAttribute('stroke', '#9933FF');
            svgLeftFarCurve.setAttribute('stroke-width', '4px');
            svgLeftFarCurve.setAttribute('stroke-dasharray', nLength4 + ' 1000');
            svgLeftFarCurve.setAttribute('stroke-dashoffset', nLength4);
            svgLeftFarCurve.setAttribute('fill', 'none');
            svgLeftFarCurve.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgLeftFarCurve.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgLeftFarCurve);
            Velocity(svgLeftFarCurve, { "stroke-dashoffset": -nDistance }, { duration: 275 });
        }
        if (this.player.attackBonus >= 4) {
            var svgRightSine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sRightSine = 'M' + parseFloat(from.x + nRadius) + ',' + from.y;
            sRightSine += ' Q' + parseFloat(from.x + nRadius + nDistance * 0.125) + ',' + parseFloat(from.y + nDistance * 0.125);
            sRightSine += ' ' + parseFloat(from.x + nRadius + nDistance * 0.25) + ',' + from.y;
            sRightSine += ' T' + parseFloat(from.x + nRadius + nDistance * 0.5) + ',' + from.y;
            sRightSine += ' T' + nDistance + ',' + from.y;
            svgRightSine.setAttribute('d', sRightSine);
            svgRightSine.setAttribute('id', "svgRightSine" + nId);
            svgRightSine.setAttribute('stroke', 'white');
            svgRightSine.setAttribute('stroke-width', '4px');
            svgRightSine.setAttribute('stroke-dasharray', nLength5 + ' 1500');
            svgRightSine.setAttribute('stroke-dashoffset', nLength5);
            svgRightSine.setAttribute('fill', 'none');
            svgRightSine.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgRightSine.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgRightSine);
            var nSineLength = svgRightSine.getTotalLength();
            Velocity(svgRightSine, { "stroke-dashoffset": -nSineLength }, { duration: 250 });

            var svgLeftSine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            var sLeftSine = 'M' + parseFloat(from.x + nRadius) + ',' + from.y;
            sLeftSine += ' Q' + parseFloat(from.x + nRadius + nDistance * 0.125) + ',-' + parseFloat(from.y + nDistance * 0.125);
            sLeftSine += ' ' + parseFloat(from.x + nRadius + nDistance * 0.25) + ',' + from.y;
            sLeftSine += ' T' + parseFloat(from.x + nRadius + nDistance * 0.5) + ',' + from.y;
            sLeftSine += ' T' + nDistance + ',' + from.y;
            svgLeftSine.setAttribute('d', sLeftSine);
            svgLeftSine.setAttribute('id', "svgLeftSine" + nId);
            svgLeftSine.setAttribute('stroke', 'white');
            svgLeftSine.setAttribute('stroke-width', '4px');
            svgLeftSine.setAttribute('stroke-dasharray', nLength5 + ' 1500');
            svgLeftSine.setAttribute('stroke-dashoffset', nLength5);
            svgLeftSine.setAttribute('fill', 'none');
            svgLeftSine.setAttribute('transform', 'rotate(' + angleDegrees + ')');
            svgLeftSine.setAttribute("filter","url(#Gaussian)");
            this.eSvg.appendChild(svgLeftSine);
            Velocity(svgLeftSine, { "stroke-dashoffset": -nSineLength }, { duration: 250 });
        }

//        if (this.player.attackBonus >= 0) {
//            Velocity(svgCenterPath, { "stroke-dashoffset": -nDistance }, { duration: 200 });
//        }
//        if (this.player.attackBonus >= 1) {
//            Velocity(svgRightPath, { "stroke-dashoffset": -nDistance }, { duration: 225 });
//            Velocity(svgLeftPath, { "stroke-dashoffset": -nDistance }, { duration: 225 });
//        }
//        if (this.player.attackBonus >= 2) {
//            Velocity(svgRightCurve, { "stroke-dashoffset": -nDistance }, { duration: 175 });
//            Velocity(svgLeftCurve, { "stroke-dashoffset": -nDistance }, { duration: 175 });
//        }
//        if (this.player.attackBonus >= 3) {
//            Velocity(svgRightFarCurve, { "stroke-dashoffset": -nDistance }, { duration: 200 });
//            Velocity(svgLeftFarCurve, { "stroke-dashoffset": -nDistance }, { duration: 200 });
//        }
//        if (this.player.attackBonus >= 0) {
//            Velocity(svgRightSine, { "stroke-dashoffset": -nSineLength }, { duration: 200 });
//            Velocity(svgLeftSine, { "stroke-dashoffset": -nSineLength }, { duration: 200 });
//        }

        var me = this;
        setTimeout(function() {
            var eCenterPath = document.getElementById("svgCenterPath" + nId);
            var eRightPath = document.getElementById("svgRightPath" + nId);
            var eLeftPath = document.getElementById("svgLeftPath" + nId);
            var eRightCurve = document.getElementById("svgRightCurve" + nId);
            var eLeftCurve = document.getElementById("svgLeftCurve" + nId);
            var eRightFarCurve = document.getElementById("svgRightFarCurve" + nId);
            var eLeftFarCurve = document.getElementById("svgLeftFarCurve" + nId);
            var eRightSine = document.getElementById("svgRightSine" + nId);
            var eLeftSine = document.getElementById("svgLeftSine" + nId);

            if (eCenterPath) { me.eSvg.removeChild(eCenterPath); }
            if (eRightPath) { me.eSvg.removeChild(eRightPath); }
            if (eLeftPath) { me.eSvg.removeChild(eLeftPath); }
            if (eRightCurve) { me.eSvg.removeChild(eRightCurve); }
            if (eLeftCurve) { me.eSvg.removeChild(eLeftCurve); }
            if (eRightFarCurve) { me.eSvg.removeChild(eRightFarCurve); }
            if (eLeftFarCurve) { me.eSvg.removeChild(eLeftFarCurve); }
            if (eRightSine) { me.eSvg.removeChild(eRightSine); }
            if (eLeftSine) { me.eSvg.removeChild(eLeftSine); }
        }, 275);
      
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
    Board.prototype.setValues = function() {
        this.dam = 0;
        this.as = 0;
        this.range = 0;
        this.cc = 0;
        this.cd = 0;
        this.chain = false;
        this.chainEffect = false;
        this.split = false;
        this.splitEffect = false;
        
        var aRange = [];
        var aCc = [];
        var aCd = [];        
        
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
                var nRange = hex.rune.range * asc;
                if (nRange > 0) { aRange.push(nRange); }
                var nCc = hex.rune.cc * desc;
                if (nCc > 0) { aCc.push(nCc); }
                var nCd = hex.rune.cd * desc;
                if (nCd > 0) { aCd.push(nCd); }

                this.dam += hex.rune.dam * asc;
                this.as += hex.rune.as * asc;

                if (hex.rune.chain === true) {
                    this.chain = true;
                    if (hex.towerConnected === true) { this.chainEffect = true; }
                }
                if (hex.rune.split === true) {
                    this.split = true;
                    if (hex.towerConnected === true) { this.splitEffect = true; }
                }
            }
        }
        aRange.sort(function(a,b){ return b - a; });
        for (var i = 0; i < aRange.length; i++) {
            this.range += aRange[i] * ((100 - this.range) / 100);
        }
        aCc.sort(function(a,b){ return b - a; }); 
        for (var i = 0; i < aCc.length; i++) {
            this.cc += aCc[i] * ((100 - this.cc) / 100);
        }
        aCd.sort(function(a,b){ return b - a; });
        for (var i = 0; i < aCd.length; i++) {
            this.cd += aCd[i] * ((1000 - this.cd) / 1000);
        }
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
                this.hexes[i].rune.chain = false;
                this.hexes[i].rune.split = false;
                switch (this.hexes[i].rune.id) {
                    case 1:
                        this.hexes[i].rune.dam = this.hexes[i].rune.stats[1] * this.hexes[i].rune.tier;
                        break;
                    case 2:
                        this.hexes[i].rune.as = this.hexes[i].rune.stats[2] * this.hexes[i].rune.tier;
                        break;
                    case 3:
                        this.hexes[i].rune.range = this.hexes[i].rune.stats[3] * this.hexes[i].rune.tier;
                        break;
                    case 4:
                        this.hexes[i].rune.cc = this.hexes[i].rune.stats[4] * this.hexes[i].rune.tier;
                        break;
                    case 5:
                        this.hexes[i].rune.cd = this.hexes[i].rune.stats[5] * this.hexes[i].rune.tier;
                        break;
                    case 6:
                        this.hexes[i].rune.chain = true;
                        break;
                    case 7:
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
        var nBlink = Math.round(Math.random() * 4);

        var iRune = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        iRune.setAttribute("width", this.side * 3.6);
        iRune.setAttribute("height", this.side * 3.6);
        iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/rune-' + this.rune.name + tier + '.png');
        iRune.setAttribute("filter","url(#filter-" + nBlink + ")");

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
        this.alive = true;
        this.damage = oSettings.enemyDam;
        this.mana = oSettings.enemyMana;
        this.experience = oSettings.enemyExperience;
        this.mod = Math.random() + 0.5;
        this.health = wave.health * this.mod;
        this.speed = wave.speed / this.mod;
        this.center = center;
        this.angleRadians = Math.atan2(to.y - this.center.y, to.x - this.center.x);
        this.angleDegrees = Math.atan2(to.y - this.center.y, to.x - this.center.x) * 180 / Math.PI;
        this.angleAttack = Math.atan2(this.center.y - to.y, this.center.x - to.x) * 180 / Math.PI;
        this.sine = Math.sin(this.angleRadians);
        this.cosine = Math.cos(this.angleRadians);
        this.direction = Math.round(Math.random());
        this.type = Math.floor(Math.random() * 4);
        this.size = 25 * this.mod;
        this.animate = 0;
        this.step = 0;
        this.attackPrimary = new Punt(-this.cosine * 50, -this.sine * 50);
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
        this.attacking = false;
        this.experience = 0;
        this.kills = 0;
        this.misses = 0;
        this.total = 0;
        this.accuracy = 1;
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
        this.attackBonus = 0;
    };
    Player.prototype.levelUp = function() {
        this.level += 1;
        this.dam += 1;
        this.skillPoints += 1;
        this.health = this.maxHealth;
        this.experience -= this.maxExperience;
        this.maxExperience = 100 + (this.level - 1) * 10;
        oGame.board.setValues();
        oGame.setValues();
        towerController.showAllStats();
        playerController.showAllStats();
        oGame.showExperience();
        oGame.showGlobe("health");
        oGame.showText("levelup", this.level);
    };

    function Wave(number) {
        this.id = number;
        this.parameter = 100 + Math.pow(this.id / 1.3, 2) + Math.pow(this.id / 14, 3) + Math.pow(this.id / 16, 4) + Math.pow(this.id / 17, 5);
        this.factor = Math.round((Math.random() * 4) + 12);
        this.number = this.factor;
        this.health = this.parameter / this.factor;
        this.speed = oSettings.enemySpeed;
        if (this.id > 10) {
            oGame.player.total += this.number;
            playerController.showStat("total");
        }
    };
    function Skill() {
        this.dam = oSettings.skillDam;
        this.as = oSettings.skillAs;
        this.range = oSettings.skillRange;
        this.cc = oSettings.skillCc;
        this.cd = oSettings.skillCd;
        this.chain = oSettings.skillChain;
        this.split = oSettings.skillSplit;
    };
    function Tower() {
        this.wave = 0;
        this.accuracy = 1;
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
    };

    return {
        init: init
    };
})();