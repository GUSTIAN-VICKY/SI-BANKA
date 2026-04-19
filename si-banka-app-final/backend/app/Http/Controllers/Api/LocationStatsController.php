<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankSampah;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LocationStatsController extends Controller
{
    /**
     * Get location distribution statistics.
     * - Super Admin Kota: Nasabah count per Kecamatan (all bank sampah)
     * - Super Admin RT / Admin RT: Detail per Kelurahan/RW in their Kecamatan
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Super Admin Kota: Get all bank sampah grouped by kecamatan
        if ($user->canViewAllData()) {
            $stats = BankSampah::select('kecamatan')
                ->selectRaw('COUNT(DISTINCT bank_sampah.id) as total_bank_sampah')
                ->selectRaw('COUNT(DISTINCT customers.id) as total_nasabah')
                ->selectRaw('COUNT(DISTINCT kelurahan) as total_kelurahan')
                ->leftJoin('customers', 'customers.bank_sampah_id', '=', 'bank_sampah.id')
                ->groupBy('kecamatan')
                ->orderBy('total_nasabah', 'desc')
                ->get();

            // Also get overall summary
            $summary = [
                'total_kecamatan' => BankSampah::distinct('kecamatan')->count('kecamatan'),
                'total_bank_sampah' => BankSampah::count(),
                'total_nasabah' => Customer::count(),
            ];

            return response()->json([
                'type' => 'kota',
                'summary' => $summary,
                'distribution' => $stats,
            ]);
        }

        // Super Admin RT / Admin RT: Get detail within their kecamatan
        $bankSampah = $user->bankSampah;
        
        if (!$bankSampah) {
            return response()->json([
                'type' => 'rt',
                'summary' => ['total_kelurahan' => 0, 'total_rw' => 0, 'total_nasabah' => 0],
                'distribution' => [],
            ]);
        }

        $kecamatan = $bankSampah->kecamatan;
        
        // Get all bank sampah in the same kecamatan, grouped by kelurahan
        $stats = BankSampah::where('kecamatan', $kecamatan)
            ->select('kelurahan', 'rt', 'rw', 'name')
            ->selectRaw('(SELECT COUNT(*) FROM customers WHERE customers.bank_sampah_id = bank_sampah.id) as total_nasabah')
            ->orderBy('kelurahan')
            ->orderBy('rw')
            ->orderBy('rt')
            ->get();

        // Group by kelurahan for summary
        $kelurahanSummary = BankSampah::where('kecamatan', $kecamatan)
            ->select('kelurahan')
            ->selectRaw('COUNT(DISTINCT id) as total_bank_sampah')
            ->selectRaw('COUNT(DISTINCT rw) as total_rw')
            ->selectRaw('(SELECT COUNT(*) FROM customers WHERE customers.bank_sampah_id IN (SELECT id FROM bank_sampah bs WHERE bs.kelurahan = bank_sampah.kelurahan)) as total_nasabah')
            ->groupBy('kelurahan')
            ->orderBy('total_nasabah', 'desc')
            ->get();

        $summary = [
            'kecamatan' => $kecamatan,
            'total_kelurahan' => BankSampah::where('kecamatan', $kecamatan)->distinct('kelurahan')->count('kelurahan'),
            'total_bank_sampah' => BankSampah::where('kecamatan', $kecamatan)->count(),
            'total_nasabah' => Customer::whereHas('bankSampah', fn($q) => $q->where('kecamatan', $kecamatan))->count(),
        ];

        return response()->json([
            'type' => 'rt',
            'summary' => $summary,
            'distribution' => $kelurahanSummary,
            'detail' => $stats,
        ]);
    }
}
