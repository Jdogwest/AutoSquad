import { BossEnemy } from '../entities/BossEnemy';
import { BossHpBar } from '../ui/BossHpBar';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { EnemyType } from '../infos/EnemyType';
import { HealPickup } from '../entities/HealPickup';
import { Player } from '../entities/Player';
import { ShopUI } from '../ui/ShopUI';
import { UpgradeConfig, getUpgradeCost } from '../infos/UpgradeConfig';
import Phaser from 'phaser';
import type { SaveData } from '../infos/SaveData';

const HEAL_PROCENT = 10;
const NORMAL_WAVE_TEXT_Y = 40;
const BOSS_WAVE_TEXT_Y = 60;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private bullets: Bullet[] = [];

  private heals: HealPickup[] = [];

  private enemies: Enemy[] = [];
  private boss?: BossEnemy;
  private spawnTimer = 0;
  private spawnInterval = 2000; // 2 секунды

  private gold = 0;

  private currentWave = 1;
  private enemiesToSpawn = 0;
  private enemiesSpawned = 0;
  private enemiesKilled = 0;
  
  private waveInProgress = false;

  private shopUI?: ShopUI;
  private bossHpBar?: BossHpBar;
  
  private waveText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private hpText!: Phaser.GameObjects.Text;

  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private uiMargin = 16;

  constructor() {
    super('GameScene');
  }

  create() {
    this.scale.on('resize', this.onResize, this);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as any;

    // === Player ===
    this.player = new Player(
      this,
      this.scale.width / 2,
      this.scale.height / 2
    );

    // === UI ===
    this.hpText = this.add.text(0, 0, '', {
      fontSize: '20px',
      color: '#ffffff',
    }).setScrollFactor(0);

    this.goldText = this.add.text(0, 0, '', {
      fontSize: '20px',
      color: '#facc15',
    }).setScrollFactor(0);

    this.waveText = this.add.text(0, 0, '', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0);

    this.updateHpText();
    this.updateGoldText();

    this.loadProgress();
    this.layoutUI();

    this.startWave();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.clearEnemies();
    });
  }

  update(time: number, delta: number) {
    this.player.update(this.cursors, this.wasd);

    // === Спавн врагов ===
    this.spawnTimer += delta;
    if (this.waveInProgress) {
      this.spawnTimer += delta;

      if (
        this.spawnTimer >= this.spawnInterval &&
        this.enemiesSpawned < this.enemiesToSpawn
      ) {
        this.spawnTimer = 0;
        this.spawnEnemy();
        this.enemiesSpawned++;
      }
    }

    const playerPos = this.player.getPosition();

    const target =
      this.boss && this.boss.isAlive()
        ? this.boss
        : this.findNearestEnemy();

    if (target && this.player.canShoot(time)) {
      const playerPos = this.player.getPosition();
      const targetPos = target.getPosition();

      const bullet = new Bullet(
        this,
        playerPos.x,
        playerPos.y,
        targetPos.x,
        targetPos.y
      );

      this.bullets.push(bullet);
      this.player.shoot(time);
    }
    // === Обновление врагов ===
    for (const enemy of this.enemies) {
      enemy.update(playerPos.x, playerPos.y);

      if (enemy.tryAttack(playerPos, time)) {
        this.player.takeDamage(enemy.getDamage());
        this.updateHpText();
      }
    }

    if (this.boss) {
      this.boss.update(playerPos, time);

      const dmg = this.boss.tryHitPlayer(playerPos);
      if (dmg > 0) {
        this.player.takeDamage(dmg);
        this.updateHpText();
      }
    }

    for (const heal of this.heals) {
      if (heal.tryPickup(playerPos)) {
        this.player.heal(HEAL_PROCENT);
        this.updateHpText();
      }
    }

    for (const bullet of this.bullets) {
      if (!bullet.getIsAlive()) continue;
      const bulletPos = bullet.getPosition();

      if (this.boss && this.boss.isAlive()) {
        const bossPos = this.boss.getPosition();
        const dx = bossPos.x - bulletPos.x;
        const dy = bossPos.y - bulletPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) {
          this.boss.takeDamage(this.player.getDamage());
          this.bossHpBar?.update(this.boss.getHp());
          bullet.destroy();

          if (!this.boss.isAlive()) {
            this.gold += this.boss.getReward();
            this.boss = undefined;
            this.endWave();
          }

          break;
        }
      }

      for (const enemy of this.enemies) {
        if (!enemy.isAliveEnemy()) continue;

        const enemyPos = enemy.getPosition();
        const dx = enemyPos.x - bulletPos.x;
        const dy = enemyPos.y - bulletPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 16) {
          enemy.takeDamage(this.player.getDamage());

          if (!enemy.isAliveEnemy()) {
            this.gold += enemy.getReward();
            this.updateGoldText();

            this.enemiesKilled++;
            this.checkWaveComplete();

            // === DROP HEAL ===
            if (Math.random() < 0.1) {
              const pos = enemy.getPosition();
              this.heals.push(new HealPickup(this, pos.x, pos.y));
            }
          }

          bullet.destroy();
          break;
        }
      }
    }

    if (this.player.getHp() <= 0) {
      this.handleGameOver();
      return;
    }
  }

  private startWave() {
    this.waveInProgress = true;
    this.spawnTimer = 0;

    if (this.currentWave % 5 === 0) {
      this.waveText.setText(`BOSS WAVE ${this.currentWave}`);

      this.boss = new BossEnemy(
        this,
        this.scale.width / 2,
        120,
        this.currentWave
      );

      this.bossHpBar = new BossHpBar(
        this,
        this.boss.getMaxHp()
      );

      this.layoutUI();
      return;
    }

    this.enemiesToSpawn = 5 + this.currentWave * 2;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;

    this.waveText.setText(`Wave ${this.currentWave}`);
  }

  private checkWaveComplete() {
    if (
      this.enemiesKilled >= this.enemiesToSpawn &&
      this.enemies.every(e => !e.isAliveEnemy())
    ) {
      this.endWave();
    }
  }

  private endWave() {
    this.waveInProgress = false;
    this.waveText.setText(`Wave ${this.currentWave} cleared`);
    
    if (this.bossHpBar) {
      this.bossHpBar?.destroy();
      this.bossHpBar = undefined;
      this.waveText.setY(NORMAL_WAVE_TEXT_Y);
      this.waveText.setText(`Wave ${this.currentWave} cleared`);
    }

    this.enterShopMode();
  }

  private updateHpText() {
    const hp = this.player.getHp();
    const maxHp = this.player.getMaxHp();
    this.hpText.setText(`HP: ${hp} / ${maxHp}`);
  }

  private updateGoldText() {
    this.goldText.setText(`Gold: ${this.gold}`);
  }

  private spawnEnemy() {
    const margin = 40;
    const width = this.scale.width;
    const height = this.scale.height;

    const side = Phaser.Math.Between(0, 3);

    let x = 0;
    let y = 0;

    switch (side) {
      case 0: // сверху
        x = Phaser.Math.Between(margin, width - margin);
        y = -margin;
        break;
      case 1: // снизу
        x = Phaser.Math.Between(margin, width - margin);
        y = height + margin;
        break;
      case 2: // слева
        x = -margin;
        y = Phaser.Math.Between(margin, height - margin);
        break;
      case 3: // справа
        x = width + margin;
        y = Phaser.Math.Between(margin, height - margin);
        break;
    }

    const types = [
      EnemyType.Fast,
      EnemyType.Shooter,
      EnemyType.Tank,
    ];

    const type = Phaser.Utils.Array.GetRandom(types);

    const enemy = new Enemy(this, x, y, type, this.currentWave);
    this.enemies.push(enemy);
  }

  private clearEnemies() {
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
  }

  private findNearestEnemy(): Enemy | null {
    let nearest: Enemy | null = null;
    let minDist = Infinity;

    const playerPos = this.player.getPosition();

    for (const enemy of this.enemies) {
      if (!enemy.isAliveEnemy()) continue;

      const pos = enemy.getPosition();
      const dx = pos.x - playerPos.x;
      const dy = pos.y - playerPos.y;
      const dist = dx * dx + dy * dy;

      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private startNextWave() {
    this.shopUI?.destroy();
    this.shopUI = undefined;

    this.setBattleUIVisible(true);

    this.saveProgress();

    this.currentWave++;
    this.startWave();
  }

  private saveProgress() {
    const data: SaveData = {
      gold: this.gold,
      upgrades: this.player.getUpgrades(),
    };

    localStorage.setItem('autosquad-save', JSON.stringify(data));
  }

  private loadProgress() {
    const raw = localStorage.getItem('autosquad-save');
    if (!raw) return;

    const data = JSON.parse(raw);

    this.gold = data.gold ?? 0;
    this.updateGoldText();

    if (data.upgrades) {
      this.player.applyUpgrades(data.upgrades);
      this.updateHpText();
    }
  }

  private enterShopMode() {
    this.setBattleUIVisible(false);

    this.shopUI = new ShopUI(
      this,
      0,
      0,
      () => this.gold,
      () => this.player.getUpgradeLevels(),
      () => this.tryUpgradeAttack(),
      () => this.tryUpgradeHp(),
      () => this.tryUpgradeFireRate(),
      () => this.startNextWave()
    );

    this.layoutUI();
  }

  private tryUpgradeAttack() {
    const level = this.player.getUpgrades().damage;
    const cfg = UpgradeConfig.attack;
    const cost = getUpgradeCost(cfg.baseCost, cfg.growth, level);

    if (!this.player.canUpgradeDamage()) return;
    if (this.gold < cost) return;

    this.gold -= cost;
    this.player.upgradeDamage();

    this.updateGoldText();
    this.shopUI?.update();
  }

  private tryUpgradeHp() {
    const level = this.player.getUpgrades().maxHp;
    const cfg = UpgradeConfig.hp;
    const cost = getUpgradeCost(cfg.baseCost, cfg.growth, level);

    if (!this.player.canUpgradeHp()) return;
    if (this.gold < cost) return;

    this.gold -= cost;
    this.player.upgradeMaxHp();

    this.updateGoldText();
    this.updateHpText();
    this.shopUI?.update();
  }

  private tryUpgradeFireRate() {
    const level = this.player.getUpgrades().fireRate;
    const cfg = UpgradeConfig.fireRate;
    const cost = getUpgradeCost(cfg.baseCost, cfg.growth, level);

    if (!this.player.canUpgradeFireRate()) return;
    if (this.gold < cost) return;

    this.gold -= cost;
    this.player.upgradeFireRate();

    this.updateGoldText();
    this.shopUI?.update();
  }

  private setBattleUIVisible(visible: boolean) {
    this.hpText.setVisible(visible);
    this.goldText.setVisible(visible);
    this.waveText.setVisible(visible);
  }

  private handleGameOver() {
    this.bossHpBar?.destroy();
    this.bossHpBar = undefined;
  }

  private layoutUI() {
    const { width, height } = this.scale;

    this.hpText.setPosition(this.uiMargin, this.uiMargin);
    this.goldText.setPosition(this.uiMargin, this.uiMargin + 28);

    this.waveText.setPosition(width / 2, 32);

    this.bossHpBar?.layout(width);

    this.shopUI?.layout(width, height);
  }

  private onResize(gameSize: Phaser.Structs.Size) {
    const { width, height } = gameSize;

    this.physics.world.setBounds(0, 0, width, height);

    const body = (this.player as any)?.sprite?.body as Phaser.Physics.Arcade.Body;
    body?.setCollideWorldBounds(true);

    this.layoutUI();
  }
}