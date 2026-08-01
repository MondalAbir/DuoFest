<?php

namespace App\Enums;

enum VolunteerStatus: string
{
    case ASSIGNED = 'assigned';
    case ACCEPTED = 'accepted';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
