<?php

namespace Tests\Browser\Admin;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use App\Models\Course;
use App\Models\User;
use App\Models\Category;

class CourseApprovalTest extends DuskTestCase
{
    /**
     * TC_PBI35_POS_001: Admin Views List of Pending Courses (Positive)
     */
    public function test_admin_views_pending_courses_list()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();
        // create pending course
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => $category->id,
            'is_approved' => false,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $course) {
            $browser->loginAs($admin)
                    ->visit('/admin/courses?status=unapproved')
                    ->assertSee('Manage Courses')
                    ->assertSee($course->title);
        });
    }

    /**
     * TC_PBI35_NEG_001: Admin Views List of Pending Courses (Negative)
     */
    public function test_admin_views_no_pending_courses_message()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                    ->visit('/admin/courses?status=unapproved')
                    ->assertSee('No courses found');
        });
    }

    /**
     * TC_PBI36_POS_001: Admin Reviews Details of a Pending Course (Positive)
     */
    public function test_admin_views_pending_course_details()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => $category->id,
            'is_approved' => false,
            'title' => 'Pending Course',
        ]);

        $this->browse(function (Browser $browser) use ($admin, $course) {
            $browser->loginAs($admin)
                    ->visit("/admin/courses/{$course->id}")
                    ->assertSee('Pending Course')
                    ->assertSee('Back to Courses');
        });
    }

    /**
     * TC_PBI37_POS_001: Admin Approves a Pending Course (Positive)
     */
    public function test_admin_approves_a_pending_course()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => $category->id,
            'is_approved' => false,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $course) {
            $browser->loginAs($admin)
                    ->visit("/admin/courses/{$course->id}")
                    ->press('Approve')
                    ->pause(500)
                    ->assertSee('Course approved successfully.');
        });
    }

    /**
     * TC_PBI37_NEG_001: Admin Approves a Course Already Approved (Negative)
     */
    public function test_admin_cannot_approve_already_approved_course()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => $category->id,
            'is_approved' => true,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $course) {
            $browser->loginAs($admin)
                    ->visit("/admin/courses/{$course->id}")
                    ->assertSee('Unapprove')
                    ->assertDisabled('Approve');
        });
    }

    /**
     * TC_PBI38_POS_001: Admin Rejects a Pending Course with Reason (Positive)
     */
    public function test_admin_rejects_course_with_reason()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => $category->id,
            'is_approved' => false,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $course) {
            $browser->loginAs($admin)
                    ->visit("/admin/courses/{$course->id}")
                    ->press('Reject')
                    ->type('rejection_reason', 'Not suitable content')
                    ->press('Submit Reason')
                    ->pause(500)
                    ->assertSee('Course unapproved successfully.');
        });
    }

    /**
     * TC_PBI38_NEG_001: Admin Rejects a Pending Course Without Reason (Negative)
     */
    public function test_admin_cannot_reject_course_without_reason()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $category = Category::factory()->create();
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'category_id' => $category->id,
            'is_approved' => false,
        ]);

        $this->browse(function (Browser $browser) use ($admin, $course) {
            $browser->loginAs($admin)
                    ->visit("/admin/courses/{$course->id}")
                    ->press('Reject')
                    ->press('Submit Reason')
                    ->pause(500)
                    ->assertSee('rejection_reason is required');
        });
    }
}
