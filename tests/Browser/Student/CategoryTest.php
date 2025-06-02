<?php

namespace Tests\Browser\Student;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class CategoryTest extends DuskTestCase
{
    /**
     * PBI 10 – TC_PBI10_POS_001: browse categories when available
     */
    public function test_browse_categories_displays_list()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/categories')
                    ->assertSee('Browse Categories')
                    ->assertSee('Parent Categories');
        });
    }

    /**
     * PBI 10 – TC_PBI10_NEG_001: empty categories
     */
    public function test_no_categories_shows_empty_message()
    {
        // Clear categories table for test
        \App\Models\Category::truncate();

        $this->browse(function (Browser $browser) {
            $browser->visit('/categories')
                    ->assertSee('No categories found');
        });

        // Optionally re-seed categories
        \App\Models\Category::factory()->count(3)->create();
    }

    /**
     * PBI 11 – TC_PBI11_POS_001: filter and sort categories
     */
    public function test_filter_and_sort_categories()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/categories')
                    ->type('search', 'SomeCategory')
                    ->pause(800)
                    ->assertQueryHas('search', 'SomeCategory')
                    ->select('sort', 'name_desc')
                    ->pause(1000)
                    ->assertQueryHas('sort', 'name_desc');
        });
    }

    /**
     * PBI 11 – TC_PBI11_NEG_001: filter yields no results
     */
    public function test_filter_yields_no_categories()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/categories')
                    ->type('search', '****notfound****')
                    ->pause(800)
                    ->assertSee('No categories found');
        });
    }

    /**
     * PBI 12 – TC_PBI12_POS_001: view courses by category
     */
    public function test_view_courses_by_category()
    {
        $category = \App\Models\Category::factory()->create();
        $course   = \App\Models\Course::factory()->create([
            'category_id'  => $category->id,
            'is_published' => true,
            'is_approved'  => true,
        ]);

        $this->browse(function (Browser $browser) use ($category) {
            $browser->visit("/categories/{$category->slug}")
                    ->assertSee("Courses in {$category->name}")
                    ->assertSee($course->title);
        });
    }

    /**
     * PBI 12 – TC_PBI12_NEG_001: category with no courses
     */
    public function test_category_with_no_courses_shows_message()
    {
        $category = \App\Models\Category::factory()->create();
        \App\Models\Course::where('category_id', $category->id)->delete();

        $this->browse(function (Browser $browser) use ($category) {
            $browser->visit("/categories/{$category->slug}")
                    ->assertSee('No courses found');
        });
    }
}