export type SaveData = {
  gold: number;
  upgrades: SaveUpgrades
};

export type SaveUpgrades = {
    damage: number;
    maxHp: number;
    fireRate: number;
}