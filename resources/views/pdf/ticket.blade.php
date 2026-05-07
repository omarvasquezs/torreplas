<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ticket {{ $invoice->serie }}-{{ $invoice->number }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @page { margin: 0; }
        body { font-family: monospace, sans-serif; color: #000; font-size: 9px; width: 100%; margin: 0; padding: 0; }
        .ticket-container { margin-left: 4mm; margin-right: 4mm; margin-top: 2mm; margin-bottom: 2mm; }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        
        .header { margin-bottom: 4px; text-align: center; border-bottom: 1px dashed #000; padding-bottom: 4px; }
        .company-name { font-size: 11px; font-weight: bold; margin-bottom: 2px; }
        .company-meta { font-size: 9px; margin-bottom: 1px; }
        
        .doc-info { text-align: center; margin-top: 4px; margin-bottom: 4px; border-bottom: 1px dashed #000; padding-bottom: 4px; }
        .doc-title { font-size: 10px; font-weight: bold; text-transform: uppercase; }
        
        .client-info { margin-bottom: 4px; border-bottom: 1px dashed #000; padding-bottom: 4px; font-size: 9px; }
        .client-info div { margin-bottom: 1px; word-wrap: break-word; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9px; table-layout: fixed; }
        .items-table th { border-bottom: 1px solid #000; padding: 2px 0; }
        .items-table td { padding: 2px 0; vertical-align: top; word-wrap: break-word; overflow: hidden; }
        .col-cant { width: 12%; text-align: left; }
        .col-desc { width: 63%; text-align: left; padding-right: 2px; }
        .col-total { width: 25%; text-align: right; }
        
        .totals { margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px; font-size: 9px; }
        .totals-row { display: table; width: 100%; margin-bottom: 1px; }
        .totals-label { display: table-cell; text-align: right; padding-right: 4px; }
        .totals-value { display: table-cell; text-align: right; font-weight: bold; width: 40px; }
        
        .footer { text-align: center; font-size: 8px; margin-top: 6px; margin-bottom: 6px; }
    </style>
</head>
<body>
<div class="ticket-container">

    @php
        $ruc      = \App\Models\Setting::get('company_ruc', '20123456789');
        $bizName  = \App\Models\Setting::get('company_name', 'TORREPLAS SAC');
        $address  = \App\Models\Setting::get('company_address', 'Av. Industrial 123');
        $phone    = \App\Models\Setting::get('company_phone', '01-234-5678');
        $logoPath = public_path('logo_torre_plas.png');
        $qrData   = $ruc . '|' . $bizName . '|' . $invoice->serie . '-' . $invoice->number;
        $qrCode   = base64_encode(SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(90)->margin(0)->generate($qrData));
    @endphp

    <div class="header">
        @if(file_exists($logoPath))
            <img src="{{ $logoPath }}" style="max-width: 140px; display: block; margin: 0 auto 5px auto;" alt="Logo">
        @endif
        <div class="company-name">{{ $bizName }}</div>
        <div class="company-meta">RUC: {{ $ruc }}</div>
        <div class="company-meta">{{ $address }}</div>
        @if($phone)<div class="company-meta">Tel: {{ $phone }}</div>@endif
    </div>

    <div class="doc-info">
        <div class="doc-title">
            @switch($invoice->type)
                @case('factura')      FACTURA ELECTRÓNICA @break
                @case('boleta')       BOLETA DE VENTA @break
                @case('nota_credito') NOTA DE CRÉDITO @break
                @case('nota_debito')  NOTA DE DÉBITO @break
                @case('nota_venta')   NOTA DE VENTA @break
                @default {{ strtoupper($invoice->type) }}
            @endswitch
        </div>
        <div>{{ $invoice->serie }}-{{ $invoice->number }}</div>
        <div>Fec. Emisión: {{ \Carbon\Carbon::parse($invoice->issue_date)->format('d/m/Y') }}</div>
    </div>

    <div class="client-info">
        @if($invoice->type === 'factura')
            <div><span class="font-bold">RUC:</span> {{ $invoice->customer_ruc ?? $invoice->client?->document_number ?? '—' }}</div>
            <div><span class="font-bold">Razón Social:</span> {{ $invoice->customer_name ?? $invoice->client?->name ?? '—' }}</div>
        @elseif($invoice->type === 'boleta')
            <div><span class="font-bold">Cliente:</span> {{ $invoice->client?->name ?? '—' }}</div>
            @if($invoice->customer_dni)
                <div><span class="font-bold">DNI:</span> {{ $invoice->customer_dni }}</div>
            @elseif($invoice->client?->document_type === 'DNI')
                <div><span class="font-bold">DNI:</span> {{ $invoice->client->document_number }}</div>
            @endif
        @else
            <div><span class="font-bold">Cliente:</span> {{ $invoice->client?->name ?? '—' }}</div>
            <div><span class="font-bold">{{ strtoupper($invoice->client?->document_type ?? 'RUC') }}:</span> {{ $invoice->client?->document_number ?? '—' }}</div>
        @endif
        
        @if($invoice->client?->address)
            <div><span class="font-bold">Dir:</span> {{ $invoice->client->address }}</div>
        @endif
    </div>

    @if($invoice->order && $invoice->order->items && $invoice->order->items->count())
    <table class="items-table">
        <thead>
            <tr>
                <th class="col-cant">Cant</th>
                <th class="col-desc">Descripción</th>
                <th class="col-total">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->order->items as $item)
            <tr>
                <td class="col-cant">{{ number_format($item->quantity, 0) }}</td>
                <td class="col-desc">{{ $item->product?->name ?? $item->description ?? '—' }}</td>
                <td class="col-total">{{ number_format($item->total_price, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="totals">
        @php
            $base = $invoice->total_amount / 1.18;
            $igv  = $invoice->total_amount - $base;
        @endphp
        <div class="totals-row">
            <div class="totals-label">Subtotal S/</div>
            <div class="totals-value">{{ number_format($base, 2) }}</div>
        </div>
        <div class="totals-row">
            <div class="totals-label">IGV (18%) S/</div>
            <div class="totals-value">{{ number_format($igv, 2) }}</div>
        </div>
        <div class="totals-row" style="font-size: 13px;">
            <div class="totals-label font-bold">TOTAL S/</div>
            <div class="totals-value">{{ number_format($invoice->total_amount, 2) }}</div>
        </div>
    </div>

    <div class="footer">
        <div>¡Gracias por su compra!</div>
        <div style="margin-top: 3px;">Representación impresa de {{ $invoice->type == 'factura' ? 'Factura' : 'Boleta' }}</div>
        <div>Revise en sunat.gob.pe</div>
    </div>

    <div style="text-align: center; margin-top: 8px;">
        <img src="data:image/svg+xml;base64,{{ $qrCode }}" alt="QR Code">
    </div>

</div>
</body>
</html>
