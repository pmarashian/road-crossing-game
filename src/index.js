import Phaser from "phaser";

import config from "./config";

const gameScene = new Phaser.Scene("Game");

gameScene.preload = function () {
  this.load.image("background", "assets/images/background.png");
  this.load.image("player", "assets/images/player.png");
};

gameScene.create = function () {
  const gameHeight = this.sys.game.config.height;
  const gameWidth = this.sys.game.config.width;

  const bg = this.add.sprite(0, 0, "background");
  bg.setPosition(gameWidth / 2, gameHeight / 2);
};

const gameConfig = {
  ...config,
  scene: gameScene,
};

const game = new Phaser.Game(gameConfig);
