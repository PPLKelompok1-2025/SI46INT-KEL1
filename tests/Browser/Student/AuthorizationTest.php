<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use App\Models\User;
use Tests\DuskTestCase;

class AuthorizationTest extends DuskTestCase
{
    /**
     * TC_PBI28_POS_001: Student can access student dashboard and courses
     */
    public function test_student_accesses_student_pages()
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->browse(function (Browser $browser) use ($student) {
            $browser->loginAs($student)
                    ->visit('/student/dashboard')
                    ->assertSee('My Learning Dashboard')
                    ->visit('/student/courses')
                    ->assertPathIs('/student/courses');
        });
    }

    /**
     * TC_PBI28_NEG_001: Student is denied access to admin/instructor pages
     */
    public function test_student_denied_access_to_restricted_pages()
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->browse(function (Browser $browser) use ($student) {
            $browser->loginAs($student)
                    // admin panel
                    ->visit('/admin/dashboard')
                    ->assertSee('403')
                    // instructor course creation
                    ->visit('/instructor/courses/create')
                    ->assertSee('403');
        });
    }
}
