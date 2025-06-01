<?php

namespace App\Http\Controllers;

use App\Http\Services\MidtransService;
use App\Models\Treatment;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MidtransController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function create_order(Request $request)
    {
        $user = Auth::user();
        $address = UserAddress::find($request->user_address_id);
        $treatment = Treatment::find($request->treatment_id);

        $generatedTrx = "TRX" . time() . date('Y') * date('m') * date('d') + time();

        $data = [
            'order_id' => $generatedTrx,
            'gross_amount' => $request->recent_price,
            'first_name' => $user->name,
            'address' => $address->address,
            'email' => $user->email,
            'treatment_id' => $treatment->id,
            'treatment' => $treatment->name,
        ];

        // Panggil fungsi createOrder dari service Midtrans
        $token = $this->midtransService->create_order($data);

        // Kirim token ke frontend
        return response()->json(['token' => $token, 'order' => $data], 200);
    }
}
