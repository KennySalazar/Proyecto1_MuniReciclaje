<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RutaController;


Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'role:COORDINADOR'])->group(function () {
    Route::get('/rutas', [RutaController::class, 'index']);
    Route::post('/rutas', [RutaController::class, 'store']);
});
