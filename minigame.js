/*
 * Card matching mini-game
 *
 * TCSS 491B Group 6 (Sugoi Kawaii)
 * Written by Seth Ladd
 * Modified by Jeannie Sin (jsin000)
 * 04/19/14
 */

/* --------------------------------- WINDOW CODE --------------------------------- */
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function (/* function */ callback, /* DOMElement */ element) {
               window.setTimeout(callback, 1000 / 60);
           };
})();

/* ------------------------------ ASSETMANAGER CODE ------------------------------ */
function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return (this.downloadQueue.length == this.successCount + this.errorCount);
}

AssetManager.prototype.downloadAll = function (callback) {
    if (this.downloadQueue.length === 0) window.setTimeout(callback, 100);
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var path = this.downloadQueue[i];
        var img = new Image();
        var that = this;
        img.addEventListener("load", function () {
            console.log("dun: " + this.src.toString());
            that.successCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.addEventListener("error", function () {
            that.errorCount += 1;
            if (that.isDone()) { callback(); }
        });
        img.src = path;
        this.cache[path] = img;
    }
}

AssetManager.prototype.getAsset = function (path) {
    return this.cache[path];
}

/* ------------------------------- GAMEENGINE CODE ------------------------------- */
function GameEngine() {
    this.entities = [];
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
}

// Starts the game
GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

// Global variables
var count = 0;
var card1;
var card2;

GameEngine.prototype.startInput = function () {
    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        // Checks that a card was clicked on (instead of background and spaces)
        // x- and y-coordinates translated into x- and y-values associated with the card's row and column 
        // x1, y1 = coordinates; x, y = values
        var clickedOnCard = function (x1, y1) {
            result = true;

            if (x < 65 || x > 935 || y < 65 || y > 805) { // Outside margins/background
                result = false;
                x = -1;
                y = -1;
            } else if (getY1(y1) === -1) { // y-value out of range
                x = -1;
                y = -1;
            } else if (x1 >= 65 && x1 <= 165) { // x = 0
                x = 0;
                y = getY1(y1);
            } else if (x1 >= 175 && x1 <= 275) { // x = 1
                x = 1;
                y = getY1(y1);
            } else if (x1 >= 285 && x1 <= 385) { // x = 2
                x = 2;
                y = getY1(y1);
            } else if (x1 >= 395 && x1 <= 495) { // x = 3
                x = 3;
                y = getY1(y1);
            } else if (x1 >= 505 && x1 <= 605) { // x = 4
                x = 4;
                y = getY1(y1);
            } else if (x1 >= 615 && x1 <= 715) { // x = 5
                x = 5;
                y = getY1(y1);
            } else if (x1 >= 725 && x1 <= 825) { // x = 6
                x = 6;
                y = getY1(y1);
            } else if (x1 >= 835 && x1 <= 935) { // x = 7
                x = 7;
                y = getY1(y1);
            } else { // Space inbetween rows and columns
                result = false;
                x = -1;
                y = -1;
            }

            return { result: result, x: x, y: y };
        }

        // Returns y-value given canvas' the y-coordinate
        var getY1 = function (y1) {
            if (y1 >= 65 && y1 <= 205) { // y = 0
                y1 = 0;
            } else if (y1 >= 215 && y1 <= 355) { // y = 1
                y1 = 1;
            } else if (y1 >= 365 && y1 <= 505) { // y = 2
                y1 = 2;
            } else if (y1 >= 515 && y1 <= 655) { // y = 3
                y1 = 3;
            } else if (y1 >= 665 && y1 <= 805) { // y = 4
                y1 = 4;
            } else { // y-coordinate out of range
                y1 = -1;
            }

            return y1;
        }

        this.card = clickedOnCard(x, y);
        if (this.card.result) { // If card was clicked, translate coordinates
            x = this.card.x;
            y = this.card.y;
        } else { // Otherwise, x, y = -1 (unaccepted value)
            x = -1;
            y = -1;
        }

        return { x: x, y: y };
    }

    // onClickListener!
    var that = this;
    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);
        e.stopPropagation();
        e.preventDefault();
    }, false);
}

GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
}

GameEngine.prototype.draw = function (drawCallback) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    if (drawCallback) {
        drawCallback(this);
    }
    this.ctx.restore();
}

// Returns appropriate index to search for card entity, based on the card's x- and y-values
GameEngine.prototype.getCardIndex = function (x, y) {
    return x + y * 8;
}

GameEngine.prototype.update = function () {
    var e = -1;
    if (this.click) { // If click event occurs...
        e = this.getCardIndex(this.click.x, this.click.y);

        if (this.click.x !== -1 && this.click.y !== -1) { // If a card is clicked...
            // Ensure that the count is 0 - 2 (on 2, compare selected cards)
            if (count < 2) {
                count++;
            } else {
                count = 1;
            }

            if (count === 1) { // On first click, store first selected card
                card1 = this.entities[e];
                if (card1 instanceof Card) {
                    console.log("Card 1 selected");
                    card1.setColor(card1.getValue()); // Turn first card over
                } else { // If a blank is clicked, do not increment the count
                    count = 0;
                }
            } else if (count === 2) { // On second click, store second selected card
                card2 = this.entities[e];
                if (card2 instanceof Card) {
                    if (card1 === card2) { // If same card is selected twice, do not increment count
                        count = 1;
                    } else { // Turn second card over
                        console.log("Card 2 selected");
                        card2.setColor(card2.getValue());
                        card2.highlighted = true;
                        if (card1.getValue() === card2.getValue()) { // Compare cards for match
                            console.log("MATCH!");
                            card1.removeFromWorld = true;
                            card2.removeFromWorld = true;
                        } else { // Turn cards back over
                            console.log("No match");
                            //card1.setColor("#FFFFFF");
                            //card2.setColor("#FFFFFF");
                        }
                    }
                } else { // If a blank is clicked, do not increment the count
                    count = 1;
                }
            }
        }
    }

    // Iterate over list of entities and remove any with removeFromWorld flag turned on
    var entitiesCount = this.entities.length;
    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];
        if (!entity.removeFromWorld) {
            entity.update();
        }
    }
    
    // Insert Blanks where Cards are removed
    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1, new Blank(this, this.entities[i].getX(), this.entities[i].getY()));
        }
    }
}

// After update is complete, reset click
GameEngine.prototype.loop = function () {
    this.update();
    this.draw();
    this.click = null;
}

/* --------------------------------- ENTITY CODE --------------------------------- */
function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () { }

/* ---------------------------------- CARD CODE ---------------------------------- */
function Card(game, x, y, color, value) {
    Entity.call(this, game, x, y); // Extends Entity
    this.color = color;
    this.value = value;
    //this.highlighted = false;
}

Card.prototype = new Entity();
Card.prototype.constructor = Card;
Card.prototype.color = '';
Card.prototype.value = '';

Card.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Card.prototype.draw = function (ctx) {
    var canvas = document.getElementById('gameWorld');
    rect = canvas.getContext("2d");
    this.ctx = ctx;
    rect.fillStyle = this.color;
    rect.fillRect(this.x, this.y, 100, 140);
    /*if (this.highlighted) {
        ctx.lineWidth = "4";
        ctx.strokeStyle = "#FFFFFF";
        ctx.rect(this.x, this.y, 100, 140);
        ctx.stroke();
    }*/
}

Card.prototype.getX = function () {
    return this.x;
}

Card.prototype.getY = function () {
    return this.y;
}

Card.prototype.getValue = function () {
    return this.value;
}

Card.prototype.setColor = function (value) {
    this.color = value;
}

/* ---------------------------------- BLANK CODE ---------------------------------- */
function Blank(game, x, y) {
    Entity.call(this, game, x, y); // Extends Entity
}

Blank.prototype = new Entity();
Blank.prototype.constructor = Card;

Blank.prototype.update = function () {
    Entity.prototype.update.call(this);
}

Blank.prototype.draw = function (ctx) {
    var canvas = document.getElementById('gameWorld');
    rect = canvas.getContext("2d");
    rect.fillStyle = "transparent";
    rect.fillRect(this.x, this.y, 100, 140);
}

/* ------------------------------- MATCHENGINE CODE ------------------------------- */
function MatchEngine() {
    GameEngine.call(this); // Extends GameEngine
}

MatchEngine.prototype = new GameEngine();
MatchEngine.prototype.constructor = MatchEngine;

MatchEngine.prototype.start = function () {
    GameEngine.prototype.start.call(this);

    for (var i = 0; i < cards.length; i++) {
        this.addEntity(cards[i]);
    }
}

MatchEngine.prototype.update = function () {
    GameEngine.prototype.update.call(this);
}

MatchEngine.prototype.draw = function () {
    GameEngine.prototype.draw.call(this, function (game) { });
}

/* ---------------------------------- MAIN CODE ---------------------------------- */
var ASSET_MANAGER = new AssetManager();
var game = new MatchEngine();

ASSET_MANAGER.downloadAll(function () {
    //console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    ASSET_MANAGER.downloadAll(function () {
        var colors = ["#000000", "#AAAAAA", "#F781F3", "#2ECCFA", "#01DF3A", "#FA5882", "#0080FF", "#01DFA5",
                      "#D358F7", "#4B088A", "#088A85", "#CEECF5", "#F6E3CE", "#4B610B", "#8A084B", "#2A0A12",
                      "#210B61", "#81F7F3", "#C8FE2E", "#088A29"];

        var arr = new Array(40);
        for (var a = 0; a < arr.length; a++) {
            arr[a] = 0;
        }

        var array = new Array(20);
        for (var b = 0; b < array.length; b++) {
            array[b] = 0;
        }

        for (var c = 0; c < arr.length; c++) {
            var rand = Math.floor(Math.random() * 20);

            if (array[rand] < 2) {
                arr[c] = rand;
                array[rand]++;
            } else {
                c--;
            }
        }

        cards = new Array(40);
        var n = 0;
        var padding = 64;
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 8; j++) {
                cards[n] = new Card(this, j * 110 + padding, i * 150 + padding, "#FFFFFF", colors[arr[j + 8 * i]]);
                n++;
            }
        }

        canvas.setAttribute('tabindex', '0');
        canvas.focus();
       
        game.init(ctx);
        game.start();
    });
});