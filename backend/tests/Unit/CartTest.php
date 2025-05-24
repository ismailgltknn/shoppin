<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;

class CartTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user, 'sanctum');
    }

    #[Test]
    public function kullanici_sepete_urun_ekleyebilir()
    {
        $product = Product::factory()->create(['stock' => 10, 'price' => 100.00]);

        $response = $this->postJson('/api/cart', [
            'productId' => $product->id,
            'quantity' => 1,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'order_status' => 'pending',
            'total_price' => 100.00,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 100.00,
        ]);
    }

    #[Test]
    public function mevcut_urun_sepete_eklendiginde_miktar_guncellenir()
    {
        $product = Product::factory()->create(['stock' => 10, 'price' => 50.00]);

        $this->postJson('/api/cart', [
            'productId' => $product->id,
            'quantity' => 1,
        ]);

        $response = $this->postJson('/api/cart', [
            'productId' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'order_status' => 'pending',
            'total_price' => 150.00,
        ]);
    }

    #[Test]
    public function stok_yetersiz_ise_urun_sepete_eklenemez()
    {
        $product = Product::factory()->create(['stock' => 5, 'price' => 10.00]);

        $response = $this->postJson('/api/cart', [
            'productId' => $product->id,
            'quantity' => 6,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['stock_error']);

        $this->assertDatabaseMissing('order_items', [
            'product_id' => $product->id,
        ]);
    }

    #[Test]
    public function kullanici_sepetteki_urunu_kaldirabilir()
    {
        $product1 = Product::factory()->create(['stock' => 10, 'price' => 100.00]);
        $product2 = Product::factory()->create(['stock' => 5, 'price' => 50.00]);

        $this->postJson('/api/cart', ['productId' => $product1->id, 'quantity' => 1]);
        $this->postJson('/api/cart', ['productId' => $product2->id, 'quantity' => 2]);

        $response = $this->deleteJson('/api/cart/' . $product1->id);

        $response->assertStatus(200);

        $this->assertDatabaseMissing('order_items', [
            'product_id' => $product1->id,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product2->id,
            'quantity' => 2,
        ]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'order_status' => 'pending',
            'total_price' => 100.00,
        ]);
    }

    #[Test]
    public function kullanici_sepetteki_urun_miktarini_guncelleyebilir()
    {
        $product = Product::factory()->create(['stock' => 10, 'price' => 100.00]);

        $this->postJson('/api/cart', ['productId' => $product->id, 'quantity' => 1]);

        $response = $this->putJson('/api/cart/' . $product->id, ['quantity' => 5]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'order_status' => 'pending',
            'total_price' => 500.00,
        ]);
    }
}
