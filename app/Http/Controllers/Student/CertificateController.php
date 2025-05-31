<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Jobs\GenerateCertificatePdf;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Display a listing of the student's certificates.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $page = $request->input('page', 1);
        $perPage = 9;

        $query = Certificate::where('user_id', $user->id)
            ->with('course')
            ->orderBy('created_at', 'desc');

        $paginatedCertificates = $query->paginate($perPage);

        $pagination = $paginatedCertificates->toArray();
        $isNextPageExists = $pagination['current_page'] < $pagination['last_page'];

        return Inertia::render('Student/Certificates/Index', [
            'certificates' => $paginatedCertificates->items(),
            'page' => $page,
            'isNextPageExists' => $isNextPageExists
        ]);
    }

    /**
     * Display the specified certificate.
     *
     * @param  \App\Models\Certificate  $certificate
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(Certificate $certificate)
    {
        $user = Auth::user();

        // Check if certificate belongs to the authenticated user
        if ($certificate->user_id !== $user->id) {
            return redirect()->route('student.certificates.index')
                ->with('error', 'You do not have permission to view this certificate.');
        }

        // Load certificate with course relationship
        $certificate->load('course');

        // Check if PDF exists and generate if needed
        if (!$certificate->pdf_path) {
            GenerateCertificatePdf::dispatch($certificate);
        }

        return Inertia::render('Student/Certificates/Show', [
            'certificate' => $certificate
        ]);
    }

    /**
     * Download the certificate as PDF.
     *
     * @param  \App\Models\Certificate  $certificate
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\RedirectResponse
     */
    public function download(Certificate $certificate)
    {
        $user = Auth::user();

        // Check if certificate belongs to the authenticated user
        if ($certificate->user_id !== $user->id) {
            return redirect()->route('student.certificates.index')
                ->with('error', 'You do not have permission to download this certificate.');
        }

        // Check if PDF exists
        if (!$certificate->pdf_path || !Storage::disk('public')->exists($certificate->pdf_path)) {
            // If no PDF, try to generate it synchronously
            $certificateService = app(CertificateService::class);
            $success = $certificateService->generatePdf($certificate);

            if (!$success) {
                return redirect()->route('student.certificates.show', $certificate->id)
                    ->with('error', 'Certificate PDF could not be generated. Please try again later.');
            }

            // Refresh certificate from database
            $certificate->refresh();
        }

        return response()->download(storage_path('app/public/' . $certificate->pdf_path), 'Certificate-' . $certificate->certificate_number . '.pdf');
    }

    /**
     * Preview the certificate PDF inline.
     *
     * @param  \App\Models\Certificate  $certificate
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function preview(Certificate $certificate)
    {
        $user = Auth::user();

        // Ensure the certificate belongs to the authenticated user
        if ($certificate->user_id !== $user->id) {
            abort(403, 'You do not have permission to view this certificate.');
        }

        // Ensure PDF exists, generate if needed
        if (!$certificate->pdf_path || !Storage::disk('public')->exists($certificate->pdf_path)) {
            $certificateService = app(CertificateService::class);
            $success = $certificateService->generatePdf($certificate);

            if (!$success) {
                abort(404, 'Certificate PDF could not be generated.');
            }

            $certificate->refresh();
        }

        $path = storage_path('app/public/' . $certificate->pdf_path);

        // Return the PDF inline for embedding
        return response()->file($path);
    }
}
