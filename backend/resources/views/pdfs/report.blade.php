<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $report['title'] }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; color: #111827; margin: 0; padding: 24px; font-size: 12px; }
        h1 { margin: 0 0 2px; font-size: 22px; }
        .meta { color: #6b7280; font-size: 11px; margin-bottom: 18px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f3f4f6; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        th, td { border: 1px solid #d1d5db; padding: 6px 8px; }
        td.num, th.num { text-align: right; }
        .summary { margin-top: 18px; font-size: 11px; }
        .summary strong { min-width: 170px; display: inline-block; }
    </style>
</head>
<body>
    <h1>{{ $report['title'] }}</h1>
    <div class="meta">Generated {{ now()->format('F j, Y g:i A') }} &middot; {{ count($report['rows']) }} event(s)</div>

    <table>
        <thead>
            <tr>
                @foreach ($report['columns'] as $column)
                    <th>{{ $column['label'] }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach ($report['rows'] as $row)
                <tr>
                    @foreach ($report['columns'] as $column)
                        @php
                            $value = $row[$column['key']] ?? '';
                            $isMoney = in_array($column['key'], ['revenue', 'pending_amount', 'completed_amount', 'failed_amount', 'refunded_amount', 'net'], true);
                        @endphp
                        <td class="{{ $isMoney ? 'num' : '' }}">{{ $isMoney ? number_format((float) $value, 2) : $value }}</td>
                    @endforeach
                </tr>
            @endforeach
        </tbody>
    </table>

    @if ($report['summary'])
        <div class="summary">
            <strong>Summary</strong>
            @foreach ($report['summary'] as $key => $value)
                <div><strong>{{ str_replace('_', ' ', ucfirst((string) $key)) }}</strong> {{ $value }}</div>
            @endforeach
        </div>
    @endif
</body>
</html>
