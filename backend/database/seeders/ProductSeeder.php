<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 48; $i++) {
            $name = fake()->words(3, true);
            Product::create([
                'name' => $name,
                'slug' => Str::slug($name) . '-' . $i,
                'description' => fake()->paragraph(),
                'price' => fake()->randomFloat(2, 50, 2000),
                'stock' => fake()->numberBetween(0, 100),
                'image' => "https://picsum.photos/seed/product{$i}/500/350",
            ]);
        }
    }
}
