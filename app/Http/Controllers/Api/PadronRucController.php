<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PadronRuc;
use Illuminate\Http\Request;

class PadronRucController extends Controller
{
    /**
     * GET /api/padron/buscar?q=20514385662        → busca por RUC
     * GET /api/padron/buscar?q=45678912           → busca por DNI (prefijo 10+DNI)
     * GET /api/padron/buscar?q=METRO              → busca por nombre
     */
    public function buscar(Request $request)
    {
        $q     = trim($request->get('q', ''));
        $tipo  = $request->get('tipo', '');
        $limit = min((int) $request->get('limit', 10), 50);

        if (strlen($q) < 3) {
            return response()->json([]);
        }

        // Auto-detectar tipo si no viene
        if (!$tipo) {
            if (ctype_digit($q) && strlen($q) === 11) {
                $tipo = 'ruc';
            } elseif (ctype_digit($q) && strlen($q) >= 7) {
                $tipo = 'dni';
            } else {
                $tipo = 'nombre';
            }
        }

        $query = PadronRuc::query();

        switch ($tipo) {
            case 'ruc':
                $query->where('ruc', 'like', $q . '%');
                break;

            case 'dni':
                // RUC persona natural = '10' + 8 dígitos DNI + dígito verificador
                $query->where('ruc', 'like', '10' . $q . '%');
                break;

            case 'nombre':
            default:
                $words = preg_split('/\s+/', mb_strtoupper($q));
                foreach ($words as $word) {
                    $query->where('nombre', 'like', '%' . $word . '%');
                }
                break;
        }

        $results = $query
            ->select(['ruc', 'nombre', 'estado', 'condicion'])
            ->limit($limit)
            ->get();

        return response()->json($results);
    }

    /**
     * GET /api/padron/buscar-ruc/{ruc}
     * Busca un RUC exacto, devuelve el registro o 404.
     */
    public function buscarRuc(string $ruc)
    {
        $ruc = trim($ruc);

        if (!ctype_digit($ruc) || strlen($ruc) !== 11) {
            return response()->json(['error' => 'RUC inválido'], 422);
        }

        $result = PadronRuc::find($ruc);

        if (!$result) {
            return response()->json(['error' => 'RUC no encontrado en el padrón'], 404);
        }

        return response()->json($result);
    }

    /**
     * GET /api/padron/stats
     * Información sobre el padrón cargado.
     */
    public function stats()
    {
        $count     = PadronRuc::count();
        $updatedAt = PadronRuc::max('updated_at');

        return response()->json([
            'total'      => $count,
            'updated_at' => $updatedAt,
            'cargado'    => $count > 0,
        ]);
    }
}
