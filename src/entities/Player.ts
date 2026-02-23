import Phaser from 'phaser';
import type { SaveUpgrades } from '../infos/SaveData';
import type { UpgradesLevels } from '../infos/UpgradesLevels';

export class Player {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Rectangle;
  private speed = 200;
  private maxHp = 100;
  private hp = 100;
  private isDead = false;
  private shootCooldown = 500; // ms
  private lastShotTime = 0;
  private damage = 10;

  private damageLevel = 0;
  private maxDamageLevel = 20;
  private hpLevel = 0;
  private maxHpLevel = 10;
  private fireRateLevel = 0;
  private maxFireRateLevel = 10;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    
    this.sprite = scene.add.rectangle(x, y, 32, 32, 0x4ade80);
    scene.physics.add.existing(this.sprite);
  }

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd: {
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
    }
  ) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    body.setVelocity(0);

    if (cursors.left?.isDown || wasd.left?.isDown) {
      body.setVelocityX(-this.speed);
    } else if (cursors.right?.isDown || wasd.right?.isDown) {
      body.setVelocityX(this.speed);
    }

    if (cursors.up?.isDown || wasd.up?.isDown) {
      body.setVelocityY(-this.speed);
    } else if (cursors.down?.isDown || wasd.down?.isDown) {
      body.setVelocityY(this.speed);
    }
  }

  getPosition() {
    return {
        x: this.sprite.x,
        y: this.sprite.y,
    };
  }

  takeDamage(amount: number) {
    if (this.isDead) return;

    this.hp -= amount;

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    if (this.isDead) return;

    this.isDead = true;

    this.scene.scene.start('GameOverScene');
  }

  getHp() {
    return this.hp;
  }

  getMaxHp() {
    return this.maxHp;
  }

  canShoot(time: number) {
    return time - this.lastShotTime >= this.shootCooldown;
  }

  shoot(time: number) {
    this.lastShotTime = time;
  }

  upgradeDamage() {
    this.damageLevel++;
  }

  upgradeMaxHp() {
    this.hpLevel++;
    this.maxHp += 20;
    this.hp += 20;
  }

  upgradeFireRate() {
    this.fireRateLevel++;
    this.shootCooldown = Math.max(100, this.shootCooldown - 50);
  }

  getDamage() {
    return this.damage;
  }

  getUpgrades(): SaveUpgrades {
    return {
      damage: this.damageLevel,
      maxHp: this.hpLevel,
      fireRate: this.fireRateLevel,
    };
  }

  getUpgradeLevels(): UpgradesLevels {
    return {
      attack: { current: this.damageLevel, max: this.maxDamageLevel },
      fireRate: { current: this.fireRateLevel, max: this.maxFireRateLevel },
      hp: { current: this.hpLevel, max: this.maxHpLevel },
    };
  }

  applyUpgrades(upgrades: SaveUpgrades) {
    for (let i = 0; i < upgrades.damage; i++) this.upgradeDamage();
    for (let i = 0; i < upgrades.maxHp; i++) this.upgradeMaxHp();
    for (let i = 0; i < upgrades.fireRate; i++) this.upgradeFireRate();
  }

  canUpgradeFireRate() {
    return this.fireRateLevel < this.maxFireRateLevel;
  }

  canUpgradeDamage() {
    return this.damageLevel < this.maxDamageLevel;
  }

  canUpgradeHp() {
    return this.hpLevel < this.maxHpLevel;
  }

  heal(procent: number) {
    if (this.isDead) return;

    this.hp = Math.min(this.hp + Math.round(this.maxHp * (procent / 100)), this.maxHp);
  }
}