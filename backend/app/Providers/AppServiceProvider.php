<?php

namespace App\Providers;

use App\Contracts\Repositories\CollegeRepositoryInterface;
use App\Contracts\Services\AuthServiceInterface;
use App\Contracts\Services\CollegeAdminServiceInterface;
use App\Contracts\Services\CollegeServiceInterface;
use App\Contracts\Services\EventCertificateServiceInterface;
use App\Contracts\Services\EventMediaServiceInterface;
use App\Contracts\Services\EventServiceInterface;
use App\Contracts\Services\EventSponsorServiceInterface;
use App\Contracts\Services\FirebaseAuthServiceInterface;
use App\Contracts\Services\RegistrationServiceInterface;
use App\Contracts\Services\TokenServiceInterface;
use App\Contracts\Services\VolunteerServiceInterface;
use App\Models\College;
use App\Models\Event;
use App\Models\User;
use App\Policies\CollegeAdminPolicy;
use App\Policies\CollegePolicy;
use App\Policies\EventPolicy;
use App\Repositories\Eloquent\CollegeRepository;
use App\Services\Auth\AuthService;
use App\Services\Auth\FirebaseAuthService;
use App\Services\Auth\TokenService;
use App\Services\College\CollegeService;
use App\Services\CollegeAdmin\CollegeAdminService;
use App\Services\Event\EventCertificateService;
use App\Services\Event\EventMediaService;
use App\Services\Event\EventService;
use App\Services\Event\EventSponsorService;
use App\Services\Registration\RegistrationService;
use App\Services\Volunteer\VolunteerService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AuthServiceInterface::class, AuthService::class);
        $this->app->bind(TokenServiceInterface::class, TokenService::class);
        $this->app->bind(FirebaseAuthServiceInterface::class, FirebaseAuthService::class);
        $this->app->bind(CollegeServiceInterface::class, CollegeService::class);
        $this->app->bind(CollegeAdminServiceInterface::class, CollegeAdminService::class);
        $this->app->bind(CollegeRepositoryInterface::class, CollegeRepository::class);
        $this->app->bind(EventServiceInterface::class, EventService::class);
        $this->app->bind(EventMediaServiceInterface::class, EventMediaService::class);
        $this->app->bind(EventSponsorServiceInterface::class, EventSponsorService::class);
        $this->app->bind(EventCertificateServiceInterface::class, EventCertificateService::class);
        $this->app->bind(RegistrationServiceInterface::class, RegistrationService::class);
        $this->app->bind(VolunteerServiceInterface::class, VolunteerService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(College::class, CollegePolicy::class);
        Gate::policy(User::class, CollegeAdminPolicy::class);
        Gate::policy(Event::class, EventPolicy::class);

        $this->configureRateLimiters();
    }

    protected function configureRateLimiters(): void
    {
        $limits = config('api.rate_limits');

        RateLimiter::for('api', function (Request $request) use ($limits) {
            return Limit::perMinute($limits['api'])
                ->by($request->user()?->getKey() ?: $request->ip())
                ->response(fn () => response()->json([
                    'success' => false,
                    'code' => 'too_many_requests',
                    'message' => 'Too many requests.',
                ], 429));
        });

        RateLimiter::for('auth', function (Request $request) use ($limits) {
            return Limit::perMinutes($limits['auth_decay'], $limits['auth'])
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'success' => false,
                    'code' => 'too_many_requests',
                    'message' => 'Too many login attempts. Please try again later.',
                ], 429));
        });

        RateLimiter::for('forgot-password', function (Request $request) use ($limits) {
            return Limit::perMinutes($limits['forgot_password_decay'], $limits['forgot_password'])
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'success' => false,
                    'code' => 'too_many_requests',
                    'message' => 'Too many password reset requests.',
                ], 429));
        });
    }
}
