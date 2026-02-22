import Phaser from 'phaser';

export class EnemyBullet {
  private sprite: Phaser.GameObjects.Rectangle;
  private speed = 250;
  private damage = 15;
  private alive = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    currentWave: number
  ) {
    this.sprite = scene.add.rectangle(x, y, 6, 6, 0xef4444);
    scene.physics.add.existing(this.sprite);

    this.damage *= Math.round(1.1 ** (currentWave / 5));
    this.speed *= Math.round(1.05 ** currentWave);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    const dx = targetX - x;
    const dy = targetY - y;
    const len = Math.sqrt(dx * dx + dy * dy);

    body.setVelocity((dx / len) * this.speed, (dy / len) * this.speed);
  }

  update() {
    if (!this.alive) return;
  }

  tryHit(playerPos: { x: number; y: number }): boolean {
    if (!this.alive) return false;

    const dist = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      playerPos.x,
      playerPos.y
    );

    if (dist < 12) {
      this.destroy();
      return true;
    }

    return false;
  }

  getDamage() {
    return this.damage;
  }

  destroy() {
    if (!this.alive) return;
    this.alive = false;
    this.sprite.destroy();
  }
}