import Phaser from 'phaser';

export class UpgradeProgressBar extends Phaser.GameObjects.Container {
  private segments: Phaser.GameObjects.Rectangle[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    max: number,
    current: number
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    const size = 10;
    const gap = 4;

    for (let i = 0; i < max; i++) {
      const rect = scene.add.rectangle(
        i * (size + gap),
        0,
        size,
        size,
        i < current ? 0xfacc15 : 0x4b5563 // жёлтый / серый
      ).setOrigin(0, 0.5);

      this.segments.push(rect);
      this.add(rect);
    }
  }

  update(current: number) {
    this.segments.forEach((seg, i) => {
      seg.setFillStyle(i < current ? 0xfacc15 : 0x4b5563);
    });
  }
}