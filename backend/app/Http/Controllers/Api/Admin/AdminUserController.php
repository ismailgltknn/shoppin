<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        $users = User::with('roles')
            ->orderBy('id', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $formattedUsers = $users->getCollection()->map(function ($user) {
            return $this->formatUserForResponse($user);
        });

        return response()->json([
            'data' => $formattedUsers,
            'current_page' => $users->currentPage(),
            'per_page' => $users->perPage(),
            'total' => $users->total(),
            'last_page' => $users->lastPage(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'role' => ['required', 'string', Rule::in(['customer', 'seller', 'admin'])],
                'shipping_address' => ['nullable', 'string', 'max:500'],
                'billing_address' => ['nullable', 'string', 'max:500'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validasyon Hatası.',
                'errors' => $e->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'shipping_address' => $validatedData['shipping_address'],
            'billing_address' => $validatedData['billing_address'],
        ]);

        $user->assignRole($validatedData['role']);

        return response()->json([
            'message' => 'Kullanıcı başarıyla eklendi.',
            'user' => $this->formatUserForResponse($user->load('roles')),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        try {
            $validatedData = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                'shipping_address' => ['nullable', 'string', 'max:1000'],
                'billing_address' => ['nullable', 'string', 'max:1000'],
                'password' => ['nullable', 'min:8', 'confirmed'],
                'role' => ['required', 'string', Rule::in(['admin', 'seller', 'customer'])],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Doğrulama hatası.',
                'errors' => $e->errors(),
            ], 422);
        }

        $user->name = $validatedData['name'];
        $user->email = $validatedData['email'];
        $user->shipping_address = $validatedData['shipping_address'];
        $user->billing_address = $validatedData['billing_address'];

        if (isset($validatedData['password'])) {
            $user->password = Hash::make($validatedData['password']);
        }

        $user->syncRoles([$validatedData['role']]);

        $user->save();

        return response()->json([
            'message' => 'Kullanıcı başarıyla güncellendi.',
            'user' => $this->formatUserForResponse($user->load('roles')),
        ]);
    }

    public function destroy(User $user)
    {
        if (Auth::user()->id === $user->id) {
            return response()->json(['message' => 'Kendi hesabınızı silemezsiniz.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Kullanıcı başarıyla silindi.'], 200);
    }

    protected function formatUserForResponse(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'shipping_address' => $user->shipping_address,
            'billing_address' => $user->billing_address,
            'role' => $user->getRoleNames()->first(),
            'created_at' => $user->created_at->toDateTimeString(),
            'updated_at' => $user->updated_at->toDateTimeString(),
        ];
    }
}
