import P5 from "p5";

export interface iAsteroid {
    name: string,
    position: P5.Vector,
    vector: P5.Vector,
    radius: number,
    distanceSquared: number,
    life: number
}
