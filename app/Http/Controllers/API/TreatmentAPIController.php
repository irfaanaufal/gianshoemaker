<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Treatment;
use Illuminate\Http\Request;

class TreatmentAPIController extends Controller
{
    public function index()
    {
        $data = Treatment::all();
        return response()->json($data, 200);
    }
}
