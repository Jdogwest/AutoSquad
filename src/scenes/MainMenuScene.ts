import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Container;
  private hintText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainMenuScene');
  }

  create() {
    // === Заголовок ===
    this.titleText = this.add
      .text(0, 0, 'AUTO SQUAD', {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // === Кнопка Start ===
    this.startButton = this.createButton(
      'START GAME',
      () => this.scene.start('GameScene')
    );

    // === Подсказка управления ===
    this.hintText = this.add
      .text(0, 0, 'Move: WASD\nAuto-shoot enabled', {
        fontSize: '16px',
        color: '#9ca3af',
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // === Первичное размещение ===
    this.layout();

    // === Реакция на ресайз ===
    this.scale.on('resize', this.layout, this);
  }

  private layout() {
    const { width, height } = this.scale;

    this.titleText.setPosition(width / 2, height / 2 - 120);
    this.startButton.setPosition(width / 2, height / 2);
    this.hintText.setPosition(width / 2, height / 2 + 90);
  }

  private createButton(
    label: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const bg = this.add
      .rectangle(0, 0, 220, 50, 0x374151)
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