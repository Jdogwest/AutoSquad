export class BossHpBar {
  private scene: Phaser.Scene;
  private bg: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  private maxHp: number;
  private width = 400;
  private height = 20;

  constructor(scene: Phaser.Scene, maxHp: number) {
    this.scene = scene;
    this.maxHp = maxHp;

    this.bg = scene.add.rectangle(0, 0, this.width, this.height, 0x1f2937)
      .setOrigin(0)
      .setScrollFactor(0);

    this.fill = scene.add.rectangle(0, 0, this.width, this.height, 0xdc2626)
      .setOrigin(0)
      .setScrollFactor(0);

    this.text = scene.add.text(0, 0, 'BOSS', {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0);
  }

  layout(screenWidth: number) {
    const x = screenWidth / 2 - this.width / 2;
    const y = 56;

    this.bg.setPosition(x, y);
    this.fill.setPosition(x, y);
    this.text.setPosition(screenWidth / 2, y + this.height / 2);
  }

  update(currentHp: number) {
    const ratio = Phaser.Math.Clamp(currentHp / this.maxHp, 0, 1);
    this.fill.width = this.width * ratio;
  }

  destroy() {
    this.bg.destroy();
    this.fill.destroy();
    this.text.destroy();
  }
}