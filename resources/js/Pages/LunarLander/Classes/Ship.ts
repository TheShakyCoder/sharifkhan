import P5 from "p5";

export class Ship {
    position
    vector
    acceleration
    thrust = 2
    radius = 10
    legWidth = 4
    legHeight = 4
    angle = 0
    fuel = 100
    hasCrashed = false
    hasLanded = false
    score = 0

    constructor(position: P5.Vector, vector: P5.Vector, acceleration: P5.Vector) {
        this.position = position
        this.vector = vector
        this.acceleration = acceleration
    }

    revolve(sketch: P5, input: P5.Vector) {
        if(input.x !== 0)
            this.angle += (sketch.deltaTime / 1000) * input.x
    }

    draw(sketch: P5) {
        sketch.push()
        sketch.translate(this.position.x, this.position.y)
        sketch.rotate(this.angle)
        sketch.fill(0)
        sketch.stroke(255)
        sketch.strokeWeight(1)

        // sketch.beginShape()
        // sketch.vertex(-this.radius, this.radius)
        // sketch.vertex(-this.radius, this.radius+5)
        // sketch.vertex(this.radius, this.radius+5)
        // sketch.vertex(this.radius, this.radius)
        //
        // sketch.endShape(sketch.CLOSE)

        //  LEFT LEG
        sketch.beginShape()
        sketch.vertex(-this.radius / 2, this.radius / 4)
        sketch.vertex(-this.radius, this.radius + this.legHeight)
        sketch.vertex(-this.radius-this.legWidth, this.radius + this.legHeight)
        sketch.vertex(-this.radius / 2 - this.legWidth, this.radius / 4)
        sketch.endShape(sketch.CLOSE)

        //  RIGHT LEG
        sketch.beginShape()
        sketch.vertex(this.radius / 2, this.radius / 4)
        sketch.vertex(this.radius, this.radius + this.legHeight)
        sketch.vertex(this.radius+this.legWidth, this.radius + this.legHeight)
        sketch.vertex(this.radius / 2 + this.legWidth, this.radius / 4)
        sketch.endShape(sketch.CLOSE)

        sketch.beginShape()
        const extra = sketch.QUARTER_PI / 2
        sketch.vertex(sketch.sin(sketch.QUARTER_PI - extra) * this.radius, sketch.cos(sketch.QUARTER_PI - extra) * this.radius)
        sketch.vertex(sketch.sin(sketch.HALF_PI - extra) * this.radius, sketch.cos(sketch.HALF_PI - extra) * this.radius)
        sketch.vertex(sketch.sin(sketch.HALF_PI + sketch.QUARTER_PI - extra) * this.radius, sketch.cos(sketch.HALF_PI + sketch.QUARTER_PI - extra) * this.radius)
        sketch.vertex(sketch.sin(sketch.PI - extra) * this.radius, sketch.cos(sketch.PI - extra) * this.radius)
        sketch.vertex(sketch.sin(sketch.PI + sketch.QUARTER_PI - extra) * this.radius, sketch.cos(sketch.PI + sketch.QUARTER_PI - extra) * this.radius)
        sketch.vertex(sketch.sin(sketch.PI + sketch.HALF_PI - extra) * this.radius, sketch.cos(sketch.PI + sketch.HALF_PI - extra) * this.radius)
        sketch.vertex(sketch.sin(sketch.TWO_PI - sketch.QUARTER_PI - extra) * this.radius, sketch.cos(sketch.TWO_PI - sketch.QUARTER_PI - extra) * this.radius)
        sketch.vertex(sketch.sin(sketch.TWO_PI - extra) * this.radius, sketch.cos(sketch.TWO_PI - extra) * this.radius)
        sketch.endShape(sketch.CLOSE)

        sketch.pop()
    }

    drawFlame(sketch: P5) {
        sketch.push()
        sketch.translate(this.position.x, this.position.y)
        sketch.rotate(this.angle)
        sketch.strokeWeight(1)
        sketch.stroke(255)
        sketch.noFill()
        sketch.beginShape()
        sketch.vertex(-this.radius / 2, this.radius)
        sketch.vertex(0, this.radius * 6)
        sketch.vertex(this.radius / 2, this.radius)
        sketch.endShape(sketch.CLOSE)
        sketch.pop()

    }
}
