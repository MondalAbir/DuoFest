<?php

namespace App\Http\Controllers\Api\Report;

use App\Contracts\Services\ReportServiceInterface;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Report\ReportRequest;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends ApiController
{
    public function __construct(
        private readonly ReportServiceInterface $reportService,
    ) {}

    /**
     * Generate a report dataset as JSON.
     */
    public function show(ReportRequest $request, string $report): JsonResponse
    {
        $data = $this->reportService->report($report, $request->validated());

        return $this->success($data, 'Report generated.');
    }

    /**
     * Export a report as CSV or PDF.
     */
    public function export(ReportRequest $request, string $report): Response
    {
        $data = $this->reportService->report($report, $request->validated());

        $stamp = now()->format('Y-m-d');

        if ($request->input('format', 'csv') === 'pdf') {
            $pdf = $this->reportService->toPdf($data);

            return response()->streamDownload(
                fn () => print $pdf,
                "{$report}-report-{$stamp}.pdf",
                ['Content-Type' => 'application/pdf'],
            );
        }

        $csv = $this->reportService->toCsv($data);

        return response()->streamDownload(
            fn () => print $csv,
            "{$report}-report-{$stamp}.csv",
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }
}
