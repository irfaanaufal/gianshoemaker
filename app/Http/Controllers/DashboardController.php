<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $query = Order::with(['order_details', 'user', 'user_address']);

        $user = Auth::user();

        $role = $user->getRoleNames();

        if ($role[0] == "pelanggan") {
            $query->where('user_id', Auth::id());
        }

        $orders = Collection::make($query->get());

        $total_order = $orders->count();

        $active_order = $orders->where('status', '!=', 'selesai')->count();

        $revenue = $orders->sum('grand_total');

        return Inertia::render('dashboard', [
            "title" => "Dashboard",
            "total_order" => $total_order,
            "active_order" => $active_order,
            "revenue" => $revenue,
        ]);
    }
}
