<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Guía de Remisión {{ $guide->code }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #1f2937;
            padding: 18px 22px;
            line-height: 1.3;
        }

        /* ── HEADER ── */
        .header-table { width: 100%; border-collapse: collapse; border-bottom: 3px solid #0891b2; padding-bottom: 8px; margin-bottom: 12px; }
        .company-name { font-size: 18px; font-weight: 700; color: #164e63; }
        .company-sub  { font-size: 10px; color: #6b7280; margin-top: 2px; }
        .doc-box { border: 2px solid #0891b2; border-radius: 4px; padding: 5px 12px; text-align: center; }
        .doc-type { font-size: 9px; font-weight: 700; color: #0891b2; text-transform: uppercase; letter-spacing: 0.04em; }
        .doc-code { font-size: 15px; font-weight: 700; color: #111827; font-family: monospace; }

        /* ── INFO BLOCKS ── */
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .info-table td { vertical-align: top; padding: 0 5px; }
        .info-table td:first-child { padding-left: 0; }
        .info-table td:last-child  { padding-right: 0; }
        .box { border: 1px solid #d1d5db; border-radius: 4px; padding: 7px 10px; }
        .box-title { font-size: 9px; text-transform: uppercase; color: #0891b2; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 5px; }
        .field { margin-bottom: 3px; }
        .lbl { font-size: 9px; color: #9ca3af; }
        .val { font-weight: 600; font-size: 11px; color: #111827; }

        /* ── ROUTE (dos columnas) ── */
        .route-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .route-table td { width: 50%; vertical-align: top; padding: 0; }
        .route-table td:first-child { padding-right: 5px; }
        .route-table td:last-child  { padding-left: 5px; }
        .route-arrow { width: 28px; text-align: center; vertical-align: middle; font-size: 18px; color: #9ca3af; padding: 0 2px; }

        /* ── OBSERVATIONS ── */
        .obs { border: 1px dashed #d1d5db; border-radius: 4px; padding: 6px 10px; margin-bottom: 10px; font-size: 10px; color: #374151; }

        /* ── ITEMS TABLE ── */
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        table.items thead th { background: #ecfeff; color: #164e63; padding: 6px 8px; font-size: 10px; border-bottom: 2px solid #0891b2; text-align: left; }
        table.items thead th.r { text-align: right; }
        table.items thead th.c { text-align: center; }
        table.items tbody td { padding: 5px 8px; font-size: 11px; border-bottom: 1px solid #f3f4f6; }
        table.items tbody td.r { text-align: right; }
        table.items tbody td.c { text-align: center; }
        table.items tbody tr:last-child td { border-bottom: none; }
        .mono { font-family: monospace; font-size: 10px; }

        /* ── FOOTER ── */
        .footer { text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 6px; }
    </style>
</head>
<body>

{{-- HEADER --}}
<table class="header-table">
    <tr>
        <td style="padding-bottom:8px">
            <div class="company-name">TORREPLAS SAC</div>
            <div class="company-sub">RUC: 20XXXXXXXXX &nbsp;|&nbsp; Lima, Perú</div>
        </td>
        <td style="text-align:right; padding-bottom:8px">
            <div class="doc-box">
                <div class="doc-type">Guía de Remisión — Remitente</div>
                <div class="doc-code">{{ $guide->code }}</div>
            </div>
        </td>
    </tr>
</table>

{{-- META INFO --}}
<table class="info-table">
    <tr>
        <td width="50%">
            <div class="box">
                <div class="box-title">Traslado</div>
                <div class="field"><div class="lbl">Destinatario</div><div class="val">{{ $guide->recipient_name }}</div></div>
                <div class="field"><div class="lbl">Fecha de Emisión</div><div class="val">{{ \Carbon\Carbon::parse($guide->issue_date)->format('d/m/Y') }}</div></div>
                <div class="field"><div class="lbl">Estado</div><div class="val">{{ strtoupper($guide->status) }}</div></div>
                <div class="field"><div class="lbl">Registrado por</div><div class="val">{{ $guide->user?->name ?? '—' }}</div></div>
            </div>
        </td>
        <td width="50%">
            <div class="box">
                <div class="box-title">Ruta</div>
                <div class="field"><div class="lbl">Ubigeo Origen</div><div class="val mono">{{ $guide->origin_ubigeo }}</div></div>
                <div class="field"><div class="lbl">Dirección Origen</div><div class="val">{{ $guide->origin_address }}</div></div>
                <div class="field" style="margin-top:4px"><div class="lbl">Ubigeo Destino</div><div class="val mono">{{ $guide->destination_ubigeo }}</div></div>
                <div class="field"><div class="lbl">Dirección Destino</div><div class="val">{{ $guide->destination_address }}</div></div>
            </div>
        </td>
    </tr>
</table>

{{-- OBSERVACIONES --}}
@if($guide->observations)
<div class="obs"><strong>Observaciones:</strong> {{ $guide->observations }}</div>
@endif

{{-- ITEMS --}}
<table class="items">
    <thead>
        <tr>
            <th class="c" style="width:30px">#</th>
            <th style="width:80px">Código</th>
            <th>Descripción</th>
            <th class="c" style="width:50px">Unidad</th>
            <th class="r" style="width:70px">Cantidad</th>
        </tr>
    </thead>
    <tbody>
        @forelse($guide->items as $i => $item)
        <tr>
            <td class="c">{{ $i + 1 }}</td>
            <td class="mono">{{ $item->product?->code ?? '—' }}</td>
            <td>{{ $item->product_name }}</td>
            <td class="c">{{ $item->unit_name ?? 'UND' }}</td>
            <td class="r">{{ number_format($item->quantity, 2) }}</td>
        </tr>
        @empty
        <tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:12px">Sin ítems registrados.</td></tr>
        @endforelse
    </tbody>
</table>

<div class="footer">
    Total de ítems: {{ $guide->items->count() }}
    &nbsp;|&nbsp; Emitido el {{ now()->format('d/m/Y H:i') }}
    &nbsp;|&nbsp; TORREPLAS SAC
</div>

</body>
</html>
