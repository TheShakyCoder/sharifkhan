<script setup lang="ts">
import P5 from 'p5'
import {onMounted, reactive, ref, Ref} from "vue";

import nippleJs, {JoystickManager} from 'nipplejs';
import {Head} from "@inertiajs/vue3";
import {ITouchScreen} from "./Interfaces/ITouchScreen";
import {IArena} from "./Interfaces/IArena";
import {IAsteroid} from "./Interfaces/IAsteroid";
import {IRocket} from "./Interfaces/IRocket";
import {IShip} from "./Interfaces/IShip";
import {Asteroid} from "./Classes/Asteroid";
import {Rocket} from "./Classes/Rocket";
import {Ship} from "./Classes/Ship";

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

const arena: IArena = reactive({
    width: 800,
    height: 800,
    frameRate: 50,
    asteroidCount: 0,
    maxAsteroids: 999,
    playing: false
})

const rockets: Ref<IRocket[]> = ref([])
const asteroids: Ref<IAsteroid[]> = ref([])

let mousePosition: Ref<P5.Vector | null> = ref(null)

let me: IShip

onMounted(() => {
    if(window.matchMedia("(pointer: coarse)").matches)
        touchEnabled()
})

new P5(( sketch: P5 ) => {
    sketch.setup = () => sketchSetup(sketch)
    sketch.draw = () => sketchDraw(sketch)
    sketch.windowResized = () => sketchWindowResized(sketch)
})

function sketchSetup(sketch: P5) {
    sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.frameRate(arena.frameRate)

    setInterval(everyTenthOfASecond, 100, sketch)
    setInterval(everySecond, 1000, sketch)
}

function sketchDraw(sketch: P5) {
    mousePosition.value = sketch.createVector(sketch.mouseX, sketch.mouseY)
    arena.frameRate = sketch.frameRate()
    sketch.background(50)


    sketch.push()

    sketch.translate(sketch.width / 2, sketch.height / 2)

    if(me)
        processMe(sketch)
    else
        sketch.translate(-arena.width / 2, -arena.height / 2)

    drawArena(sketch)
    processRockets(sketch)
    processAsteroids(sketch)

    if(me)
        drawMe(sketch)

    sketch.pop()
}

function sketchWindowResized(sketch: P5) {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight)
}

function processAsteroids(sketch: P5) {
    for(let a: number = asteroids.value.length - 1; a >= 0; a--) {
        let asteroid: IAsteroid = asteroids.value[a]
        asteroid.move(sketch)
        asteroid.edges(arena, false)
        const hitRocket: number = asteroid.collide(sketch, rockets.value)
        let alive: boolean = true
        if(hitRocket > -1) {
            alive = asteroid.damage(1)
            rockets.value.splice(hitRocket, 1)
        }

        if(asteroid.hitMe(sketch, me))
            end()

        if(alive)
            drawAsteroid(asteroid, sketch)
        else
            asteroids.value.splice(a, 1)
    }
}

function drawAsteroid(asteroid: IAsteroid, sketch: P5) {
    sketch.fill(0)
    sketch.strokeWeight(1)
    sketch.stroke(255)
    sketch.circle(asteroid.position.x, asteroid.position.y, asteroid.radius * 2)
}

function processRockets(sketch: P5) {
    for(let r: number = rockets.value.length - 1; r >= 0; r--) {
        let destroyRocket = false
        let rocket: IRocket = rockets.value[r]
        rocket.move(sketch)
        if(!rocket.edges(arena, true))
            destroyRocket = true


        if(!destroyRocket)
            drawRocket(rocket, sketch)
        else
            rockets.value.splice(r, 1)
    }
}

function drawRocket(rocket: IRocket, sketch: P5) {
    sketch.fill(255)
    sketch.noStroke()
    sketch.circle(rocket.position.x, rocket.position.y, rocket.radius * 2)
}

function processMe(sketch: P5) {
    if(!arena.playing)
        return
    if(touchScreen.enabled)
        me.angle = touchScreen.angle2
    else
        me.angle = sketch.atan2(sketch.mouseY - sketch.height / 2, sketch.mouseX - sketch.width / 2) + sketch.HALF_PI
    me.vector = captureMovement(sketch)
    me.vector.mult(me.velocity * sketch.deltaTime / 1000)
    me.position.add(me.vector)
    sketch.translate(-me.position.x, -me.position.y)
}

function drawMe(sketch: P5) {
    sketch.push()
    sketch.translate(me.position.x, me.position.y)
    sketch.fill(0)
    sketch.stroke(255)
    sketch.strokeWeight(1)
    sketch.rotate(me.angle)
    sketch.beginShape()
    sketch.vertex(0, -15)
    sketch.vertex(10, 10)
    sketch.vertex(-10, 10)
    sketch.endShape(sketch.CLOSE)
    sketch.pop()
}

function captureMovement(sketch: P5): P5.Vector {
    if(touchScreen.enabled)
        return P5.Vector.fromAngle(-touchScreen.angle1, touchScreen.force1)
    else
        return captureKeys(sketch)
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

function drawArena(sketch: P5) {
    sketch.fill(55)
    sketch.rect(0, 0, arena.width, arena.height)

    sketch.stroke(100)
    sketch.strokeWeight(4)
    for(let x = 100; x < arena.width; x = x + 100) {
        for(let y = 100; y < arena.height; y = y + 100) {
            sketch.point(x, y)
        }
    }
}

function everyTenthOfASecond(sketch: P5) {
    createRocket(sketch)
}

function everySecond(sketch: P5) {
    createAsteroid(sketch)
}

function createAsteroid(sketch: P5) {
    if(!arena.playing)
        return
    arena.asteroidCount++
    asteroids.value.push(
        new Asteroid (
            sketch.createVector(0, 0),
            P5.Vector.fromAngle(sketch.random(0, sketch.TAU), sketch.random(0, 50)),
            40,
            5
        )
    )
}

function createRocket(sketch: P5) {
    if(!arena.playing)
        return
    rockets.value.push(
        new Rocket(
            sketch.createVector(me.position.x, me.position.y),
            P5.Vector.fromAngle(me.angle - Math.PI / 2, 250),
            5,
            1
        )
    )
}

function touchEnabled() {
    touchScreen.enabled = true

    touchScreen.joystick1 = nippleJs.create({
        zone: document.getElementById(touchScreen.element1) as HTMLElement,
        mode: 'static',
        position: { left: '70px', bottom: '70px' },
    });
    touchScreen.joystick1.on('move', function(evt, data) {
        touchScreen.angle1 = data.angle.radian
        touchScreen.force1 = Math.min(1, data.force)
    })
    touchScreen.joystick1.on('end', function (evt, data) {
        touchScreen.angle1 = 0
        touchScreen.force1 = 0
    });

    touchScreen.joystick2 = nippleJs.create({
        zone: document.getElementById(touchScreen.element2) as HTMLElement,
        mode: 'static',
        position: { right: '70px', bottom: '70px' },
    });
    touchScreen.joystick2.on('move', function(evt, data) {
        touchScreen.angle2 = -data.angle.radian + Math.PI / 2
        touchScreen.force2 = Math.min(1, data.force)
    })
    touchScreen.joystick2.on('end', function (evt, data) {
        // touchScreen.angle2 = 0
        touchScreen.force2 = 0
    });
}

function start() {
    me = new Ship(
        new P5.Vector(arena.width / 2, arena.height / 2),
        new P5.Vector(0, 0),
        25,
        5,
        50
    )
    asteroids.value = []
    rockets.value = []
    arena.asteroidCount = 0

    arena.playing = true
}

function end() {
    arena.playing = false
}
</script>

<template>
    <Head title="Asteroids Game" />

    <div  class="absolute inset-0 flex flex-col justify-center items-center z-10">
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
            <div v-if="arena.asteroidCount === 0" class="text-center">
              <p v-if="touchScreen.enabled">Touch the red bar.</p>
              <p v-else>Use the WASD keys and mouse.</p>
              <p>Survive.</p>
              <p>Muh ha ha ha!</p>
            </div>
            <div v-else>
              <div class="text-center ">You got to level</div>
              <div class="text-center text-7xl font-bold">{{ arena.asteroidCount }}</div>
            </div>
            <div class="w-full flex justify-around my-4">
              <button @click="start" class="w-20 p-2 px-3 rounded-2xl bg-green-600 text-white font-bold">Start</button>
            </div>
            <a class="underline" href="/">Home</a>
            <a class="underline" href="https://bitbucket.org/FigLimited/sharifkhan/src/main/resources/js/Pages/Asteroids/Index.vue">Source Code</a>
          </div>
      </transition>
    </div>

    <div class="h-screen flex flex-col justify-between w-full">
        <div class="bg-white bg-opacity-40 z-10 p-2">
            <div class="flex justify-between">
                <div>Score</div>
                <div>{{ arena.asteroidCount }}</div>
            </div>
            <div class="flex justify-between">
                <div>Frame Rate</div>
                <div>{{ Math.round(arena.frameRate) }}</div>
            </div>
<!--s-->
        </div>
        <div class="flex bg-red-500  h-32 z-10" :class="[touchScreen.enabled ? 'bg-opacity-40' : 'bg-opacity-0']">
            <div class="w-1/2" :id="touchScreen.element1"></div>
            <div class="w-1/2" :id="touchScreen.element2"></div>
        </div>
    </div>

</template>

<style lang="css">
.p5Canvas {
    @apply absolute inset-0 z-0
}
</style>
