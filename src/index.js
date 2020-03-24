import Phaser from "phaser";

import config from "./config";

const gameScene = new Phaser.Scene("Game");

gameScene.init = function () {
  this.maxSpeed = 1.6;
  this.minSpeed = 0.5;

  this.maxY = 265;
  this.minY = 75;

  this.playerSpeed = 4;

  this.playerScore = 0;
};

gameScene.preload = function () {
  this.load.image("background", "assets/images/background.png");
  this.load.image("player", "assets/images/player.png");
  this.load.image("enemy", "assets/images/dragon.png");
  this.load.image("goal", "assets/images/treasure.png");
};

gameScene.create = function () {
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

  this.cameras.main.fadeFrom(1000, 0, 0, 0);
};

gameScene.restart = function () {
  console.log("BANG");
  this.cameras.main.fade(1000, 0, 0, 0);
  this.cameras.main.on(
    "camerafadeoutcomplete",
    function () {
      this.scene.restart();
    },
    this
  );
};

gameScene.update = function () {
  const enemies = this.enemies.getChildren();
  const num = enemies.length;

  const playerBox = this.player.getBounds();
  const goalBox = this.goal.getBounds();

  if (this.input.activePointer.isDown) {
    this.player.setX(this.player.x + this.playerSpeed);
  }

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerBox, goalBox)) {
    this.playerScore++;
    this.restart();
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
      this.restart();
    }
  }
};

const gameConfig = {
  ...config,
  scene: gameScene,
};

const game = new Phaser.Game(gameConfig);
