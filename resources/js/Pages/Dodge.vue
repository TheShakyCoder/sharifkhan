<script setup lang="ts">
import P5 from 'p5'
import {reactive, ref} from "vue";
import {Link} from "@inertiajs/vue3";

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

    //  ASTEROIDS
    asteroids.value.forEach((asteroid) => {
      asteroid.position.add(asteroid.vector)
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
  const distance = 70
  let movement = { x: 0, y: 0 }
  if (sketch.keyIsDown(65)) {
    movement.x = -distance
  }
  if (sketch.keyIsDown(68)) {
    movement.x = distance
  }
  if (sketch.keyIsDown(87)) {
    movement.y = -distance
  }
  if (sketch.keyIsDown(83)) {
    movement.y = distance
  }

  const vector = sketch.createVector(movement.x * sketch.deltaTime / 1000, movement.y * sketch.deltaTime / 1000)
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
    vector: sketch.createVector(sketch.random(-5, 5), sketch.random(-5, 5)),
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
  <div v-if="!playing" class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
    <div class="bg-white w-80 text-black py-20 flex flex-col justify-center items-center">
      <div v-if="asteroidCount === 0" class="text-center">
          <p>Use the WASD keys.</p>
          <p>Survive to level {{ maxAsteroids }}</p>
          <p>Muh ha ha ha!</p>
      </div>
      <div v-else>You got to level {{ asteroidCount }}</div>
      <button @click="start" class="p-4 px-5 rounded-2xl bg-green-600 text-white font-bold">Start</button>
    </div>
  </div>
</template>

<style scoped>

</style>
