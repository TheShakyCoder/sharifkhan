import {IBody} from "./IBody";

export interface IShip extends IBody {

    shieldRadius: number,
    velocity: number,
    angle: number
}
