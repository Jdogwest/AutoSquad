export const EnemyType = {
  Fast: 'fast',
  Shooter: 'shooter',
  Tank: 'tank',
} as const;

export type EnemyType = typeof EnemyType[keyof typeof EnemyType];