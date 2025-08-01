<?php

use App\Http\Controllers\API\MenuAPIController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LogAnalystController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TrackingController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\UserAddressController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/chatbot', function() {
    return Inertia::render('openai', [
        "title" => "Rekomendasi Treatment"
    ]);
})->name('openai');

Route::controller(LogAnalystController::class)->group(function() {
    Route::post('/chatbot/treatment/recomendation', 'analyze')->name('openai.treatment.analyze');
    Route::post('/chatbot/treatment/recomendation/test', 'analyzeTest')->name('openai.treatment.analyze.test');
    Route::post('/treatment/recommend', 'another_analyze')->name('order.treatment.recommend');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->group(function() {
    // Static Route Get Data
    Route::middleware('verify-local-api')->group(function() {
        Route::get('/menu/get', [MenuController::class, 'get'])->name('menu.get');
        Route::get('/menu/get/row/{menu}', [MenuController::class, 'row'])->name('menu.get.row');

        Route::get('/role/get', [RoleController::class, 'get'])->name('role.get');
        Route::get('/role/get/row/{role}', [RoleController::class, 'row'])->name('role.get.row');

        Route::get('/order/get', [OrderController::class, 'get'])->name('order.get');
        Route::get('/order/get/row/{order}', [OrderController::class, 'row'])->name('order.get.row');
    });

    // Static Route
    Route::get('/user/list', [UserController::class, 'index'])->name('user.index');
    Route::get('/menu/list', [MenuController::class, 'index'])->name('menu.index');
    Route::get('/treatment/list', [TreatmentController::class, 'index'])->name('treatment.index');
    Route::get('/order/list', [OrderController::class, 'dashboard'])->name('order.index');
    Route::get('/tracking/list', [TrackingController::class, 'index'])->name('tracking.index');
    Route::get('/order/placement', [OrderController::class, 'index'])->name('order.placement');
    Route::post('/order/placement', [MidtransController::class, 'create_order'])->name('order.placement.store');
    Route::post('/order/callback', [OrderController::class, 'callback'])->name('order.callback');
    Route::post('/order/take/{order}', [TrackingController::class, 'take_order'])->name('order.take');

    // Dynamic Route
    Route::resource('user', UserController::class)->except('index');
    Route::resource('menu', MenuController::class)->except('index');
    Route::resource('treatment', TreatmentController::class)->except('index');
    Route::resource('order', OrderController::class)->except('index');
    Route::resource('user-address', UserAddressController::class)->except('index');
    Route::resource('tracking', TrackingController::class)->except('index');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
