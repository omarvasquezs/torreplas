<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => redirect()->route('login'));

// Dashboard
Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    // Profile
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Products
    Route::resource('products', \App\Http\Controllers\ProductController::class);

    // Clients
    Route::resource('clients', \App\Http\Controllers\ClientController::class);

    // Suppliers
    Route::resource('suppliers', \App\Http\Controllers\SupplierController::class);

    // Orders / Sales
    Route::resource('orders', \App\Http\Controllers\OrderController::class);

    // Purchases
    Route::resource('purchases', \App\Http\Controllers\PurchaseController::class);

    // Invoices / Billing
    Route::resource('invoices', \App\Http\Controllers\InvoiceController::class);

    // Inventory & Warehouses
    Route::get('inventory',             [\App\Http\Controllers\WarehouseController::class, 'index'])->name('inventory.index');
    Route::post('warehouses',           [\App\Http\Controllers\WarehouseController::class, 'store'])->name('warehouses.store');
    Route::put('warehouses/{warehouse}',[\App\Http\Controllers\WarehouseController::class, 'update'])->name('warehouses.update');
    Route::delete('warehouses/{warehouse}', [\App\Http\Controllers\WarehouseController::class, 'destroy'])->name('warehouses.destroy');
    Route::get('inventory/movements',   [\App\Http\Controllers\WarehouseController::class, 'movements'])->name('inventory.movements');
    Route::post('inventory/movements',  [\App\Http\Controllers\WarehouseController::class, 'storeMovement'])->name('inventory.movements.store');
    Route::post('inventory/transfer',   [\App\Http\Controllers\WarehouseController::class, 'transfer'])->name('inventory.transfer');

    // Cash & Finance
    Route::get('cash',                                      [\App\Http\Controllers\CashController::class, 'index'])->name('cash.index');
    Route::post('cash/{cashRegister}/open',                [\App\Http\Controllers\CashController::class, 'open'])->name('cash.open');
    Route::post('cash/{cashRegister}/close',               [\App\Http\Controllers\CashController::class, 'close'])->name('cash.close');
    Route::get('cash/{cashRegister}',                       [\App\Http\Controllers\CashController::class, 'show'])->name('cash.show');
    Route::post('cash/{cashRegister}/movements',            [\App\Http\Controllers\CashController::class, 'storeMovement'])->name('cash.movements.store');
    Route::post('bank-accounts',                            [\App\Http\Controllers\CashController::class, 'storeBank'])->name('bank.store');
    Route::post('bank-accounts/{bankAccount}/transactions', [\App\Http\Controllers\CashController::class, 'storeBankTransaction'])->name('bank.transactions.store');

    // Accounts Receivable / Payable
    Route::get('accounts/receivable',                               [\App\Http\Controllers\AccountsController::class, 'receivable'])->name('accounts.receivable');
    Route::post('accounts/receivable/{order}/payment',              [\App\Http\Controllers\AccountsController::class, 'storeReceivablePayment'])->name('accounts.receivable.payment');
    Route::get('accounts/payable',                                  [\App\Http\Controllers\AccountsController::class, 'payable'])->name('accounts.payable');
    Route::post('accounts/payable/{purchase}/payment',              [\App\Http\Controllers\AccountsController::class, 'storePayablePayment'])->name('accounts.payable.payment');

    // Human Resources
    Route::resource('employees', \App\Http\Controllers\EmployeeController::class);
    Route::get('employees/{employee}/payrolls',     [\App\Http\Controllers\EmployeeController::class, 'payrolls'])->name('employees.payrolls');
    Route::post('employees/{employee}/payrolls',    [\App\Http\Controllers\EmployeeController::class, 'storePayroll'])->name('employees.payrolls.store');

    // Logistics
    Route::resource('deliveries', \App\Http\Controllers\DeliveryController::class);
    Route::get('carriers',        [\App\Http\Controllers\DeliveryController::class, 'carriers'])->name('carriers.index');
    Route::post('carriers',       [\App\Http\Controllers\DeliveryController::class, 'storeCarrier'])->name('carriers.store');

    // Reports (with CSV export)
    Route::get('reports',                   [\App\Http\Controllers\ReportsController::class, 'index'])->name('reports.index');
    Route::get('reports/sales',             [\App\Http\Controllers\ReportsController::class, 'sales'])->name('reports.sales');
    Route::get('reports/sales/export',      [\App\Http\Controllers\ReportsController::class, 'exportSales'])->name('reports.sales.export');
    Route::get('reports/purchases',         [\App\Http\Controllers\ReportsController::class, 'purchases'])->name('reports.purchases');
    Route::get('reports/purchases/export',  [\App\Http\Controllers\ReportsController::class, 'exportPurchases'])->name('reports.purchases.export');
    Route::get('reports/inventory',         [\App\Http\Controllers\ReportsController::class, 'inventory'])->name('reports.inventory');
    Route::get('reports/inventory/export',  [\App\Http\Controllers\ReportsController::class, 'exportInventory'])->name('reports.inventory.export');
    Route::get('reports/movements',         [\App\Http\Controllers\ReportsController::class, 'movements'])->name('reports.movements');
    Route::get('reports/movements/export',  [\App\Http\Controllers\ReportsController::class, 'exportMovements'])->name('reports.movements.export');

    // Settings
    Route::get('settings',    [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::post('settings',   [\App\Http\Controllers\SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/series',        [\App\Http\Controllers\SettingsController::class, 'storeSeries'])->name('settings.series.store');
    Route::delete('settings/series/{id}', [\App\Http\Controllers\SettingsController::class, 'destroySeries'])->name('settings.series.destroy');

    // Accounting
    Route::get('accounting',                            fn() => \Inertia\Inertia::render('Accounting/Index'))->name('accounting.index');
    Route::get('accounting/accounts',                   [\App\Http\Controllers\AccountingController::class, 'accounts'])->name('accounting.accounts');
    Route::post('accounting/accounts',                  [\App\Http\Controllers\AccountingController::class, 'storeAccount'])->name('accounting.accounts.store');
    Route::put('accounting/accounts/{account}',         [\App\Http\Controllers\AccountingController::class, 'updateAccount'])->name('accounting.accounts.update');
    Route::delete('accounting/accounts/{account}',      [\App\Http\Controllers\AccountingController::class, 'destroyAccount'])->name('accounting.accounts.destroy');
    Route::get('accounting/entries',                    [\App\Http\Controllers\AccountingController::class, 'entries'])->name('accounting.entries');
    Route::post('accounting/entries',                   [\App\Http\Controllers\AccountingController::class, 'storeEntry'])->name('accounting.entries.store');
    Route::patch('accounting/entries/{entry}/status',   [\App\Http\Controllers\AccountingController::class, 'updateEntryStatus'])->name('accounting.entries.status');
    Route::delete('accounting/entries/{entry}',         [\App\Http\Controllers\AccountingController::class, 'destroyEntry'])->name('accounting.entries.destroy');
    Route::get('accounting/balance',                    [\App\Http\Controllers\AccountingController::class, 'balance'])->name('accounting.balance');

    // Kardex
    Route::get('products/{product}/kardex', [\App\Http\Controllers\ProductController::class, 'kardex'])->name('products.kardex');

    // Employee Documents
    Route::get('employees/{employee}/documents',                              [\App\Http\Controllers\EmployeeController::class, 'documents'])->name('employees.documents');
    Route::post('employees/{employee}/documents',                             [\App\Http\Controllers\EmployeeController::class, 'storeDocument'])->name('employees.documents.store');
    Route::delete('employees/{employee}/documents/{document}',                [\App\Http\Controllers\EmployeeController::class, 'destroyDocument'])->name('employees.documents.destroy');

    // Bank Reconciliation
    Route::get('bank-accounts/{bankAccount}/reconciliation',   [\App\Http\Controllers\CashController::class, 'reconciliation'])->name('bank.reconciliation');
    Route::post('bank-transactions/{transaction}/reconcile',   [\App\Http\Controllers\CashController::class, 'toggleReconcile'])->name('bank.reconcile');

    // Users
    Route::resource('users', \App\Http\Controllers\UserController::class);

    // Rentals (Alquileres) — admin only
    Route::resource('rentals', \App\Http\Controllers\RentalController::class);
    Route::post('rentals/{rental}/generate-payment',     [\App\Http\Controllers\RentalController::class, 'generatePayment'])->name('rentals.generate-payment');
    Route::post('rentals/bulk-generate',                 [\App\Http\Controllers\RentalController::class, 'bulkGenerate'])->name('rentals.bulk-generate');
    Route::post('rental-payments/{payment}/register',    [\App\Http\Controllers\RentalController::class, 'registerPayment'])->name('rentals.payments.register');
    Route::post('rental-payments/{payment}/revert',      [\App\Http\Controllers\RentalController::class, 'revertPayment'])->name('rentals.payments.revert');
});

require __DIR__ . '/auth.php';

