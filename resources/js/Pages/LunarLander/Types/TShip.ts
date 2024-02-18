import P5 from "p5";

export type TShip = {
    position: P5.Vector,
    vector: P5.Vector,
    acceleration: P5.Vector,
    thrust: number,
    radius: number,
    legHeight: number,
    legWidth: number,
    angle: number,
    fuel: number,
    hasCrashed: boolean,
    hasLanded: boolean,
    score: number

    draw(sketch: P5): void,
    drawFlame(sketch: P5): void,
    revolve(sketch: P5, input: P5.Vector): void
}
