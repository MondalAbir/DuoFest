<?php

namespace App\Enums;

enum EventStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case UPCOMING = 'upcoming';
    case LIVE = 'live';
    case COMPLETED = 'completed';
    case ARCHIVED = 'archived';
    case CANCELLED = 'cancelled';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
