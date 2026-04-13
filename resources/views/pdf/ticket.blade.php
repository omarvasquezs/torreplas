<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ticket {{ $invoice->serie }}-{{ $invoice->number }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: monospace, sans-serif; color: #000; font-size: 11px; width: 100%; max-width: 80mm; margin: 0 auto; padding: 5mm; }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        
        .header { margin-bottom: 5px; text-align: center; border-bottom: 1px dashed #000; padding-bottom: 5px; }
        .company-name { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
        .company-meta { font-size: 10px; margin-bottom: 2px; }
        
        .doc-info { text-align: center; margin-top: 5px; margin-bottom: 5px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
        .doc-title { font-size: 12px; font-weight: bold; text-transform: uppercase; }
        
        .client-info { margin-bottom: 5px; border-bottom: 1px dashed #000; padding-bottom: 5px; font-size: 10px; }
        .client-info div { margin-bottom: 2px; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 10px; }
        .items-table th { border-bottom: 1px solid #000; padding: 2px 0; text-align: left; }
        .items-table td { padding: 2px 0; vertical-align: top; }
        
        .totals { margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px; font-size: 11px; }
        .totals-row { display: table; width: 100%; margin-bottom: 2px; }
        .totals-label { display: table-cell; text-align: right; padding-right: 10px; }
        .totals-value { display: table-cell; text-align: right; font-weight: bold; width: 60px; }
        
        .footer { text-align: center; font-size: 9px; margin-top: 10px; margin-bottom: 10px; }
    </style>
</head>
<body>

    @php
        $settings = \App\Models\Setting::all_flat();
        $ruc      = $settings['company_ruc']      ?? '20XXXXXXXXX';
        $bizName  = $settings['company_name']     ?? 'TORREPLAS SAC';
        $address  = $settings['company_address']  ?? 'Lima, Perú';
        $phone    = $settings['company_phone']    ?? '';
    @endphp

    <div class="header">
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
                <th>Cant</th>
                <th>Descripción</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->order->items as $item)
            <tr>
                <td>{{ number_format($item->quantity, 0) }}</td>
                <td>{{ substr($item->product?->name ?? $item->description ?? '—', 0, 20) }}</td>
                <td class="text-right">{{ number_format($item->total_price, 2) }}</td>
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

</body>
</html>
