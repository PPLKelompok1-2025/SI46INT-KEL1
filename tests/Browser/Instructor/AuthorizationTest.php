<?php

namespace Tests\Browser\Instructor;

use Laravel\Dusk\Browser;
use App\Models\User;
use Tests\DuskTestCase;

class AuthorizationTest extends DuskTestCase
{
    /**
     * TC_PBI29_POS_001: Instructor can access instructor dashboard and course creation
     */
    public function test_instructor_accesses_instructor_pages()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);

        $this->browse(function (Browser $browser) use ($instructor) {
            $browser->loginAs($instructor)
                    ->visit('/instructor/dashboard')
                    ->assertSee('Dashboard')
                    ->visit('/instructor/courses/create')
                    ->assertSee('Create New Course');
        });
    }

    /**
     * TC_PBI29_NEG_001: Instructor is denied access to admin pages
     */
    public function test_instructor_denied_access_to_admin_pages()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);

        $this->browse(function (Browser $browser) use ($instructor) {
            $browser->loginAs($instructor)
                    ->visit('/admin/users')
                    ->assertSee('403');
        });
    }
}
