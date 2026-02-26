<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante de Alquiler</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 12px; }
        .header { border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 16px; }
        .title { font-size: 22px; font-weight: 700; color: #312e81; margin: 0; }
        .subtitle { color: #6b7280; margin-top: 4px; }
        .grid { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .grid td { padding: 6px 4px; vertical-align: top; }
        .label { color: #6b7280; font-size: 11px; }
        .value { font-weight: 600; }
        .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; margin-top: 8px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        .table th { background: #eef2ff; color: #3730a3; text-align: left; padding: 8px; font-size: 11px; }
        .table td { border-bottom: 1px solid #e5e7eb; padding: 8px; }
        .right { text-align: right; }
        .footer { margin-top: 18px; color: #6b7280; font-size: 10px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Comprobante de Alquiler</h1>
        <div class="subtitle">TORREPLAS SAC</div>
    </div>

    <table class="grid">
        <tr>
            <td width="50%">
                <div class="label">Cliente</div>
                <div class="value">{{ $rental->client?->name ?? '—' }}</div>
            </td>
            <td width="25%">
                <div class="label">Contrato N°</div>
                <div class="value">{{ str_pad((string)$rental->id, 6, '0', STR_PAD_LEFT) }}</div>
            </td>
            <td width="25%">
                <div class="label">Estado</div>
                <div class="value">{{ strtoupper($rental->status) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Descripción</div>
                <div class="value">{{ $rental->description }}</div>
            </td>
            <td>
                <div class="label">Inicio</div>
                <div class="value">{{ optional($rental->start_date)->format('d/m/Y') }}</div>
            </td>
            <td>
                <div class="label">Fin</div>
                <div class="value">{{ $rental->end_date ? optional($rental->end_date)->format('d/m/Y') : 'Indefinido' }}</div>
            </td>
        </tr>
    </table>

    <div class="box">
        <table class="grid" style="margin-bottom:0;">
            <tr>
                <td width="33%">
                    <div class="label">Canon mensual</div>
                    <div class="value">S/ {{ number_format((float)$rental->monthly_fee, 2) }}</div>
                </td>
                <td width="33%">
                    <div class="label">Día de vencimiento</div>
                    <div class="value">{{ $rental->payment_day }}</div>
                </td>
                <td width="34%">
                    <div class="label">Último cobro</div>
                    <div class="value">{{ $latestPayment?->period ?? '—' }}</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Período</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th class="right">Monto (S/)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rental->payments->take(8) as $payment)
                <tr>
                    <td>{{ $payment->period }}</td>
                    <td>{{ optional($payment->due_date)->format('d/m/Y') }}</td>
                    <td>{{ strtoupper($payment->status) }}</td>
                    <td class="right">{{ number_format((float)$payment->amount, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align:center;color:#6b7280;">Sin cobros registrados</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Generado el {{ $generatedAt->format('d/m/Y H:i') }}
    </div>
</body>
</html>
