import { EnemyType } from './EnemyType';

export const EnemyConfig = {
  [EnemyType.Fast]: {
    hp: 30,
    speed: 120,
    damage: 5,
    attackRange: 25,
    reward: 3,
  },

  [EnemyType.Shooter]: {
    hp: 60,
    speed: 60,
    damage: 10,
    attackRange: 120,
    reward: 6,
  },

  [EnemyType.Tank]: {
    hp: 150,
    speed: 30,
    damage: 20,
    attackRange: 35,
    reward: 12,
  },
};