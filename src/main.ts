import Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game', // div id в HTML
  backgroundColor: '#020617',

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },

  physics: {
    default: 'arcade', // 🔥 ВАЖНО
    arcade: {
      debug: false,
    },
  },

  scene: [
    MainMenuScene,
    GameScene,
    GameOverScene,
  ],
};

new Phaser.Game(config);