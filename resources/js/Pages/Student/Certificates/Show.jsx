import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Award, Calendar, Download } from 'lucide-react';

export default function Show({ certificate }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Certificate - ${certificate.course.title}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={route('student.certificates.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Certificate of Completion
                    </h1>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Certificate Preview */}
                    <div className="md:col-span-2">
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                {certificate.pdf_path ? (
                                    <div className="aspect-[4/3] w-full bg-white">
                                        <iframe
                                            src={route(
                                                'student.certificates.preview',
                                                certificate.id,
                                            )}
                                            className="h-full w-full border-0"
                                            title="Certificate Preview"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-muted p-6 text-center">
                                        <Award className="mb-4 h-16 w-16 text-primary" />
                                        <h3 className="text-xl font-bold">
                                            Certificate is being generated
                                        </h3>
                                        <p className="mt-2 text-muted-foreground">
                                            Please check back in a few minutes.
                                            Your certificate is being prepared.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Certificate Details */}
                    <div>
                        <Card>
                            <CardContent className="space-y-4 p-6">
                                <div className="flex items-center justify-center">
                                    <div className="rounded-full bg-primary/10 p-4">
                                        <Award className="h-8 w-8 text-primary" />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-lg font-semibold">
                                        {certificate.course.title}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Certificate #
                                        {certificate.certificate_number}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Issued Date
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(
                                                    certificate.issued_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    {certificate.pdf_path ? (
                                        <Button className="w-full" asChild>
                                            <a
                                                href={route(
                                                    'student.certificates.download',
                                                    certificate.id,
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Certificate
                                            </a>
                                        </Button>
                                    ) : (
                                        <Button className="w-full" disabled>
                                            <Download className="mr-2 h-4 w-4" />
                                            Certificate Generating...
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
