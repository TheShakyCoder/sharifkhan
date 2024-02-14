<script setup lang="ts">
import {Head} from "@inertiajs/vue3";
import P5 from "p5";
import {reactive} from "vue";
import {TShip} from "./Types/TShip";
import {Ship} from './Classes/Ship'
import {ITouchScreen} from "../Asteroids/Interfaces/ITouchScreen";


const touchScreen = reactive({
    enabled: false,

    joystick1: null,
    element1: 'zone_joystick1',
    angle1: 0,
    force1: 0,

    joystick2: null,
    element2: 'zone_joystick2',
    angle2: 0,
    force2: 0,
})

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

    // start()
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
    if(!arena.playing)
        return

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
        if(me.angle > sketch.QUARTER_PI / 2 || me.angle < -sketch.QUARTER_PI / 2 || me.vector.mag() > 2)
            crash()
        me.position.y = arena.height - me.radius - me.legs
        me.vector = sketch.createVector(0, 0)
        end()
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
        new P5.Vector(1, 0),
        new P5.Vector(0, 0),
    ))
    arena.playing = true
}

function crash() {
    alert('CRASH!')
}

function end() {
    arena.playing = false
}

</script>

<template>
    <Head title="Lunar Lander" />

    <div class="absolute h-screen w-screen inset-0 flex flex-col justify-center items-center z-20">
        <transition
            enter-active-class="duration-150 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="!arena.playing"
                class="flex flex-col justify-center items-center bg-white bg-opacity-80 rounded-xl w-60 text-black py-8 z-30"
            >
                <div class="text-center">
                    <p>LANDSCAPE mode is best</p>
                    <p v-if="touchScreen.enabled">Use the 2 joysticks..</p>
                    <p v-else>Use the WASD keys.</p>
                    <p>Land safely.</p>
                </div>
<!--                <div v-else>-->
<!--                    <div class="text-center ">You got to level</div>-->
<!--&lt;!&ndash;                    <div class="text-center text-7xl font-bold">{{ arena.asteroidCount }}</div>&ndash;&gt;-->
<!--                </div>-->
                <div class="w-full flex justify-around my-4">
                    <button @click="start" class="w-20 p-2 px-3 rounded-2xl bg-green-600 text-white font-bold">Start</button>
                </div>
                <a class="underline" href="/">Home</a>
                <a class="underline" href="https://bitbucket.org/FigLimited/sharifkhan/src/main/resources/js/Pages/LunarLander//Index.vue">Source Code</a>
            </div>
        </transition>
    </div>

<!--    <div class="w-screen flex flex-row justify-between items-start">-->

<!--        <div class="w-0 h-screen z-20" :id="touchScreen.element1"></div>-->

<!--        <div class="bg-white bg-opacity-40 z-10 p-2 flex-grow text-xl">-->
<!--            <div class="flex justify-between w-40">-->
<!--                <div>Frame Rate</div>-->
<!--                <div class="font-bold">{{ Math.round(arena.frameRate) }}</div>-->
<!--            </div>-->
<!--            <div v-if="me" class="flex justify-between w-40">-->
<!--                <div>Fuel</div>-->
<!--                <div class="font-bold">{{ Math.round(me.fuel) }}</div>-->
<!--            </div>-->
<!--        </div>-->

<!--        <div class="w-0 h-screen z-20" :id="touchScreen.element2"></div>-->

<!--    </div>-->

</template>

<style scoped>

</style>
