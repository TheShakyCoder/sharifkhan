import {IBody} from "./IBody";
import {IRocket} from "./IRocket";
import P5 from "p5";
import {IShip} from "./IShip";

export interface IAsteroid extends IBody {
    distanceSquared: number,
    collide(sketch: P5, rockets: IRocket[]): number,
    damage(hit: number): boolean
    hitMe(sketch: P5, me: IShip): boolean
}
