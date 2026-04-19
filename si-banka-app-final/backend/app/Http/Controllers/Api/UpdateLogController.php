<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UpdateLog;
use Illuminate\Http\Request;

class UpdateLogController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => UpdateLog::with('user')->orderBy('date', 'desc')->get(),
        ]);
    }
}
