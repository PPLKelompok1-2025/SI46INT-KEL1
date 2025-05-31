<?php

namespace App\Services;

use App\Models\Certificate;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class CertificateService
{
    /**
     * Generate a PDF certificate.
     *
     * @param  \App\Models\Certificate  $certificate
     * @return bool
     */
    public function generatePdf(Certificate $certificate)
    {
        try {
            // Load the certificate with related data
            $certificate->load(['user', 'course', 'course.user']);

            // Generate the PDF
            $pdf = PDF::loadView('certificates.template', [
                'certificate' => $certificate,
                'user' => $certificate->user,
                'course' => $certificate->course,
                'instructor' => $certificate->course->user,
                'issueDate' => $certificate->issued_at->format('F d, Y'),
            ])
            // Set paper to A4 landscape for horizontal orientation
            ->setPaper('a4', 'landscape');

            // Save the PDF to storage
            $filename = 'certificates/' . $certificate->certificate_number . '.pdf';
            Storage::put('public/' . $filename, $pdf->output());

            // Update the certificate with the PDF path
            $certificate->update([
                'pdf_path' => $filename
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to generate certificate PDF: ' . $e->getMessage());
            return false;
        }
    }
}
