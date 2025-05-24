<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function update(Request $request)
    {
        try {
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
                'shipping_address' => ['nullable', 'string', 'max:1000'],
                'billing_address' => ['nullable', 'string', 'max:1000'],
                'password' => ['nullable', 'min:8', 'confirmed'],
                'current_password' => ['nullable', 'string'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Doğrulama hatası.',
                'errors' => $e->errors(),
            ], 422);
        }

        $user = $request->user();

        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->shipping_address = $request->input('shipping_address');
        $user->billing_address = $request->input('billing_address');

        if ($request->filled('password')) {
            if ($request->filled('current_password')) {
                if (!Hash::check($request->input('current_password'), $user->password)) {
                    return response()->json(['message' => 'Mevcut şifre yanlış.'], 403);
                }
            } else {
                return response()->json(['message' => 'Mevcut şifrenizi girmelisiniz.']);
            }
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        return response()->json([
            'message' => 'Profil başarıyla güncellendi.',
            'user' => $user->only(['id', 'name', 'email', 'shipping_address', 'billing_address'])
        ]);
    }
}
