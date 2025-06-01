<?php

use App\Http\Controllers\API\MenuAPIController;
use App\Http\Controllers\API\ShoeTypeAPIController;
use App\Http\Controllers\API\TreatmentAPIController;
use App\Http\Controllers\API\UserAPIController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('menu', MenuAPIController::class)->names('api.menu');
Route::apiResource('user', UserAPIController::class)->names('api.user');
Route::apiResource('treatment', TreatmentAPIController::class)->names('api.treatment');
Route::apiResource('shoe-type', ShoeTypeAPIController::class)->names('api.shoe-type');
