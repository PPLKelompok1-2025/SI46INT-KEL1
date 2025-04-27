<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
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
            'certificates' => Inertia::merge($paginatedCertificates->items()),
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
        if (!$certificate->pdf_path || !Storage::exists($certificate->pdf_path)) {
            return redirect()->route('student.certificates.show', $certificate->id)
                ->with('error', 'Certificate PDF not found.');
        }

        return Storage::download($certificate->pdf_path, 'Certificate-' . $certificate->certificate_number . '.pdf');
    }
}
