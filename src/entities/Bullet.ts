import Phaser from 'phaser';

export class Bullet {
  private sprite: Phaser.GameObjects.Rectangle;
  private speed = 400;
  private isAlive = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetX: number,
    targetY: number
  ) {
    this.sprite = scene.add.rectangle(x, y, 6, 6, 0xffffff);
    scene.physics.add.existing(this.sprite);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    body.setVelocity(
      (dx / distance) * this.speed,
      (dy / distance) * this.speed
    );
  }

  update() {
    if (!this.isAlive) return;
  }

  destroy() {
    if (!this.isAlive) return;

    this.isAlive = false;
    this.sprite.destroy();
  }

  getPosition() {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
    };
  }

  getIsAlive() {
    return this.isAlive;
  }
}