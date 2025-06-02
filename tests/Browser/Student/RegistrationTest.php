<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use App\Models\User;
use Tests\DuskTestCase;

class RegistrationTest extends DuskTestCase
{
    /**
     * PBI 1 – TC_PBI01_POS_001: successful student registration
     */
    public function test_student_can_register_with_valid_credentials()
    {
        $email = 'dusk.student+' . time() . '@example.com';
        User::where('email', $email)->delete();

        $this->browse(function (Browser $browser) use ($email) {
            $browser->visit('/register')
                    ->type('name', 'Dusk Student')
                    ->type('email', $email)
                    ->type('password', 'password123')
                    ->type('password_confirmation', 'password123')
                    ->press('Register')
                    ->pause(2000)
                    ->assertPathIs('/student/dashboard')
                    ->assertSee('My Learning Dashboard');
        });

        User::where('email', $email)->delete();
    }

    /**
     * PBI 1 – TC_PBI01_NEG_001: registration with existing email
     */
    public function test_registration_fails_for_existing_email()
    {
        $existing = User::factory()->create(['email' => 'existing@student.com']);

        $this->browse(function (Browser $browser) {
            $browser->visit('/register')
                    ->type('name', 'Any Student')
                    ->type('email', 'existing@student.com')
                    ->type('password', 'password123')
                    ->type('password_confirmation', 'password123')
                    ->press('Register')
                    ->pause(1000)
                    ->assertPathIs('/register')
                    ->assertSee('The email has already been taken');
        });

        $existing->delete();
    }

    /**
     * PBI 1 – TC_PBI01_NEG_002: registration with invalid email format
     */
    public function test_registration_fails_for_invalid_email_format()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/register')
                    ->type('name', 'Test')
                    ->type('email', 'invalid-email')
                    ->type('password', 'password123')
                    ->type('password_confirmation', 'password123')
                    ->press('Register')
                    ->pause(1000)
                    ->assertPathIs('/register')
                    ->assertSee('Please enter a valid email address');
        });
    }

    /**
     * PBI 1 – TC_PBI01_NEG_003: registration with password too short
     */
    public function test_registration_fails_for_weak_password()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/register')
                    ->type('name', 'Test')
                    ->type('email', 'weak@password.com')
                    ->type('password', 'short')
                    ->type('password_confirmation', 'short')
                    ->press('Register')
                    ->pause(1000)
                    ->assertPathIs('/register')
                    ->assertSee('Password must be at least 8 characters');
        });
    }

    /**
     * PBI 2 – TC_PBI02_POS_001: successful instructor registration
     */
    public function test_instructor_can_register_with_valid_credentials()
    {
        $email = 'dusk.instructor+' . time() . '@example.com';
        User::where('email', $email)->delete();

        $this->browse(function (Browser $browser) use ($email) {
            $browser->visit('/register')
                    ->type('name', 'Dusk Instructor')
                    ->type('email', $email)
                    // toggle the Radix switch by clicking its label
                    ->click('label[for=is_instructor]')
                    ->type('password', 'password123')
                    ->type('password_confirmation', 'password123')
                    ->press('Register')
                    ->pause(2000)
                    ->assertPathIs('/instructor/dashboard')
                    ->assertSee('Courses');
        });

        User::where('email', $email)->delete();
    }

    /**
     * PBI 2 – TC_PBI02_NEG_001: registration fails for existing email (instructor)
     */
    public function test_instructor_registration_fails_for_existing_email()
    {
        $existing = User::factory()->create([
            'email' => 'existing@instructor.com',
            'role'  => 'instructor',
        ]);

        $this->browse(function (Browser $browser) {
            $browser->visit('/register')
                    ->type('name', 'Any Instructor')
                    ->click('label[for=is_instructor]')
                    ->type('email', 'existing@instructor.com')
                    ->type('password', 'password123')
                    ->type('password_confirmation', 'password123')
                    ->press('Register')
                    ->pause(1000)
                    ->assertPathIs('/register')
                    ->assertSee('The email has already been taken');
        });

        $existing->delete();
    }
}