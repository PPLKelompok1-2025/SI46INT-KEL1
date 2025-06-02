<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use App\Models\Course;
use App\Models\User;
use Tests\DuskTestCase;

class BrowseCoursesTest extends DuskTestCase
{
    /**
     * PBI 13 – TC_PBI13_POS_001: Browse all available courses (positive)
     */
    public function test_browse_all_available_courses()
    {
        // Ensure at least one approved course exists
        $course = Course::factory()->create([
            'is_published' => true,
            'is_approved' => true,
        ]);

        $this->browse(function (Browser $browser) use ($course) {
            $browser->visit('/courses')
                    ->assertSee('Explore Courses')
                    ->assertSee($course->title);
        });

        // Clean up
        $course->delete();
    }

    /**
     * PBI 13 – TC_PBI13_NEG_001: Browse courses when none available (negative)
     */
    public function test_no_courses_shows_empty_message()
    {
        // Remove any courses
        Course::truncate();

        $this->browse(function (Browser $browser) {
            $browser->visit('/courses')
                    ->assertSee('No courses found');
        });
    }

    /**
     * PBI 14 – TC_PBI14_POS_001: Search course by name/instructor (positive)
     */
    public function test_search_course_by_name_or_instructor()
    {
        // Create a unique course title
        $course = Course::factory()->create([
            'title' => 'UniqueCourseXYZ',
            'is_published' => true,
            'is_approved' => true,
        ]);

        $this->browse(function (Browser $browser) use ($course) {
            $browser->visit('/courses')
                    ->type('search', 'UniqueCourseXYZ')
                    ->pause(800)
                    ->assertSee('UniqueCourseXYZ');
        });

        $course->delete();
    }

    /**
     * PBI 14 – TC_PBI14_NEG_001: Search with no matching courses (negative)
     */
    public function test_search_no_matching_courses_shows_empty_message()
    {
        // Ensure there is at least one course to load page
        $dummy = Course::factory()->create([
            'is_published' => true,
            'is_approved' => true,
        ]);

        $this->browse(function (Browser $browser) {
            $browser->visit('/courses')
                    ->type('search', 'NoSuchCourseExists')
                    ->pause(800)
                    ->assertSee('No courses found');
        });

        $dummy->delete();
    }
}