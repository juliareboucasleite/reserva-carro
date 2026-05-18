<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'As credenciais fornecidas são inválidas.',
            ]);
        }

        $plainToken = Str::random(80);
        $user->forceFill([
            'mobile_api_token' => hash('sha256', $plainToken),
        ])->save();

        return response()->json([
            'token' => $plainToken,
            'user' => $this->serializeUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->serializeUser($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->forceFill([
            'mobile_api_token' => null,
        ])->save();

        return response()->json([
            'ok' => true,
        ]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'surname' => $user->surname,
            'email' => $user->email,
            'role' => $user->role,
            'team' => $user->team,
            'country' => $user->country,
            'nif' => $user->nif,
            'birthdate' => $user->birthdate?->format('Y-m-d'),
            'phone' => $user->phone,
        ];
    }
}
