<?php

return [

    /*
    |--------------------------------------------------------------------------
    | API Configuration
    |--------------------------------------------------------------------------
    |
    | Central place for API-wide settings such as versioning, token TTLs and
    | response conventions. All values may be overridden via environment
    | variables in production.
    |
    */

    'version' => env('API_VERSION', 'v1'),

    'prefix' => env('API_PREFIX', 'api'),

    'token_name' => env('API_TOKEN_NAME', 'duofest'),

    'token_expiry_days' => (int) env('API_TOKEN_EXPIRY_DAYS', 7),

    'per_page' => (int) env('API_PER_PAGE', 15),

    'max_per_page' => (int) env('API_MAX_PER_PAGE', 100),

    'rate_limits' => [
        'auth' => env('API_RATE_LIMIT_AUTH', 10),
        'auth_decay' => env('API_RATE_LIMIT_AUTH_DECAY', 1),
        'forgot_password' => env('API_RATE_LIMIT_FORGOT_PASSWORD', 3),
        'forgot_password_decay' => env('API_RATE_LIMIT_FORGOT_PASSWORD_DECAY', 1),
        'api' => env('API_RATE_LIMIT_API', 60),
        'api_decay' => env('API_RATE_LIMIT_API_DECAY', 1),
        'otp' => env('API_RATE_LIMIT_OTP', 5),
        'otp_decay' => env('API_RATE_LIMIT_OTP_DECAY', 1),
    ],

    'registration' => [
        'otp_ttl_minutes' => (int) env('REGISTRATION_OTP_TTL_MINUTES', 5),
    ],

    'defaults' => [
        'user_role' => env('API_DEFAULT_USER_ROLE', 'student'),
    ],

];
