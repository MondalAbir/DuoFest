<?php

namespace App\Enums;

enum EventMediaType: string
{
    case BANNER = 'banner';
    case GALLERY = 'gallery';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
