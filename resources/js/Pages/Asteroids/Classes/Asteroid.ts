import P5 from "p5";
import {Body} from "./Body";
import {IAsteroid} from "../Interfaces/IAsteroid";
import {IRocket} from "../Interfaces/IRocket";
import {IShip} from "../Interfaces/IShip";

export class Asteroid extends Body implements IAsteroid {
    distanceSquared: number;
    sides: number = 10;
    offset: number[] = []

    constructor(position: P5.Vector, vector: P5.Vector, radius: number, life: number) {
        super(position, vector, radius, life);
        this.distanceSquared = 1000

        for (let o: number = 0; o < this.sides; o++) {
            this.offset[o] = Math.floor((Math.random() * radius) - radius / 2)
        }
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
        for (let o: number = 0; o < this.sides; o++) {
            this.offset[o] *= 2/3
        }
        return this.life > 0;
    }

    hitMe(sketch: P5, me: IShip): boolean {
        return Math.pow(P5.Vector.dist(this.position, me.position), 2) < sketch.sq(this.radius) + sketch.sq(me.radius)
    }

    draw(sketch: P5): void {
        sketch.push()
        sketch.translate(this.position.x, this.position.y)
        // sketch.rotate(this.rotation)
        sketch.stroke(255)
        sketch.strokeWeight(1)
        sketch.fill(0)
        sketch.beginShape()
        for (let s = 0; s < this.sides; s++) {
            let angle = sketch.map(s, 0, this.sides, 0, sketch.TWO_PI)
            let x = (this.radius + this.offset[s]) * sketch.cos(angle)
            let y = (this.radius + this.offset[s]) * sketch.sin(angle)
            sketch.vertex(x, y)
        }
        sketch.endShape(sketch.CLOSE)
        // collision border
        sketch.noFill()
        sketch.stroke(60)
        sketch.strokeWeight(1)
        sketch.ellipse(0, 0, this.radius * 2)
        // text
        // sketch.rotate(this.rotation * -1)
        sketch.noStroke()
        sketch.fill(0)
        // sketch.textAlign(sketch.CENTER)
        // sketch.text(this.strength, 0, 0)
        sketch.pop()
    }
}
