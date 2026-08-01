<?php

namespace App\Enums;

enum RegistrationStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case CHECKED_IN = 'checked_in';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
