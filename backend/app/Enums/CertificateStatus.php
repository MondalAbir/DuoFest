<?php

namespace App\Enums;

enum CertificateStatus: string
{
    case ISSUED = 'issued';
    case REVOKED = 'revoked';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
