'use strict';

$(function() {
    var eCanvas = document.getElementById('canvas');
    var eSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    eSvg.setAttributeNS('http://www.w3.org/2000/svg','xlink','http://www.w3.org/1999/xlink');
    eSvg.setAttributeNS(null, "width", 600);
    eSvg.setAttributeNS(null, "height", 600);
    eCanvas.appendChild(eSvg);
    
    var center = new Punt(300, 300);
    var board = new Board(eSvg, center, 2, 32);
    board.build();
    board.defs();
    board.draw();
    var heart = board.find("0, 0");
    board.rune(heart, "heart");
    var player = new Player();
//    var circle1 = new Circle(eSvg, center, 1, 40);
//    circle1.element();
//    var circle2 = new Circle(eSvg, center, 1, 96);
//    circle2.element();
//    var circle3 = new Circle(eSvg, center, 1, 162);
//    circle3.element();
//    var heartcircle = new Circle(eSvg, center, 2, 26);
//    heartcircle.element();

    $("polygon").on("click", function() {
        var id = $(this).attr("id");
        var runes = ["dam", "as", "cc", "cd", "range", "gold"];
        var hex = board.find(id);
        hex.modifier += 1;
        board.unrune(hex);
        if (hex.modifier === 7) {
            this.setAttribute("fill", "transparent");
            hex.modifier = 0;
        }
        else {
            board.rune(hex, runes[hex.modifier - 1]);
            this.setAttribute("fill", "url(#" + id.replace(", ", "") + ")"); 
        }
        var eStats = $("#playerStats");
        eStats.empty();
        var sDps = player.dps();
        var eDps = ("<p>Player dps: " + sDps + "</p>");
        eStats.append(eDps);

    });
    $("polygon").on("mouseover", function() {
        var id = $(this).attr("id");
        var hex = board.find(id);
        var eStats = $("#hexStats");
        eStats.empty();
        var sModifier = hex.modifier;
        var eModifier = ("<p>Modifier: " + sModifier + "</p>");
        eStats.append(eModifier);
    });
});

function Punt(x, y) {
    this.x = x;
    this.y = y;
}

function Circle(canvas, center, width, radius) {
    this.canvas = canvas;
    this.center = center;
    this.width = width;
    this.radius = radius;
}
Circle.prototype.element = function() {
//    <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.element.setAttribute('cx', this.center.x);
    this.element.setAttribute('cy', this.center.y);
    this.element.setAttribute('r', this.radius);
    this.element.setAttribute('stroke', 'red');
    this.element.setAttribute('stroke-width', this.width);
    this.element.setAttribute("fill", "none");
//    return this.element;
    this.canvas.appendChild(this.element);
}

function Hex(id, center, side){
    this.modifier = 0;
    this.center = center;
    this.side = side;
    this.height = Math.sqrt(3 * this.side * this.side);
    this.id = id;
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
    if (this.id === "0, 0") { this.element.setAttribute('fill', 'url(#00)'); }
    this.element.setAttribute('id', this.id);
    this.element.setAttribute('class', 'hex');
    
    return this.element;
};
Hex.prototype.pattern = function(rune) {
    this.pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    this.pattern.setAttribute("id", this.id.replace(", ", ""));
    this.pattern.setAttribute("patternUnits", "userSpaceOnUse");
    this.pattern.setAttribute("x", this.center.x - 1.8 * this.side);
    this.pattern.setAttribute("y", this.center.y - 1.8 * this.side);
    this.pattern.setAttribute("width", this.side * 3.6);
    this.pattern.setAttribute("height", this.side * 3.6);

    var iRune = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    iRune.setAttribute("width", this.side * 3.6);
    iRune.setAttribute("height", this.side * 3.6);
    iRune.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/' + rune + '.png');
    var iCircle = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    iCircle.setAttribute("width", this.side * 3.6);
    iCircle.setAttribute("height", this.side * 3.6);
    iCircle.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/circlefull.png');

    this.pattern.appendChild(iRune);
    this.pattern.appendChild(iCircle);

//    var image3 = document.createElementNS('http://www.w3.org/2000/svg', 'image');
//    image3.setAttribute("width", this.side * 3.6);
//    image3.setAttribute("height", this.side * 3.6);
//    image3.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'images/right.png');
//    this.pattern.appendChild(image3);
    
    return this.pattern;
};

function Board(canvas, center, radius, side) {
    this.canvas = canvas;
    this.center = center;
    this.radius = radius;
    this.side = side;
    this.height = Math.sqrt(3 * this.side * this.side);
    this.hexes = [];
};
Board.prototype.defs = function() {
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.canvas.appendChild(this.defs);
};
Board.prototype.build = function() {
    for (var j = -this.radius; j <= this.radius; j++) {
        var nI = parseInt(this.radius - Math.floor(Math.abs(j) / 2));
        var nJ = -Math.abs(j % 2);
        for (var i = -nI; i <= nI; i++) {
            if (!(i === 0 && nJ !== 0)) {
                var aId = i + ", " + -j;
                var offSet = 0;
                if (nJ !== 0) { var offSet = nJ * i / Math.abs(i); }
                var punt = new Punt(this.center.x + this.height * (2 * i + offSet), this.center.y + 3 * j * this.side);
                var hex = new Hex(aId, punt, this.side);
                this.hexes.push(hex);
            }
        }
    }
};
Board.prototype.draw = function() {
    for (var i = 0; i < this.hexes.length; i++ ) {
        this.canvas.appendChild(this.hexes[i].element());
    }
};
Board.prototype.unrune = function(hex) {
    delete hex["image"];
    delete hex["pattern"];
    $('pattern#' + hex.id.replace(", ", "")).remove();
};
Board.prototype.rune = function(hex, rune) {
    this.defs.appendChild(hex.pattern(rune));
};
Board.prototype.find = function(id) {
    for (var i = 0; i < this.hexes.length; i++ ) {
        if (this.hexes[i].id === id) { return this.hexes[i]; }
    }
};

function Player() {
    this.health = 100;
    this.radius = 100;
    this.dam = 100;
    this.cc = 5;
    this.cd = 50;
    this.as = 2;
};
Player.prototype.dps = function() {
    return this.dam * this.cc * (100 + this.cd) / 10000 + this.dam * (100 - this.cc) / 100;
};