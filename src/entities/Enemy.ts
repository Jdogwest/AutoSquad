import Phaser from 'phaser';
import { EnemyConfig } from '../infos/EnemyConfig';
import type { EnemyType } from '../infos/EnemyType';

export class Enemy {
  private sprite: Phaser.GameObjects.Rectangle;
  private speed = 100;
  private damage = 10;
  private attackRange = 30;
  private attackCooldown = 1000; // ms
  private lastAttackTime = 0;
  private isAlive = true;
  private hp = 30;
  private reward = 5;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType,
    currentWave: number
  ) {
    const config = EnemyConfig[type];

    this.hp = Math.round(config.hp * (1.15 ** currentWave));
    this.speed = Math.round(config.speed * (1.05 ** currentWave));
    this.damage = Math.round(config.damage * (1.1 ** currentWave));
    this.attackRange = Math.round(config.attackRange);
    this.reward = Math.round(config.reward + 1 * currentWave);

    this.sprite = scene.add.rectangle(x, y, 28, 28, 0xef4444);
    scene.physics.add.existing(this.sprite);
  }

  update(targetX: number, targetY: number) {
    if (!this.isAlive) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    const dx = targetX - this.sprite.x;
    const dy = targetY - this.sprite.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      body.setVelocity(0);
      return;
    }

    const vx = (dx / distance) * this.speed;
    const vy = (dy / distance) * this.speed;

    body.setVelocity(vx, vy);
  }

  tryAttack(target: { x: number; y: number }, time: number): boolean {
    if (!this.isAlive) return false;

    const dist = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      target.x,
      target.y
    );

    if (dist < this.attackRange && time > this.lastAttackTime + this.attackCooldown) {
      this.lastAttackTime = time;
      return true;
    }

    return false;
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

  takeDamage(amount: number) {
    if (!this.isAlive) return;

    this.hp -= amount;

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    if (!this.isAlive) return;

    this.isAlive = false;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.enable = false;
    }

    this.sprite.destroy();
  }

  isAliveEnemy() {
    return this.isAlive;
  }

  getReward() {
    return this.reward;
  }

  getDamage() {
    return this.damage;
  }
}