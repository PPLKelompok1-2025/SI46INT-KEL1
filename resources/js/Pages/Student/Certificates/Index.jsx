import CertificateCard from '@/Components/Student/CertificateCard';
import EmptyState from '@/Components/Student/EmptyState';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, WhenVisible } from '@inertiajs/react';

export default function Index({
    auth,
    certificates,
    page = 1,
    isNextPageExists = false,
}) {
    return (
        <AuthenticatedLayout>
            <Head title="My Certificates" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Certificates</h1>
                </div>

                {certificates.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {certificates.map((certificate) => (
                                <CertificateCard
                                    key={certificate.id}
                                    certificate={certificate}
                                    userName={auth.user.name}
                                />
                            ))}
                        </div>

                        {isNextPageExists && (
                            <div className="mt-8">
                                <WhenVisible
                                    always
                                    params={{
                                        data: {
                                            page: Number(page) + 1,
                                        },
                                        only: [
                                            'certificates',
                                            'page',
                                            'isNextPageExists',
                                        ],
                                        preserveState: true,
                                    }}
                                    fallback={
                                        <div className="flex justify-center">
                                            <p className="text-muted-foreground">
                                                You've reached the end.
                                            </p>
                                        </div>
                                    }
                                >
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    </div>
                                </WhenVisible>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon="Award"
                        title="No certificates yet"
                        description="Complete courses to earn certificates of completion."
                        buttonText="Browse Courses"
                        buttonLink="/courses"
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
