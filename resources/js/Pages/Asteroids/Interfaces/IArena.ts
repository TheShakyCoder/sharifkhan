import P5 from "p5";

export interface IArena {
    width: number,
    height: number,
    frameRate: number,
    asteroidCount: number,
    maxAsteroids: number,
    playing: boolean
}
