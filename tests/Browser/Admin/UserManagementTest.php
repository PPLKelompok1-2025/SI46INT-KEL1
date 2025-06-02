<?php

namespace Tests\Browser\Admin;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use App\Models\User;

class UserManagementTest extends DuskTestCase
{
    /**
     * TC_PBI45_POS_001: Admin Views List of Registered Users (Positive)
     */
    public function test_admin_views_user_list()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);

        $this->browse(function (Browser $browser) use ($admin, $student, $instructor) {
            $browser->loginAs($admin)
                    ->visit('/admin/users')
                    ->assertSee('User Management')
                    ->assertSee($student->name)
                    ->assertSee($instructor->name);
        });
    }

    /**
     * TC_PBI45_NEG_001: Admin Views List when only admin exists (Negative)
     */
    public function test_admin_views_only_self_in_user_list()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/admin/users')
                    ->assertSee('Total Users')
                    ->assertSee((string) User::count())
                    ->assertSee($admin->name)
                    ->assertDontSee('student')
                    ->assertDontSee('instructor');
        });
    }

    /**
     * TC_PBI46_POS_001: Admin Edits User Information (Positive)
     */
    public function test_admin_edits_user_information_success()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'student']);

        $newName = 'Updated Name';

        $this->browse(function (Browser $browser) use ($admin, $user, $newName) {
            $browser->loginAs($admin)
                    ->visit("/admin/users/{$user->id}/edit")
                    ->type('name', $newName)
                    ->select('role', 'instructor')
                    ->press('Update User')
                    ->pause(500)
                    ->visit('/admin/users')
                    ->assertSee($newName);
        });
    }

    /**
     * TC_PBI46_NEG_001: Admin Edits User Information with invalid data (Negative)
     */
    public function test_admin_edits_user_information_validation_failure()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'student']);

        $this->browse(function (Browser $browser) use ($admin, $user) {
            $browser->loginAs($admin)
                    ->visit("/admin/users/{$user->id}/edit")
                    ->clear('name')
                    ->press('Update User')
                    ->pause(500)
                    ->assertSee('The name field is required.');
        });
    }

    /**
     * TC_PBI47_POS_001: Admin Deletes a User Account (Positive)
     */
    public function test_admin_deletes_user_account_success()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'student']);

        $this->browse(function (Browser $browser) use ($admin, $user) {
            $browser->loginAs($admin)
                    ->delete("/admin/users/{$user->id}")
                    ->pause(500)
                    ->visit('/admin/users')
                    ->assertSee('User deleted successfully.')
                    ->assertDontSee($user->name);
        });
    }

    /**
     * TC_PBI47_NEG_001: Admin Attempts to Delete Own Account (Negative)
     */
    public function test_admin_cannot_delete_own_account()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->delete("/admin/users/{$admin->id}")
                    ->pause(500)
                    ->visit('/admin/users')
                    ->assertSee('You cannot delete your own account.');
        });
    }
}
