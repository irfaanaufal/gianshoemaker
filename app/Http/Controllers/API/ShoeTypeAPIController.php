<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ShoeType;
use Illuminate\Http\Request;

class ShoeTypeAPIController extends Controller
{
    public function index()
    {
        $data = ShoeType::all();
        return response()->json($data, 200);
    }
}
