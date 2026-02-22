import Phaser from 'phaser';
import { UpgradeProgressBar } from './UpgradeProgressBar';
import type { UpgradesLevels } from '../infos/UpgradesLevels';
import { getUpgradeCost, UpgradeConfig } from '../infos/UpgradeConfig';

export class ShopUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  private goldText!: Phaser.GameObjects.Text;

  private attackBar!: UpgradeProgressBar;
  private hpBar!: UpgradeProgressBar;
  private fireRateBar!: UpgradeProgressBar;

  private attackBtn!: {
    container: Phaser.GameObjects.Container;
    bg: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
  };

  private hpBtn!: {
    container: Phaser.GameObjects.Container;
    bg: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
  };

  private fireRateBtn!: {
    container: Phaser.GameObjects.Container;
    bg: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
  };

  private gold: () => number;
  private upgrades: () => UpgradesLevels;

  private onUpgradeAttack: () => void;
  private onUpgradeHp: () => void;
  private onUpgradeFireRate: () => void;
  private onStartWave: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    gold: () => number,
    upgrades: () => UpgradesLevels,
    onUpgradeAttack: () => void,
    onUpgradeHp: () => void,
    onUpgradeFireRate: () => void,
    onStartWave: () => void
  ) {
    this.scene = scene;
    this.gold = gold;
    this.upgrades = upgrades;
    this.onUpgradeAttack = onUpgradeAttack;
    this.onUpgradeHp = onUpgradeHp;
    this.onUpgradeFireRate = onUpgradeFireRate;
    this.onStartWave = onStartWave;

    this.container = scene.add.container(x, y);

    this.buildUI();
    this.update();
  }

  destroy() {
    this.container.destroy(true);
  }

  update() {
    const up = this.upgrades();

    this.goldText.setText(`Gold: ${this.gold()}`);

    const attackCost = getUpgradeCost(
      UpgradeConfig.attack.baseCost,
      UpgradeConfig.attack.growth,
      up.attack.current
    );

    const hpCost = getUpgradeCost(
      UpgradeConfig.hp.baseCost,
      UpgradeConfig.hp.growth,
      up.hp.current
    );

    const fireRateCost = getUpgradeCost(
      UpgradeConfig.fireRate.baseCost,
      UpgradeConfig.fireRate.growth,
      up.fireRate.current
    );

    this.attackBtn.text.setText(`Upgrade Attack\n(${attackCost})`);
    this.hpBtn.text.setText(`Upgrade HP\n(${hpCost})`);
    this.fireRateBtn.text.setText(`Upgrade Fire Rate\n(${fireRateCost})`);

    this.attackBar.update(up.attack.current);
    this.hpBar.update(up.hp.current);
    this.fireRateBar.update(up.fireRate.current);

    this.setButtonEnabled(this.attackBtn, up.attack.current < up.attack.max);
    this.setButtonEnabled(this.hpBtn, up.hp.current < up.hp.max);
    this.setButtonEnabled(this.fireRateBtn, up.fireRate.current < up.fireRate.max);
  }

  private buildUI() {
    const style = { fontSize: '18px', color: '#ffffff' };

    this.goldText = this.scene.add.text(0, 0, '', style);
    
    // === ATTACK ===
    this.attackBtn = this.createButton(0, 40, this.onUpgradeAttack);
    this.attackBar = new UpgradeProgressBar(
      this.scene,
      220,
      55,
      this.upgrades().attack.max,
      this.upgrades().attack.current
    );
    
    // === HP ===
    this.hpBtn = this.createButton(0, 90, this.onUpgradeHp);
    this.hpBar = new UpgradeProgressBar(
      this.scene,
      220,
      105,
      this.upgrades().hp.max,
      this.upgrades().hp.current
    );
    
    // === FIRE RATE ===
    this.fireRateBtn = this.createButton(0, 140, this.onUpgradeFireRate);
    this.fireRateBar = new UpgradeProgressBar(
      this.scene,
      220,
      155,
      this.upgrades().fireRate.max,
      this.upgrades().fireRate.current
    );
    
    const startBtn = this.createButton(0, 200, this.onStartWave);
    startBtn.text.setText('Start Wave');
    
    this.container.add([
      this.goldText,
      this.attackBtn.container,
      this.attackBar,
      this.hpBtn.container,
      this.hpBar,
      this.fireRateBtn.container,
      this.fireRateBar,
      startBtn.container,
    ]);
  }

  private createButton(
    x: number,
    y: number,
    onClick: () => void
  ) {
    const WIDTH = 200;
    const HEIGHT = 32;

    const bg = this.scene.add
      .rectangle(0, 0, WIDTH, HEIGHT, 0x374151)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });

    const text = this.scene.add.text(0, 0, '', {
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: WIDTH - 20 },
      align: 'center',
    }).setOrigin(0.5);

    text.setPosition(WIDTH / 2, HEIGHT / 2);

    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => bg.setFillStyle(0x4b5563));
    bg.on('pointerout', () => bg.setFillStyle(0x374151));

    const container = this.scene.add.container(x, y, [bg, text]);

    return { container, bg, text };
  }

  private setButtonEnabled(
    button: { bg: Phaser.GameObjects.Rectangle },
    enabled: boolean
  ) {
    button.bg.disableInteractive();

    if (enabled) {
      button.bg.setFillStyle(0x374151);
      button.bg.setInteractive({ useHandCursor: true });
    } else {
      button.bg.setFillStyle(0x1f2937);
    }
  }
}