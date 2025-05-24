<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('categories')->latest();

        // Eğer category_id parametresi geldiyse filtrele
        if ($request->filled('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('id', $request->category_id);
            });
        }

        $products = $query->paginate(12);

        $products->getCollection()->transform(function ($product) {
            $product->ct_name = $product->categories->first()?->name;
            unset($product->categories);
            return $product;
        });

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with('categories')->find($id);

        if (!$product) {
            return response()->json(['message' => 'Ürün bulunamadı.'], 404);
        }

        $ct_name = $product->categories->first()?->name;

        return response()->json([
            'id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'image' => $product->image,
            'description' => $product->description,
            'ct_name' => $ct_name,
        ]);
    }

}
