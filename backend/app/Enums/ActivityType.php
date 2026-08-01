<?php

namespace App\Enums;

enum ActivityType: string
{
    case CREATED = 'created';
    case UPDATED = 'updated';
    case DELETED = 'deleted';
    case RESTORED = 'restored';
    case LOGIN = 'login';
    case LOGOUT = 'logout';
    case REGISTERED = 'registered';
    case EMAIL_VERIFIED = 'email_verified';
    case PASSWORD_RESET = 'password_reset';
    case PASSWORD_CHANGED = 'password_changed';
    case ROLE_ASSIGNED = 'role_assigned';
    case CHECK_IN = 'check_in';
    case CANCELLED = 'cancelled';
    case REQUEST = 'request';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
