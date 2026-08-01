<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case COLLEGE_ADMIN = 'college_admin';
    case EVENT_MANAGER = 'event_manager';
    case VOLUNTEER = 'volunteer';
    case STUDENT = 'student';

    /**
     * All assignable roles, used by seeders and tests.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }
}
