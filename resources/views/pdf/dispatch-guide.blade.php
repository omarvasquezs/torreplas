<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Guía de Remisión {{ $guide->code }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 12px; padding: 20px; }

        .header { display: table; width: 100%; border-bottom: 3px solid #0891b2; padding-bottom: 12px; margin-bottom: 16px; }
        .header-left  { display: table-cell; vertical-align: middle; }
        .header-right { display: table-cell; text-align: right; vertical-align: middle; }
        .company-name { font-size: 20px; font-weight: 700; color: #164e63; }
        .company-sub  { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .doc-box { border: 2px solid #0891b2; border-radius: 6px; padding: 8px 16px; display: inline-block; text-align: center; }
        .doc-type { font-size: 11px; font-weight: 700; color: #0891b2; text-transform: uppercase; letter-spacing: 0.05em; }
        .doc-code { font-size: 17px; font-weight: 700; color: #111827; margin-top: 2px; font-family: monospace; }

        .grid { display: table; width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .col { display: table-cell; padding: 0 6px; vertical-align: top; }
        .col:first-child { padding-left: 0; }
        .col:last-child  { padding-right: 0; }
        .box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; height: 100%; }
        .box h3 { font-size: 10px; text-transform: uppercase; color: #0891b2; letter-spacing: 0.06em; margin-bottom: 6px; font-weight: 700; }
        .field { margin-bottom: 4px; }
        .label { color: #9ca3af; font-size: 10px; }
        .value { font-weight: 600; color: #111827; font-size: 12px; }

        .route-section { margin-bottom: 14px; }
        .route-grid { display: table; width: 100%; }
        .route-col { display: table-cell; width: 50%; padding-right: 6px; vertical-align: top; }
        .route-col:last-child { padding-right: 0; padding-left: 6px; }

        .arrow { display: table-cell; width: 30px; text-align: center; vertical-align: middle; font-size: 20px; color: #6b7280; }

        table.items { width: 100%; border-collapse: collapse; }
        table.items thead th { background: #ecfeff; color: #164e63; text-align: left; padding: 8px 10px; font-size: 11px; border-bottom: 2px solid #0891b2; }
        table.items tbody td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
        table.items tbody tr:last-child td { border-bottom: none; }
        .text-right  { text-align: right; }
        .text-center { text-align: center; }
        .mono { font-family: monospace; }

        .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        .obs-box { border: 1px dashed #d1d5db; border-radius: 6px; padding: 8px 12px; margin-bottom: 14px; font-size: 11px; color: #374151; }
    </style>
</head>
<body>

    {{-- HEADER --}}
    <div class="header">
        <div class="header-left">
            <div class="company-name">TORREPLAS SAC</div>
            <div class="company-sub">RUC: 20XXXXXXXXX &nbsp;|&nbsp; Lima, Perú</div>
        </div>
        <div class="header-right">
            <div class="doc-box">
                <div class="doc-type">Guía de Remisión - Remitente</div>
                <div class="doc-code">{{ $guide->code }}</div>
            </div>
        </div>
    </div>

    {{-- META --}}
    <div class="grid" style="margin-bottom:14px">
        <div class="col" style="width:50%">
            <div class="box">
                <h3>Datos del Traslado</h3>
                <div class="field"><div class="label">Fecha de Emisión</div><div class="value">{{ \Carbon\Carbon::parse($guide->issue_date)->format('d/m/Y') }}</div></div>
                <div class="field"><div class="label">Destinatario</div><div class="value">{{ $guide->recipient_name }}</div></div>
                <div class="field"><div class="label">Estado</div><div class="value">{{ strtoupper($guide->status) }}</div></div>
                <div class="field"><div class="label">Registrado por</div><div class="value">{{ $guide->user?->name ?? '—' }}</div></div>
            </div>
        </div>
        <div class="col" style="width:50%">
            <div class="box">
                <h3>Ruta</h3>
                <div class="field"><div class="label">Ubigeo Origen</div><div class="value mono">{{ $guide->origin_ubigeo }}</div></div>
                <div class="field"><div class="label">Dirección Origen</div><div class="value">{{ $guide->origin_address }}</div></div>
                <div class="field" style="margin-top:6px"><div class="label">Ubigeo Destino</div><div class="value mono">{{ $guide->destination_ubigeo }}</div></div>
                <div class="field"><div class="label">Dirección Destino</div><div class="value">{{ $guide->destination_address }}</div></div>
            </div>
        </div>
    </div>

    {{-- OBSERVATIONS --}}
    @if($guide->observations)
    <div class="obs-box">
        <strong>Observaciones:</strong> {{ $guide->observations }}
    </div>
    @endif

    {{-- ITEMS --}}
    <table class="items">
        <thead>
            <tr>
                <th class="text-center">#</th>
                <th>Código</th>
                <th>Descripción</th>
                <th class="text-center">Unidad</th>
                <th class="text-right">Cantidad</th>
            </tr>
        </thead>
        <tbody>
            @forelse($guide->items as $i => $item)
            <tr>
                <td class="text-center">{{ $i + 1 }}</td>
                <td class="mono">{{ $item->product?->code ?? '—' }}</td>
                <td>{{ $item->product_name }}</td>
                <td class="text-center">{{ $item->unit_name ?? 'UND' }}</td>
                <td class="text-right">{{ number_format($item->quantity, 2) }}</td>
            </tr>
            @empty
            <tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:16px">Sin ítems registrados.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Total de ítems: {{ $guide->items->count() }} &nbsp;|&nbsp;
        Generado el {{ now()->format('d/m/Y H:i') }} &nbsp;|&nbsp; TORREPLAS SAC
    </div>

</body>
</html>
