<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class ImportarPadronRuc extends Command
{
    /**
     * php artisan padron:importar
     * php artisan padron:importar --file=/ruta/al/padron_reducido_ruc.txt
     * php artisan padron:importar --url=http://... (descarga automática desde SUNAT)
     */
    protected $signature = 'padron:importar
                            {--file= : Ruta al archivo .txt local}
                            {--url= : URL del ZIP a descargar (default: SUNAT oficial)}
                            {--chunk=1000 : Registros por lote para bulk insert}';

    protected $description = 'Importa/actualiza el Padrón Reducido RUC de SUNAT a la base de datos';

    const SUNAT_URL = 'http://www2.sunat.gob.pe/padron_reducido_ruc.zip';

    public function handle(): int
    {
        $file      = $this->option('file');
        $url       = $this->option('url') ?? self::SUNAT_URL;
        $chunkSize = (int) $this->option('chunk');
        $tmpZip    = null;
        $tmpTxt    = null;

        try {
            /* ── 1. Obtener el archivo de texto ────────────────────────── */
            if ($file) {
                $txtPath = $file;
                $this->info("Usando archivo local: {$txtPath}");
            } else {
                $this->info("Descargando padrón desde: {$url}");
                $tmpZip = tempnam(sys_get_temp_dir(), 'padron_') . '.zip';
                $tmpTxt = sys_get_temp_dir() . '/padron_reducido_ruc';

                $this->downloadFile($url, $tmpZip);
                $this->info('Descarga completada. Extrayendo ZIP...');

                $txtPath = $this->extractZip($tmpZip, $tmpTxt);
                $this->info("Archivo extraído: {$txtPath}");
            }

            if (!file_exists($txtPath)) {
                $this->error("No se encontró el archivo: {$txtPath}");
                return self::FAILURE;
            }

            /* ── 2. Crear tabla temporal y hacer swap sin downtime ─────── */
            $this->info('Creando tabla temporal...');
            DB::statement('CREATE TABLE IF NOT EXISTS padron_ruc_temp LIKE padron_ruc');
            DB::statement('TRUNCATE TABLE padron_ruc_temp');

            /* ── 3. Importar en chunks ──────────────────────────────────── */
            $this->info('Importando registros...');
            $total  = 0;
            $batch  = [];
            $handle = fopen($txtPath, 'r');
            $now    = now()->toDateTimeString();

            $bar = $this->output->createProgressBar();
            $bar->setFormat(' %current% registros [%bar%] %elapsed%');
            $bar->start();

            while (($line = fgets($handle)) !== false) {
                $line = trim($line);
                if (empty($line)) continue;

                $parts     = explode('|', $line);
                // Formato: RUC|NOMBRE|ESTADO|CONDICION|...(campos extras ignorados)
                $ruc       = trim($parts[0] ?? '');
                $nombre    = trim($parts[1] ?? '');
                $estado    = trim($parts[2] ?? '');
                $condicion = trim($parts[3] ?? '');

                if (strlen($ruc) < 8 || strlen($ruc) > 11) continue; // skip malformed

                $batch[] = [
                    'ruc'       => $ruc,
                    'nombre'    => mb_substr($nombre, 0, 200),
                    'estado'    => mb_substr($estado, 0, 30),
                    'condicion' => mb_substr($condicion, 0, 30),
                    'updated_at'=> $now,
                ];

                if (count($batch) >= $chunkSize) {
                    DB::table('padron_ruc_temp')->insert($batch);
                    $total += count($batch);
                    $batch  = [];
                    $bar->advance($chunkSize);
                }
            }

            // Último lote
            if (!empty($batch)) {
                DB::table('padron_ruc_temp')->insert($batch);
                $total += count($batch);
            }

            fclose($handle);
            $bar->finish();

            /* ── 4. Swap atómico de tablas ──────────────────────────────── */
            $this->newLine();
            $this->info('Haciendo swap de tablas (sin downtime)...');
            DB::statement('RENAME TABLE padron_ruc TO padron_ruc_old, padron_ruc_temp TO padron_ruc');
            DB::statement('DROP TABLE IF EXISTS padron_ruc_old');

            /* ── 5. Limpiar temporales ──────────────────────────────────── */
            if ($tmpZip && file_exists($tmpZip)) @unlink($tmpZip);
            if ($tmpTxt && file_exists($tmpTxt)) @unlink($tmpTxt);

            $this->info("✅ Importación completada: {$total} registros.");
            Log::info("Padrón RUC importado: {$total} registros.");

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error durante la importación: ' . $e->getMessage());
            Log::error('Error importando padrón RUC: ' . $e->getMessage());

            if ($tmpZip && file_exists($tmpZip)) @unlink($tmpZip);
            if ($tmpTxt && file_exists($tmpTxt)) @unlink($tmpTxt);
            DB::statement('DROP TABLE IF EXISTS padron_ruc_temp');

            return self::FAILURE;
        }
    }

    private function downloadFile(string $url, string $dest): void
    {
        $fp = fopen($dest, 'wb');
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FILE            => $fp,
            CURLOPT_FOLLOWLOCATION  => true,
            CURLOPT_TIMEOUT         => 600, // 10 minutos
        ]);
        $result = curl_exec($ch);
        $error  = curl_error($ch);
        curl_close($ch);
        fclose($fp);

        if ($result === false || !empty($error)) {
            throw new \RuntimeException("Error CURL descargando padrón: {$error}");
        }
    }

    private function extractZip(string $zipPath, string $destDir): string
    {
        if (!is_dir($destDir)) mkdir($destDir, 0755, true);

        $zip = new ZipArchive();
        if ($zip->open($zipPath) !== true) {
            throw new \RuntimeException("No se pudo abrir el ZIP: {$zipPath}");
        }
        $zip->extractTo($destDir);
        $zip->close();

        $files = glob($destDir . '/*.txt');
        if (empty($files)) {
            throw new \RuntimeException("No se encontró archivo .txt en el ZIP extraído.");
        }

        return $files[0];
    }
}
