<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Activity Logging Configuration
    |--------------------------------------------------------------------------
    |
    | Controls how model activity and API request logging behave across the
    | application. Sensitive routes (auth, password reset) can be excluded
    | from automatic request logging.
    |
    */

    'enabled' => (bool) env('ACTIVITY_LOG_ENABLED', true),

    'prune_days' => (int) env('ACTIVITY_LOG_PRUNE_DAYS', 90),

    'log_requests' => (bool) env('ACTIVITY_LOG_REQUESTS', true),

    'exclude_requests' => [
        'api/v1/auth/*',
        'api/v1/health',
    ],

    'events' => [
        'created',
        'updated',
        'deleted',
        'restored',
        'login',
        'logout',
        'registered',
        'email_verified',
        'password_reset',
        'password_changed',
    ],

];
