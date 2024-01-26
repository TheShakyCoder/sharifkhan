import P5 from "p5";
import {Body} from "./Body";
import {IAsteroid} from "../Interfaces/IAsteroid";
import {IRocket} from "../Interfaces/IRocket";
import {IShip} from "../Interfaces/IShip";

export class Asteroid extends Body implements IAsteroid {
    distanceSquared: number;
    constructor(position: P5.Vector, vector: P5.Vector, radius: number, life: number) {
        super(position, vector, radius, life);
        this.distanceSquared = 1000
    }

    collide(sketch: P5, rockets: IRocket[]): number {
        let hit: number = -1
        for(let r: number = rockets.length - 1; r >= 0; r--) {
            let rocket: IRocket = rockets[r]
            if(Math.pow(P5.Vector.dist(this.position, rocket.position), 2) < sketch.sq(this.radius) + sketch.sq(rocket.radius))
                hit = r
        }
        return hit
    }

    damage(hit: number): boolean {
        this.life -= hit
        this.radius = this.radius * 2 / 3
        this.vector.mult(3/2)
        this.vector.setHeading(this.vector.heading() + Math.PI / 4)
        return this.life > 0;
    }

    hitMe(sketch: P5, me: IShip): boolean {
        return Math.pow(P5.Vector.dist(this.position, me.position), 2) < sketch.sq(this.radius) + sketch.sq(me.radius)
    }
}
