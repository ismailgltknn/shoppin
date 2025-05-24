<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function index()
    {
        $order = Order::where('user_id', Auth::id())
            ->where('order_status', 'pending')
            ->with('orderItems.product')
            ->first();

        if (!$order) {
            return response()->json([]);
        }

        return response()->json($order->orderItems->map(function ($item) {
            return [
                'productId' => $item->product_id,
                'name' => $item->product->name,
                'price' => $item->unit_price,
                'image' => $item->product->image,
                'quantity' => $item->quantity,
            ];
        }));
    }

    public function store(Request $request)
    {
        $request->validate([
            'productId' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $productId = $request->productId;
        $quantity = $request->quantity;
        $user = Auth::user();

        $cart = Order::firstOrCreate(
            [
                'user_id' => $user->id,
                'order_status' => 'pending'
            ],
            [
                'order_date' => now(),
                'total_price' => 0,
                'shipping_address' => null,
                'billing_address' => null,
            ]
        );

        $product = Product::findOrFail($productId);

        DB::beginTransaction();
        try {
            if ($product->stock < $quantity) {
                DB::rollBack();
                throw ValidationException::withMessages([
                    'stock_error' => 'Yetersiz stok! Mevcut stok: ' . $product->stock,
                ]);
            }

            $orderItem = $cart->orderItems()->where('product_id', $productId)->first();

            if ($orderItem) {
                $orderItem->quantity += $quantity;
                if ($product->stock < $orderItem->quantity) {
                    DB::rollBack();
                    throw ValidationException::withMessages([
                        'stock_error' => 'Yetersiz stok! Bu üründen sepetteki miktar ile birlikte toplam ' . $product->stock . ' adetten fazla olamaz.',
                    ]);
                }
                $orderItem->save();
            } else {
                $orderItem = new OrderItem([
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'unit_price' => $product->price,
                ]);
                $cart->orderItems()->save($orderItem);
            }

            $cart->total_price = $cart->orderItems->sum(function ($item) {
                return $item->quantity * $item->unit_price;
            });
            $cart->save();

            DB::commit();

            $updatedCart = Order::where('id', $cart->id)
                ->with('orderItems.product')
                ->first();

            return response()->json($updatedCart, 200);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Ürün sepete eklenirken bir hata oluştu: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $productId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $order = Order::where('user_id', Auth::id())
            ->where('order_status', 'pending')
            ->firstOrFail();

        $item = OrderItem::where('order_id', $order->id)
            ->where('product_id', $productId)
            ->firstOrFail();

        $product = Product::findOrFail($productId);

        DB::beginTransaction();
        try {
            if ($product->stock < $request->quantity) {
                DB::rollBack();
                throw ValidationException::withMessages([
                    'stock_error' => 'Yetersiz stok! Mevcut stok: ' . $product->stock,
                ]);
            }
            $item->quantity = $request->quantity;
            $item->save();

            $order->total_price = $order->orderItems->sum(function ($item) {
                return $item->quantity * $item->unit_price;
            });
            $order->save();

            DB::commit();

            $updatedCart = Order::where('id', $order->id)
                ->with('orderItems.product')
                ->first();

            return response()->json($updatedCart, 200);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage(), 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Adet güncellenirken bir hata oluştu: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($productId)
    {
        $order = Order::where('user_id', Auth::id())
            ->where('order_status', 'pending')
            ->firstOrFail();

        DB::beginTransaction();
        try {
            OrderItem::where('order_id', $order->id)
                ->where('product_id', $productId)
                ->delete();

            $order->total_price = $order->orderItems->sum(function ($item) {
                return $item->quantity * $item->unit_price;
            });
            $order->save();

            DB::commit();

            $updatedCart = Order::where('id', $order->id)
                ->with('orderItems.product')
                ->first();

            return response()->json($updatedCart, 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Ürün sepetten silinirken bir hata oluştu: ' . $e->getMessage()], 500);
        }
    }

    public function clear()
    {
        $order = Order::where('user_id', Auth::id())
            ->where('order_status', 'pending')
            ->first();

        if ($order) {
            DB::beginTransaction();
            try {
                $order->orderItems()->delete();
                $order->total_price = 0;
                $order->save();
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => 'Sepet temizlenirken bir hata oluştu: ' . $e->getMessage()], 500);
            }
        }

        return response()->json(['message' => 'Sepet temizlendi.']);
    }
}
