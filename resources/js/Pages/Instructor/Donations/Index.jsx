import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CalendarIcon,
    CreditCard,
    DollarSign,
    HeartHandshake,
    Users,
} from 'lucide-react';

export default function CourseDonationsIndex({ course, donations }) {
    const totalDonations = donations.data.reduce(
        (sum, donation) => sum + parseFloat(donation.amount),
        0,
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Donations - ${course.title}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link
                            href={route('instructor.courses.show', course.id)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            Donations for {course.title}
                        </h1>
                        <p className="text-muted-foreground">
                            Track donations received for this course
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Donations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <span className="text-2xl font-bold">
                                    {formatCurrency(totalDonations)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Donors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <span className="text-2xl font-bold">
                                    {donations.total}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Average Donation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <HeartHandshake className="h-5 w-5 text-muted-foreground" />
                                <span className="text-2xl font-bold">
                                    {donations.total > 0
                                        ? formatCurrency(
                                              totalDonations / donations.total,
                                          )
                                        : formatCurrency(0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Donation History</CardTitle>
                        <CardDescription>
                            All donations received for this course
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {donations.data.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Message</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {donations.data.map((donation) => (
                                        <TableRow key={donation.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                    {donation.donated_at
                                                        ? new Date(
                                                              donation.donated_at,
                                                          ).toLocaleDateString()
                                                        : new Date(
                                                              donation.created_at,
                                                          ).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {donation.user.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                    {formatCurrency(
                                                        donation.amount,
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                        donation.status ===
                                                        'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : donation.status ===
                                                                'pending'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {donation.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        donation.status.slice(
                                                            1,
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {donation.message || '-'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <HeartHandshake className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-medium">
                                    No donations yet
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    You haven't received any donations for this
                                    course yet.
                                </p>
                                <div className="mt-6">
                                    <Button asChild variant="outline">
                                        <Link
                                            href={route(
                                                'courses.show',
                                                course.slug,
                                            )}
                                        >
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            View Course Page
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    {donations.data.length > 0 && (
                        <CardFooter className="flex justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {donations.from} to {donations.to} of{' '}
                                {donations.total} donations
                            </div>
                            <div className="flex gap-2">
                                {donations.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        href={link.url}
                                    >
                                        {link.label
                                            .replace('&laquo;', '«')
                                            .replace('&raquo;', '»')}
                                    </Button>
                                ))}
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
