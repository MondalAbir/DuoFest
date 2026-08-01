<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * Generates a public UUID for a model on a dedicated `uuid` column while
 * keeping the integer primary key for relations and performance.
 */
trait HasUuid
{
    use HasUuids;

    public function uniqueIds(): array
    {
        return ['uuid'];
    }
}
