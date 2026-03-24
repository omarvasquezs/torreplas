<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante {{ $invoice->serie }}-{{ $invoice->number }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 12px; padding: 20px; }

        .header { display: table; width: 100%; border-bottom: 3px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px; }
        .header-left { display: table-cell; vertical-align: middle; }
        .header-right { display: table-cell; text-align: right; vertical-align: middle; }
        .company-name { font-size: 20px; font-weight: 700; color: #312e81; }
        .company-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .doc-box { border: 2px solid #4f46e5; border-radius: 6px; padding: 8px 16px; display: inline-block; text-align: center; }
        .doc-type { font-size: 13px; font-weight: 700; color: #4f46e5; text-transform: uppercase; }
        .doc-num { font-size: 16px; font-weight: 700; color: #111827; margin-top: 2px; }

        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .info-table td { padding: 5px 8px; vertical-align: top; }
        .info-section { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; }
        .info-section h3 { font-size: 10px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; margin-bottom: 6px; }
        .info-section .field { margin-bottom: 4px; }
        .info-section .label { color: #9ca3af; font-size: 10px; }
        .info-section .value { font-weight: 600; color: #111827; }

        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .items-table thead th { background: #eef2ff; color: #3730a3; text-align: left; padding: 8px 10px; font-size: 11px; }
        .items-table tbody td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; }
        .items-table tbody tr:last-child td { border-bottom: none; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .totals { width: 220px; margin-left: auto; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
        .totals table { width: 100%; border-collapse: collapse; }
        .totals table td { padding: 6px 12px; font-size: 12px; }
        .totals table tr:not(:last-child) td { border-bottom: 1px solid #e5e7eb; }
        .totals-label { color: #6b7280; }
        .totals-value { text-align: right; font-weight: 600; }
        .totals-total td { background: #4f46e5; color: #fff; font-weight: 700; font-size: 13px; }

        .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .status-generated  { background: #dbeafe; color: #1d4ed8; }
        .status-sent_sunat { background: #fef9c3; color: #a16207; }
        .status-accepted   { background: #dcfce7; color: #166534; }
        .status-rejected   { background: #fee2e2; color: #b91c1c; }

        .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
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
                <div class="doc-type">
                    @switch($invoice->type)
                        @case('factura')        Factura Electrónica @break
                        @case('boleta')         Boleta de Venta     @break
                        @case('nota_credito')   Nota de Crédito     @break
                        @case('nota_debito')    Nota de Débito      @break
                        @default {{ $invoice->type }}
                    @endswitch
                </div>
                <div class="doc-num">{{ $invoice->serie }}-{{ $invoice->number }}</div>
            </div>
        </div>
    </div>

    {{-- INFO --}}
    <table class="info-table">
        <tr>
            <td width="60%">
                <div class="info-section">
                    <h3>
                        @if($invoice->type === 'factura') Adquiriente / Cliente
                        @elseif($invoice->type === 'boleta') Receptor / Cliente
                        @else Cliente
                        @endif
                    </h3>

                    @if($invoice->type === 'factura')
                        {{-- Factura: muestra RUC + Razón Social --}}
                        <div class="field">
                            <div class="label">RUC</div>
                            <div class="value">{{ $invoice->customer_ruc ?? $invoice->client?->document_number ?? '—' }}</div>
                        </div>
                        <div class="field">
                            <div class="label">Razón Social</div>
                            <div class="value">{{ $invoice->customer_name ?? $invoice->client?->name ?? '—' }}</div>
                        </div>
                    @elseif($invoice->type === 'boleta')
                        {{-- Boleta: muestra nombre y DNI si existe --}}
                        <div class="field">
                            <div class="label">Cliente</div>
                            <div class="value">{{ $invoice->client?->name ?? '—' }}</div>
                        </div>
                        @if($invoice->customer_dni)
                        <div class="field">
                            <div class="label">DNI</div>
                            <div class="value">{{ $invoice->customer_dni }}</div>
                        </div>
                        @elseif($invoice->client?->document_type === 'DNI')
                        <div class="field">
                            <div class="label">DNI</div>
                            <div class="value">{{ $invoice->client->document_number }}</div>
                        </div>
                        @endif
                    @else
                        <div class="field">
                            <div class="label">Razón Social / Nombre</div>
                            <div class="value">{{ $invoice->client?->name ?? '—' }}</div>
                        </div>
                        <div class="field">
                            <div class="label">{{ strtoupper($invoice->client?->document_type ?? 'RUC') }}</div>
                            <div class="value">{{ $invoice->client?->document_number ?? '—' }}</div>
                        </div>
                    @endif

                    @if($invoice->client?->address)
                    <div class="field">
                        <div class="label">Dirección</div>
                        <div class="value">{{ $invoice->client->address }}</div>
                    </div>
                    @endif
                </div>
            </td>
            <td width="40%">
                <div class="info-section">
                    <h3>Datos del Comprobante</h3>
                    <div class="field">
                        <div class="label">Fecha de Emisión</div>
                        <div class="value">{{ \Carbon\Carbon::parse($invoice->issue_date)->format('d/m/Y') }}</div>
                    </div>
                    <div class="field">
                        <div class="label">Estado</div>
                        <div class="value">
                            <span class="status-badge status-{{ $invoice->status }}">
                                @switch($invoice->status)
                                    @case('generated')  Generado     @break
                                    @case('sent_sunat') Enviado SUNAT @break
                                    @case('accepted')   Aceptado     @break
                                    @case('rejected')   Rechazado    @break
                                    @default {{ $invoice->status }}
                                @endswitch
                            </span>
                        </div>
                    </div>
                    @if($invoice->order)
                    <div class="field">
                        <div class="label">Pedido Asociado</div>
                        <div class="value">{{ $invoice->order->code ?? '#'.$invoice->order->id }}</div>
                    </div>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    {{-- ITEMS --}}
    @if($invoice->order && $invoice->order->items && $invoice->order->items->count())
    <table class="items-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Descripción</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">P. Unit. (S/)</th>
                <th class="text-right">Total (S/)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->order->items as $i => $item)
            <tr>
                <td class="text-center">{{ $i + 1 }}</td>
                <td>{{ $item->product?->name ?? $item->description ?? '—' }}</td>
                <td class="text-right">{{ number_format($item->quantity, 2) }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                <td class="text-right">{{ number_format($item->total_price, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    {{-- TOTALS --}}
    <div class="totals">
        <table>
            @php
                $base = $invoice->total_amount / 1.18;
                $igv  = $invoice->total_amount - $base;
            @endphp
            <tr>
                <td class="totals-label">Base Imponible</td>
                <td class="totals-value">S/ {{ number_format($base, 2) }}</td>
            </tr>
            <tr>
                <td class="totals-label">IGV (18%)</td>
                <td class="totals-value">S/ {{ number_format($igv, 2) }}</td>
            </tr>
            <tr class="totals-total">
                <td>TOTAL</td>
                <td style="text-align:right">S/ {{ number_format($invoice->total_amount, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Generado el {{ now()->format('d/m/Y H:i') }} &nbsp;|&nbsp; TORREPLAS SAC &nbsp;|&nbsp; Documento referencial
    </div>

</body>
</html>
