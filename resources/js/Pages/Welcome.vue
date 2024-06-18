<script setup>
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    canLogin: Boolean,
    canRegister: Boolean,
    laravelVersion: String,
    phpVersion: String,
});
</script>

<template>
    <Head title="UK Laravel Contractor" />

    <div class="relative sm:flex sm:justify-center sm:items-center min-h-screen bg-dots-darker bg-center bg-gray-100 dark:bg-dots-lighter dark:bg-gray-900 selection:bg-red-500 selection:text-white">

        <div class="max-w-7xl text-xl mx-auto p-6 lg:p-8 dark:text-gray-200 flex flex-col justify-around">
            <div class="flex flex-col">
                <h1>Sharif Khan</h1>
                <h2 class="font-bold text-2xl">UK Based Laravel contractor</h2>
                <p>Specialising in portals and intranets.</p>
                <a class="underline underline-offset-4" href="https://www.linkedin.com/in/shaky-coder/">LinkedIn profile</a>
                <a class="underline underline-offset-4" href="https://www.youtube.com/@theshakycoder">YouTube Channel</a>
            </div>
            <div class="flex flex-col mt-12">
                <h2 class="font-bold text-2xl">Specialties</h2>
                <div>Laravel</div>
                <div>inertia.js</div>
                <div>vue.js</div>
            </div>
            <div class="flex flex-col mt-12">
                <h2 class="font-bold text-2xl">Concept Sites</h2>
                <div><a class="underline underline-offset-4" href="https://dev.stupidly.uk">Stupidly</a> Bookkeeping App</div>
            </div>
            <div class="flex flex-col mt-12">
                <h2 class="font-bold text-2xl">Games</h2>
                <div><a class="underline underline-offset-4" href="/dodge">Dodge</a> (first attempt)</div>
                <div><a class="underline underline-offset-4" href="/asteroids">Asteroids</a> (my take on an old classic)</div>
                <div><a class="underline underline-offset-4" href="https://earth2900.sharifkhan.co.uk/">Earth 2900 (BETA)</a> (homage to Deuteros)</div>
<!--                <div><a class="underline underline-offset-4" href="/lander">Lunar Lander</a> (desktop only, no touchscreen)</div>-->
            </div>
            <div class="flex flex-col mt-12">
                <h2 class="font-bold text-2xl">Online Training</h2>
                <div><a class="underline underline-offset-4" href="/live-lessons">Live Lessons</a></div>
            </div>
        </div>
    </div>
</template>

<style>
.bg-dots-darker {
    background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(0,0,0,0.07)'/%3E%3C/svg%3E");
}
@media (prefers-color-scheme: dark) {
    .dark\:bg-dots-lighter {
        background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E");
    }
}
</style>
