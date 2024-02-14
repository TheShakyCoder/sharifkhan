<script setup lang="ts">
import {Head} from "@inertiajs/vue3";
import P5 from "p5";
import {reactive} from "vue";
import {TShip} from "./Types/TShip";
import {Ship} from './Classes/Ship'

const arena = reactive({
    width: 800,
    height: 800,
    frameRate: 30,
    playing: false,
    gravity: 1
})

let me: TShip

new P5(( sketch: P5 ) => {
    sketch.setup = () => sketchSetup(sketch)
    sketch.draw = () => sketchDraw(sketch)
    sketch.windowResized = () => sketchWindowResized(sketch)
})

function sketchSetup(sketch: P5) {
    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.frameRate(arena.frameRate)

    start()
}

function sketchDraw(sketch: P5) {
    sketch.background(20)
    drawArena(sketch)
    if(me)
        processMe(sketch)
}

function sketchWindowResized(sketch: P5) {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight)
}

function processMe(sketch: P5) {
    const input = captureKeys(sketch)
    addForces(sketch, input)
    revolveMe(sketch, input)
    moveMe(sketch, input)
    drawMe(sketch, input)
}

function addForces(sketch: P5, input: P5.Vector) {
    addThrust(sketch, input)
    addGravity(sketch)
}

function addThrust(sketch: P5, input: P5.Vector) {
    if(input.y !== 0)
        me.acceleration.add(
            sketch.createVector(
                sketch.sin(me.angle) * me.thrust,
                -sketch.cos(me.angle) * me.thrust
            ).mult(sketch.deltaTime / 1000)
        )
}

function addGravity(sketch: P5) {
    const gravity = sketch.createVector(0, arena.gravity).mult(sketch.deltaTime / 1000)
    me.acceleration.add(gravity)
}

function revolveMe(sketch: P5, input: P5.Vector) {
    me.revolve(sketch, input)
}

function moveMe(sketch: P5, input: P5.Vector) {
    me.position.add(me.vector)
    me.vector.add(me.acceleration)
    me.acceleration = sketch.createVector(0,0)
    me.revolve(sketch, input)
    if(me.position.y + me.radius + me.legs > arena.height) {
        me.position.y = arena.height - me.radius - me.legs
        me.vector = sketch.createVector(0, 0)
    }
}

function drawArena(sketch: P5) {
    sketch.fill(10)
    sketch.rect(0, 0, arena.width, arena.height)

    sketch.stroke(100)
    sketch.strokeWeight(4)
    for(let x = 100; x < arena.width; x = x + 100) {
        for(let y = 100; y < arena.height; y = y + 100) {
            sketch.point(x, y)
        }
    }
}

function drawMe(sketch: P5, input: P5.Vector) {
    me.draw(sketch, input)
}

function captureKeys(sketch: P5): P5.Vector {
    let x: number = 0
    let y: number = 0
    if (sketch.keyIsDown(65))
        x = -1
    if (sketch.keyIsDown(68))
        x = 1
    if (sketch.keyIsDown(87))
        y = -1
    if (sketch.keyIsDown(83))
        y = 1
    return sketch.createVector(x, y)
}

function start() {
    me = reactive(new Ship(
        new P5.Vector(400, 400),
        new P5.Vector(0, 0),
        new P5.Vector(0, 0),
    ))
}
</script>

<template>
    <Head title="Lunar Lander" />

    <div class="w-screen flex flex-row justify-between items-start z-20">

        <div  v-if="me" class="absolute top-0 left-0 right-0 bg-white bg-opacity-40 p-2 flex-grow text-xl">
            <div class="flex justify-between w-full">
                <div>Position</div>
                <div class="font-bold">{{ me.position }}</div>
            </div>
            <div class="flex justify-between w-full">
                <div>Vector</div>
                <div class="font-bold">{{ me.vector }}</div>
            </div>
            <div class="flex justify-between w-full">
                <div>Acceleration</div>
                <div class="font-bold">{{ me.acceleration }}</div>
            </div>
            <div class="flex justify-between w-full">
                <div>Angle</div>
                <div class="font-bold">{{ me.angle }}</div>
            </div>
<!--            <div class="flex justify-between w-40">-->
<!--                <div>Frame Rate</div>-->
<!--                <div class="font-bold">{{ Math.round(arena.frameRate) }}</div>-->
<!--            </div>-->
        </div>

    </div>
</template>

<style scoped>
.p5Canvas {
    @apply absolute inset-0 z-0
}
</style>
