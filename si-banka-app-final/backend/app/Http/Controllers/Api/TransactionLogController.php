<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TransactionLog;
use Illuminate\Http\Request;

class TransactionLogController extends Controller
{
    public function index()
    {
        $logs = TransactionLog::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }
}
