import Phaser from 'phaser';

export class HealPickup {
  private sprite: Phaser.GameObjects.Triangle;
  private alive = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {

    this.sprite = scene.add.triangle(
      x,
      y,
      0, 20,
      10, 0,
      20, 20,
      0x22c55e
    );

    scene.physics.add.existing(this.sprite);
  }

  tryPickup(playerPos: { x: number; y: number }): boolean {
    if (!this.alive) return false;

    const dist = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      playerPos.x,
      playerPos.y
    );

    if (dist < 20) {
      this.destroy();
      return true;
    }

    return false;
  }

  destroy() {
    if (!this.alive) return;
    this.alive = false;
    this.sprite.destroy();
  }
}