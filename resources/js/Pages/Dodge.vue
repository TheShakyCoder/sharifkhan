<script setup lang="ts">
import P5 from 'p5'
import {onMounted, reactive, ref} from "vue";

import nipplejs from 'nipplejs';
const touchScreen = ref(false)
const joystick = ref(null)

const joystickMovement = reactive({
    x: 0,
    y: 0
})

onMounted(() => {
    if(window.matchMedia("(pointer: coarse)").matches) {
        // touchscreen
        console.log('TOUCH')
        touchScreen.value = true
    }

    joystick.value = nipplejs.create({
        zone: document.getElementById('zone_joystick') as HTMLElement,
        mode: 'semi',
        restJoystick: true
    });

    joystick.value.on('move', function(evt, data) {
        // console.log(data)
        if(data.angle.radian > Math.PI / 8 && data.angle.radian < Math.PI * 3 / 8) {
            joystickMovement.x = 1
            joystickMovement.y = -1
        } else if(data.angle.radian > Math.PI * 3 / 8 && data.angle.radian < Math.PI * 5 / 8) {
            joystickMovement.x = 0
            joystickMovement.y = -1
        } else if(data.angle.radian > Math.PI * 5 / 8 && data.angle.radian < Math.PI * 7 / 8) {
            joystickMovement.x = -1
            joystickMovement.y = -1
        } else if(data.angle.radian > Math.PI * 7 / 8 && data.angle.radian < Math.PI * 9 / 8) {
            joystickMovement.x = -1
            joystickMovement.y = 0
        } else if(data.angle.radian > Math.PI * 9 / 8 && data.angle.radian < Math.PI * 11 / 8) {
            joystickMovement.x = -1
            joystickMovement.y = 1
        } else if(data.angle.radian > Math.PI * 11 / 8 && data.angle.radian < Math.PI * 13 / 8) {
            joystickMovement.x = 0
            joystickMovement.y = 1
        } else if(data.angle.radian > Math.PI * 13 / 8 && data.angle.radian < Math.PI * 15 / 8) {
            joystickMovement.x = 1
            joystickMovement.y = 1
        } else if(data.angle.radian > Math.PI * 15 / 8 || data.angle.radian < Math.PI * 8) {
            joystickMovement.x = 1
            joystickMovement.y = 0
        }
    }).on('end', function (evt, data) {
        joystickMovement.x = 0
        joystickMovement.y = 0
    });
})

interface iAsteroid {
  name: string,
  position: P5.Vector,
  vector: P5.Vector,
  radius: number,
}

interface iShip {
  position: P5.Vector,
  vector: P5.Vector,
  radius: number,
  weaponRadius: number
}

const arena = {
  width: 800,
  height: 800
}

const browser = {
  width: window.innerWidth,
  height: window.innerHeight
}

const asteroids = ref(<iAsteroid[]>[])
const asteroidCount = ref(0)
const maxAsteroids = 99
const frameRate = ref(40)
const delta = ref(0)

const shipMode = ref('dodge')
const ships = reactive({
    dodge: {
        speed: 60,
        radius: 20,
        weaponRadius: 1
    },
    shield: {
        speed: 50,
        radius: 25,
        weaponRadius: 50
    }
})

const asteroidSpeed = 70
const weaponChargeTime = 5000
let weaponCharged = true

let positionMiddle: P5.Vector
let noVector: P5.Vector

let me: iShip

const playing = ref(false)

new P5(( sketch: P5 ) => {
  sketch.setup = () => {
    sketch.createCanvas(browser.width, browser.height);
    sketch.frameRate(frameRate.value)

      positionMiddle = sketch.createVector(arena.width / 2, arena.height / 2)
      noVector = sketch.createVector(0, 0)

    setInterval(createAsteroid, 1000, sketch)
  }
  sketch.draw = () => {
    delta.value = parseInt(sketch.frameRate())
    sketch.background(100)
    sketch.push()
    sketch.translate(sketch.width / 2, sketch.height / 2)
    if(me) {
      sketch.translate(-me.position.x, -me.position.y)
    }

    //  ARENA
    sketch.fill(55)
    sketch.rect(0, 0, arena.width, arena.height)

    //  GRID
    sketch.stroke(255)
    sketch.strokeWeight(4)
    for(let x = 100; x < arena.width; x = x + 100) {
        for(let y = 100; y < arena.height; y = y + 100) {
            sketch.point(x, y)
        }
    }

    //  ASTEROIDS
    sketch.stroke(255)
    sketch.strokeWeight(1)
    asteroids.value.forEach((asteroid : iAsteroid) => {
      const newVector = sketch.createVector(asteroid.vector.x * sketch.deltaTime / 1000, asteroid.vector.y * sketch.deltaTime / 1000)
      asteroid.position.add(newVector)
      if(asteroid.position.x > arena.width) {
        asteroid.position.x = 0
      }
      if(asteroid.position.x < 0) {
        asteroid.position.x = arena.width
      }
      if(asteroid.position.y > arena.height) {
        asteroid.position.y = 0
      }
      if(asteroid.position.y < 0) {
        asteroid.position.y = arena.height
      }

      sketch.fill(0)
      sketch.circle(asteroid.position.x, asteroid.position.y, asteroid.radius * 2)
      sketch.fill(255)
      sketch.textSize(18)
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.text(asteroid.name, asteroid.position.x, asteroid.position.y)
    })

    if(me) {
        if(weaponCharged)
            sketch.fill(0, 180, 0)
        else
            sketch.fill(255, 0, 0)
      sketch.noStroke()
      sketch.circle(me.position.x, me.position.y, me.radius * 2)
      //  weapon
      sketch.noFill()
        if(weaponCharged)
            sketch.stroke(0, 180, 0)
        else
            sketch.stroke(255, 0, 0)

      sketch.strokeWeight(1)
      sketch.circle(me.position.x, me.position.y, me.weaponRadius * 2)
      //  level text
      sketch.fill(255)
      sketch.textSize(20)
      sketch.textStyle(sketch.BOLD)
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.noStroke()
      sketch.text(asteroidCount.value.toString(), me.position.x, me.position.y)

      captureMovement(sketch)
      getDistances(sketch)
      const checkWeaponResult = checkWeapon()
      if(checkWeaponResult > -1 && weaponCharged)
        laserAsteroid(sketch, checkWeaponResult)
      if(checkCollision())
        end()
    }

    sketch.pop()
  }
})

function laserAsteroid(sketch: P5, asteroidIndex: number) {
    asteroids.value.splice(asteroidIndex, 1)
    weaponCharged = false
    setTimeout(function () {
        weaponCharged = true
    }, weaponChargeTime)
}

function start(mode: string) {
  shipMode.value = mode
  asteroidCount.value = 0
  asteroids.value = []
    weaponCharged = true

    me = reactive<iShip>({
        position: positionMiddle,
        vector: noVector,
        radius: ships[shipMode.value].radius,
        weaponRadius: ships[shipMode.value].weaponRadius,
    })
    me.position.x = 400
    me.position.y = 400

  playing.value = true
}

function end() {
  playing.value = false
}

function captureMovement(sketch: P5) {
  let movement = {...joystickMovement}
  if (sketch.keyIsDown(65)) {
    movement.x = -1
  }
  if (sketch.keyIsDown(68)) {
    movement.x = 1
  }
  if (sketch.keyIsDown(87)) {
    movement.y = -1
  }
  if (sketch.keyIsDown(83)) {
    movement.y = 1
  }

  const vector = sketch.createVector(movement.x * sketch.deltaTime * ships[shipMode.value].speed / 1000, movement.y * sketch.deltaTime * ships[shipMode.value].speed / 1000)
  if(playing.value)
    me.position.add(vector)

  me.position.x = sketch.min(me.position.x, arena.width)
  me.position.y = sketch.min(me.position.y, arena.height)
  me.position.x = sketch.max(me.position.x, 0)
  me.position.y = sketch.max(me.position.y, 0)
}

function createAsteroid(sketch: P5): void {
  if(!playing.value || asteroidCount.value > maxAsteroids)
    return

  asteroidCount.value++
  asteroids.value.push({
    name: asteroidCount.value.toString(),
    position: sketch.createVector(0, 0),
    vector: sketch.createVector(sketch.random(-asteroidSpeed, asteroidSpeed), sketch.random(-asteroidSpeed, asteroidSpeed)),
    radius: 25
  })
}

function checkCollision(): boolean {
  let found = false

  asteroids.value.forEach((asteroid: iAsteroid) => {
    const zSquared = (asteroid.radius + me.radius) * (asteroid.radius + me.radius)

    if(asteroid.distanceSquared < zSquared)
      found = true
  })
  return found
}

function checkWeapon() {
    let weapon = -1
  asteroids.value.forEach((asteroid: iAsteroid, index: number) => {
    const zSquared = (asteroid.radius + me.weaponRadius) * (asteroid.radius + me.weaponRadius)
    if(asteroid.distanceSquared < zSquared)
      weapon = index
  })
    return weapon
}

function getDistances(sketch: P5) {
    asteroids.value.forEach((asteroid: iAsteroid) => {
        const xDiff = sketch.abs(me.position.x - asteroid.position.x)
        const yDiff = sketch.abs(me.position.y - asteroid.position.y)

        const xSquared = xDiff * xDiff
        const ySquared = yDiff * yDiff

        asteroid.distanceSquared = xSquared + ySquared
    })
}
</script>

<template>
  <div class="bottom-1 left-1 right-1 bg-red-500 bg-opacity-50 h-28 z-30" :class="[touchScreen ? 'absolute' : 'hidden']" id="zone_joystick"></div>
  <div class="absolute left-0 top-0 right-0 z-20">
    <ul class="bg-white bg-opacity-50 px-8 py-6">
      <li class="flex">
        <div class="w-32">Level</div>
        <div class="text-right font-bold w-16">{{ asteroidCount }}</div>
      </li>
      <li class="flex">
        <div class="w-32">Frame Rate</div>
        <div class="text-right font-bold w-16">{{ delta }}</div>
      </li>

    </ul>
  </div>

  <transition
    enter-active-class="duration-150 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="!playing" class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-40">
      <div class="bg-white bg-opacity-70 rounded-xl w-60 text-black py-12 flex flex-col justify-center items-center">
        <div v-if="asteroidCount === 0" class="text-center">
          <p v-if="touchScreen">Touch the red bar.</p>
          <p v-else>Use the WASD keys.</p>
          <p>Avoid the black balls.</p>
          <p>Survive to level {{ maxAsteroids }}.</p>
          <p>Muh ha ha ha!</p>
        </div>
        <div v-else>
          <div class="text-center ">You got to level</div>
          <div class="text-center text-7xl font-bold">{{ asteroidCount }}</div>
        </div>
        <div class="w-full flex justify-around my-4">
          <button @click="start('dodge')" class="w-20 p-2 px-3 rounded-2xl bg-green-600 text-white font-bold">Dodge</button>
          <button @click="start('shield')" class="w-20 p-2 px-3 rounded-2xl bg-green-600 text-white font-bold">Shield</button>
        </div>
        <a class="underline" href="/">Home</a>
      </div>
    </div>
  </transition>
</template>

<style scoped>

</style>
