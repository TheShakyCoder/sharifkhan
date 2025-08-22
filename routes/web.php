<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/live-lessons', function () {
    return Inertia::render('LiveLessons');
});

Route::get('/dodge', function () {
    return Inertia::render('Dodge/Index');
})->name('dodge');

Route::get('/asteroids', function () {
    return Inertia::render('Asteroids/Index');
})->name('asteroids');

Route::get('/battle-zone', function () {
    return Inertia::render('BattleZone/Index');
})->name('battle-zone');

Route::get('/lander', function () {
    return Inertia::render('LunarLander/Index');
})->name('lander');

//Route::middleware([
//    'auth:sanctum',
//    config('jetstream.auth_session'),
//    'verified',
//])->group(function () {
//    Route::get('/dashboard', function () {
//        return Inertia::render('Dashboard');
//    })->name('dashboard');
//});
