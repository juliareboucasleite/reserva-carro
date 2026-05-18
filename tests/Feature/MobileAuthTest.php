<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MobileAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_login_returns_token_and_user_payload(): void
    {
        $user = User::factory()->create([
            'email' => 'condutor@example.com',
            'password' => 'password',
        ]);

        $response = $this->postJson('/mobile/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ]);

        $this->assertNotNull($user->fresh()->getAttribute('mobile_api_token'));
    }

    public function test_mobile_token_can_access_me_and_logout_revokes_it(): void
    {
        $user = User::factory()->create([
            'password' => 'password',
        ]);

        $login = $this->postJson('/mobile/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $token = $login->json('token');

        $this->withToken($token)
            ->getJson('/mobile/auth/me')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);

        $this->withToken($token)
            ->postJson('/mobile/auth/logout')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->withToken($token)
            ->getJson('/mobile/auth/me')
            ->assertUnauthorized();
    }
}
