<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getStats()
    {
        $totalProducts = Product::count();
        $totalStock = Product::sum('stock');
        $totalOrders = Order::count();
        $totalUsers = User::count();

        $recentOrders = Order::where('created_at', '>=', now()->subDays(7))->count();

        $totalInventoryValue = Product::selectRaw('SUM(price * stock) as total_value')->first()->total_value ?? 0;


        return response()->json([
            'totalProducts' => $totalProducts,
            'totalStock' => $totalStock,
            'totalOrders' => $totalOrders,
            'totalUsers' => $totalUsers,
            'recentOrdersLast7Days' => $recentOrders,
            'totalInventoryValue' => (float) $totalInventoryValue,
        ]);
    }
}
