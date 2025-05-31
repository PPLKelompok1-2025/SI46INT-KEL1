<?php

namespace App\Jobs;

use App\Models\Certificate;
use App\Services\CertificateService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateCertificatePdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The certificate instance.
     *
     * @var \App\Models\Certificate
     */
    protected $certificate;

    /**
     * Create a new job instance.
     *
     * @param  \App\Models\Certificate  $certificate
     * @return void
     */
    public function __construct(Certificate $certificate)
    {
        $this->certificate = $certificate;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(CertificateService $certificateService)
    {
        // Make sure we're working with a fresh instance from the database
        $certificate = Certificate::findOrFail($this->certificate->id);

        // Generate the certificate PDF
        $certificateService->generatePdf($certificate);
    }
}
