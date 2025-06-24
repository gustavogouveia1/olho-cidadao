<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;

Route::get('/reports', [ReportController::class, 'index'])->name('api.reports.index');

Route::post('/report', [ReportController::class, 'store'])->name('api.report.store');

