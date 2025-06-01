<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('categories')->latest();

        if ($request->filled('category_id')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        $perPage = $request->input('per_page', 12);
        if (!is_numeric($perPage) || $perPage < 1) {
            $perPage = 12;
        }

        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            $firstCategory = $product->categories->first();

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
                'image' => $product->image,
                'category_id' => $firstCategory ? $firstCategory->id : null,
                'ct_name' => $firstCategory ? $firstCategory->name : null,
            ];
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        $validatedData['image'] = null;

        $product = Product::create($validatedData);
        $product->categories()->sync([$request->category_id]);

        return response()->json([
            'message' => 'Ürün başarıyla eklendi.',
            'product' => $this->formatProductForResponse($product->load('categories')),
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products')->ignore($product->id),
            ],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();

        $product->update($validatedData);
        $product->categories()->sync([$request->category_id]);

        return response()->json([
            'message' => 'Ürün başarıyla güncellendi.',
            'product' => $this->formatProductForResponse($product->load('categories')),
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Ürün başarıyla silindi.'], 200);
    }

    protected function formatProductForResponse(Product $product)
    {
        $firstCategory = $product->categories->first();

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price' => (string) $product->price,
            'stock' => (int) $product->stock,
            'image' => $product->image,
            'category_id' => $firstCategory ? $firstCategory->id : null,
            'ct_name' => $firstCategory ? $firstCategory->name : null,
        ];
    }

}
