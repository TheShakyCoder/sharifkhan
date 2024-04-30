<script setup lang="ts">
import {Head} from "@inertiajs/vue3";
import P5 from "p5";
import {Ref,ref,reactive} from "vue";
import {TShip} from "./Types/TShip";
import {Ship} from './Classes/Ship'
import {ITouchScreen} from "../Asteroids/Interfaces/ITouchScreen";

const touchScreen: ITouchScreen = reactive({
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

const blueprint = reactive({
    minWidth: 40,
    maxWidth: 120,
    minHeight: 200,
    maxHeight: 600
})

const buildings: Ref<any[]> = ref([])

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
    if(buildings.value.length === 0)
        createBuildings(sketch)

    sketch.background(20)
    drawArena(sketch)
    drawBuildings(sketch)
    if(me)
        processMe(sketch)
}

function sketchWindowResized(sketch: P5) {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight)
}

function createBuildings(sketch: P5) {
    buildings.value.splice(0, buildings.value.length)
    let remainingWidth = arena.width
    let building
    while(remainingWidth > blueprint.maxWidth) {
        const w = sketch.random(blueprint.minWidth, blueprint.maxWidth)
        const h = sketch.random(blueprint.minHeight, blueprint.maxHeight)
        const x = arena.width - remainingWidth
        const y = arena.height - h

        building = {x, y, w, h, multiplier: (arena.height - h) / w }

        buildings.value.push(building)
        remainingWidth -= w
    }

}

function processMe(sketch: P5) {
    if(arena.playing)  {
        const input = captureKeys(sketch)
        addForces(sketch, input)
        revolveMe(sketch, input)
        moveMe(sketch, input)
        if(input.y !== 0)
            me.drawFlame(sketch)
    }

    drawMe(sketch)
    drawStats(sketch)
}

function drawStats(sketch: P5) {
    sketch.textSize(14)
    sketch.textAlign(sketch.LEFT)
    sketch.text('x: ' + me.position.x.toFixed(0), arena.width - 100, 50)
    sketch.text('y: ' + me.position.y.toFixed(0), arena.width - 100, 70)

    sketch.text('vx: ' + me.vector.x.toFixed(2), arena.width - 200, 50)
    sketch.text('vy: ' + me.vector.y.toFixed(2), arena.width - 200, 70)
    sketch.text('vm: ' + me.vector.mag().toFixed(2), arena.width - 200, 90)
    sketch.text('a: ' + (me.angle * 57.2958).toFixed(0), arena.width - 200, 110)
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

    //  HIT A WALL
    if(me.position.x + me.radius > arena.width || me.position.x - me.radius < 0)
        crash(sketch)

    //  HIT THE GROUND
    if(me.position.y + me.radius + me.legHeight > arena.height) {
        if(isCrash(sketch))
            crash(sketch)
        else
            end(sketch)
    }

    //  HIT A BUILDING
    touchedBuilding(sketch)
    if(me.hasCrashed)
        crash(sketch)

    if(me.hasLanded)
        end(sketch)
}

function touchedBuilding(sketch: P5) {

    for(let b = 0; b < buildings.value.length; b++) {
        const building = buildings.value[b]

        if(me.position.y + me.radius + me.legHeight > building.y) {

            if(me.position.x - me.radius > building.x && me.position.x + me.radius < building.x + building.w) {
                if(isCrash(sketch)) {
                    me.hasCrashed = true
                    return
                } else {
                    me.hasLanded = true
                    me.score = (building.multiplier * 100)
                    return
                }
            }

            if(me.position.x + me.radius > building.x && me.position.x - me.radius < building.x + building.w) {
                me.hasCrashed = true
                return
            }
        }

    }
}

function drawArena(sketch: P5) {
    sketch.stroke(128)
    sketch.strokeWeight(1)
    sketch.fill(10)
    sketch.rect(0, 0, arena.width, arena.height)
}

function drawBuildings(sketch: P5) {
    let startX = 0
    sketch.strokeWeight(1)
    for(let b = 0; b < buildings.value.length; b++) {
        const building = buildings.value[b]
        sketch.noFill()
        sketch.rect(startX, building.y, building.w, building.h)

        sketch.textAlign(sketch.CENTER, sketch.TOP)
        sketch.textSize(24)
        sketch.fill(130)
        sketch.text((building.multiplier * 100).toFixed(0), building.x + (building.w / 2), building.y + 15)
        startX += building.w
    }
}

function drawMe(sketch: P5) {
    me.draw(sketch)
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

function isCrash(sketch: P5) {
    return me.angle > sketch.QUARTER_PI / 2 || me.angle < -sketch.QUARTER_PI / 2 || me.vector.mag() > 1.5
}

function start() {
    me = reactive(new Ship(
        new P5.Vector(50, 50),
        new P5.Vector(Math.random() + 0.5, 0),
        new P5.Vector(0, 0),
    ))
    buildings.value = []
    arena.playing = true
}

function crash(sketch: P5) {
    arena.playing = false
}

function end(sketch: P5) {
    arena.playing = false
    me.vector = sketch.createVector(0, 0)
}

</script>

<template>
    <Head title="Lunar Lander" />

    <div class="absolute inset-0 flex flex-col justify-center items-center z-20">
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
                class="flex flex-col justify-center items-center bg-white bg-opacity-80 rounded-xl w-60 text-black py-12 z-30"
            >
                <div class="text-center">
                    <p v-if="touchScreen.enabled">LANDSCAPE mode is best</p>
                    <p v-if="touchScreen.enabled">Use the 2 joysticks..</p>
                    <p v-if="me && me.hasCrashed" class="bg-red-600 text-white p-2">CRASHED</p>
                    <p v-if="me && me.hasLanded" class="bg-green-600 text-white p-2">LANDED</p>
                    <p v-if="me && me.hasLanded" class="p-2">You scored {{ me.score.toFixed(0) }} points.</p>
                    <p v-else>Use the WASD keys.</p>
                    <p>Land on a building safely.</p>
                </div>
                <div class="w-full flex justify-around my-4">
                    <button @click="start" class="w-20 p-2 px-3 rounded-2xl bg-green-600 text-white font-bold">Start</button>
                </div>
                <a class="underline" href="/">Home</a>
                <a class="underline" href="https://bitbucket.org/FigLimited/sharifkhan/src/main/resources/js/Pages/LunarLander/Index.vue">Source Code</a>
            </div>
        </transition>
    </div>

    <div class="w-screen flex flex-row justify-between items-start">

        <div class="w-0 h-screen z-20" :id="touchScreen.element1"></div>

        <div class="bg-white bg-opacity-40 z-10 p-2 flex-grow text-xl">
            <div class="flex justify-between w-40">
                <div>Score</div>
                <div class="font-bold">{{ arena.width }}</div>
            </div>
            <div class="flex justify-between w-40">
                <div>Frame Rate</div>
                <div class="font-bold">{{ Math.round(arena.frameRate) }}</div>
            </div>
        </div>

        <div class="w-0 h-screen z-20" :id="touchScreen.element2"></div>

    </div>

</template>

<style scoped>
.p5Canvas {
    @apply absolute inset-0 z-0
}
</style>
