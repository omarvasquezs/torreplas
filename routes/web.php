<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('products', \App\Http\Controllers\ProductController::class);
    Route::resource('clients', \App\Http\Controllers\ClientController::class);
    Route::resource('orders', \App\Http\Controllers\OrderController::class);
    Route::get('inventory', [\App\Http\Controllers\WarehouseController::class, 'index'])->name('inventory.index');
    Route::get('finance', [\App\Http\Controllers\FinanceController::class, 'index'])->name('finance.index');
    Route::resource('purchases', \App\Http\Controllers\PurchaseController::class);
    Route::get('settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
});

require __DIR__ . '/auth.php';
