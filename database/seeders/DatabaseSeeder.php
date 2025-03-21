<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Category;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Note;
use App\Models\PromoCodes;
use App\Models\Review;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);

        // Create instructors
        $instructors = User::factory()->instructor()->count(5)->create();

        // Create one specific instructor for testing
        $mainInstructor = User::factory()->instructor()->create([
            'name' => 'John Instructor',
            'email' => 'instructor@example.com',
        ]);

        $instructors->push($mainInstructor);

        // Create students
        $students = User::factory()->count(20)->create();

        // Create one specific student for testing
        $mainStudent = User::factory()->create([
            'name' => 'Jane Student',
            'email' => 'student@example.com',
        ]);

        $students->push($mainStudent);

        // Create categories
        $categories = Category::factory()->count(8)->create();

        // Create subcategories
        foreach ($categories as $category) {
            if (fake()->boolean(30)) {
                Category::factory()->count(rand(1, 3))->create([
                    'parent_id' => $category->id,
                ]);
            }
        }

        // Create courses for each instructor
        $courses = collect();
        foreach ($instructors as $instructor) {
            $instructorCourses = Course::factory()
                ->count(rand(1, 5))
                ->create([
                    'user_id' => $instructor->id,
                    'category_id' => $categories->random()->id,
                ]);

            $courses = $courses->merge($instructorCourses);
        }

        // Create featured courses
        Course::factory()
            ->featured()
            ->count(5)
            ->create([
                'user_id' => $instructors->random()->id,
                'category_id' => $categories->random()->id,
            ]);

        // Create lessons for each course
        foreach ($courses as $course) {
            $lessonCount = rand(5, 15);

            // Ensure first lesson is free for preview
            Lesson::factory()->free()->create([
                'course_id' => $course->id,
                'order' => 1,
                'section' => 'Introduction',
            ]);

            // Create remaining lessons
            Lesson::factory()->count($lessonCount - 1)->create([
                'course_id' => $course->id,
            ]);
        }

        // Create promo codes
        $promoCodes = collect();

        // Create percentage discount codes
        $promoCodes = $promoCodes->merge(
            PromoCodes::factory()
                ->percentage()
                ->count(3)
                ->create([
                    'description' => 'Get 25% off on all courses',
                ])
        );

        // Create fixed amount discount codes
        $promoCodes = $promoCodes->merge(
            PromoCodes::factory()
                ->fixedAmount()
                ->count(3)
                ->create([
                    'description' => 'Get $10 off on your purchase',
                ])
        );

        // Create some expired promo codes
        PromoCodes::factory()
            ->expired()
            ->count(2)
            ->create([
                'description' => 'Limited time offer (expired)',
            ]);

        // Create special promo code for testing
        $promoCodes = $promoCodes->merge([
            PromoCodes::factory()->create([
                'code' => 'WELCOME50',
                'description' => 'Welcome discount - 50% off',
                'discount_type' => 'percentage',
                'discount_value' => 50,
                'max_uses' => 100,
            ])
        ]);

        // Create enrollments, reviews, notes, and certificates for students
        foreach ($students as $student) {
            // Enroll in some courses
            $enrolledCourses = $courses->random(rand(1, 5));

            foreach ($enrolledCourses as $course) {
                $enrollment = Enrollment::factory()->create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                ]);

                // Some completed courses get reviews and certificates
                if ($enrollment->completed_at) {
                    // Add review
                    Review::factory()->create([
                        'user_id' => $student->id,
                        'course_id' => $course->id,
                    ]);

                    // Add certificate
                    Certificate::factory()->create([
                        'user_id' => $student->id,
                        'course_id' => $course->id,
                    ]);
                }

                // Add notes for some courses
                if (fake()->boolean(70)) {
                    // Create only one note per user-course combination
                    Note::factory()->create([
                        'user_id' => $student->id,
                        'course_id' => $course->id,
                    ]);
                }

                // Create transaction for paid courses
                if ($course->price > 0) {
                    // Sometimes apply a promo code (30% chance)
                    $promoCode = null;
                    $discountAmount = 0;

                    if (fake()->boolean(30) && $promoCodes->count() > 0) {
                        $promoCode = $promoCodes->random();
                        $discountAmount = $promoCode->calculateDiscount($course->price);
                        $promoCode->incrementUsage();
                    }

                    Transaction::factory()->create([
                        'user_id' => $student->id,
                        'course_id' => $course->id,
                        'amount' => $course->price,
                        'promo_code_id' => $promoCode ? $promoCode->id : null,
                        'discount_amount' => $discountAmount,
                    ]);
                }
            }

            // Add some courses to wishlist
            $wishlistCourses = $courses->diff($enrolledCourses)->random(rand(0, 3));
            foreach ($wishlistCourses as $course) {
                Wishlist::factory()->create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                ]);
            }
        }

        // Create assignments and submissions
        foreach ($courses as $course) {
            if (fake()->boolean(60)) {
                // Get lessons for this course
                $lessons = Lesson::where('course_id', $course->id)->get();

                foreach ($lessons as $lesson) {
                    if (fake()->boolean(30)) {  // Only some lessons have assignments
                        $assignment = Assignment::factory()->create([
                            'lesson_id' => $lesson->id,
                        ]);

                        // Get enrollments for this course
                        $courseEnrollments = Enrollment::where('course_id', $course->id)->get();

                        // Some students submit assignments
                        foreach ($courseEnrollments as $enrollment) {
                            if (fake()->boolean(70)) {
                                AssignmentSubmission::factory()->create([
                                    'assignment_id' => $assignment->id,
                                    'user_id' => $enrollment->user_id,
                                ]);
                            }
                        }
                    }
                }
            }
        }
    }
}
