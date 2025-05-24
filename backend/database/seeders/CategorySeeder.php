<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Elektronik',
            'Moda',
            'Ev ve Yaşam',
            'Kitap',
            'Oyuncak',
            'Spor',
            'Güzellik',
            'Ofis Ürünleri',
            'Mutfak',
            'Bebek'
        ];

        foreach ($categories as $name) {
            Category::create([
                'name' => $name,
                'slug' => Str::slug($name),
            ]);
        }
    }
}
