<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class OrderTest extends TestCase
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
    public function kullanici_yeni_bir_siparis_olusturabilir()
    {
        $product = Product::factory()->create(['stock' => 10, 'price' => 100.00]);

        $cart = Order::factory()->pending()->create([
            'user_id' => $this->user->id,
        ]);
        OrderItem::create([
            'order_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'unit_price' => $product->price,
        ]);

        $response = $this->postJson('/api/orders', [
            'shipping_address' => 'Test Adres Sokak No:1 D:2',
            'billing_address' => 'Fatura Adres Sokak No:3 D:4',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Siparişiniz başarıyla oluşturuldu!',
            ])
            ->assertJsonStructure([
                'message',
                'orderId'
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $cart->id,
            'user_id' => $this->user->id,
            'order_status' => 'processing',
            'shipping_address' => 'Test Adres Sokak No:1 D:2',
            'billing_address' => 'Fatura Adres Sokak No:3 D:4',
            'total_price' => 200.00,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 8,
        ]);
    }

    #[Test]
    public function stok_yetersiz_ise_siparis_olusturulamaz()
    {
        $initialProductStock = 1;
        $orderQuantity = 2;

        $product = Product::factory()->create([
            'stock' => $initialProductStock,
            'price' => 100.00
        ]);
        $cart = Order::factory()->pending()->create(['user_id' => $this->user->id]);
        OrderItem::create([
            'order_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => $orderQuantity,
            'unit_price' => $product->price,
        ]);

        $response = $this->postJson('/api/orders', [
            'shipping_address' => 'Test Adres',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['stock_error']);

        $this->assertDatabaseHas('orders', [
            'id' => $cart->id,
            'user_id' => $this->user->id,
            'order_status' => 'pending',
            'total_price' => 0.00,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => $initialProductStock,
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => $orderQuantity,
        ]);
    }

    #[Test]
    public function sepet_bos_ise_siparis_olusturulamaz()
    {
        $cart = Order::factory()->pending()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->postJson('/api/orders', [
            'shipping_address' => 'Test Adres',
        ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'Sepetiniz boş veya bulunamadı.']);

        $this->assertDatabaseHas('orders', [
            'id' => $cart->id,
            'order_status' => 'pending',
        ]);
    }

    #[Test]
    public function fatura_adresi_belirtilmezse_gonderim_adresi_kullanilir()
    {
        $product = Product::factory()->create(['stock' => 10, 'price' => 100.00]);

        $cart = Order::factory()->pending()->create([
            'user_id' => $this->user->id,
        ]);
        OrderItem::create([
            'order_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => $product->price,
        ]);

        $response = $this->postJson('/api/orders', [
            'shipping_address' => 'Sadece Gönderim Adresi',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('orders', [
            'id' => $cart->id,
            'shipping_address' => 'Sadece Gönderim Adresi',
            'billing_address' => 'Sadece Gönderim Adresi',
            'order_status' => 'processing',
        ]);
    }

    #[Test]
    public function kullanici_tum_siparislerini_listeleyebilir()
    {
        $product1 = Product::factory()->create();
        $order1 = Order::factory()->create([
            'user_id' => $this->user->id,
            'order_status' => 'completed',
            'order_date' => now()->subDays(5),
            'total_price' => 100.00
        ]);
        OrderItem::create(['order_id' => $order1->id, 'product_id' => $product1->id, 'quantity' => 1, 'unit_price' => 100]);

        $product2 = Product::factory()->create();
        $order2 = Order::factory()->create([
            'user_id' => $this->user->id,
            'order_status' => 'processing',
            'order_date' => now()->subDays(2),
            'total_price' => 200.00
        ]);
        OrderItem::create(['order_id' => $order2->id, 'product_id' => $product2->id, 'quantity' => 1, 'unit_price' => 200]);

        $pendingProduct = Product::factory()->create();
        $pendingOrder = Order::factory()->pending()->create([
            'user_id' => $this->user->id,
            'total_price' => 50.00
        ]);
        OrderItem::create(['order_id' => $pendingOrder->id, 'product_id' => $pendingProduct->id, 'quantity' => 1, 'unit_price' => 50]);

        $response = $this->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $order1->id])
            ->assertJsonFragment(['id' => $order2->id])
            ->assertJsonMissing(['id' => $pendingOrder->id]);
    }

    #[Test]
    public function kullanici_belirli_bir_siparisi_goruntuleyebilir()
    {
        $product = Product::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'order_status' => 'completed',
            'total_price' => 100.00
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 100.00
        ]);

        $response = $this->getJson('/api/orders/' . $order->id);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $order->id,
                'user_id' => $this->user->id,
                'order_status' => 'completed',
                'total_price' => 100.00,
            ])
            ->assertJsonStructure([
                'id',
                'user_id',
                'order_status',
                'order_date',
                'total_price',
                'shipping_address',
                'billing_address',
                'created_at',
                'updated_at',
                'order_items' => [
                    '*' => ['id', 'order_id', 'product_id', 'quantity', 'unit_price', 'created_at', 'updated_at', 'product']
                ]
            ]);
    }

    #[Test]
    public function kullanici_baskasinin_siparisini_goruntuleyemez()
    {
        $anotherUser = User::factory()->create();
        $orderOfAnotherUser = Order::factory()->create([
            'user_id' => $anotherUser->id,
            'order_status' => 'completed'
        ]);

        $response = $this->getJson('/api/orders/' . $orderOfAnotherUser->id);

        $response->assertStatus(404);
    }

    #[Test]
    public function kullanici_pending_siparisini_goruntuleyemez()
    {
        $pendingOrder = Order::factory()->pending()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this->getJson('/api/orders/' . $pendingOrder->id);

        $response->assertStatus(404);
    }
}
