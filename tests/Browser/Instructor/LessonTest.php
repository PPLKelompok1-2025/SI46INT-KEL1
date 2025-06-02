<?php

namespace Tests\Browser\Instructor;

use Laravel\Dusk\Browser;
use App\Models\Course;
use App\Models\User;
use App\Models\Lesson;
use Tests\DuskTestCase;

class LessonTest extends DuskTestCase
{
    /**
     * PBI 16 – TC_PBI16_POS_001: Instructor adds a lesson to a course (positive)
     */
    public function test_instructor_adds_lesson_to_course()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create([
            'user_id' => $instructor->id,
            'is_published' => true,
            'is_approved' => true,
        ]);

        $this->browse(function (Browser $browser) use ($instructor, $course) {
            $browser->loginAs($instructor)
                    ->visit("/instructor/courses/{$course->id}/lessons/create")
                    ->type('title', 'Test Lesson Title')
                    ->press('Next: Lesson Content')
                    ->press('Next: Settings')
                    ->press('Create Lesson')
                    ->pause(1000)
                    ->assertPathIs('/instructor/courses/' . $course->id . '/lessons')
                    ->assertSee('Test Lesson Title');
        });

        // Clean up
        Lesson::where('course_id', $course->id)->delete();
        $course->delete();
        $instructor->delete();
    }

    /**
     * PBI 16 – TC_PBI16_NEG_001: Instructor fails to add lesson with missing required fields (negative)
     */
    public function test_instructor_cannot_add_lesson_with_missing_title()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['user_id' => $instructor->id]);

        $this->browse(function (Browser $browser) use ($instructor, $course) {
            $browser->loginAs($instructor)
                    ->visit("/instructor/courses/{$course->id}/lessons/create")
                    ->press('Next: Lesson Content')
                    ->press('Next: Settings')
                    ->press('Create Lesson')
                    ->pause(1000)
                    ->assertSee('The title field is required.');
        });

        $course->delete();
        $instructor->delete();
    }

    /**
     * PBI 17 – TC_PBI17_POS_001: Instructor edits an existing lesson (positive)
     */
    public function test_instructor_edits_a_lesson()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['user_id' => $instructor->id]);
        $lesson = Lesson::factory()->create([
            'course_id' => $course->id,
            'title' => 'Original Title',
            'order' => 1,
        ]);

        $this->browse(function (Browser $browser) use ($instructor, $course, $lesson) {
            $browser->loginAs($instructor)
                    ->visit("/instructor/courses/{$course->id}/lessons/{$lesson->id}/edit")
                    ->type('title', 'Updated Lesson Title')
                    ->press('Save Changes')
                    ->pause(1000)
                    ->assertSee('Updated Lesson Title');
        });

        // Clean up
        $lesson->delete();
        $course->delete();
        $instructor->delete();
    }

    /**
     * PBI 17 – TC_PBI17_NEG_001: Instructor fails to save edits with invalid data (negative)
     */
    public function test_instructor_cannot_edit_lesson_with_empty_title()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['user_id' => $instructor->id]);
        $lesson = Lesson::factory()->create([
            'course_id' => $course->id,
            'title' => 'Some Title',
            'order' => 1,
        ]);

        $this->browse(function (Browser $browser) use ($instructor, $course, $lesson) {
            $browser->loginAs($instructor)
                    ->visit("/instructor/courses/{$course->id}/lessons/{$lesson->id}/edit")
                    ->type('title', '')
                    ->press('Save Changes')
                    ->pause(1000)
                    ->assertSee('The title field is required.');
        });

        $lesson->delete();
        $course->delete();
        $instructor->delete();
    }

    /**
     * PBI 18 – TC_PBI18_POS_001: Instructor deletes a lesson (positive)
     */
    public function test_instructor_deletes_a_lesson()
    {
        $instructor = User::factory()->create(['role' => 'instructor']);
        $course = Course::factory()->create(['user_id' => $instructor->id]);
        $lesson = Lesson::factory()->create(['course_id' => $course->id]);

        $this->browse(function (Browser $browser) use ($instructor, $course, $lesson) {
            $browser->loginAs($instructor)
                    ->visit("/instructor/courses/{$course->id}/lessons")
                    ->press('Delete')
                    ->acceptDialog()
                    ->pause(1000)
                    ->assertDontSee($lesson->title);
        });

        $course->delete();
        $instructor->delete();
    }

    /**
     * PBI 18 – TC_PBI18_NEG_001: Instructor cannot delete prerequisite lesson (negative)
     */
    public function test_instructor_cannot_delete_prerequisite_lesson()
    {
        // This feature is not currently enforced by the system.
        $this->markTestIncomplete('Prerequisite deletion validation not implemented.');
    }
}
