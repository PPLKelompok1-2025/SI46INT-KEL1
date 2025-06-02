<?php

namespace Tests\Browser\Admin;

use Laravel\Dusk\Browser;
use App\Models\Review;
use App\Models\User;
use App\Models\Course;
use Tests\DuskTestCase;

class ReviewApprovalTest extends DuskTestCase
{
    /**
     * PBI 19 – TC_PBI19_POS_001: Admin approves a pending review (positive)
     */
    public function test_admin_approves_pending_review()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);
        $course = Course::factory()->create();
        $review = Review::factory()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
            'is_reported' => true,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $review) {
            $browser->loginAs($admin)
                    ->visit('/admin/reviews/' . $review->id)
                    ->assertSee('Reported')
                    ->press('Approve Review')
                    ->pause(1000)
                    ->assertDontSee('Reported');
        });

        // Clean up
        $review->delete();
        $course->delete();
        $student->delete();
        $admin->delete();
    }

    /**
     * PBI 19 – TC_PBI19_NEG_001: Admin attempts to approve an already approved review (negative)
     */
    public function test_admin_cannot_approve_already_approved_review()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);
        $course = Course::factory()->create();
        $review = Review::factory()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
            'is_reported' => false,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $review) {
            $browser->loginAs($admin)
                    ->visit('/admin/reviews/' . $review->id)
                    ->assertDontSee('Approve Review');
        });

        $review->delete();
        $course->delete();
        $student->delete();
        $admin->delete();
    }

    /**
     * PBI 20 – TC_PBI20_POS_001: Admin rejects a pending review (positive)
     */
    public function test_admin_rejects_pending_review()
    {
        // Rejection feature not implemented; use delete as proxy
        $this->markTestIncomplete('Review reject functionality is not implemented; consider using delete.');
    }

    /**
     * PBI 20 – TC_PBI20_NEG_001: Admin attempts to reject without reason (negative)
     */
    public function test_admin_cannot_reject_without_reason()
    {
        $this->markTestIncomplete('Review reject validation is not implemented.');
    }
}
