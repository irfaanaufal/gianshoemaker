<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Services\MidtransService;
use App\Models\ShoeType;
use App\Models\Treatment;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Support\Facades\Auth;

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
        $user = Auth::user();
        $role = $user->getRoleNames();
        $orders = new Order;
        if ($role[0] == "pelanggan") {
            $orders->where(['user_id', $user->id]);
        }

        return Inertia::render('order/page', [
            "title" => "GIANSHOEMAKER | Order List",
            "orders" => $orders->with(['order_details', 'user', 'user_address'])->get()
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

    protected function generateTrx(): string
    {
        return "TRX" . time() . date('Y') * date('m') * date('d') + time();
    }

    public function store(Request $request)
    {
        try {
            $custom = (object)[
                "name" => $request->custom_user,
                "address" => $request->custom_address,
                "email" => "example@gmail.com"
            ];

            // Handle both registered and guest users
            $user = $request->user_id ? User::find($request->user_id) : $custom;
            $address = $request->user_address_id ? UserAddress::find($request->user_address_id) : $custom->address;

            $data = [
                "order_id" => $this->generateTrx(),
                "gross_amount" => $request->total_price,
                "first_name" => $user ? $user->name : $request->custom_user,
                "address" => $address ? $address->address : $request->custom_address,
                "email" => $user ? $user->email : $custom->email,
                "order_details" => $request->order_details,
            ];

            $addon_data = [
                "user_id" => $user ? $user->id : null,
                "user_address_id" => $address ? $address->id : null,
                "custom_user" => $request->custom_user,
                "custom_lat" => $request->custom_lat,
                "custom_long" => $request->custom_long,
                "custom_address" => $request->custom_address
            ];

            // Create Midtrans token
            $token = $this->midtransService->create_order($data);

            $newOrderDetails = [];
            foreach ($request->order_details as $ods) {
                $newOrderDetails[] = (object)[
                    "treatment_id" => $ods["treatment_id"],
                    "shoe_type_id" => $ods["shoe_type_id"],
                    "shoe_name" => $ods["shoe_name"],
                    "recent_price" => (int)$ods["recent_price"]
                ];
            }

            return response()->json([
                'token' => $token,
                'order' => $data,
                "addon_order" => $addon_data,
                "order_details" => $newOrderDetails
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Order creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store_user_mode(Request $request)
    {

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
        $order->update([
            'status' => $request->status
        ]);
        return response()->json([
            "message" => "Berhasil update order!"
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }
}
