import CertificateCard from '@/Components/Student/CertificateCard';
import EmptyState from '@/Components/Student/EmptyState';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, certificates }) {
    return (
        <StudentLayout auth={auth}>
            <Head title="My Certificates" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Certificates</h1>
                </div>

                {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {certificates.map((certificate) => (
                            <CertificateCard
                                key={certificate.id}
                                certificate={certificate}
                                userName={auth.user.name}
                            />
                        ))}
                    </div>
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
        </StudentLayout>
    );
}
