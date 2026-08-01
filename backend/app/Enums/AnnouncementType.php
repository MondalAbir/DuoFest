<?php

namespace App\Enums;

enum AnnouncementType: string
{
    case INFO = 'info';
    case WARNING = 'warning';
    case IMPORTANT = 'important';
    case UPDATE = 'update';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
