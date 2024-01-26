import P5 from "p5";
import {IArena} from "./IArena";

export interface IBody {
    position: P5.Vector,
    vector: P5.Vector,
    radius: number,
    life: number,
    move(sketch: P5): void,
    edges(arena: IArena, die: boolean): boolean
}
