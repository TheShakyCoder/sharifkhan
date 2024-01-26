import P5 from "p5";
import {IRocket} from "../Interfaces/IRocket";
import {Body} from "./Body";

export class Rocket extends Body implements IRocket {
    constructor(position: P5.Vector, vector: P5.Vector, radius: number, life: number) {
        super(position, vector, radius, life);
    }
}
