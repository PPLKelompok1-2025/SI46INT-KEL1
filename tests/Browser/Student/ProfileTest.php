<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use App\Models\User;
use Tests\DuskTestCase;

class ProfileTest extends DuskTestCase
{
    /**
     * PBI22 – TC_PBI22_POS_001: User edits profile information (positive)
     */
    public function test_user_edits_profile_information()
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/profile')
                    ->assertSee('Profile Information')
                    ->type('name', 'Updated Name')
                    ->press('Save')
                    ->pause(500)
                    ->assertSee('Saved.');
        });
    }

    /**
     * PBI23 – TC_PBI23_POS_001: User changes profile picture (positive)
     */
    public function test_user_changes_profile_picture()
    {
        $user = User::factory()->create();

        $this->browse(function (Browser $browser) use ($user) {
            $browser->loginAs($user)
                    ->visit('/profile')
                    ->assertSee('Profile Photo')
                    ->attach('photo', __DIR__.'/../fixtures/avatar.jpg')
                    ->press('Save')
                    ->pause(1000)
                    ->assertSee('Profile photo updated successfully');
        });
    }
}
