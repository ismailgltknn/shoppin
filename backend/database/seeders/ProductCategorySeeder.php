<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $categoryIds = Category::pluck('id')->toArray();

        foreach ($products as $product) {
            DB::table('product_categories')->insert([
                'product_id' => $product->id,
                'category_id' => fake()->randomElement($categoryIds),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

