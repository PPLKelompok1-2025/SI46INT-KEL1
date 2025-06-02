<?php

namespace Tests\Browser\Instructor;

use Laravel\Dusk\Browser;
use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use Tests\DuskTestCase;

class CourseManagementTest extends DuskTestCase
{
    /**
     * TC_PBI31_POS_001: Instructor Creates a New Course (Positive)
     */
    public function test_instructor_creates_a_new_course()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();

        $this->browse(function (Browser $browser) use ($instructor, $category) {
            $browser->loginAs($instructor)
                    ->visit('/instructor/courses/create')
                    ->assertSee('Create New Course')
                    ->type('#title', 'New Course Title')
                    ->type('#description', 'This is a test course description')
                    ->select('category_id', $category->id)
                    ->type('#price', '99.99')
                    ->press('Create Course')
                    ->pause(1000)
                    ->assertSee('New Course Title');
        });
    }

    /**
     * TC_PBI31_NEG_001: Instructor Creates a New Course with Missing Mandatory Fields (Negative)
     */
    public function test_instructor_cannot_create_course_with_missing_fields()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);

        $this->browse(function (Browser $browser) use ($instructor) {
            $browser->loginAs($instructor)
                    ->visit('/instructor/courses/create')
                    ->assertSee('Create New Course')
                    ->press('Create Course')
                    ->pause(500)
                    ->assertSee('The title field is required.');
        });
    }

    /**
     * TC_PBI32_POS_001: Instructor Edits an Owned Course (Positive)
     */
    public function test_instructor_edits_owned_course()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => Category::factory()->create()->id,
            'title' => 'Original Title',
        ]);

        $this->browse(function (Browser $browser) use ($instructor, $course) {
            $browser->loginAs($instructor)
                    ->visit("/instructor/courses/{$course->id}/edit")
                    ->assertSee('Edit Course: Original Title')
                    ->type('#title', 'Updated Title')
                    ->press('Edit Course')
                    ->pause(1000)
                    ->assertSee('Updated Title');
        });
    }

    /**
     * TC_PBI32_NEG_001: Instructor Edits a Course Not Owned (Negative)
     */
    public function test_instructor_cannot_edit_course_not_owned()
    {
        $owner = User::factory()->create(['role' => 'instructor']);
        $other = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['user_id' => $owner->id]);

        $this->browse(function (Browser $browser) use ($other, $course) {
            $browser->loginAs($other)
                    ->visit("/instructor/courses/{$course->id}/edit")
                    ->pause(500)
                    ->assertPathIs('/instructor/courses')
                    ->assertSee('My Courses');
        });
    }

    /**
     * TC_PBI33_POS_001: Instructor Deletes an Owned Course (Positive)
     */
    public function test_instructor_deletes_owned_course()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['user_id' => $instructor->id]);

        $this->browse(function (Browser $browser) use ($instructor, $course) {
            $browser->loginAs($instructor)
                    ->visit('/instructor/courses')
                    ->assertSee($course->title);
            $browser->script('fetch("/instructor/courses/' . $course->id . '", { method: "DELETE", headers: { "X-CSRF-TOKEN": document.querySelector("meta[name=\'csrf-token\']").getAttribute("content"), "Accept": "application/json" }, credentials: "same-origin" }).then(() => location.reload());');
            $browser->pause(1000)
                    ->assertDontSee($course->title);
        });
    }

    /**
     * TC_PBI33_NEG_001: Instructor Deletes a Course with Active Enrollments (Negative)
     */
    public function test_instructor_cannot_delete_course_with_enrollments()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['user_id' => $instructor->id]);
        Enrollment::factory()->create([
            'user_id' => User::factory()->create()->id,
            'course_id' => $course->id,
        ]);

        $this->browse(function (Browser $browser) use ($instructor, $course) {
            $browser->loginAs($instructor)
                    ->visit('/instructor/courses')
                    ->assertSee($course->title);
            $browser->script('fetch("/instructor/courses/' . $course->id . '", { method: "DELETE", headers: { "X-CSRF-TOKEN": document.querySelector("meta[name=\'csrf-token\']").getAttribute("content"), "Accept": "application/json" }, credentials: "same-origin" }).then(() => location.reload());');
            $browser->pause(1000)
                    ->assertSee('Cannot delete course with active enrollments');
        });
    }

    /**
     * TC_PBI34_POS_001: Instructor Views Own Course Detail (Positive)
     */
    public function test_instructor_views_own_course_detail()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'title' => 'Detail Course',
            'category_id' => Category::factory()->create()->id,
        ]);

        $this->browse(function (Browser $browser) use ($instructor, $course) {
            $browser->loginAs($instructor)
                    ->visit("/instructor/courses/{$course->id}")
                    ->assertSee('Detail Course')
                    ->assertSee('Back to Courses');
        });
    }

    /**
     * TC_PBI34_NEG_001: Instructor Views Course Detail Not Owned (Negative)
     */
    public function test_instructor_cannot_view_course_detail_not_owned()
    {
        $owner = User::factory()->create(['role' => 'instructor']);
        $other = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['user_id' => $owner->id]);

        $this->browse(function (Browser $browser) use ($other, $course) {
            $browser->loginAs($other)
                    ->visit("/instructor/courses/{$course->id}")
                    ->pause(500)
                    ->assertPathIs('/instructor/courses')
                    ->assertSee('My Courses');
        });
    }
}
