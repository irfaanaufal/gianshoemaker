<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Order\StoreRequest as OrderStore;
use App\Http\Requests\Order\UpdateRequest as OrderUpdate;
use App\Http\Services\MidtransService;
use App\Models\ShoeType;
use App\Models\Treatment;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('order', [
            'title' => "GIANSHOEMAKER | Place Order"
        ]);
    }

    public function dashboard()
    {
        return Inertia::render('order/page', [
            "title" => "GIANSHOEMAKER | Order List",
            "orders" => Order::with(['order_details', 'user', 'user_address'])->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('order/create', [
            "title" => "GIANSHOEMAKER | Tambah Order",
            "users" => User::whereHas('roles', function($query) {
                $query->whereIn('roles.name', ['pelanggan']);
            })->with('address')->get(),
            "shoe_types" => ShoeType::all(),
            "treatments" => Treatment::all()
        ]);
    }

    public function store(Request $request)
    {
        $generatedTrx = "TRX" . time() . date('Y') * date('m') * date('d') + time();
        $user = User::find($request->user_id);
        $address = UserAddress::find($request->user_address_id);
        $data = [
            "order_id" => $generatedTrx,
            "gross_amount" => $request->total_price,
            "first_name" => $user ?  $user->name : $request->custom_user,
            "address" => $address ? $address->address : $request->custom_address,
            "email" => $user ?  $user->email : "",
            "order_details" => $request->order_details,
        ];
        $addon_data = [
            "user_id" => $user->id,
            "user_address_id" => $address->id,
            "custom_user" => $request->custom_user ?? null,
            "custom_lat" => $request->custom_lat ?? null,
            "custom_long" => $request->custom_long ?? null,
        ];
        // Panggil fungsi createOrder dari service Midtrans
        $token = $this->midtransService->create_order($data);

        $newOrderDetails = [];
        foreach ($request->order_details as $ods) {
            array_push($newOrderDetails, (object)[
                "treatment_id" => $ods["treatment_id"] ?? $ods->treatment_id,
                "shoe_type_id" => $ods["shoe_type_id"] ?? $ods->shoe_type_id,
                "shoe_name" => $ods["shoe_name"] ?? $ods->shoe_name,
                "recent_price" => (int)$ods["recent_price"] ?? (int)$ods->recent_price,
            ]);
        }

        // Kirim token ke frontend
        return response()->json(['token' => $token, 'order' => $data, "addon_order" => $addon_data, "order_details" => $newOrderDetails], 200);
    }

    public function callback(Request $request)
    {
        $trx = Order::create([
            "trx" => $request->order["order_id"],
            "user_id" => $request->addon_order["user_id"] ?? null,
            "user_address_id" => $request->addon_order["user_address_id"] ?? null,
            "address" => $request->order["address"] ?? null,
            "custom_user" => $request->addon_order["custom_user"] ?? null,
            "custom_lat" => $request->addon_order["custom_lat"] ?? null,
            "custom_long" => $request->addon_order["custom_long"] ?? null,
            "payment_status" => "paid",
            "grand_total" => $request->order["gross_amount"] ?? 0
        ]);
        foreach ($request->order_details as $od) {
            $trx->order_details()->create($od);
        }
        return response()->json([
            "message" => "Berhasil membuat order baru!"
        ], 200);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }
}
