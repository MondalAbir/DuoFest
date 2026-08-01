<?php

namespace App\Models;

use Illuminate\Notifications\DatabaseNotification;

/**
 * Application wrapper over Laravel's database notification, so the
 * notifications table can be referenced as a first-class model.
 */
class Notification extends DatabaseNotification {}
