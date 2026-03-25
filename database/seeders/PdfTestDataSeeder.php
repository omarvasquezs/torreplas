<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Client;
use App\Models\Product;
use App\Models\Invoice;
use App\Models\DispatchGuide;
use App\Models\User;
use Carbon\Carbon;

/**
 * Crea registros de prueba para visualizar los PDFs de:
 *  - Facturas (con RUC + Razón Social)
 *  - Boletas  (con DNI opcional)
 *  - Guías de Remisión
 *
 * Es idempotente: no duplica si ya existen registros.
 */
class PdfTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Clientes de prueba ───────────────────────────────────────────
        $clientesData = [
            [
                'name'            => 'SUPERMERCADOS METRO SAC',
                'document_type'   => 'RUC',
                'document_number' => '20100070970',
                'email'           => 'facturacion@metro.pe',
                'phone'           => '014441515',
                'address'         => 'Av. Paseo de la República 3220, San Isidro, Lima',
                'is_active'       => true,
            ],
            [
                'name'            => 'RESTAURANTE EL BUEN SABOR EIRL',
                'document_type'   => 'RUC',
                'document_number' => '20516832821',
                'email'           => 'compras@elbuensabor.pe',
                'phone'           => '013456789',
                'address'         => 'Jr. Huallaga 456, Lima Centro',
                'is_active'       => true,
            ],
            [
                'name'            => 'Juan Carlos Pérez Ríos',
                'document_type'   => 'DNI',
                'document_number' => '45678912',
                'email'           => 'jperez@gmail.com',
                'phone'           => '987654321',
                'address'         => 'Av. Brasil 1234, Breña',
                'is_active'       => true,
            ],
            [
                'name'            => 'María Elena Soto Vargas',
                'document_type'   => 'DNI',
                'document_number' => '32145678',
                'email'           => 'msoto@hotmail.com',
                'phone'           => '956123789',
                'address'         => 'Calle Los Álamos 789, Surco',
                'is_active'       => true,
            ],
        ];

        $clients = [];
        foreach ($clientesData as $cd) {
            $client = Client::firstOrCreate(
                ['document_number' => $cd['document_number']],
                $cd
            );
            $clients[] = $client;
        }

        // ── 2. Obtener o crear usuario para guías ───────────────────────────
        $user = User::first();
        if (!$user) {
            $this->command->warn('No hay usuarios en el sistema. Crea un usuario primero.');
            return;
        }

        // ── 3. Obtener productos ────────────────────────────────────────────
        $products = Product::where('is_active', true)->take(6)->get();
        if ($products->isEmpty()) {
            $this->command->warn('No hay productos activos. Ejecuta primero KeyfacilProductsSeeder.');
            return;
        }

        // ── 4. Series de documentos ─────────────────────────────────────────
        $seriesFact = 'F001';
        $seriesBol  = 'B001';

        $this->ensureSeries('factura', $seriesFact);
        $this->ensureSeries('boleta',  $seriesBol);

        // ── 5. Facturas (tipo factura con RUC + Razón Social) ───────────────
        $facturasData = [
            [
                'client'        => $clients[0], // Metro SAC
                'type'          => 'factura',
                'serie'         => $seriesFact,
                'customer_ruc'  => '20100070970',
                'customer_name' => 'SUPERMERCADOS METRO SAC',
                'customer_dni'  => null,
                'total_amount'  => 2832.60,
                'issue_date'    => Carbon::now()->subDays(5)->toDateString(),
                'status'        => 'accepted',
            ],
            [
                'client'        => $clients[1], // El Buen Sabor
                'type'          => 'factura',
                'serie'         => $seriesFact,
                'customer_ruc'  => '20516832821',
                'customer_name' => 'RESTAURANTE EL BUEN SABOR EIRL',
                'customer_dni'  => null,
                'total_amount'  => 590.00,
                'issue_date'    => Carbon::now()->subDays(2)->toDateString(),
                'status'        => 'generated',
            ],
        ];

        $invoiceCount = 0;
        foreach ($facturasData as $fd) {
            $number = $this->nextNumber('factura', $fd['serie']);
            if (Invoice::where('type', $fd['type'])->where('serie', $fd['serie'])->where('number', $number)->exists()) {
                continue;
            }
            Invoice::create([
                'client_id'     => $fd['client']->id,
                'type'          => $fd['type'],
                'serie'         => $fd['serie'],
                'number'        => $number,
                'issue_date'    => $fd['issue_date'],
                'total_amount'  => $fd['total_amount'],
                'customer_ruc'  => $fd['customer_ruc'],
                'customer_name' => $fd['customer_name'],
                'customer_dni'  => $fd['customer_dni'],
                'status'        => $fd['status'],
            ]);
            $this->incrementSeries('factura', $fd['serie']);
            $invoiceCount++;
        }

        // ── 6. Boletas (tipo boleta con DNI opcional) ───────────────────────
        $boletasData = [
            [
                'client'        => $clients[2], // Juan — con DNI
                'type'          => 'boleta',
                'serie'         => $seriesBol,
                'customer_ruc'  => null,
                'customer_name' => null,
                'customer_dni'  => '45678912',
                'total_amount'  => 45.80,
                'issue_date'    => Carbon::now()->subDays(1)->toDateString(),
                'status'        => 'generated',
            ],
            [
                'client'        => $clients[3], // María — sin DNI (anónima)
                'type'          => 'boleta',
                'serie'         => $seriesBol,
                'customer_ruc'  => null,
                'customer_name' => null,
                'customer_dni'  => null,  // DNI opcional → no ingresado
                'total_amount'  => 18.50,
                'issue_date'    => Carbon::now()->toDateString(),
                'status'        => 'generated',
            ],
        ];

        foreach ($boletasData as $bd) {
            $number = $this->nextNumber('boleta', $bd['serie']);
            if (Invoice::where('type', $bd['type'])->where('serie', $bd['serie'])->where('number', $number)->exists()) {
                continue;
            }
            Invoice::create([
                'client_id'     => $bd['client']->id,
                'type'          => $bd['type'],
                'serie'         => $bd['serie'],
                'number'        => $number,
                'issue_date'    => $bd['issue_date'],
                'total_amount'  => $bd['total_amount'],
                'customer_ruc'  => $bd['customer_ruc'],
                'customer_name' => $bd['customer_name'],
                'customer_dni'  => $bd['customer_dni'],
                'status'        => $bd['status'],
            ]);
            $this->incrementSeries('boleta', $bd['serie']);
            $invoiceCount++;
        }

        $this->command->info("Facturas/Boletas: {$invoiceCount} creados.");

        // ── 7. Guías de Remisión ────────────────────────────────────────────
        if (DispatchGuide::count() < 2) {
            $guiasData = [
                [
                    'series'              => 'T001',
                    'recipient_name'      => 'RESTAURANTE EL BUEN SABOR EIRL',
                    'origin_ubigeo'       => '150101',
                    'origin_address'      => 'Av. Industrial 345, La Victoria, Lima',
                    'destination_ubigeo'  => '150107',
                    'destination_address' => 'Jr. Huallaga 456, Lima Centro, Lima',
                    'issue_date'          => Carbon::now()->subDays(3)->toDateString(),
                    'observations'        => 'Entrega con factura F001-00000001. Llamar antes de entregar.',
                    'items'               => [
                        ['product' => $products[0], 'quantity' => 50],
                        ['product' => $products[1], 'quantity' => 24],
                        ['product' => $products[2], 'quantity' => 10],
                    ],
                ],
                [
                    'series'              => 'T001',
                    'recipient_name'      => 'SUPERMERCADOS METRO SAC',
                    'origin_ubigeo'       => '150101',
                    'origin_address'      => 'Av. Industrial 345, La Victoria, Lima',
                    'destination_ubigeo'  => '150131',
                    'destination_address' => 'Av. Paseo de la República 3220, San Isidro, Lima',
                    'issue_date'          => Carbon::now()->subDays(1)->toDateString(),
                    'observations'        => null,
                    'items'               => [
                        ['product' => $products[3], 'quantity' => 100],
                        ['product' => $products[4], 'quantity' => 36],
                    ],
                ],
            ];

            $guideCount = 0;
            foreach ($guiasData as $gd) {
                $correlative = (DispatchGuide::where('series', $gd['series'])->max('correlative') ?? 0) + 1;
                $code = $gd['series'] . '-' . str_pad((string) $correlative, 8, '0', STR_PAD_LEFT);

                $guide = DispatchGuide::create([
                    'series'              => $gd['series'],
                    'correlative'         => $correlative,
                    'code'                => $code,
                    'issue_date'          => $gd['issue_date'],
                    'recipient_name'      => $gd['recipient_name'],
                    'observations'        => $gd['observations'],
                    'origin_ubigeo'       => $gd['origin_ubigeo'],
                    'origin_address'      => $gd['origin_address'],
                    'destination_ubigeo'  => $gd['destination_ubigeo'],
                    'destination_address' => $gd['destination_address'],
                    'status'              => 'processed',
                    'user_id'             => $user->id,
                ]);

                foreach ($gd['items'] as $item) {
                    $guide->items()->create([
                        'product_id'   => $item['product']->id,
                        'product_name' => $item['product']->name,
                        'unit_name'    => $item['product']->unit?->abbreviation ?? 'UND',
                        'quantity'     => $item['quantity'],
                    ]);
                }
                $guideCount++;
            }

            $this->command->info("Guías de Remisión: {$guideCount} creadas.");
        } else {
            $this->command->info('Guías de Remisión: ya existen registros, omitiendo.');
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private function ensureSeries(string $type, string $series): void
    {
        if (!DB::table('document_series')->where('type', $type)->where('series', $series)->exists()) {
            DB::table('document_series')->insert([
                'type'        => $type,
                'series'      => $series,
                'next_number' => 1,
                'is_active'   => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }

    private function nextNumber(string $type, string $series): string
    {
        $row = DB::table('document_series')->where('type', $type)->where('series', $series)->first();
        $n   = $row ? (int) $row->next_number : 1;
        return str_pad((string) $n, 8, '0', STR_PAD_LEFT);
    }

    private function incrementSeries(string $type, string $series): void
    {
        DB::table('document_series')
            ->where('type', $type)
            ->where('series', $series)
            ->increment('next_number');
    }
}
