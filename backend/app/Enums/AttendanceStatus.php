<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case PRESENT = 'present';
    case LATE = 'late';
    case EXCUSED = 'excused';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
