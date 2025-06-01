<?php

use App\Http\Controllers\API\MenuAPIController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MidtransController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\UserAddressController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
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
    Route::get('/menu/list', [MenuController::class, 'index'])->name('menu.index');
    Route::get('/treatment/list', [TreatmentController::class, 'index'])->name('treatment.index');
    Route::get('/order/list', [OrderController::class, 'dashboard'])->name('order.index');
    Route::get('/order/placement', [OrderController::class, 'index'])->name('order.placement');
    Route::post('/order/placement', [MidtransController::class, 'create_order'])->name('order.placement.store');

    // Dynamic Route
    Route::resource('menu', MenuController::class)->except('index');
    Route::resource('treatment', TreatmentController::class)->except('index');
    Route::resource('order', OrderController::class)->except('index');
    Route::resource('user-address', UserAddressController::class)->except('index');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
