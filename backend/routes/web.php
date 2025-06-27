<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->get('/dashboard', function () {
    return response()->json([
        'message' => 'Usuário autenticado, pode acessar o dashboard',
    ]);
});

Route::get('/teste-auth', function () {
    return auth()->check()
        ? response()->json(['auth' => true, 'user' => auth()->user()])
        : response()->json(['auth' => false], 401);
});

//require __DIR__.'/auth.php';
