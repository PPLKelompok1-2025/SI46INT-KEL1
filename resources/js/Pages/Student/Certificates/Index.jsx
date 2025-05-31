import CertificateCard from '@/Components/Student/CertificateCard';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Award, ChevronDown } from 'lucide-react';

export default function Index({ certificates, page, isNextPageExists }) {
    const user = usePage().props.auth.user;

    const loadMoreCertificates = () => {
        router.visit(
            route('student.certificates.index', {
                page: parseInt(page) + 1,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                only: ['certificates', 'page', 'isNextPageExists'],
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Certificates" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">My Certificates</h1>
                    <p className="text-muted-foreground">
                        View and download your achievement certificates
                    </p>
                </div>

                {certificates.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {certificates.map((certificate) => (
                                <CertificateCard
                                    key={certificate.id}
                                    certificate={certificate}
                                    userName={user.name}
                                />
                            ))}
                        </div>

                        {isNextPageExists && (
                            <div className="flex justify-center pt-6">
                                <Button
                                    variant="outline"
                                    onClick={loadMoreCertificates}
                                >
                                    <ChevronDown className="mr-2 h-4 w-4" />
                                    Load More
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Award className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-medium">
                            No Certificates Yet
                        </h3>
                        <p className="mb-4 max-w-md text-sm text-muted-foreground">
                            Complete courses to earn certificates. They'll
                            appear here once you've finished all lessons in a
                            course.
                        </p>
                        <Button asChild>
                            <Link href={route('student.courses.index')}>
                                Browse Your Courses
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
