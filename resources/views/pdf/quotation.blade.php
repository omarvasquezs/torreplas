<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Cotización {{ $quotation->quote_number }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 11px; padding: 20px; }

        .header { display: table; width: 100%; border-bottom: 3px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px; }
        .header-left { display: table-cell; vertical-align: middle; }
        .header-right { display: table-cell; text-align: right; vertical-align: middle; }
        .company-logo { max-height: 58px; max-width: 170px; }
        .company-name { font-size: 19px; font-weight: 700; color: #312e81; }
        .company-sub  { font-size: 10px; color: #6b7280; margin-top: 2px; }
        .doc-box { border: 2px solid #4f46e5; border-radius: 6px; padding: 7px 16px; display: inline-block; text-align: center; }
        .doc-type { font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.04em; }
        .doc-num  { font-size: 15px; font-weight: 700; color: #111827; margin-top: 2px; font-family: monospace; }

        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .meta-table td { vertical-align: top; padding: 0 5px; }
        .meta-table td:first-child { padding-left: 0; }
        .meta-table td:last-child  { padding-right: 0; }
        .box { border: 1px solid #e5e7eb; border-radius: 5px; padding: 8px 10px; }
        .box-title { font-size: 9px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.04em; margin-bottom: 5px; font-weight: 700; }
        .field { margin-bottom: 3px; }
        .lbl { font-size: 9px; color: #9ca3af; }
        .val { font-weight: 600; color: #111827; font-size: 11px; }

        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        .items-table thead th { background: #eef2ff; color: #3730a3; padding: 7px 8px; font-size: 10px; text-align: left; border-bottom: 2px solid #c7d2fe; }
        .items-table thead th.r { text-align: right; }
        .items-table tbody td { padding: 6px 8px; font-size: 11px; border-bottom: 1px solid #f3f4f6; }
        .items-table tbody td.r { text-align: right; }
        .items-table tbody td.c { text-align: center; }
        .items-table tbody tr:last-child td { border-bottom: none; }

        .totals { width: 210px; margin-left: auto; border: 1px solid #e5e7eb; border-radius: 5px; overflow: hidden; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals table td { padding: 5px 10px; font-size: 11px; }
        .totals table tr:not(:last-child) td { border-bottom: 1px solid #e5e7eb; }
        .totals-label { color: #6b7280; }
        .totals-value { text-align: right; font-weight: 600; }
        .totals-total td { background: #4f46e5; color: #fff; font-weight: 700; font-size: 12px; }

        .notes { border: 1px dashed #d1d5db; border-radius: 5px; padding: 8px 10px; margin-top: 14px; font-size: 10px; color: #374151; }
        .notes-title { font-weight: 700; margin-bottom: 3px; color: #6b7280; font-size: 9px; text-transform: uppercase; }

        .sigs { display: table; width: 100%; margin-top: 28px; }
        .sig-cell { display: table-cell; width: 45%; text-align: center; }
        .sig-line { border-top: 1px solid #374151; padding-top: 5px; font-size: 10px; color: #374151; margin-top: 28px; }

        .footer { margin-top: 18px; text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
    </style>
</head>
<body>

@php
    $logoPath = public_path('logo_torre_plas.png');
    $ruc      = $company->ruc     ?? '20XXXXXXXXX';
    $bizName  = $company->name    ?? 'TORREPLAS SAC';
    $address  = $company->address ?? 'Lima, Perú';
    $phone    = $company->phone   ?? '';
@endphp

{{-- HEADER --}}
<div class="header">
    <div class="header-left">
        @if(file_exists($logoPath))
            <img src="{{ $logoPath }}" class="company-logo" alt="Logo">
        @else
            <div class="company-name">{{ $bizName }}</div>
        @endif
        <div class="company-sub">RUC: {{ $ruc }} &nbsp;|&nbsp; {{ $address }}{{ $phone ? ' &nbsp;|&nbsp; Tel: '.$phone : '' }}</div>
    </div>
    <div class="header-right">
        <div class="doc-box">
            <div class="doc-type">Cotización</div>
            <div class="doc-num">{{ $quotation->quote_number }}</div>
        </div>
    </div>
</div>

{{-- META INFO --}}
<table class="meta-table">
    <tr>
        <td width="55%">
            <div class="box">
                <div class="box-title">Cliente</div>
                @if($quotation->client)
                    <div class="field"><div class="lbl">Razón Social / Nombre</div><div class="val">{{ $quotation->client->name }}</div></div>
                    <div class="field"><div class="lbl">{{ $quotation->client->document_type }}</div><div class="val">{{ $quotation->client->document_number }}</div></div>
                    @if($quotation->client->address)
                    <div class="field"><div class="lbl">Dirección</div><div class="val">{{ $quotation->client->address }}</div></div>
                    @endif
                @else
                    <div class="val" style="color:#9ca3af">Sin cliente asignado</div>
                @endif
                @if($quotation->attention)
                    <div class="field" style="margin-top:4px"><div class="lbl">Atención a</div><div class="val">{{ $quotation->attention }}</div></div>
                @endif
            </div>
        </td>
        <td width="45%">
            <div class="box">
                <div class="box-title">Datos del Documento</div>
                <div class="field"><div class="lbl">Fecha de Emisión</div><div class="val">{{ \Carbon\Carbon::parse($quotation->issue_date)->format('d/m/Y') }}</div></div>
                @if($quotation->valid_until)
                <div class="field"><div class="lbl">Válida Hasta</div><div class="val">{{ \Carbon\Carbon::parse($quotation->valid_until)->format('d/m/Y') }}</div></div>
                @endif
                <div class="field"><div class="lbl">Preparado por</div><div class="val">{{ $quotation->user?->name ?? '—' }}</div></div>
                <div class="field"><div class="lbl">Estado</div><div class="val" style="text-transform:uppercase">{{ $quotation->status }}</div></div>
            </div>
        </td>
    </tr>
</table>

{{-- ITEMS --}}
<table class="items-table">
    <thead>
        <tr>
            <th style="width:28px">#</th>
            <th>Descripción</th>
            <th class="r" style="width:70px">Cantidad</th>
            <th class="r" style="width:85px">P. Unit. (S/)</th>
            <th class="r" style="width:90px">Total (S/)</th>
        </tr>
    </thead>
    <tbody>
        @foreach($quotation->items as $i => $item)
        <tr>
            <td class="c">{{ $i + 1 }}</td>
            <td>{{ $item->description }}</td>
            <td class="r">{{ number_format($item->quantity, 2) }}</td>
            <td class="r">{{ number_format($item->unit_price, 2) }}</td>
            <td class="r">{{ number_format($item->total_price, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- TOTALS --}}
<div class="totals">
    <table>
        <tr>
            <td class="totals-label">Subtotal</td>
            <td class="totals-value">S/ {{ number_format($quotation->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td class="totals-label">IGV (18%)</td>
            <td class="totals-value">S/ {{ number_format($quotation->tax, 2) }}</td>
        </tr>
        <tr class="totals-total">
            <td>TOTAL</td>
            <td style="text-align:right">S/ {{ number_format($quotation->total, 2) }}</td>
        </tr>
    </table>
</div>

@if($quotation->notes)
<div class="notes">
    <div class="notes-title">Condiciones y Observaciones</div>
    {{ $quotation->notes }}
</div>
@endif

{{-- SIGNATURES --}}
<div class="sigs">
    <div class="sig-cell">
        <div class="sig-line">{{ $bizName }}<br>Proveedor</div>
    </div>
    <div class="sig-cell" style="float:right">
        <div class="sig-line">{{ $quotation->client?->name ?? 'Cliente' }}<br>Conformidad</div>
    </div>
</div>

<div class="footer">
    Generado el {{ now()->format('d/m/Y H:i') }} &nbsp;|&nbsp; {{ $bizName }} &nbsp;|&nbsp; RUC: {{ $ruc }}
    &nbsp;|&nbsp; Esta cotización es referencial y no constituye un comprobante de pago.
</div>

</body>
</html>
