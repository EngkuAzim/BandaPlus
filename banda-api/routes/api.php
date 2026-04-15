<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AduanController; // Make sure this is imported at the top!

// --- PUBLIC ROUTES (No login required) ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// --- PROTECTED ROUTES (Login required) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // User Profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profil', [AuthController::class, 'updateProfile']);

    // Aduan System & Dashboard
    Route::post('/aduan', [AduanController::class, 'store']); 
    Route::get('/aduan', [AduanController::class, 'getUserAduan']); // <--- MUST BE INSIDE THIS GROUP
    Route::get('/dashboard/stats', [AduanController::class, 'getStats']); 

});