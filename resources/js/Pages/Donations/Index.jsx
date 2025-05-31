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
import { Head } from '@inertiajs/react';
import { CalendarIcon, CreditCard } from 'lucide-react';

export default function DonationsIndex({ donations }) {
    return (
        <AuthenticatedLayout>
            <Head title="My Donations" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">My Donations</h1>
                        <p className="text-muted-foreground">
                            Track your donations to course creators
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Donation History</CardTitle>
                            <CardDescription>
                                Your past and pending donations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {donations.data.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Recipient</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {donations.data.map((donation) => (
                                            <TableRow key={donation.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                        {new Date(
                                                            donation.created_at,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {donation.course.title}
                                                </TableCell>
                                                <TableCell>
                                                    {donation.course.user.name}
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
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="text-lg font-medium">
                                        No donations yet
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        You haven't made any donations to course
                                        creators yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        {donations.data.length > 0 && (
                            <CardFooter className="flex justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {donations.from} to {donations.to}{' '}
                                    of {donations.total} donations
                                </div>
                                <div className="flex gap-2">
                                    {donations.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
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
            </div>
        </AuthenticatedLayout>
    );
}
