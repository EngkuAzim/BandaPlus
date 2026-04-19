<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Controllers ---
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Komuniti\AduanController;
use App\Http\Controllers\Komuniti\ProfileController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AduanAdminController;
use App\Http\Controllers\Pegawai\ArahanKerjaController;
use App\Http\Controllers\Pegawai\JabatanController;
use App\Http\Controllers\Kontraktor\KontraktorController;

// ============================================================
// PUBLIC ROUTES — No authentication required
// ============================================================
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:5,1');

// ============================================================
// PROTECTED ROUTES — Must be logged in
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Current user info & logout (all roles)
    Route::get('/user', function (Request $req) {
        // Load jabatan relationship so frontend always has jabatan info
        return $req->user()->load('jabatan:id_jabatan,nama_jabatan,baki_semasa,bajet_tahunan');
    });
    Route::post('/logout',   [AuthController::class, 'logout']);

    // --------------------------------------------------------
    // KOMUNITI — submit & track own reports
    // --------------------------------------------------------
    Route::post('/aduan',            [AduanController::class, 'store']);
    Route::get('/aduan',             [AduanController::class, 'getUserAduan']);
    Route::get('/dashboard/stats',   [AduanController::class, 'getStats']);
    Route::put('/profil',            [ProfileController::class, 'update']);

    // --------------------------------------------------------
    // PENTADBIR — admin panel routes
    // --------------------------------------------------------
    Route::middleware('role:pentadbir')->prefix('admin')->group(function () {
        Route::get('/dashboard/stats',  [AduanAdminController::class, 'getStats']);
        Route::get('/aduan',            [AduanAdminController::class, 'index']);
        Route::put('/aduan/{id}',       [AduanAdminController::class, 'updateStatus']);
        Route::get('/users',            [UserController::class, 'index']);
        Route::post('/users',           [UserController::class, 'store']);
        Route::put('/users/{id}',       [UserController::class, 'update']);
        Route::delete('/users/{id}',    [UserController::class, 'destroy']);
    });

    // --------------------------------------------------------
    // PEGAWAI — department officer routes (pentadbir can also access)
    // --------------------------------------------------------
    Route::middleware('role:pegawai,pentadbir')->prefix('pegawai')->group(function () {
        Route::get('/dashboard/stats',          [AduanAdminController::class, 'getStats']);
        Route::get('/aduan',                    [AduanAdminController::class, 'index']);
        Route::get('/aduan-pending',            [ArahanKerjaController::class, 'pendingAduan']); // aduan belum ada AK
        Route::get('/kontraktor-list',          [ArahanKerjaController::class, 'getKontraktorList']);
        Route::get('/jabatan',                  [JabatanController::class, 'index']);
        Route::get('/arahan-kerja',             [ArahanKerjaController::class, 'index']);
        Route::put('/arahan-kerja/{id}',        [ArahanKerjaController::class, 'update']);
        Route::put('/aduan/{id}/tugaskan',      [ArahanKerjaController::class, 'tugaskan']);
    });

    // --------------------------------------------------------
    // KONTRAKTOR — contractor work order routes
    // --------------------------------------------------------
    Route::middleware('role:kontraktor')->prefix('kontraktor')->group(function () {
        Route::get('/dashboard/stats',          [KontraktorController::class, 'getStats']);
        Route::get('/tugasan',                  [KontraktorController::class, 'getTugasan']);
        Route::put('/tugasan/{id}',             [KontraktorController::class, 'updateStatus']);
        Route::post('/tugasan/{id}/bukti',      [KontraktorController::class, 'uploadBukti']);
    });
});