export type UpgradesLevels = {
    attack: StatLevels,
    fireRate: StatLevels,
    hp: StatLevels,
}

type StatLevels = {
    current: number; 
    max: number;
}