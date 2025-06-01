<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\Order\StoreRequest as OrderStore;
use App\Http\Requests\Order\UpdateRequest as OrderUpdate;
use App\Models\ShoeType;
use App\Models\Treatment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
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

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderStore $request)
    {
        DB::transaction(function() use($request) {
            //
        });
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
