import Phaser from 'phaser';

export class BossHpBar {
  private bg: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  private maxHp: number;
  private width = 400;
  private height = 20;

  constructor(scene: Phaser.Scene, maxHp: number) {
    this.maxHp = maxHp;

    const x = scene.scale.width / 2 - this.width / 2;
    const y = 20;

    this.bg = scene.add
      .rectangle(x, y, this.width, this.height, 0x1f2937)
      .setOrigin(0);

    this.fill = scene.add
      .rectangle(x, y, this.width, this.height, 0xdc2626)
      .setOrigin(0);

    this.text = scene.add
      .text(scene.scale.width / 2, y + this.height / 2, 'BOSS', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
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