import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Award, Download } from 'lucide-react';

export default function Show({ auth, certificate }) {
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString();

    return (
        <StudentLayout auth={auth}>
            <Head title="Certificate" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('student.certificates.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Certificates
                        </Link>
                    </Button>

                    <Button size="sm" asChild>
                        <Link
                            href={route(
                                'student.certificates.download',
                                certificate.id,
                            )}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Certificate
                        </Link>
                    </Button>
                </div>

                <Card className="mx-auto max-w-3xl overflow-hidden">
                    <CardContent className="p-0">
                        {certificate.pdf_path ? (
                            <div className="aspect-[1.4/1] w-full">
                                <iframe
                                    src={`/storage/${certificate.pdf_path.replace('public/', '')}`}
                                    className="h-full w-full"
                                    title="Certificate Preview"
                                />
                            </div>
                        ) : (
                            <div className="flex aspect-[1.4/1] w-full flex-col items-center justify-center space-y-4 bg-muted/30 p-8 text-center">
                                <Award className="h-16 w-16 text-primary" />
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold">
                                        Certificate of Completion
                                    </h2>
                                    <p className="text-lg">
                                        This certifies that
                                    </p>
                                    <p className="text-xl font-semibold">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-lg">
                                        has successfully completed the course
                                    </p>
                                    <p className="text-xl font-semibold">
                                        {certificate.course.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Certificate #
                                        {certificate.certificate_number} •
                                        Issued on {issuedDate}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="mx-auto max-w-3xl space-y-4">
                    <div className="rounded-lg border p-4">
                        <h3 className="mb-2 font-semibold">
                            Certificate Details
                        </h3>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Certificate Number
                                </p>
                                <p>{certificate.certificate_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Issue Date
                                </p>
                                <p>{issuedDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Course
                                </p>
                                <p>{certificate.course.title}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Recipient
                                </p>
                                <p>{auth.user.name}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button asChild>
                            <Link
                                href={route(
                                    'student.courses.show',
                                    certificate.course.slug,
                                )}
                            >
                                View Course Details
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
