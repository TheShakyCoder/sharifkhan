import P5 from "p5";
import {iObject} from "./iObject";

export interface iAsteroid extends iObject {
    name: string,
    distanceSquared: number,
}
