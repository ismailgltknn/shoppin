<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
            'stock' => $product->stock,
            'category_id' => $product->categories->first()?->id,
            'slug' => $product->slug,
        ]);
    }

    /**
     * Create new product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products,slug|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => $request->slug,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image' => $imagePath ? Storage::url($imagePath) : null,
        ]);

        $category = Category::find($request->category_id);
        if ($category) {
            $product->categories()->sync([$category->id]);
        }

        return response()->json([
            'message' => 'Ürün başarıyla oluşturuldu.',
            'product' => $this->formatProductForResponse($product->load('categories')),
        ], 201);
    }

    /**
     * Update product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('image')) {
            if ($product->image && Storage::disk('public')->exists(str_replace('/storage/', '', $product->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $product->image));
            }
            $imagePath = $request->file('image')->store('products', 'public');
            $product->image = Storage::url($imagePath);
        }

        $product->update([
            'name' => $request->name,
            'slug' => $request->slug,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
        ]);

        $category = Category::find($request->category_id);
        if ($category) {
            $product->categories()->sync([$category->id]);
        }

        return response()->json([
            'message' => 'Ürün başarıyla güncellendi.',
            'product' => $this->formatProductForResponse($product->load('categories')),
        ]);
    }

    /**
     * Delete product.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Product $product)
    {
        // Resmi sil (varsa)
        if ($product->image && Storage::disk('public')->exists(str_replace('/storage/', '', $product->image))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image));
        }

        $product->delete();

        return response()->json(['message' => 'Ürün başarıyla silindi.'], 200);
    }

    /**
     * Format product response.
     *
     * @param  \App\Models\Product  $product
     * @return array
     */
    protected function formatProductForResponse(Product $product)
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'price' => (float) $product->price,
            'image' => $product->image,
            'description' => $product->description,
            'ct_name' => $product->categories->first()?->name,
            'stock' => $product->stock,
            'category_id' => $product->categories->first()?->id,
            'slug' => $product->slug,
        ];
    }

}
