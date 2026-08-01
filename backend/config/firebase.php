<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Firebase Authentication Configuration
    |--------------------------------------------------------------------------
    |
    | Firebase Auth integration is driven entirely by environment variables so
    | the application can be configured per-environment without code changes.
    |
    | FIREBASE_CREDENTIALS_FILE points to a service-account JSON file. As an
    | alternative you may provide the raw JSON via FIREBASE_CREDENTIALS_JSON.
    |
    */

    'project_id' => env('FIREBASE_PROJECT_ID'),

    'credentials_file' => env('FIREBASE_CREDENTIALS_FILE'),

    'credentials_json' => env('FIREBASE_CREDENTIALS_JSON'),

    'api_key' => env('FIREBASE_API_KEY'),

    'auth' => [
        'enabled' => (bool) env('FIREBASE_AUTH_ENABLED', true),
    ],

];
