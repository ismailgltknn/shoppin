<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index()
    {
        // 'pending' dışındaki tüm siparişleri getir
        $orders = Order::where('user_id', Auth::id())
            ->where('order_status', '!=', 'pending')
            ->orderByDesc('order_date')
            ->with('orderItems.product')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show($id)
    {
        $order = Order::where('user_id', Auth::id())
            ->where('id', $id)
            ->where('order_status', '!=', 'pending')
            ->with('orderItems.product')
            ->firstOrFail();

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:500',
            'billing_address' => 'nullable|string|max:500',
        ]);

        $currentCart = Order::where('user_id', Auth::id())
            ->where('order_status', 'pending')
            ->with('orderItems.product')
            ->first();

        if (!$currentCart || $currentCart->orderItems->isEmpty()) {
            return response()->json(['message' => 'Sepetiniz boş veya bulunamadı.'], 400);
        }

        try {
            DB::transaction(function () use ($currentCart, $request) {
                // Stok kontrolü
                foreach ($currentCart->orderItems as $item) {
                    if ($item->product->stock < $item->quantity) {
                        throw ValidationException::withMessages([
                            'stock_error' => "Üzgünüz, {$item->product->name} ürünü için yeterli stok bulunmamaktadır. Mevcut stok: {$item->product->stock}",
                        ]);
                    }
                }

                // Toplam fiyatı hesapla
                $totalPrice = $currentCart->orderItems->sum(function ($item) {
                    return $item->quantity * $item->unit_price;
                });

                // Sipariş Durumunu Güncelle ve Bilgileri Ekle
                $currentCart->update([
                    'order_status' => 'processing',
                    'order_date' => now(),
                    'shipping_address' => $request->shipping_address,
                    'billing_address' => $request->billing_address ?? $request->shipping_address,
                    'total_price' => $totalPrice,
                ]);

                // Stokları Azalt
                foreach ($currentCart->orderItems as $item) {
                    $item->product->decrement('stock', $item->quantity);
                }
            });

            // Transaction başarılı
            return response()->json(['message' => 'Siparişiniz başarıyla oluşturuldu!', 'orderId' => $currentCart->id], 200);

        } catch (ValidationException $e) {
            // DB::transaction() içinde fırlatılan ValidationException otomatik olarak transaction'ı geri alır
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Diğer beklenmedik hatalar için, DB::transaction() zaten rollBack yapmıştır.
            Log::error("Sipariş oluşturulurken bir hata oluştu: " . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Siparişiniz oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'], 500);
        }
    }
}
