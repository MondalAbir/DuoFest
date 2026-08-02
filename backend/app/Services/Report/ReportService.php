<?php

namespace App\Services\Report;

use App\Contracts\Services\ReportServiceInterface;
use App\Enums\AttendanceStatus;
use App\Enums\CertificateStatus;
use App\Enums\PaymentStatus;
use App\Enums\RegistrationStatus;
use App\Enums\VolunteerStatus;
use App\Exceptions\ApiException;
use App\Models\Event;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class ReportService implements ReportServiceInterface
{
    private const TYPES = ['attendance', 'revenue', 'registrations', 'events', 'volunteers', 'certificates'];

    private const TITLES = [
        'attendance' => 'Attendance Report',
        'revenue' => 'Revenue Report',
        'registrations' => 'Registrations Report',
        'events' => 'Events Report',
        'volunteers' => 'Volunteers Report',
        'certificates' => 'Certificates Report',
    ];

    /**
     * @var array<string, list<array{key: string, label: string}>>
     */
    private const COLUMNS = [
        'events' => [
            ['key' => 'event_id', 'label' => 'Event ID'],
            ['key' => 'event_title', 'label' => 'Event'],
            ['key' => 'status', 'label' => 'Status'],
            ['key' => 'starts_at', 'label' => 'Starts At'],
            ['key' => 'capacity', 'label' => 'Capacity'],
            ['key' => 'registered', 'label' => 'Registered'],
            ['key' => 'confirmed', 'label' => 'Confirmed'],
            ['key' => 'checked_in', 'label' => 'Checked In'],
            ['key' => 'cancelled', 'label' => 'Cancelled'],
            ['key' => 'attendance', 'label' => 'Attended'],
            ['key' => 'revenue', 'label' => 'Revenue'],
            ['key' => 'volunteers', 'label' => 'Volunteers'],
            ['key' => 'certificates', 'label' => 'Certificates'],
        ],
        'registrations' => [
            ['key' => 'event_id', 'label' => 'Event ID'],
            ['key' => 'event_title', 'label' => 'Event'],
            ['key' => 'pending', 'label' => 'Pending'],
            ['key' => 'confirmed', 'label' => 'Confirmed'],
            ['key' => 'checked_in', 'label' => 'Checked In'],
            ['key' => 'cancelled', 'label' => 'Cancelled'],
            ['key' => 'guest', 'label' => 'Guests'],
            ['key' => 'account', 'label' => 'Account Holders'],
            ['key' => 'total', 'label' => 'Total'],
        ],
        'attendance' => [
            ['key' => 'event_id', 'label' => 'Event ID'],
            ['key' => 'event_title', 'label' => 'Event'],
            ['key' => 'registered', 'label' => 'Registered'],
            ['key' => 'present', 'label' => 'Present'],
            ['key' => 'late', 'label' => 'Late'],
            ['key' => 'excused', 'label' => 'Excused'],
            ['key' => 'attended', 'label' => 'Total Attended'],
            ['key' => 'attendance_rate', 'label' => 'Attendance Rate (%)'],
        ],
        'revenue' => [
            ['key' => 'event_id', 'label' => 'Event ID'],
            ['key' => 'event_title', 'label' => 'Event'],
            ['key' => 'pending_amount', 'label' => 'Pending'],
            ['key' => 'completed_amount', 'label' => 'Completed'],
            ['key' => 'failed_amount', 'label' => 'Failed'],
            ['key' => 'refunded_amount', 'label' => 'Refunded'],
            ['key' => 'net', 'label' => 'Net'],
        ],
        'volunteers' => [
            ['key' => 'event_id', 'label' => 'Event ID'],
            ['key' => 'event_title', 'label' => 'Event'],
            ['key' => 'assigned', 'label' => 'Assigned'],
            ['key' => 'accepted', 'label' => 'Accepted'],
            ['key' => 'completed', 'label' => 'Completed'],
            ['key' => 'cancelled', 'label' => 'Cancelled'],
            ['key' => 'active', 'label' => 'Active'],
            ['key' => 'hours', 'label' => 'Hours'],
        ],
        'certificates' => [
            ['key' => 'event_id', 'label' => 'Event ID'],
            ['key' => 'event_title', 'label' => 'Event'],
            ['key' => 'issued', 'label' => 'Issued'],
            ['key' => 'emailed', 'label' => 'Emailed'],
            ['key' => 'revoked', 'label' => 'Revoked'],
            ['key' => 'total', 'label' => 'Total'],
        ],
    ];

    public function report(string $type, array $filters = []): array
    {
        if (! in_array($type, self::TYPES, true)) {
            throw new ApiException('Unsupported report type.', 422, errorCode: 'invalid_report_type');
        }

        $range = $this->dateRange($filters);

        $rows = match ($type) {
            'events' => $this->eventsRows($filters, $range),
            'registrations' => $this->registrationsRows($filters, $range),
            'attendance' => $this->attendanceRows($filters, $range),
            'revenue' => $this->revenueRows($filters, $range),
            'volunteers' => $this->volunteersRows($filters, $range),
            'certificates' => $this->certificatesRows($filters, $range),
        };

        return [
            'type' => $type,
            'title' => self::TITLES[$type],
            'filters' => array_filter($filters, fn ($value) => $value !== null && $value !== ''),
            'columns' => self::COLUMNS[$type],
            'rows' => $rows,
            'summary' => $this->summarize($type, $rows),
        ];
    }

    public function toCsv(array $report): string
    {
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, "\xEF\xBB\xBF");

        fputcsv($stream, array_column($report['columns'], 'label'));

        foreach ($report['rows'] as $row) {
            fputcsv($stream, array_map(fn ($column) => $row[$column['key']] ?? '', $report['columns']));
        }

        rewind($stream);

        return (string) stream_get_contents($stream);
    }

    public function toPdf(array $report): string
    {
        return Pdf::loadView('pdfs.report', ['report' => $report])->output();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function eventsRows(array $filters, array $range): array
    {
        $events = $this->baseEvents($filters, true)
            ->withCount([
                'registrations as registrations_total' => fn ($q) => $q->whereNotIn('status', [RegistrationStatus::CANCELLED->value]),
                'registrations as registrations_confirmed' => fn ($q) => $q->where('status', RegistrationStatus::CONFIRMED->value),
                'registrations as registrations_checked_in' => fn ($q) => $q->where('status', RegistrationStatus::CHECKED_IN->value),
                'registrations as registrations_cancelled' => fn ($q) => $q->where('status', RegistrationStatus::CANCELLED->value),
                'attendance as attendance_total',
                'volunteers as volunteers_active' => fn ($q) => $q->whereNotIn('status', [VolunteerStatus::CANCELLED->value]),
                'certificates as certificates_issued' => fn ($q) => $q->withoutTrashed()->where('certificates.status', CertificateStatus::ISSUED->value),
            ])
            ->withSum(['transactions as revenue_completed' => fn ($q) => $q->where('status', PaymentStatus::COMPLETED->value)], 'amount')
            ->get();

        return $events->map(fn (Event $event) => [
            'event_id' => $event->id,
            'event_title' => $event->title,
            'status' => $event->status->value,
            'starts_at' => $event->starts_at?->format('Y-m-d') ?? '',
            'capacity' => $event->capacity ?? '',
            'registered' => (int) $event->registrations_total,
            'confirmed' => (int) $event->registrations_confirmed,
            'checked_in' => (int) $event->registrations_checked_in,
            'cancelled' => (int) $event->registrations_cancelled,
            'attendance' => (int) $event->attendance_total,
            'revenue' => round((float) $event->revenue_completed, 2),
            'volunteers' => (int) $event->volunteers_active,
            'certificates' => (int) $event->certificates_issued,
        ])->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function registrationsRows(array $filters, array $range): array
    {
        $effective = $filters['status'] ?? null;

        $events = $this->baseEvents($filters)
            ->withCount([
                'registrations as r_pending' => $this->registrationsAgg(RegistrationStatus::PENDING->value, $range, $effective),
                'registrations as r_confirmed' => $this->registrationsAgg(RegistrationStatus::CONFIRMED->value, $range, $effective),
                'registrations as r_checked_in' => $this->registrationsAgg(RegistrationStatus::CHECKED_IN->value, $range, $effective),
                'registrations as r_cancelled' => $this->registrationsAgg(RegistrationStatus::CANCELLED->value, $range, $effective),
                'registrations as r_guest' => function (Builder $query) use ($range, $effective) {
                    $this->between($query, 'created_at', $range);
                    $query->whereNull('user_id')
                        ->whereNotIn('status', [RegistrationStatus::CANCELLED->value]);
                    if ($effective) {
                        $query->where('status', $effective);
                    }
                },
            ])
            ->get();

        return $events->map(fn (Event $event) => [
            'event_id' => $event->id,
            'event_title' => $event->title,
            'pending' => (int) $event->r_pending,
            'confirmed' => (int) $event->r_confirmed,
            'checked_in' => (int) $event->r_checked_in,
            'cancelled' => (int) $event->r_cancelled,
            'guest' => (int) $event->r_guest,
            'account' => max(0, (int) $event->r_pending + $event->r_confirmed + $event->r_checked_in - (int) $event->r_guest),
            'total' => (int) $event->r_pending + $event->r_confirmed + $event->r_checked_in,
        ])->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function attendanceRows(array $filters, array $range): array
    {
        $effective = $filters['status'] ?? null;

        $events = $this->baseEvents($filters)
            ->withCount([
                'registrations as registered_count' => fn ($q) => $q->whereNotIn('status', [RegistrationStatus::CANCELLED->value]),
                'attendance as present_count' => $this->attendanceAgg(AttendanceStatus::PRESENT->value, $range, $effective),
                'attendance as late_count' => $this->attendanceAgg(AttendanceStatus::LATE->value, $range, $effective),
                'attendance as excused_count' => $this->attendanceAgg(AttendanceStatus::EXCUSED->value, $range, $effective),
            ])
            ->get();

        return $events->map(function (Event $event) {
            $registered = (int) $event->registered_count;
            $attended = (int) $event->present_count + (int) $event->late_count;

            return [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'registered' => $registered,
                'present' => (int) $event->present_count,
                'late' => (int) $event->late_count,
                'excused' => (int) $event->excused_count,
                'attended' => $attended,
                'attendance_rate' => $registered > 0 ? round($attended / $registered * 100, 2) : 0,
            ];
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function revenueRows(array $filters, array $range): array
    {
        $effective = $filters['status'] ?? null;

        $events = $this->baseEvents($filters)
            ->withSum([
                'transactions as revenue_pending' => $this->transactionsAgg(PaymentStatus::PENDING->value, $range, $effective),
                'transactions as revenue_completed' => $this->transactionsAgg(PaymentStatus::COMPLETED->value, $range, $effective),
                'transactions as revenue_failed' => $this->transactionsAgg(PaymentStatus::FAILED->value, $range, $effective),
                'transactions as revenue_refunded' => $this->transactionsAgg(PaymentStatus::REFUNDED->value, $range, $effective),
            ], 'amount')
            ->get();

        return $events->map(fn (Event $event) => [
            'event_id' => $event->id,
            'event_title' => $event->title,
            'pending_amount' => round((float) $event->revenue_pending, 2),
            'completed_amount' => round((float) $event->revenue_completed, 2),
            'failed_amount' => round((float) $event->revenue_failed, 2),
            'refunded_amount' => round((float) $event->revenue_refunded, 2),
            'net' => round((float) $event->revenue_completed - (float) $event->revenue_refunded, 2),
        ])->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function volunteersRows(array $filters, array $range): array
    {
        $effective = $filters['status'] ?? null;

        $events = $this->baseEvents($filters)
            ->withCount([
                'volunteers as v_assigned' => $this->volunteersAgg(VolunteerStatus::ASSIGNED->value, $range, $effective),
                'volunteers as v_accepted' => $this->volunteersAgg(VolunteerStatus::ACCEPTED->value, $range, $effective),
                'volunteers as v_completed' => $this->volunteersAgg(VolunteerStatus::COMPLETED->value, $range, $effective),
                'volunteers as v_cancelled' => $this->volunteersAgg(VolunteerStatus::CANCELLED->value, $range, $effective),
                'volunteers as v_active' => function (Builder $query) use ($range, $effective) {
                    $this->between($query, 'created_at', $range);
                    $query->whereNotIn('status', [VolunteerStatus::CANCELLED->value]);
                    if ($effective) {
                        $query->where('status', $effective);
                    }
                },
            ])
            ->withSum(['volunteers as v_hours' => $this->volunteersAgg(VolunteerStatus::COMPLETED->value, $range, $effective)], 'hours_volunteered')
            ->get();

        return $events->map(fn (Event $event) => [
            'event_id' => $event->id,
            'event_title' => $event->title,
            'assigned' => (int) $event->v_assigned,
            'accepted' => (int) $event->v_accepted,
            'completed' => (int) $event->v_completed,
            'cancelled' => (int) $event->v_cancelled,
            'active' => (int) $event->v_active,
            'hours' => round((float) $event->v_hours, 2),
        ])->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function certificatesRows(array $filters, array $range): array
    {
        $effective = $filters['status'] ?? null;

        $events = $this->baseEvents($filters)
            ->withCount([
                'certificates as c_issued' => $this->certificatesAgg(CertificateStatus::ISSUED->value, $range, $effective),
                'certificates as c_emailed' => function (Builder $query) use ($range, $effective) {
                    $this->certificatesAgg(CertificateStatus::ISSUED->value, $range, $effective)($query);
                    $query->whereNotNull('certificates.emailed_at');
                },
                'certificates as c_revoked' => function (Builder $query) use ($range, $effective) {
                    $query->withTrashed()
                        ->where('certificates.status', $effective ?? CertificateStatus::REVOKED->value);
                    $this->between($query, 'certificates.issued_at', $range);
                },
            ])
            ->get();

        return $events->map(fn (Event $event) => [
            'event_id' => $event->id,
            'event_title' => $event->title,
            'issued' => (int) $event->c_issued,
            'emailed' => (int) $event->c_emailed,
            'revoked' => (int) $event->c_revoked,
            'total' => (int) $event->c_issued + (int) $event->c_revoked,
        ])->all();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Event>
     */
    private function baseEvents(array $filters, bool $eventDate = false): Builder
    {
        return Event::query()
            ->when($filters['college_id'] ?? null, fn ($q, $id) => $q->where('college_id', $id))
            ->when($filters['event_id'] ?? null, fn ($q, $id) => $q->where('id', $id))
            ->when($eventDate, function (Builder $query) use ($filters) {
                $query
                    ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
                    ->when($filters['from'] ?? null, fn ($q, $date) => $q->whereDate('starts_at', '>=', Carbon::parse($date)))
                    ->when($filters['to'] ?? null, fn ($q, $date) => $q->whereDate('starts_at', '<=', Carbon::parse($date)));
            })
            ->orderBy('id');
    }

    /**
     * Aggregate closure for registrations by status.
     */
    private function registrationsAgg(?string $status, array $range, ?string $effective): \Closure
    {
        return function (Builder $query) use ($status, $range, $effective) {
            $this->between($query, 'created_at', $range);

            if ($status !== null || $effective !== null) {
                $query->where('status', $effective ?? $status);
            }
        };
    }

    /**
     * Aggregate closure for attendance.
     */
    private function attendanceAgg(?string $status, array $range, ?string $effective): \Closure
    {
        return function (Builder $query) use ($status, $range, $effective) {
            $this->between($query, 'attended_at', $range);

            $query->where('status', $effective ?? $status);
        };
    }

    /**
     * Aggregate closure for transactions (used with withSum).
     */
    private function transactionsAgg(?string $status, array $range, ?string $effective): \Closure
    {
        return function (Builder $query) use ($status, $range, $effective) {
            $this->between($query, 'paid_at', $range);

            $query->where('status', $effective ?? $status);
        };
    }

    /**
     * Aggregate closure for volunteers (used with withCount/withSum).
     */
    private function volunteersAgg(?string $status, array $range, ?string $effective): \Closure
    {
        return function (Builder $query) use ($status, $range, $effective) {
            $this->between($query, 'created_at', $range);

            $query->where('status', $effective ?? $status);
        };
    }

    /**
     * Aggregate closure for certificates (issued/emailed only, non-trashed).
     */
    private function certificatesAgg(?string $status, array $range, ?string $effective): \Closure
    {
        return function (Builder $query) use ($status, $range, $effective) {
            $query->withoutTrashed()
                ->where('certificates.status', $effective ?? $status);

            $this->between($query, 'certificates.issued_at', $range);
        };
    }

    /**
     * Apply an optional date range to a child-table query.
     *
     * @param  array{0: ?Carbon, 1: ?Carbon}  $range
     */
    private function between(Builder $query, string $column, array $range): void
    {
        [$from, $to] = $range;

        if ($from) {
            $query->where($column, '>=', $from);
        }

        if ($to) {
            $query->where($column, '<=', $to);
        }
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    private function dateRange(array $filters): array
    {
        return [
            isset($filters['from']) ? Carbon::parse($filters['from'])->startOfDay() : null,
            isset($filters['to']) ? Carbon::parse($filters['to'])->endOfDay() : null,
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     * @return array<string, mixed>
     */
    private function summarize(string $type, array $rows): array
    {
        $sumKeys = match ($type) {
            'events' => ['registered', 'confirmed', 'checked_in', 'cancelled', 'attendance', 'revenue', 'volunteers', 'certificates'],
            'registrations' => ['pending', 'confirmed', 'checked_in', 'cancelled', 'guest', 'account', 'total'],
            'attendance' => ['registered', 'present', 'late', 'excused', 'attended'],
            'revenue' => ['pending_amount', 'completed_amount', 'failed_amount', 'refunded_amount', 'net'],
            'volunteers' => ['assigned', 'accepted', 'completed', 'cancelled', 'active', 'hours'],
            'certificates' => ['issued', 'emailed', 'revoked', 'total'],
        };

        $summary = ['events' => count($rows)];

        foreach ($sumKeys as $key) {
            $summary[$key] = 0;
        }

        foreach ($rows as $row) {
            foreach ($sumKeys as $key) {
                $summary[$key] += (float) $row[$key];
            }
        }

        foreach ($summary as $key => $value) {
            if (in_array($key, ['revenue', 'pending_amount', 'completed_amount', 'failed_amount', 'refunded_amount', 'net', 'hours'], true)) {
                $summary[$key] = round($value, 2);
            }
        }

        if ($type === 'attendance') {
            $registered = (float) $summary['registered'];

            $summary['attendance_rate'] = $registered > 0 ? round($summary['attended'] / $registered * 100, 2) : 0;
        }

        return $summary;
    }
}
