<?php

namespace App\Console\Commands;

use App\Jobs\GenerateCertificatePdf;
use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GeneratePendingCertificates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'certificates:generate-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate certificates for completed enrollments that do not have certificates yet';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking for completed enrollments without certificates...');

        // Get all completed enrollments
        $completedEnrollments = Enrollment::whereNotNull('completed_at')
            ->with(['user', 'course'])
            ->get();

        $count = 0;

        foreach ($completedEnrollments as $enrollment) {
            // Check if certificate already exists
            $existingCertificate = Certificate::where('user_id', $enrollment->user_id)
                ->where('course_id', $enrollment->course_id)
                ->first();

            if (!$existingCertificate) {
                $this->info("Generating certificate for user {$enrollment->user->name} on course {$enrollment->course->title}");

                try {
                    // Create a new certificate
                    $certificate = Certificate::create([
                        'user_id' => $enrollment->user_id,
                        'course_id' => $enrollment->course_id,
                        'certificate_number' => 'CERT-' . strtoupper(substr(md5(uniqid()), 0, 8)) . '-' . $enrollment->user_id . '-' . $enrollment->course_id,
                        'issued_at' => now(),
                    ]);

                    // Dispatch job to generate PDF
                    GenerateCertificatePdf::dispatch($certificate);

                    $count++;
                } catch (\Exception $e) {
                    $this->error("Error generating certificate: {$e->getMessage()}");
                    Log::error("Error generating certificate: {$e->getMessage()}");
                }
            }
        }

        $this->info("Generated {$count} new certificates.");

        return Command::SUCCESS;
    }
}