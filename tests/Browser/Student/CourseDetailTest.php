<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use App\Models\Course;
use Tests\DuskTestCase;

class CourseDetailTest extends DuskTestCase
{
    /**
     * PBI 15 – TC_PBI15_POS_001: View course detail page (positive)
     */
    public function test_view_course_detail_page()
    {
        // Create an approved course with a category and instructor
        $course = Course::factory()->create([
            'is_published' => true,
            'is_approved' => true,
        ]);

        $this->browse(function (Browser $browser) use ($course) {
            $browser->visit('/courses')
                    ->clickLink('View Course')
                    ->pause(1000)
                    ->assertPathIs('/courses/' . $course->slug)
                    ->assertSee($course->title)
                    ->assertSee($course->short_description);
        });

        $course->delete();
    }

    /**
     * PBI 15 – TC_PBI15_NEG_001: View non-existent or inaccessible course (negative)
     */
    public function test_view_nonexistent_course_returns_404()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/courses/non-existent-slug')
                    ->pause(500)
                    ->assertSee('404');
        });
    }
}
