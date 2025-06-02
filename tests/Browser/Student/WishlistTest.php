<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use App\Models\User;
use App\Models\Course;
use App\Models\Category;
use App\Models\Wishlist;

class WishlistTest extends DuskTestCase
{
    /**
     * TC_PBI41_POS_001: Student Adds Course to Wishlist (Positive)
     */
    public function test_student_adds_course_to_wishlist()
    {
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => $category->id,
            'is_approved' => true,
            'is_published' => true,
        ]);

        $this->browse(function (Browser $browser) use ($student, $course) {
            $browser->loginAs($student)
                    ->visit("/student/courses/{$course->slug}");
            $browser->script([
                'fetch("/student/courses/' . $course->id . '/wishlist", { method: "POST", headers: { "X-CSRF-TOKEN": document.querySelector(\'meta[name="csrf-token"]\').getAttribute("content") }, credentials: "same-origin" }).then(() => location.reload());'
            ]);
            $browser->pause(500)
                    ->visit('/student/wishlist')
                    ->assertSee($course->title);
        });
    }

    /**
     * TC_PBI41_POS_002: Student Removes Course from Wishlist (Positive)
     */
    public function test_student_removes_course_from_wishlist()
    {
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => $category->id,
            'is_approved' => true,
            'is_published' => true,
        ]);
        Wishlist::create(['user_id' => $student->id, 'course_id' => $course->id]);

        $this->browse(function (Browser $browser) use ($student, $course) {
            $browser->loginAs($student)
                    ->visit('/student/wishlist')
                    ->assertSee($course->title);
            $browser->script([
                'fetch("/student/courses/' . $course->id . '/wishlist", { method: "POST", headers: { "X-CSRF-TOKEN": document.querySelector(\'meta[name="csrf-token"]\').getAttribute("content") }, credentials: "same-origin" }).then(() => location.reload());'
            ]);
            $browser->pause(500)
                    ->assertSee('Your wishlist is empty');
        });
    }

    /**
     * TC_PBI41_NEG_001: Non-logged-in user is redirected when accessing wishlist page (Negative)
     */
    public function test_guest_cannot_access_wishlist_page()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/student/wishlist')
                    ->assertPathIs('/login');
        });
    }
}
