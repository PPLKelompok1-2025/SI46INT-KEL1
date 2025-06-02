<?php

namespace Tests\Browser\Admin;

use Laravel\Dusk\Browser;
use App\Models\User;
use Tests\DuskTestCase;

class AuthorizationTest extends DuskTestCase
{
    /**
     * TC_PBI30_POS_001: Admin can access admin dashboard and user management
     */
    public function test_admin_accesses_admin_pages()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/admin/dashboard')
                    ->assertSee('Dashboard')
                    ->visit('/admin/users')
                    ->assertSee('User Management');
        });
    }

    /**
     * TC_PBI30_NEG_001: Admin receives 404 for non-existent pages
     */
    public function test_admin_non_existent_page_returns_404()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/admin/non-existent')
                    ->assertSee('404');
        });
    }
}
