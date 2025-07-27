<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Treatment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        // ✅ Ambil treatment paling banyak dipilih dari order_details
        $topTreatments = DB::table('order_details')
            ->select('treatment_id', DB::raw('COUNT(*) as count'))
            ->groupBy('treatment_id')
            ->orderByDesc('count')
            ->limit(5) // Ambil 5 teratas
            ->get()
            ->map(function ($item) {
                $treatment = Treatment::find($item->treatment_id);
                return [
                    'label' => $treatment?->name ?? 'Unknown',
                    'value' => $item->count
                ];
            });

        // ✅ Total order bulanan (paid) dari Januari - Desember
        $monthlyOrders = DB::table('orders')
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->where('payment_status', 'paid')
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->pluck('count', 'month');

        // Normalisasi agar semua bulan 1–12 terisi (jika kosong = 0)
        $monthlyOrdersComplete = collect(range(1, 12))->map(function ($month) use ($monthlyOrders) {
            return [
                'month' => Carbon::create()->month($month)->format('F'),
                'count' => $monthlyOrders[$month] ?? 0,
            ];
        });

        // ✅ Total pendapatan bulanan dari order yang 'paid'
        $monthlyRevenue = DB::table('orders')
            ->selectRaw('MONTH(created_at) as month, SUM(grand_total) as revenue')
            ->where('payment_status', 'paid')
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->pluck('revenue', 'month');

        // Lengkapi semua bulan 1–12 agar tidak kosong
        $monthlyRevenueComplete = collect(range(1, 12))->map(function ($month) use ($monthlyRevenue) {
            return [
                'month' => Carbon::create()->month($month)->format('F'),
                'revenue' => (float) ($monthlyRevenue[$month] ?? 0),
            ];
        });

        return Inertia::render('dashboard', [
            "title" => "Dashboard",
            "total_order" => $total_order,
            "active_order" => $active_order,
            "revenue" => $revenue,
            "top_treatments" => $topTreatments,
            "monthly_orders" => $monthlyOrdersComplete,
            "monthly_revenue" => $monthlyRevenueComplete,
        ]);
    }
}
