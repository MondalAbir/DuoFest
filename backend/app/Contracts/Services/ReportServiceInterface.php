<?php

namespace App\Contracts\Services;

interface ReportServiceInterface
{
    /**
     * Generate a report dataset.
     *
     * @param  array<string, mixed>  $filters
     * @return array{type: string, title: string, filters: array<string, mixed>, columns: list<array{key: string, label: string}>, rows: list<array<string, mixed>>, summary: array<string, mixed>}
     */
    public function report(string $type, array $filters = []): array;

    /**
     * Render a report dataset as a CSV string (UTF-8 BOM, Excel friendly).
     *
     * @param  array<string, mixed>  $report
     */
    public function toCsv(array $report): string;

    /**
     * Render a report dataset as PDF binary.
     *
     * @param  array<string, mixed>  $report
     */
    public function toPdf(array $report): string;
}
