import P5 from "p5";
import {IBody} from "../Interfaces/IBody";
import {IArena} from "../Interfaces/IArena";

export abstract class Body implements IBody {
    position: P5.Vector;
    vector: P5.Vector;
    radius: number;
    life: number;

    protected constructor(position: P5.Vector, vector: P5.Vector, radius: number, life: number) {
        this.position = position
        this.vector = vector
        this.radius = radius
        this.life = life
    }

    move(sketch: P5): void {
        const newVector = sketch.createVector(this.vector.x * sketch.deltaTime / 1000, this.vector.y * sketch.deltaTime / 1000)
        this.position.add(newVector)
    }

    edges(arena: IArena, die: boolean): boolean {
        if(this.position.x > arena.width)
            if(die)
                return false
            else
                this.position.x = 0

        if(this.position.x < 0)
            if(die)
                return false
            else
                this.position.x = arena.width

        if(this.position.y > arena.height)
            if(die)
                return false
            else
                this.position.y = 0
        if(this.position.y < 0)
            if(die)
                return false
            else
                this.position.y = arena.height

        return true
    }
}
