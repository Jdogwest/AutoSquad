export const UpgradeConfig = {
  attack: {
    baseCost: 20,
    growth: 1.15,
    maxLevel: 20,
  },
  hp: {
    baseCost: 20,
    growth: 1.15,
    maxLevel: 20,
  },
  fireRate: {
    baseCost: 20,
    growth: 1.2,
    maxLevel: 10,
  },
};

export function getUpgradeCost(
  base: number,
  growth: number,
  level: number
) {
  return Math.floor(base * Math.pow(growth, level));
}