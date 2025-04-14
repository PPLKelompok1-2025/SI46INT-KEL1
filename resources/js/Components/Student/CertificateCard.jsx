import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Link } from '@inertiajs/react';
import { Award, Download, ExternalLink } from 'lucide-react';

export default function CertificateCard({ certificate, userName }) {
    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-yellow-500" />
                    Certificate of Completion
                </CardTitle>
                <CardDescription>{certificate.course.title}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border bg-muted/50 p-4 text-center">
                    <p className="mb-1 text-sm">Awarded to</p>
                    <p className="mb-1 font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">
                        Issued on{' '}
                        {new Date(certificate.issued_at).toLocaleDateString()}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/student/certificates/${certificate.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                    </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                    <Link
                        href={`/student/certificates/${certificate.id}/download`}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
