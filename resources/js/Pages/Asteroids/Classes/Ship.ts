import {Body} from "./Body";
import {IShip} from "../Interfaces/IShip";
import P5 from "p5";

export class Ship extends Body implements IShip {
    shieldRadius: number;
    velocity: number;
    angle: number;
    constructor(position: P5.Vector, vector: P5.Vector, radius: number, life: number, shieldRadius: number) {
        super(position, vector, radius, life);
        this.shieldRadius = shieldRadius
        this.velocity = 100
        this.angle = 0
    }
}
