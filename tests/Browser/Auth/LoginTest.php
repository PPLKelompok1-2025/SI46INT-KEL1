<?php

namespace Tests\Browser\Auth;

use Laravel\Dusk\Browser;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\DuskTestCase;

class LoginTest extends DuskTestCase
{
    // (existing student/instructor/admin login tests)

    /**
     * PBI 4 – TC_PBI04_NEG_001: instructor login failure with wrong password
     */
    public function test_instructor_cannot_login_with_wrong_password()
    {
        $instructor = User::factory()->create([
            'email'    => 'login.instructor@example.com',
            'password' => Hash::make('correct-password'),
            'role'     => 'instructor',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('email', 'login.instructor@example.com')
                    ->type('password', 'wrong-password')
                    ->press('Log in')
                    ->pause(1000)
                    ->assertSee('These credentials do not match our records.');
        });

        $instructor->delete();
    }

    /**
     * PBI 5 – TC_PBI05_NEG_001: admin login failure with wrong password
     */
    public function test_admin_cannot_login_with_wrong_password()
    {
        $admin = User::factory()->create([
            'email'    => 'login.admin@example.com',
            'password' => Hash::make('correct-password'),
            'role'     => 'admin',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('email', 'login.admin@example.com')
                    ->type('password', 'wrong-password')
                    ->press('Log in')
                    ->pause(1000)
                    ->assertSee('These credentials do not match our records.');
        });

        $admin->delete();
    }
}