<?php

namespace App\Providers;

use App\Auth\Guards\FirebaseGuard;
use App\Contracts\Services\FirebaseAuthServiceInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class FirebaseServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerFirebaseBindings();

        Auth::extend('firebase', function ($app, $name, array $config) {
            return new FirebaseGuard(
                $app->make(FirebaseAuthServiceInterface::class),
                $app['request'],
            );
        });
    }

    protected function registerFirebaseBindings(): void
    {
        $this->app->bind(FirebaseAuthServiceInterface::class, \App\Services\Auth\FirebaseAuthService::class);

        $this->app->singleton(\Kreait\Firebase\Contract\Auth::class, function ($app) {
            $projectId = config('firebase.project_id');
            $credentialsFile = config('firebase.credentials_file');
            $credentialsJson = config('firebase.credentials_json');

            if (! $credentialsFile && ! $credentialsJson) {
                // Return a lazy factory-less stub is not possible; instead resolve
                // a factory now that will throw a clear error if used. When Firebase
                // is disabled the guard/controller short-circuit before this point.
                throw new \RuntimeException(
                    'Firebase credentials are not configured. Set FIREBASE_CREDENTIALS_FILE or FIREBASE_CREDENTIALS_JSON in your .env.',
                );
            }

            $factory = new \Kreait\Firebase\Factory();

            if ($projectId) {
                $factory = $factory->withProjectId($projectId);
            }

            if ($credentialsFile) {
                $factory = $factory->withServiceAccount($credentialsFile);
            } elseif ($credentialsJson) {
                $factory = $factory->withServiceAccount(json_decode($credentialsJson, true));
            }

            return $factory->createAuth();
        });
    }
}
