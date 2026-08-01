<?php

use App\Http\Controllers\Api\ActivityLog\ActivityLogController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\College\CollegeController;
use App\Http\Controllers\Api\Event\EventController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Registration\RegistrationController;
use App\Http\Controllers\Api\Volunteer\VolunteerController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class)->name('health');

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:auth')->name('auth.register');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth')->name('auth.login');
    Route::post('firebase', [AuthController::class, 'loginWithFirebase'])->middleware('throttle:auth')->name('auth.firebase');
    Route::post('password/forgot', [AuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password')->name('password.forgot');
    Route::post('password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:forgot-password')->name('password.reset');

    Route::middleware(['auth:api', 'active'])->group(function () {
        Route::get('me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::post('logout-all', [AuthController::class, 'logoutAll'])->name('auth.logout-all');
        Route::post('email/resend', [AuthController::class, 'resendVerificationEmail'])->name('verification.resend');
        Route::post('email/verify', [AuthController::class, 'verifyEmail'])->name('verification.verify');
    });
});

/*
|--------------------------------------------------------------------------
| Email verification link (direct browser click)
|--------------------------------------------------------------------------
*/
Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('verification.verify-link');

/*
|--------------------------------------------------------------------------
| Colleges
|--------------------------------------------------------------------------
*/
Route::get('colleges', [CollegeController::class, 'index'])->name('colleges.index');
Route::get('colleges/{college}', [CollegeController::class, 'show'])->name('colleges.show');

Route::middleware(['auth:api', 'active'])->group(function () {
    Route::post('colleges', [CollegeController::class, 'store'])->middleware('permission:college.create')->name('colleges.store');
    Route::put('colleges/{college}', [CollegeController::class, 'update'])->middleware('permission:college.update')->name('colleges.update');
    Route::delete('colleges/{college}', [CollegeController::class, 'destroy'])->middleware('permission:college.delete')->name('colleges.destroy');
});

/*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
*/
Route::get('events', [EventController::class, 'index'])->name('events.index');
Route::get('events/slug/{slug}', [EventController::class, 'showBySlug'])->name('events.show-by-slug');
Route::get('events/{event}', [EventController::class, 'show'])->name('events.show');

Route::middleware(['auth:api', 'active'])->group(function () {
    Route::post('events', [EventController::class, 'store'])->middleware('permission:event.create')->name('events.store');
    Route::put('events/{event}', [EventController::class, 'update'])->middleware('permission:event.update')->name('events.update');
    Route::delete('events/{event}', [EventController::class, 'destroy'])->middleware('permission:event.delete')->name('events.destroy');
    Route::post('events/{event}/publish', [EventController::class, 'publish'])->middleware('permission:event.publish')->name('events.publish');
    Route::post('events/{event}/unpublish', [EventController::class, 'unpublish'])->middleware('permission:event.publish')->name('events.unpublish');

    // Self-service registration
    Route::post('events/{event}/register', [RegistrationController::class, 'store'])->middleware('permission:registration.create')->name('registrations.store');

    // Volunteer slots
    Route::post('events/{event}/slots', [VolunteerController::class, 'store'])->name('volunteer-slots.store');
    Route::post('events/{event}/slots/{slot}/assign', [VolunteerController::class, 'assign'])->name('volunteer-slots.assign');
    Route::delete('events/{event}/slots/{slot}/volunteers/{user}', [VolunteerController::class, 'remove'])->name('volunteer-slots.remove');
});

/*
|--------------------------------------------------------------------------
| Registrations
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'active'])->prefix('registrations')->group(function () {
    Route::get('/', [RegistrationController::class, 'index'])->name('registrations.index');
    Route::get('{registration}', [RegistrationController::class, 'show'])->name('registrations.show');
    Route::post('{registration}/cancel', [RegistrationController::class, 'cancel'])->name('registrations.cancel');
    Route::post('{registration}/check-in', [RegistrationController::class, 'checkIn'])->name('registrations.check-in');
});

/*
|--------------------------------------------------------------------------
| Volunteer dashboard
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'active'])->get('volunteer/my-slots', [VolunteerController::class, 'mySlots'])->name('volunteer.my-slots');

/*
|--------------------------------------------------------------------------
| Activity logs
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'active'])
    ->get('activity-logs', [ActivityLogController::class, 'index'])
    ->middleware('permission:activity_log.view_any')
    ->name('activity-logs.index');

