import Phaser from 'phaser';
import { EnemyBullet } from './EnemyBullet';

export class BossEnemy {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Rectangle;

  private hp = 800;
  private maxHp = 800;
  private isDead = false;

  private speed = 40;
  private preferredDistance = 200;

  private reward = 50;

  private currentWave;

  private shootCooldown = 1200;
  private lastShotTime = 0;

  private bullets: EnemyBullet[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, currentWave: number) {
    this.scene = scene;

    this.currentWave = currentWave;

    this.hp *= Math.round(1.15 ** (currentWave / 5));
    this.maxHp *= Math.round(1.15 ** (currentWave / 5));
    this.reward *= Math.round(1.05 ** (currentWave / 5));

    this.sprite = scene.add.rectangle(x, y, 80, 80, 0x991b1b);
    scene.physics.add.existing(this.sprite);
  }

  update(playerPos: { x: number; y: number }, time: number) {
    if (this.isDead) return;

    const dx = playerPos.x - this.sprite.x;
    const dy = playerPos.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.preferredDistance) {
        const nx = dx / dist;
        const ny = dy / dist;

        this.sprite.x += nx * this.speed * (this.scene.game.loop.delta / 1000);
        this.sprite.y += ny * this.speed * (this.scene.game.loop.delta / 1000);
    }

    if (time > this.lastShotTime + this.shootCooldown) {
        this.lastShotTime = time;

        this.bullets.push(
        new EnemyBullet(
            this.scene,
            this.sprite.x,
            this.sprite.y,
            playerPos.x,
            playerPos.y,
            this.currentWave
        )
        );
    }

    for (const bullet of this.bullets) {
        bullet.update();
    }
    }

  tryHitPlayer(playerPos: { x: number; y: number }): number {
    let damage = 0;

    for (const bullet of this.bullets) {
      if (bullet.tryHit(playerPos)) {
        damage += bullet.getDamage();
      }
    }

    return damage;
  }

  takeDamage(amount: number) {
    if (this.isDead) return;

    this.hp -= amount;
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    this.sprite.destroy();
  }

  isAlive() {
    return !this.isDead;
  }

  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  getReward() {
    return this.reward;
  }

  getHp() {
    return this.hp;
  }

  getMaxHp() {
    return this.maxHp;
  }
}