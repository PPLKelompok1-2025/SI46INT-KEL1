<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;

class EnrolledCoursesTest extends DuskTestCase
{
    /**
     * TC_PBI39_POS_001: Student Views Enrolled Courses List (Positive)
     */
    public function test_student_views_enrolled_courses_list()
    {
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['is_approved' => true, 'is_published' => true, 'user_id' => $instructor->id]);
        Enrollment::factory()->create(['user_id' => $student->id, 'course_id' => $course->id]);

        $this->browse(function (Browser $browser) use ($student, $course) {
            $browser->loginAs($student)
                    ->visit('/student/courses')
                    ->assertSee($course->title);
        });
    }

    /**
     * TC_PBI39_NEG_001: Student Views Enrolled Courses List (Negative)
     */
    public function test_student_views_empty_enrolled_courses_list()
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->browse(function (Browser $browser) use ($student) {
            $browser->loginAs($student)
                    ->visit('/student/courses')
                    ->assertSee("You haven't enrolled in any courses yet");
        });
    }

    /**
     * TC_PBI40_POS_001: Student Views Enrolled Course Detail (Positive)
     */
    public function test_student_views_enrolled_course_detail()
    {
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['is_approved' => true, 'is_published' => true, 'user_id' => $instructor->id, 'title' => 'Enrolled Course']);
        Enrollment::factory()->create(['user_id' => $student->id, 'course_id' => $course->id]);

        $this->browse(function (Browser $browser) use ($student, $course) {
            $browser->loginAs($student)
                    ->visit('/student/courses')
                    ->clickLink('View Course')
                    ->pause(500)
                    ->assertSee('Enrolled Course')
                    ->assertSee('Progress');
        });
    }

    /**
     * TC_PBI40_NEG_001: Student Accesses Course Detail Not Enrolled (Negative)
     */
    public function test_student_cannot_view_unenrolled_course_detail()
    {
        $student = User::factory()->create(['role' => 'student']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['is_approved' => true, 'is_published' => true, 'user_id' => $instructor->id]);

        $this->browse(function (Browser $browser) use ($student, $course) {
            $browser->loginAs($student)
                    ->visit("/student/courses/{$course->slug}/learn")
                    ->assertSee('You must be enrolled in this course to access the learning materials.');
        });
    }
}
