import Phaser from "phaser";

import config from "./config";

const STARTING_LIFE_COUNT = 3;

const gameScene = new Phaser.Scene("Game");

gameScene.init = function ({ score = 0, lives = 3 }) {
  this.maxSpeed = 1.6;
  this.minSpeed = 0.5;

  this.maxY = 265;
  this.minY = 75;

  this.playerSpeed = 4;

  this.playerScore = score;
  this.playerLives = lives;

  this.isRestarting = false;
  this.transitioning = true;
};

gameScene.preload = function () {
  this.load.image("background", "assets/images/background.png");
  this.load.image("player", "assets/images/player.png");
  this.load.image("enemy", "assets/images/dragon.png");
  this.load.image("goal", "assets/images/treasure.png");
  this.load.image("heart", "assets/images/heart.png");
};

gameScene.create = function () {
  this.cameras.main.fadeIn(500, 0, 0, 0);
  this.cameras.main.on(
    "camerafadeincomplete",
    function () {
      this.transitioning = false;
    },
    this
  );

  const gameHeight = this.sys.game.config.height;
  const gameWidth = this.sys.game.config.width;

  const bg = this.add.sprite(0, 0, "background");
  bg.setPosition(gameWidth / 2, gameHeight / 2);

  this.player = this.add.sprite(50, gameHeight / 2, "player");
  this.player.setScale(0.65);
  this.player.setDepth(10);

  this.goal = this.add.sprite(550, gameHeight / 2, "goal");
  this.goal.setScale(0.75);

  this.enemies = new Phaser.GameObjects.Group(gameScene, {
    key: "enemy",
    quantity: 4,
    setXY: {
      x: 120,
      y: 100,
      stepX: 120,
      stepY: 20,
    },
  });

  // Render Score
  this.scoreCount = new Phaser.GameObjects.Group(gameScene);

  for (let i = 0; i < this.playerScore; i++) {
    this.scoreCount.add(
      new Phaser.GameObjects.Sprite(
        gameScene,
        600 - i * 50,
        40,
        "goal"
      ).setScale(0.5),
      true
    );
  }

  // Render Lives
  this.lifeCount = new Phaser.GameObjects.Group(gameScene);

  for (let i = 0; i < this.playerLives; i++) {
    this.lifeCount.add(
      new Phaser.GameObjects.Sprite(
        gameScene,
        600 - i * 50,
        330,
        "heart"
      ).setScale(0.1),
      true
    );
  }

  Phaser.Actions.Call(
    this.enemies.getChildren(),
    function (enemy) {
      enemy.setScale(0.65);
      enemy.flipX = true;

      enemy.speed = this.minSpeed + Math.random() * this.maxSpeed;
      enemy.direction = Math.random() > 0.5 ? 1 : -1;
    },
    this
  );
};

gameScene.restart = function (gotHit = false) {
  this.isRestarting = true;

  if (gotHit) {
    return Promise.all([this.shake(), this.fadeOut()]).then(
      this.restartScene.bind(this)
    );
  } else {
    return this.fadeOut().then(this.restartScene.bind(this));
  }
};

gameScene.restartScene = function () {
  let score = this.playerScore;
  let lives = this.playerLives;

  if (!lives) {
    score = 0;
    lives = STARTING_LIFE_COUNT;
  }

  this.scene.restart({
    score,
    lives,
  });
};

gameScene.fadeOut = function () {
  return new Promise((resolve) => {
    this.cameras.main.fade(450, 0, 0, 0);
    this.cameras.main.on("camerafadeoutcomplete", resolve);
  });
};

gameScene.shake = function () {
  return new Promise((resolve) => {
    this.cameras.main.shake(500);
    this.cameras.main.on("camerashakecomplete", resolve);
  });
};

gameScene.update = function () {
  if (this.isRestarting || this.transitioning) {
    return;
  }

  const enemies = this.enemies.getChildren();
  const num = enemies.length;

  const playerBox = this.player.getBounds();
  const goalBox = this.goal.getBounds();

  if (this.input.activePointer.isDown) {
    this.player.setX(this.player.x + this.playerSpeed);
  }

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerBox, goalBox)) {
    this.playerScore++;
    return this.restart();
  }

  for (let i = 0; i < num; i++) {
    let enemy = enemies[i];
    enemy.setY(enemy.y + enemy.speed * enemy.direction);

    if (enemy.y < this.minY && enemy.direction === -1) {
      enemy.direction = enemy.direction * -1;
    }

    if (enemy.y > this.maxY && enemy.direction === 1) {
      enemy.direction = enemy.direction * -1;
    }

    if (
      Phaser.Geom.Intersects.RectangleToRectangle(playerBox, enemy.getBounds())
    ) {
      this.playerLives--;
      return this.restart(true);
    }
  }
};

const gameConfig = {
  ...config,
  scene: gameScene,
};

const game = new Phaser.Game(gameConfig);
