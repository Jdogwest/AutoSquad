import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private restartBtn!: Phaser.GameObjects.Container;
  private menuBtn!: Phaser.GameObjects.Container;

  constructor() {
    super('GameOverScene');
  }

  create() {
    // === Заголовок ===
    this.titleText = this.add
      .text(0, 0, 'GAME OVER', {
        fontSize: '48px',
        color: '#ef4444',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // === Restart ===
    this.restartBtn = this.createButton(
      'RESTART',
      () => this.scene.start('GameScene')
    );

    // === Main Menu ===
    this.menuBtn = this.createButton(
      'MAIN MENU',
      () => this.scene.start('MainMenuScene')
    );

    // === Первичное размещение ===
    this.layout();

    // === Подписка на ресайз ===
    this.scale.on('resize', this.layout, this);
  }

  private layout() {
    const { width, height } = this.scale;

    this.titleText.setPosition(width / 2, height / 2 - 120);

    this.restartBtn.setPosition(width / 2, height / 2);
    this.menuBtn.setPosition(width / 2, height / 2 + 70);
  }

  private createButton(
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.add
      .rectangle(0, 0, 240, 50, 0x374151)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(0, 0, label, {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x4b5563));
    bg.on('pointerout', () => bg.setFillStyle(0x374151));
    bg.on('pointerdown', onClick);

    return this.add
      .container(0, 0, [bg, text])
      .setScrollFactor(0);
  }
}