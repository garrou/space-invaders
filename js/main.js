const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const scoreText = document.querySelector("p");
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const loose = document.getElementById("loose");

/**
 * Available enemies colors
 */
const ENEMIES_COLORS = [
	"green",
	"red"
];

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
	update = () => {
		/* right */
		if ((this.x + this.image.width) >= width) {
			this.velX *= -1;
		}
		/* left */
		if ((this.x) <= 0) {
			this.velX *= -1;
		}

		this.x += this.velX;
	}

	/**
	 * Spaceship can shoot
	 */
	shoot = (lasersArray) => {
		let laser = new Laser(this.x + this.image.width, 
							this.y, 
							2, 
							"images/laser-" + this.color + ".png");
		laser.play();
		lasersArray.push(laser);
	}

	/**
	 * Draw on canvas
	 */
	draw = () => {
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
		this.image.src = "images/enemy-" + this.color + "-" + Utils.random(1, 5) + ".png";
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
		this.alive = true;
		this.image.src = "images/player-" + this.color + "-" + Utils.random(1, 3) + ".png";
	}

	/**
	 * Check screen limits
	 */
	checkBounds = () => {
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
	setControls = () => {
		window.onkeydown = (e) => {
			if (e.key === "ArrowLeft" && this.velX > 0) {
				this.x *= -1;
			} else if (e.key === "ArrowRight" && this.velX < 0) {
				this.x *= -1;
			} else if (e.key === ' ') {
				this.shoot(playerLasers);
			}
		};
	}

	/**
	 * Check if player spaceship hit an enemy spaceship
	 * @param {*} enemySpaceship spaceship to check
	 */
	hitObject(enemySpaceship) {
		let dx = this.x - enemySpaceship.x;
		let dy = this.y - enemySpaceship.y;
		let distance = Math.sqrt(dx * dx + dy * dy);
		let isHit = false;

		if (distance < this.image.height / 2 + enemySpaceship.image.height / 2) {
			isHit = true;
		}
		return isHit;
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
	draw = () => {
		ctx.drawImage(this.image, this.x, this.y);
	}

	/**
	 * Play explosion sound
	 */
	play = () => {
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
	killEnemy = () => {

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
	killPlayer = (player) => {

		let dx = this.x - player.x;
		let dy = this.y - player.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < this.image.height + player.image.height / 2) {
			let explosion = new Explosion(player.x, player.y);
			explosion.draw();
			explosion.play();
			player.alive = false;
			this.active = false;
		}
	}

	/**
	 * Draw a laser
	 */
	draw = () => {
		ctx.drawImage(this.image, this.x, this.y);
	}

	/**
	 * Update laser position
	 */
	update = (direction) => {
		if (direction === "up") {
			this.y -= this.velY;
		} else {
			this.y += this.velY;
		}
	}

	/**
	 * Player laser sound
	 */
	play = () =>  {
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
	put = () => {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
}

/**
 * Utils class used in script
 */
class Utils {

	/**
	   * Get random between min and max
	   * @param {*} min min available number
	   * @param {*} max max available number
	   */
	static random = (min, max) => {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	/**
	 * Add nbEnemies in enemies array
	 * @param {*} enemies array with enemies
	 * @param {*} nbEnemies number of enemies
	 */
	static addEnemies = (enemies, nbEnemies) => {

		let startY = 20;

		for (let i = 0; i < nbEnemies; i++) {
			enemies.push(new Enemy(Utils.random(50, innerWidth - 100),
									startY,
									Utils.random(1, 10),
									ENEMIES_COLORS[Utils.random(0, ENEMIES_COLORS.length)]));

			if (enemies.length % 4 == 0) {
				startY += 150;
			}
		}
		return enemies;
	}
}

/**
 * Mother class bonus
 * Give bonus to player
 */
class Bonus {

	/**
	 * Init a bonus
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.image = new Image();
	}

	/**
	 * Draw bonus
	 */
	draw() {
		ctx.drawImage(this.image, this.x, this.y);
	}

	/** 
	 * Update bonus position
	 */
	update() {
		this.y += 1;
	}
}

/**
 * Represent a nuclear bomb bonus
 */
class NuclearBomb extends Bonus {
	
	/**
	 * Init a nuclear bomb
	 */
	constructor(x, y) {
		super(x, y);
		this.image.src = "images/nuclear-bomb.png";
	}
}

/**
 * Represent the current game 
 */
class Game {

	/**
	 * Loop game
	 */
	static play = () => {

		let randBonus = Utils.random(0, 10000);
		let randomValue = Utils.random(0, 500);

		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, width, height);

		for (let i = 0; i < 2; i++) {
			new Star(Utils.random(1, width),
				Utils.random(1, height),
				Utils.random(1, 5)).put();
		}

		scoreText.innerHTML = "Score : " + score;

		/**
		 * Animate enemies
		 */
		for (let i = 0; i < enemies.length; i++) {
			enemies[i].draw();
			enemies[i].update();

			// Check if player hit an enemy
			if (player.hitObject(enemies[i])) {
				player.alive = false;
				let explosion = new Explosion(this.x, this.y);
				explosion.draw();
				explosion.play();
			}

			// Enemies shoot
			if (score > 0) {
				if (randomValue >= 220 && randomValue <= 230) {
					randomValue = Utils.random(0, enemies.length);
					enemies[randomValue].shoot(enemiesLasers);
				}
			}
			if (enemies[i].y + enemies[i].image.height >= height) {
				player.alive = false;
			}
		}

		// Enemies down
		if (score > 0) {
			if (randomValue == 457) {
				enemies.forEach(enemy => enemy.y += 150);
			}
		}

		if (enemies.length <= NB_ENEMIES / 3) {
			Utils.addEnemies(enemies, NB_ENEMIES / 3);
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

		// add bonus
		if (randBonus === 9874) {
			let bonus = new NuclearBomb(Utils.random(0, width), Utils.random(0, height / 3));
			allBonus.push(bonus);
		}

		// display bonus
		for (let i = 0; i < allBonus.length; i++) {
			if (allBonus[i].y > height) {
				allBonus.splice(i, 1);
			} else {
				allBonus[i].draw();
				allBonus[i].update();
			}

			// apply bonus
			if (player.hitObject(allBonus[i])) {
				score += enemies.length;
				enemies = [];
				allBonus.splice(i, 1);
				Utils.addEnemies(enemies, NB_ENEMIES);
			}
		}

		player.draw();
		player.update();
		player.checkBounds();

		if (player.alive) {
			requestAnimationFrame(this.play);
		} else {
			this.loose();
		}
	}

	/**
	 * When player loose
	 */
	static loose = () => {
		loose.textContent = "You loose ! ";
	}
}

const NB_ENEMIES = 12;
let score = 0;
let enemies = [];
let playerLasers = [];
let enemiesLasers = [];
let allBonus = [];
let player = new Player(width / 2.2, height / 1.2, 5, "blue");

player.setControls();
Utils.addEnemies(enemies, NB_ENEMIES);

Game.play();