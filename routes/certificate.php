<?php

use App\Http\Controllers\CertificateController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    // Certificate routes for authenticated users
    Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('/certificates/{certificate}', [CertificateController::class, 'show'])->name('certificates.show');
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download'])->name('certificates.download');
    Route::get('/courses/{course}/certificate/generate', [CertificateController::class, 'generate'])->name('certificates.generate');
    Route::get('/courses/{course}/certificate/check-eligibility', [CertificateController::class, 'checkEligibility'])->name('certificates.check-eligibility');
});

// Public certificate verification route (no auth required)
Route::get('/certificates/verify', [CertificateController::class, 'verify'])->name('certificates.verify');
Route::post('/certificates/verify', [CertificateController::class, 'verify']);
