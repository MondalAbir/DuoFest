<?php

use App\Http\Controllers\Api\ActivityLog\ActivityLogController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\EmailVerificationController;
use App\Http\Controllers\Api\College\CollegeController;
use App\Http\Controllers\Api\CollegeAdmin\CollegeAdminController;
use App\Http\Controllers\Api\Event\EventCategoryController;
use App\Http\Controllers\Api\Event\EventCertificateController;
use App\Http\Controllers\Api\Event\EventController;
use App\Http\Controllers\Api\Event\EventMediaController;
use App\Http\Controllers\Api\Event\EventSponsorController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\Registration\RegistrationController;
use App\Http\Controllers\Api\User\UserController;
use App\Http\Controllers\Api\Volunteer\VolunteerController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class)->name('health');

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
|
| Students authenticate with Firebase email OTP (POST /auth/firebase) and
| are auto-registered on first sign-in. Staff/volunteers are provisioned by
| a super admin (POST /users) and sign in with email/password (POST /auth/login).
|
*/
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:auth')->name('auth.login');
    Route::post('firebase', [AuthController::class, 'loginWithFirebase'])->middleware('throttle:auth')->name('auth.firebase');
    Route::post('password/forgot', [AuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password')->name('password.forgot');
    Route::post('password/reset', [AuthController::class, 'resetPassword'])->middleware('throttle:forgot-password')->name('password.reset');

    Route::middleware(['auth:api', 'active'])->group(function () {
        Route::get('me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::post('logout-all', [AuthController::class, 'logoutAll'])->name('auth.logout-all');
        Route::post('password/change', [AuthController::class, 'changePassword'])->name('password.change');
        Route::post('email/resend', [AuthController::class, 'resendVerificationEmail'])->name('verification.resend');
        Route::post('email/verify', [AuthController::class, 'verifyEmail'])->name('verification.verify');
    });

    Route::post('invitations/accept', [AuthController::class, 'acceptInvitation'])->middleware('throttle:forgot-password')->name('auth.invitations.accept');
});

/*
|--------------------------------------------------------------------------
| User management (super admin only)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'active', 'role:super_admin'])->prefix('users')->group(function () {
    Route::post('/', [UserController::class, 'store'])->name('users.store');
});

/*
|--------------------------------------------------------------------------
| College admin management (super admin only)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'active'])->prefix('college-admins')->group(function () {
    Route::get('/', [CollegeAdminController::class, 'index'])->middleware('can:viewAny,App\Models\User')->name('college-admins.index');
    Route::post('/', [CollegeAdminController::class, 'store'])->middleware('can:create,App\Models\User')->name('college-admins.store');
    Route::post('invite', [CollegeAdminController::class, 'invite'])->middleware('can:invite,App\Models\User')->name('college-admins.invite');

    Route::get('{user}', [CollegeAdminController::class, 'show'])->middleware('can:view,user')->name('college-admins.show');
    Route::put('{user}', [CollegeAdminController::class, 'update'])->middleware('can:update,user')->name('college-admins.update');
    Route::delete('{user}', [CollegeAdminController::class, 'destroy'])->middleware('can:delete,user')->name('college-admins.destroy');
    Route::post('{user}/suspend', [CollegeAdminController::class, 'suspend'])->middleware('can:suspend,user')->name('college-admins.suspend');
    Route::post('{user}/restore', [CollegeAdminController::class, 'restore'])->middleware('can:restore,user')->name('college-admins.restore');
    Route::post('{user}/reset-password', [CollegeAdminController::class, 'resetPassword'])->middleware('can:resetPassword,user')->name('college-admins.reset-password');
    Route::post('{user}/assign-college', [CollegeAdminController::class, 'assignCollege'])->middleware('can:assignCollege,user')->name('college-admins.assign-college');
    Route::put('{user}/roles', [CollegeAdminController::class, 'updateRoles'])->middleware('can:manageRoles,user')->name('college-admins.roles');
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
    Route::post('colleges', [CollegeController::class, 'store'])->middleware('can:create,App\Models\College')->name('colleges.store');
    Route::put('colleges/{college}', [CollegeController::class, 'update'])->middleware('can:update,college')->name('colleges.update');
    Route::delete('colleges/{college}', [CollegeController::class, 'destroy'])->middleware('can:delete,college')->name('colleges.destroy');
    Route::post('colleges/{college}/invite-admin', [CollegeController::class, 'inviteAdmin'])->middleware('can:inviteAdmin,college')->name('colleges.invite-admin');
});

/*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
|
| Public, unauthenticated discovery endpoints: listing, feeds, search and
| categories. Management endpoints live below under auth:api.
|
*/
Route::get('events', [EventController::class, 'index'])->name('events.index');
Route::get('events/featured', [EventController::class, 'featured'])->name('events.featured');
Route::get('events/upcoming', [EventController::class, 'upcoming'])->name('events.upcoming');
Route::get('events/search', [EventController::class, 'search'])->name('events.search');
Route::get('events/slug/{slug}', [EventController::class, 'showBySlug'])->name('events.show-by-slug');
Route::get('events/{event}', [EventController::class, 'show'])->name('events.show');

Route::get('event-categories', [EventCategoryController::class, 'index'])->name('event-categories.index');
Route::get('event-categories/{category}', [EventCategoryController::class, 'show'])->name('event-categories.show');

Route::middleware(['auth:api', 'active'])->group(function () {
    Route::post('events', [EventController::class, 'store'])->middleware('can:create,App\Models\Event')->name('events.store');
    Route::put('events/{event}', [EventController::class, 'update'])->middleware('can:update,event')->name('events.update');
    Route::delete('events/{event}', [EventController::class, 'destroy'])->middleware('can:delete,event')->name('events.destroy');
    Route::post('events/{event}/publish', [EventController::class, 'publish'])->middleware('can:publish,event')->name('events.publish');
    Route::post('events/{event}/unpublish', [EventController::class, 'unpublish'])->middleware('can:unpublish,event')->name('events.unpublish');
    Route::post('events/{event}/archive', [EventController::class, 'archive'])->middleware('can:archive,event')->name('events.archive');
    Route::post('events/{event}/unarchive', [EventController::class, 'unarchive'])->middleware('can:unarchive,event')->name('events.unarchive');

    // Event media (banner + gallery)
    Route::get('events/{event}/media', [EventMediaController::class, 'index'])->middleware('can:view,event')->name('events.media.index');
    Route::post('events/{event}/media', [EventMediaController::class, 'store'])->middleware('can:manageMedia,event')->name('events.media.store');
    Route::delete('events/{event}/media/{media}', [EventMediaController::class, 'destroy'])->middleware('can:manageMedia,event')->scopeBindings()->name('events.media.destroy');

    // Event sponsors
    Route::get('events/{event}/sponsors', [EventSponsorController::class, 'index'])->middleware('can:view,event')->name('events.sponsors.index');
    Route::post('events/{event}/sponsors', [EventSponsorController::class, 'store'])->middleware('can:manageSponsors,event')->name('events.sponsors.store');
    Route::put('events/{event}/sponsors/{sponsor}', [EventSponsorController::class, 'update'])->middleware('can:manageSponsors,event')->scopeBindings()->name('events.sponsors.update');
    Route::delete('events/{event}/sponsors/{sponsor}', [EventSponsorController::class, 'destroy'])->middleware('can:manageSponsors,event')->scopeBindings()->name('events.sponsors.destroy');

    // Event certificates
    Route::get('events/{event}/certificates', [EventCertificateController::class, 'index'])->middleware('can:manageCertificates,event')->name('events.certificates.index');
    Route::post('events/{event}/certificates', [EventCertificateController::class, 'store'])->middleware('can:manageCertificates,event')->name('events.certificates.store');
    Route::delete('events/{event}/certificates/{certificate}', [EventCertificateController::class, 'destroy'])->middleware('can:manageCertificates,event')->scopeBindings()->name('events.certificates.destroy');

    // Self-service registration
    Route::post('events/{event}/register', [RegistrationController::class, 'store'])->middleware('permission:registration.create')->name('registrations.store');

    // Volunteers
    Route::get('events/{event}/volunteers', [VolunteerController::class, 'index'])->middleware('permission:volunteer.view_any')->name('volunteers.index');
    Route::post('events/{event}/volunteers', [VolunteerController::class, 'store'])->middleware('permission:volunteer.create')->name('volunteers.store');
    Route::post('events/{event}/volunteers/assign', [VolunteerController::class, 'assign'])->middleware('permission:volunteer.update')->name('volunteers.assign');
    Route::delete('volunteers/{volunteer}', [VolunteerController::class, 'destroy'])->middleware('permission:volunteer.update')->name('volunteers.destroy');
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
Route::middleware(['auth:api', 'active'])->get('volunteer/my-volunteering', [VolunteerController::class, 'myVolunteering'])->name('volunteer.my-volunteering');

/*
|--------------------------------------------------------------------------
| Activity logs
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:api', 'active'])
    ->get('activity-logs', [ActivityLogController::class, 'index'])
    ->middleware('permission:activity_log.view_any')
    ->name('activity-logs.index');
