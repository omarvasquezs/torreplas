<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\Unit;

class KeyfacilProductsSeeder extends Seeder
{
    /**
     * Importa los productos extraídos del sistema Keyfacil de Torreplas SAC.
     * El campo 'code' guarda el código interno de Keyfacil.
     * El costo (cost) se estima al 70% del precio de venta.
     */
    public function run(): void
    {
        $unit = Unit::where('name', 'LIKE', '%unidad%')->orWhere('abbreviation', 'UND')->first();

        if (!$unit) {
            $unit = Unit::create(['name' => 'Unidades', 'abbreviation' => 'UND']);
        }

        $products = [
            ['name' => '16X19 SOL', 'code' => '20230531142732', 'price' => 5.00],
            ['name' => '26X40 LISO', 'code' => '20230810111343', 'price' => 20.00],
            ['name' => '3X8 BRILLO', 'code' => '20230427194819', 'price' => 2.00],
            ['name' => 'ALCOHOL GALON', 'code' => '20230625145228', 'price' => 30.00],
            ['name' => 'ALCOHOL LITTO', 'code' => '20230625145207', 'price' => 7.50],
            ['name' => 'ALUMINIO', 'code' => '20230625152729', 'price' => 5.00],
            ['name' => 'BANDEJA PB2 X25UNDS', 'code' => '20230625153322', 'price' => 4.50],
            ['name' => 'BOLSA 16X19 CON25PQTS', 'code' => '20230625153409', 'price' => 115.00],
            ['name' => 'BOLSA 19X20 ALFA', 'code' => '20230625161959', 'price' => 9.00],
            ['name' => 'BOLSA 20X30 ALFA', 'code' => '20230625153023', 'price' => 17.00],
            ['name' => 'BOLSA 20X30 NEGRA', 'code' => '20230625153054', 'price' => 6.00],
            ['name' => 'BOLSA 21X24 ALFA', 'code' => '20230427162256', 'price' => 11.00],
            ['name' => 'BOLSA 3X6X200', 'code' => '20230625143030', 'price' => 9.00],
            ['name' => 'BOLSA 3X8 X200', 'code' => '20230625153136', 'price' => 10.00],
            ['name' => 'BOLSA 7X10 SOL', 'code' => '20230625152914', 'price' => 1.00],
            ['name' => 'BOLSA NEGRA 220', 'code' => '20230625152833', 'price' => 60.00],
            ['name' => 'BOLSA PAPEL 1', 'code' => '20230814075514', 'price' => 7.00],
            ['name' => 'BOLSA12X16 ALFA', 'code' => '20230625161820', 'price' => 3.50],
            ['name' => 'BOWL DE BAMBU 1300 ML', 'code' => '20230531142849', 'price' => 10.50],
            ['name' => 'CT3 ALFA', 'code' => '20230531142538', 'price' => 0.60],
            ['name' => 'CT3 FIBRA', 'code' => '20230531142620', 'price' => 0.65],
            ['name' => 'CT5 ALFA', 'code' => '20230531142511', 'price' => 0.40],
            ['name' => 'CT5 FIBRA', 'code' => '20230531142657', 'price' => 0.40],
            ['name' => 'CUCHARA DARNEL', 'code' => '20230814135822', 'price' => 10.00],
            ['name' => 'CUCHARA TRANSPARENTE', 'code' => '20230427191903', 'price' => 5.00],
            ['name' => 'CUCHARA X MILLAR', 'code' => '20230805143308', 'price' => 70.00],
            ['name' => 'CUCHARITA', 'code' => '20230625153230', 'price' => 2.50],
            ['name' => 'CUCHARITAS X MILLAR', 'code' => '20230805144437', 'price' => 20.00],
            ['name' => 'CUCHILLOS MILLAR', 'code' => '20230805142846', 'price' => 70.00],
            ['name' => 'DELI BUFET XMILLAR', 'code' => '20230807223119', 'price' => 380.00],
            ['name' => 'DELI PRIMO', 'code' => '20230531142432', 'price' => 0.40],
            ['name' => 'DELI SUPER FAST 1/2', 'code' => '20230427162155', 'price' => 0.35],
            ['name' => 'DELI SUPER FAST LITRO', 'code' => '20230531142248', 'price' => 0.40],
            ['name' => 'DELI1/2 CHEMPACK', 'code' => '20230531142930', 'price' => 0.35],
            ['name' => 'DOMO POLLERO', 'code' => '20230625142932', 'price' => 1.05],
            ['name' => 'DUPLICO 48ONZAS', 'code' => '20230814135923', 'price' => 110.00],
            ['name' => 'ENVASE 1/2LITRO TRANSPARENTE', 'code' => '20230625143719', 'price' => 0.28],
            ['name' => 'ENVASE 8 ONZAS TRANSPARENTES', 'code' => '20230625143526', 'price' => 0.22],
            ['name' => 'ENVASE TRIANGULO', 'code' => '20230427192123', 'price' => 0.40],
            ['name' => 'FIL EMBALAJE', 'code' => '20230814075014', 'price' => 110.00],
            ['name' => 'GUANTES VERDE', 'code' => '20230805143213', 'price' => 30.00],
            ['name' => 'GUANTES VINILO', 'code' => '20230625152705', 'price' => 14.00],
            ['name' => 'JABON LIQUIDO', 'code' => '20230807223154', 'price' => 18.00],
            ['name' => 'JABON LIQUIDO AVAL', 'code' => '20230814140234', 'price' => 6.50],
            ['name' => 'LIGA CHINA CHICA', 'code' => '20230625143444', 'price' => 3.50],
            ['name' => 'LIMPIA TODO', 'code' => '20230625152800', 'price' => 11.00],
            ['name' => 'P H JUMBO X 6ROLLOS', 'code' => '20230625143315', 'price' => 58.00],
            ['name' => 'PALO ANTICUCHO', 'code' => '20230625143200', 'price' => 2.50],
            ['name' => 'PAPEL MANTECA', 'code' => '20230625152944', 'price' => 90.00],
            ['name' => 'PAPEL TOALLA INTERFOLIADO', 'code' => '20230625143108', 'price' => 6.00],
            ['name' => 'PH JUMBO SANIT', 'code' => '20230807223216', 'price' => 22.00],
            ['name' => 'PLATO 15 TORTA X25UNDS', 'code' => '20230702132417', 'price' => 3.00],
            ['name' => 'ROLLO 14X20', 'code' => '20230805144052', 'price' => 17.00],
            ['name' => 'ROLLO 3X6 BOLSA', 'code' => '20230805144125', 'price' => 8.00],
            ['name' => 'ROLLO 7X10', 'code' => '20230612133624', 'price' => 11.00],
            ['name' => 'ROLLO BOLSA 10X15', 'code' => '20230805143942', 'price' => 11.00],
            ['name' => 'ROLLO BOLSA 12X17', 'code' => '20230805144027', 'price' => 11.00],
            ['name' => 'ROLLO BOLSA 5X10', 'code' => '20230805143839', 'price' => 11.00],
            ['name' => 'ROLLO BOLSA 7X10', 'code' => '20230805143811', 'price' => 11.00],
            ['name' => 'ROLLO BOLSA 8X12', 'code' => '20230805143905', 'price' => 11.00],
            ['name' => 'ROLLO3X8 BOLSA', 'code' => '20230805144152', 'price' => 8.00],
            ['name' => 'ROLLO4X8 BOLSA', 'code' => '20230805144226', 'price' => 8.00],
            ['name' => 'SERVILLETA DOBLADA', 'code' => '20230427194737', 'price' => 18.00],
            ['name' => 'SERVILLETA GRANEL', 'code' => '20230807223255', 'price' => 8.00],
            ['name' => 'SERVILLETA CHINO', 'code' => '20230814140203', 'price' => 120.00],
            ['name' => 'SERVILLETA X18', 'code' => '20230805143110', 'price' => 18.00],
            ['name' => 'SOBRE CUBIERTO X MILLAR', 'code' => '20230805142928', 'price' => 55.00],
            ['name' => 'SORBETE DE PAPEL', 'code' => '20230625143249', 'price' => 4.00],
            ['name' => 'SORBETON CON ENVOLTURA', 'code' => '20230427192035', 'price' => 6.00],
            ['name' => 'TENEDOR BLANCO10X50UNDS', 'code' => '20230531143110', 'price' => 3.50],
            ['name' => 'TENEDOR DARNEL', 'code' => '20230814135846', 'price' => 10.00],
            ['name' => 'TENEDOR GRANDE', 'code' => '20230427192531', 'price' => 4.00],
            ['name' => 'TENEDOR MEDIANO', 'code' => '20230427192342', 'price' => 2.50],
            ['name' => 'TENEDOR X MILLAR', 'code' => '20230805143751', 'price' => 70.00],
            ['name' => 'TENEDOR XMILLAR', 'code' => '20230805143247', 'price' => 70.00],
            ['name' => 'TOCA (GORRO)', 'code' => '20230625143416', 'price' => 14.00],
            ['name' => 'VASO 12 DOMO', 'code' => '20230427191947', 'price' => 0.50],
        ];

        $imported = 0;
        $skipped = 0;

        foreach ($products as $data) {
            // Evitar duplicados por code (código Keyfacil)
            if (Product::where('code', $data['code'])->exists()) {
                $skipped++;
                continue;
            }

            // Slug único basado en el nombre
            $slug = Str::slug($data['name']);
            $base = $slug;
            $n = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $base . '-' . $n++;
            }

            Product::create([
                'name' => $data['name'],
                'slug' => $slug,
                'code' => $data['code'],
                'unit_id' => $unit->id,
                'price' => $data['price'],
                'cost' => round($data['price'] * 0.70, 2),
                'is_active' => true,
            ]);

            $imported++;
        }

        $this->command->info("Keyfacil: {$imported} productos importados, {$skipped} omitidos.");
    }
}
