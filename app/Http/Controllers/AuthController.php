<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->serializeUser($request->user()),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'As credenciais fornecidas são inválidas.',
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'user' => $this->serializeUser($request->user()),
            'csrf_token' => csrf_token(),
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'size:2'],
            'nif' => ['required', 'string', 'max:32'],
            'birthdate' => ['required', 'date', 'before:today'],
            'phone' => ['required', 'string', 'max:32'],
            'email' => ['required', 'email', 'max:255', 'confirmed', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'team' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', Rule::in(['driver'])],
            'newsletter_opt_in' => ['nullable', 'boolean'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'surname' => $data['surname'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => $data['role'] ?? 'driver',
            'team' => $data['team'] ?? 'Operações',
            'country' => $data['country'],
            'nif' => $data['nif'],
            'birthdate' => $data['birthdate'],
            'phone' => $data['phone'],
            'newsletter_opt_in' => (bool) ($data['newsletter_opt_in'] ?? false),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'user' => $this->serializeUser($user),
            'csrf_token' => csrf_token(),
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'ok' => true,
        ]);
    }

    private function serializeUser(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

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
