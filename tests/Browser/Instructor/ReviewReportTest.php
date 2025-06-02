<?php

namespace Tests\Browser\Instructor;

use Laravel\Dusk\Browser;
use App\Models\Review;
use App\Models\Course;
use App\Models\User;
use Tests\DuskTestCase;

class ReviewReportTest extends DuskTestCase
{
    /**
     * PBI 21 – TC_PBI21_POS_001: Instructor reports a review (positive)
     */
    public function test_instructor_reports_a_review()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $student = User::factory()->create(['role' => 'student']);
        $course = Course::factory()->create(['user_id' => $instructor->id]);
        $review = Review::factory()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
            'is_reported' => false,
        ]);

        $this->browse(function (Browser $browser) use ($instructor, $course, $review) {
            $browser->loginAs($instructor)
                    ->visit('/instructor/reviews/' . $review->id)
                    ->assertSee('Report Inappropriate Review')
                    ->press('Report Inappropriate Review')
                    ->pause(500)
                    ->press('Report Review')
                    ->pause(1000)
                    ->assertSee('Reported to Admins');
        });

        // Clean up
        $review->delete();
        $course->delete();
        $student->delete();
        $instructor->delete();
    }

    /**
     * PBI 21 – TC_PBI21_NEG_001: Instructor attempts to report without reason (negative)
     */
    public function test_instructor_cannot_report_without_confirmation()
    {
        // Reporting does not require a reason in current implementation
        $this->markTestIncomplete('No mandatory reason field; test not applicable.');
    }
}
