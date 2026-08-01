<?php

namespace App\Enums;

enum SponsorTier: string
{
    case PLATINUM = 'platinum';
    case GOLD = 'gold';
    case SILVER = 'silver';
    case BRONZE = 'bronze';
    case PARTNER = 'partner';

    public static function values(): array
    {
        return array_map(fn (self $tier) => $tier->value, self::cases());
    }
}
