import Phaser from 'phaser'

const gameScene = new Phaser.Scene('Game');

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene,
};

const game = new Phaser.Game( config );