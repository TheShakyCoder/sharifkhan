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
  radius: number
}

interface iShip {
  position: P5.Vector,
  vector: P5.Vector,
  radius: number
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

const playerSpeed = 60
const asteroidSpeed = 70

let me: iShip

const playing = ref(false)

new P5(( sketch: P5 ) => {
  sketch.setup = () => {
    sketch.createCanvas(browser.width, browser.height);
    sketch.frameRate(frameRate.value)

    me = reactive<iShip>({
      position: sketch.createVector(arena.width / 2, arena.height / 2),
      vector: sketch.createVector(0, 0),
      radius: 25
    })

    setInterval(createAsteroid, 1000, sketch)
  }
  sketch.draw = () => {
    delta.value = parseInt(sketch.frameRate())
    sketch.background(100)
    sketch.push()
    sketch.translate(sketch.width / 2, sketch.height / 2)
    sketch.translate(-me.position.x, -me.position.y)

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
    asteroids.value.forEach((asteroid) => {
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
      sketch.textSize(20)
      sketch.textAlign(sketch.CENTER, sketch.CENTER);
      sketch.text(asteroid.name, asteroid.position.x, asteroid.position.y)
    })

    //  ME
    sketch.fill(255)
    sketch.circle(me.position.x, me.position.y, me.radius * 2)

    captureMovement(sketch)
    if(checkCollision(sketch))
      end()

    sketch.pop()
  }
})

function start() {
  asteroidCount.value = 0
  asteroids.value = []
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

  const vector = sketch.createVector(movement.x * sketch.deltaTime * playerSpeed / 1000, movement.y * sketch.deltaTime * playerSpeed / 1000)
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

function checkCollision(sketch: P5): boolean {
  let found = false
  asteroids.value.forEach((asteroid: iAsteroid) => {
    const xDiff = sketch.abs(me.position.x - asteroid.position.x)
    const yDiff = sketch.abs(me.position.y - asteroid.position.y)

    const xSquared = xDiff * xDiff
    const ySquared = yDiff * yDiff
    const zSquared = (asteroid.radius + me.radius) * (asteroid.radius + me.radius)

    if(xSquared + ySquared < zSquared)
      found = true

  })
  return found
}
</script>

<template>
    <div v-if="touchScreen" class="absolute bottom-0 left-0 right-0 bg-red-500 bg-opacity-50 h-28 z-30" id="zone_joystick"></div>

  <div class="absolute top-4 right-4 z-20">
    <ul class="bg-white bg-opacity-50 px-8 py-6">
        <li><a class="underline" href="/">Home</a></li>
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
  <div v-if="!playing" class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-40">
    <div class="bg-white bg-opacity-70 w-60 text-black py-12 flex flex-col justify-center items-center">
      <div v-if="asteroidCount === 0" class="text-center">
          <p v-if="touchScreen">Touch the red bar.</p>
          <p v-else>Use the WASD keys.</p>
          <p>Avoid the black balls.</p>
          <p>Survive to level {{ maxAsteroids }}.</p>
          <p>Muh ha ha ha!</p>
      </div>
      <div v-else>You got to level {{ asteroidCount }}</div>
      <button @click="start" class="p-4 px-5 rounded-2xl bg-green-600 text-white font-bold">Start</button>
    </div>
  </div>
</template>

<style scoped>

</style>
