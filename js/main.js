const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const scoreText = document.querySelector("p");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

/**
 * Available enemies colors
 */
const ENEMIES_COLORS = [
	"green",
	"red"
];

/**
 * Get random between min and max
 * @param {*} min min available number
 * @param {*} max max available number
 */
const random = (min,max) => {
	return num = Math.floor(Math.random()*(max-min)) + min;
}

/**
 * Mother abstract class 
 */
class Spaceship {

	/**
	 * Constructor of mother class
	 * @param {*} x x position
	 * @param {*} y y position
	 * @param {*} velX x speed
	 * @param {*} color spaceship color
	 */
	constructor(x, y, velX, color) {
		this.x = x;
		this.y = y;
		this.velX = velX;
		this.color = color;
		this.image = new Image();
	}

	/**
	 * Update position
	 */
	update() {
		/* right */
		if ((this.x + this.image.width) >= width) {
			this.velX = -(this.velX);
		}
		/* left */
		if ((this.x) <= 0) {
			this.velX = -(this.velX);
		}

		this.x += this.velX;
	}

	/**
	 * Draw on canvas
	 */
	draw() {
		ctx.drawImage(this.image, this.x, this.y);
	}
}

/**
 * Represents a enemy
 */
class Enemy extends Spaceship {

	/**
	 * Init a new enemy
	 * @param {*} x x position
	 * @param {*} y y position
	 * @param {*} velX x speed
	 * @param {*} color enemy color
	 */
	constructor(x, y, velX, color) {
		super(x, y, velX, color);
		this.image.src = "images/enemy-" + this.color + "-" + random(1, 5) + ".png";
	}

	/**
	 * Enemy can shoot
	 */
	shoot() {
		let laser = new Laser(this.x + this.image.width / 2, this.y + this.image.height, 2, "images/laser-" + this.color + ".png");
		laser.play();
		enemiesLasers.push(laser);
	}
}

/**
 * Class who reprensent player 
 */
class Player extends Spaceship {

	/**
	 * Init player
	 * @param {*} x x position 
	 * @param {*} y y position
	 * @param {*} velX x speed
	 * @param {*} color player color
	 */
	constructor(x, y, velX, color) {
		super(x, y, velX, color);
		this.fire = true;
		this.nbMoves = 1;
		this.image.src = "images/player-" + this.color + "-" + random(1, 3) + ".png";
	}

	/**
	 * Check screen limits
	 */
	checkBounds() {
		/* right */
		if ((this.x + this.image.width / 2) >= width) {
			this.x = -(this.x);
		}
		/* left */
		if ((this.x + this.image.width) <= 0) {
			this.x = -(this.x);
		}
	}

	/**
	 * Add controls to the player
	 */
	setControls() {
		window.onkeydown = (e) => {
			if (e.key === "ArrowLeft") {
				this.x = -(this.x);
				this.nbMoves++;
			} else if (e.key === "ArrowRight") {
				this.x = -(this.x);
				this.nbMoves++;
			} else if (e.key === ' ') {
				this.shoot();
			}
		};
	}

	/**
	 * Player can shoot
	 */
	shoot() {
		if (this.fire) { 
			let laser = new Laser(this.x + this.image.width / 2, this.y - this.image.height / 2, 10, "images/laser-" + this.color +".png");
			laser.play();
			playerLasers.push(laser);
			this.fire = false;
			this.nbMoves++;
		}  else {
			setTimeout(() => {
				this.fire = true;
			}, 10);
		}
	}

	/**
	 * Reset the number of player moves
	 */
	resetMoves() {
		this.nbMoves = 1;
	}
}

/**
 * Represent an explosion when enemy
 * was shooted
 */
class Explosion {

	/**
	 * Init a new explosion
	 * @param {*} x x position
	 * @param {*} y y position
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.image = new Image();
		this.image.src = "images/blast.png";
		this.sound = new Audio("sounds/explosion1.mp3");
	}

	/**
	 * Draw explosion
	 */
	draw() {
		ctx.drawImage(this.image, this.x, this.y);
	}

	/**
	 * Play explosion sound
	 */
	play() {
		this.sound.play();
	}
}

/**
 * Represent a laser
 */
class Laser {

	/**
	 * Init a new laser
	 * @param {*} x x position
	 * @param {*} y y position
	 * @param {*} velY y speed
	 * @param {*} image laser image
	 */
	constructor(x, y, velY, image) {
		this.x = x;
		this.y = y;
		this.active = true;
		this.velY = velY;
		this.image = new Image();
		this.image.src = image;
		this.sound = new Audio("sounds/laser.mp3");
	}

	/**
	 * Check if bullet touch an enemy
	 */
	killEnemy() {

		for (let i = 0; i < enemies.length; i++) {

			let dx = this.x - enemies[i].x;
			let dy = this.y - enemies[i].y;
			let distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < this.image.height + enemies[i].image.height) {
				let explosion = new Explosion(enemies[i].x, enemies[i].y);
				explosion.draw();
				explosion.play();
				this.active = false;
				enemies.splice(i, 1);
				score++;
			}
		}
	}

	/**
	 * Check if bullet touch player
	 * @param {*} player player to kill
	 */
	killPlayer(player) {

		let dx = this.x - player.x;
		let dy = this.y - player.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < this.image.height + player.image.height) {
			let explosion = new Explosion(player.x, player.y);
			explosion.draw();
			explosion.play();
			this.active = false;
		}
	}

	/**
	 * Draw a laser
	 */
	draw() {
		ctx.drawImage(this.image, this.x, this.y);
	}

	/**
	 * Update laser position
	 */
	update(direction) {
		if (direction === "up") {
			this.y -= this.velY; 
		} else {
			this.y += this.velY; 
		}
	}

	/**
	 * Player laser sound
	 */
	play() {
		this.sound.play();
	}
}

/**
 * Represent a star in sky
 */
class Star {

	/**
	 * Init a new star
	 * @param {*} x x position
	 * @param {*} y y position
	 * @param {*} size star size
	 */
	constructor(x, y, size) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.color = "white";
	}

	/**
	 * Put star on canvas
	 */
	put() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

/**
 * Add nbEnemies in enemies array
 * @param {*} enemies array with enemies
 * @param {*} nbEnemies number of enemies
 */
const addEnemies = (enemies, nbEnemies) => {
	
	let startY = 20;

	for (let i = 0; i < nbEnemies; i++) {
		enemies.push(new Enemy(random(50, innerWidth - 100), startY, random(1, 10), ENEMIES_COLORS[random(0, ENEMIES_COLORS.length)]));
		if (enemies.length % 4 == 0) {
			startY += 150;
		}
	}
	return enemies;
}

const NB_ENEMIES = 12;
let score = 0;
let enemies = [];
let playerLasers = [];
let enemiesLasers = [];
let player = new Player(width / 2.2, height / 1.2, 5, "blue");
let down = false;

player.setControls();
addEnemies(enemies, NB_ENEMIES);

/**
 * Game loop
 */
const loop = () => {

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);

	for (let i = 0; i < 2; i++) {
		new Star(random(1, width), random(1, height), random(1, 5)).put();
	}
	
	scoreText.innerHTML = "Score : " + score;

	if (enemies.length <= NB_ENEMIES / 3) {
		down = true;
	}

	/**
	 * Animate enemies
	 */
	for (let i = 0; i < enemies.length; i++) {
    	enemies[i].draw();
		enemies[i].update();

		if (down) {
			enemies[i].y += 150;
		}

		if (player.nbMoves === 5) {
			let randomEnemy = random(0, enemies.length);
			enemies[randomEnemy].shoot();
			player.resetMoves();
		} 
	}

	if (down) {
		down = false;
		addEnemies(enemies, enemies.length * 2);
	}

	/**
	 * Check if enemies laser touch player 
	 */
	for (let i = 0; i < enemiesLasers.length; i++) {
		if (enemiesLasers[i].y > height || !enemiesLasers[i].active) {
			enemiesLasers.splice(i, 1);
		} else {
			enemiesLasers[i].draw();
			enemiesLasers[i].update("down");
			enemiesLasers[i].killPlayer(player);
		}
	}

	/** 
	 * Check if lasers touch enemies
	 */
	for (let i = 0; i < playerLasers.length; i++) {
		if (playerLasers[i].y < 0 || !playerLasers[i].active) {
			playerLasers.splice(i, 1);
		} else {
			playerLasers[i].draw();
			playerLasers[i].update("up");
			playerLasers[i].killEnemy();
		}
	}

	player.draw();
	player.update();
	player.checkBounds();

  	requestAnimationFrame(loop);
}

loop();