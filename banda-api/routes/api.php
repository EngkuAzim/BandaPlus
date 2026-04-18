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

    // Aduan System & Dashboard
    Route::post('/aduan', [AduanController::class, 'store']);
    Route::get('/aduan', [AduanController::class, 'getUserAduan']);
    
    // Dashboard Stats
    Route::get('/dashboard/stats', [AduanController::class, 'getStats']); 
    
    // ADD THIS LINE FOR PENTADBIR (Admin)
    Route::get('/admin/dashboard/stats', [AduanController::class, 'getAdminDashboardStats']); 
    Route::get('/admin/aduan', [AduanController::class, 'getAllAduanAdmin']); 
    Route::put('/admin/aduan/{id}', [AduanController::class, 'updateStatusAduan']);
    // --- PENGURUSAN PENGGUNA (ADMIN SAHAJA) ---
    Route::get('/admin/users', [AuthController::class, 'getAllUsers']);
    Route::post('/admin/users', [AuthController::class, 'createUser']);
    Route::put('/admin/users/{id}', [AuthController::class, 'updateUser']);
});