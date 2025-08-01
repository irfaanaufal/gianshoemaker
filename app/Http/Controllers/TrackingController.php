<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $user_login = Auth::user();
        $data = Order::whereIn('service_method', ['antar jemput', 'antar'])
            ->whereIn('status', ['siap diambil', 'dalam perjalanan (ambil)', 'dalam perjalanan (antar)', 'siap dikirim'])
            ->where(function ($query) use ($user_login) {
                $query->whereNull('courier_id')
                    ->orWhere('courier_id', $user_login->id);
            })
            ->with(['user', 'order_details', 'user_address'])
            ->orderBy('created_at', 'desc')
            ->orderBy('distance_km', 'asc')
            ->get();

        return Inertia::render("tracking/page", [
            "title" => "Tracking Order",
            "orders" => $data
        ]);
    }

    public function take_order(Request $request, Order $order)
    {
        try {
            $user_login = Auth::user();
            if (empty($order->courier_id)) {
                $order->courier_id = $user_login->id;
                $order->save();
                return response()->json([
                    "message" => "Berhasil mengambil orderan!"
                ], 201);
            }
        } catch (Exception $ex) {
            return response()->json([
                "message" => $ex->getMessage()
            ]);
        }
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
