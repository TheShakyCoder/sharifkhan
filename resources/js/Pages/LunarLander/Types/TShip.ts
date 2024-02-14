import P5 from "p5";

export type TShip = {
    position: P5.Vector,
    vector: P5.Vector,
    acceleration: P5.Vector,
    thrust: number,
    radius: number,
    legs: number,
    angle: number,
    fuel: number,

    draw(sketch: P5, input: P5.Vector): void,
    revolve(sketch: P5, input: P5.Vector): void
}
