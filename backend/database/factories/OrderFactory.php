<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'user_id' => User::factory(), // İlişkili bir User oluşturur
            'order_status' => $this->faker->randomElement(['pending', 'processing', 'completed', 'cancelled']),
            'order_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'total_price' => $this->faker->randomFloat(2, 10, 1000), // 2 ondalıklı, 10 ile 1000 arasında fiyat
            'shipping_address' => $this->faker->address,
            'billing_address' => $this->faker->address,
        ];
    }

    /**
     * Indicate that the order is in 'pending' status.
     *
     * @return \Illuminate\Database\Eloquent\Factories\Factory
     */
    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'order_status' => 'pending',
                'order_date' => now(),
                'total_price' => 0, // Pending siparişin başlangıç total_price'ı 0 olabilir
            ];
        });
    }
}
