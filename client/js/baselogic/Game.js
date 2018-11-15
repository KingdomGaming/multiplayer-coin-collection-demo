import Ball from "../objects/player/Ball";
import Coin from "../objects/collectible/Coin";

import colors from "../constants/colors";
import keys from "../constants/keys";

import PrimaryCanvas from "../components/PrimaryCanvas";
import ScoreCanvas from "../components/ScoreCanvas";

export default class Game {
    constructor() {
        this.fps = 30;

        //Creates the canvas objects and gets their context.
        this.views = [
            this.theGameCanvas = new PrimaryCanvas("theGameCanvas"),
            this.theScoreCanvas = new ScoreCanvas("theScoreCanvas")
        ]

        this.gameContext = this.theGameCanvas.context;
        this.scoreContext = this.theScoreCanvas.context;

        //Get the boundaries
        this.bound_top = this.theGameCanvas.bounds.top;
        this.bound_left = this.theGameCanvas.bounds.left;
        this.bound_right = this.theGameCanvas.bounds.right;
        this.bound_bottom = this.theGameCanvas.bounds.bottom;

        //Creates our ball object.
        this.player = new Ball({});

        //Init coin collection
        this.coinMap = [];
        this.maxCoins = 75;
        this.generateCoins();

        //Init player's score
        this.playerScore = 0;

        //Sets our starting friction value - originally 0.01
        this.friction = 0.05;

        this.keyMap = {};
        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener("keydown", this.addKeyToMap.bind(this));
        window.addEventListener("keyup", this.removeKeyFromMap.bind(this));
    }

    addKeyToMap(event) {
        this.keyMap[event.key] = true;
    }

    removeKeyFromMap(event) {
        this.keyMap[event.key] = false;
    }

    generateCoins() {
        //Define coin values
        const coin_min_x = 0 + (this.player.radius * 2);
        const coin_max_x = this.bound_right - this.bound_left - (this.player.radius * 3);
        const coin_min_y = 0 + (this.player.radius * 2);
        const coin_max_y = this.bound_bottom - this.bound_top - (this.player.radius * 3);

        if(this.coinMap.length < this.maxCoins)
        {
            const xPos = Math.floor(Math.random() * coin_max_x) + coin_min_x;
            const yPos = Math.floor(Math.random() * coin_max_y) + coin_min_y;

            this.coinMap.push(
                new Coin({
                    x: xPos,
                    y: yPos
                })
            );
        }
    }

    checkPreconditions() {
        return hasCanvasSupport();
    }

    run() {
        this.update();
        this.render(this.gameContext, this.scoreContext);

        setTimeout(this.run.bind(this), 1000 / this.fps);
    }

    update() {
        this.checkBoundary(this.player, this.theGameCanvas);

        this.handleInput();

        this.moveObjects();

        this.checkCoinCollision();
        this.generateCoins();
    }

    render(gameContext, scoreContext) {
        this.clearScreen();

        this.renderCoins(gameContext);
        this.renderPlayer(gameContext);
        this.renderScore(scoreContext);
    }

    moveObjects() {
        this.player.move();
    }

    handleInput() {
        // Define key handling variables
        const maxVel = 10;
        const maxNegativeVel = maxVel * -1;
        const addVel = 1;


        //Check for activated keys
        if(this.keyMap[keys.w] && !this.player.lock_top)
        {
            this.player.velY -= addVel;

            if(this.player.velY < maxNegativeVel) {
                this.player.velY = maxNegativeVel;
            }
        }



        if(this.keyMap[keys.a] && !this.player.lock_left)
        {
            this.player.velX -= addVel;

            if(this.player.velX < maxNegativeVel) {
                this.player.velX = maxNegativeVel;
            }
        }



        if(this.keyMap[keys.d] && !this.player.lock_right)
        {
            this.player.velX += addVel;

            if(this.player.velX > maxVel) {
                this.player.velX = maxVel;
            }
        }



        if(this.keyMap[keys.s] && !this.player.lock_bottom)
        {
            this.player.velY += addVel;

            if(this.player.velY > maxVel) {
                this.player.velY = maxVel;
            }
        }
    }

    clearScreen() {
        this.views.forEach((canvas) => canvas.clear());
    }

    renderPlayer(context) {
        this.player.render(context);
    }

    renderCoins(context) {
        this.coinMap.forEach((coin) => coin.render(context));
    }

    renderScore(context) {
        const displayedScore = this.playerScore.toString().padStart(4, "0");

        context.font = "30px Arial";
        context.fillStyle = this.calculateScoreColor(this.playerScore);

        context.fillText(displayedScore, 15, 35);
    }

    calculateScoreColor(score) {
        let scoreColor;

        if(score >= 100)
        {
            scoreColor = colors.score.tier5;
        }
        else if(score >= 50)
        {
            scoreColor = colors.score.tier4;
        }
        else if(score >= 25)
        {
            scoreColor = colors.score.tier3;
        }
        else if(score >= 10)
        {
            scoreColor = colors.score.tier2;
        }
        else
        {
            scoreColor = colors.score.tier1;
        }

        return scoreColor;
    }

    //Function in charge of checking the ball against walls.
    checkBoundary(object, theGameCanvas)
    {
        //Get the boundaries
        const bound_top = this.bound_top;
        const bound_left = this.bound_left;
        const bound_right = this.bound_right;
        const bound_bottom = this.bound_bottom;



        //Get object coords
        var object_top = parseFloat(object.y - object.radius) + bound_top;
        var object_left = parseFloat(object.x - object.radius) + bound_left;
        var object_right = parseFloat(object.x + object.radius) + bound_left;
        var object_bottom = parseFloat(object.y + object.radius) + bound_top;



        //Get maximum values
        var max_top = bound_top + object.radius - bound_top;
        var max_left = bound_left + object.radius - bound_left;
        var max_right = bound_right - object.radius - bound_left;
        var max_bottom = bound_bottom - object.radius - bound_top;



        //Check Top Boundary
        if(object_top <= bound_top)
        {
            object.velY = 0;
            object.y = max_top;
            object.lock_top = true;

        }
        else if(object.lock_top)
        {
            object.lock_top = false;
        }



        //Check Left Boundary
        if(object_left <= bound_left)
        {
            object.velX = 0;
            object.x = max_left;
            object.lock_left = true;
        }
        else if(object.lock_left)
        {
            object.lock_left = false;
        }



        //Check Left Boundary
        if(object_right >= bound_right)
        {
            object.velX = 0;
            object.x = max_right;
            object.lock_right = true;
        }
        else if(object.lock_right)
        {
            object.lock_right = false;
        }



        //Check Bottom Boundary
        if(object_bottom >= bound_bottom)
        {
            object.velY = 0;
            object.y = max_bottom;
            object.lock_bottom = true;
        }
        else if(object.lock_bottom)
        {
            object.lock_bottom = false;
        }
    }

    checkCoinCollision() {
        this.coinMap.forEach((coin, index) => {
            const isCollision = Math.sqrt(Math.pow((this.player.x - coin.x), 2) + Math.pow((this.player.y - coin.y), 2)) <= ((this.player.radius + coin.radius) - ((coin.radius*2) - 2));

            if (isCollision) {
                this.playerScore ++;
                this.coinMap.splice(index, 1);
            }
        });
    }
}

const hasCanvasSupport = () => {
    return Modernizr.canvas;
}