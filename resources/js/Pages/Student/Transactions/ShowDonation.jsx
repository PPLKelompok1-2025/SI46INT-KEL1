import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CalendarClock,
    HeartHandshake,
    User,
} from 'lucide-react';

export default function ShowDonation({ donation }) {
    // Format date to be more readable
    const formattedDate = new Date(donation.created_at).toLocaleString(
        undefined,
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    );

    const donatedDate = donation.donated_at
        ? new Date(donation.donated_at).toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    return (
        <AuthenticatedLayout>
            <Head title={`Donation Details - ${donation.order_id}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link
                            href={route('student.transactions.index', {
                                tab: 'donations',
                            })}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Donation Details</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HeartHandshake className="h-5 w-5" />
                                <span>Donation Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Order ID</h3>
                                <p className="font-mono text-sm">
                                    {donation.order_id}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Date</h3>
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                    <span>{formattedDate}</span>
                                </div>
                            </div>
                            {donatedDate && (
                                <div>
                                    <h3 className="font-semibold">
                                        Donation Completed Date
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                                        <span>{donatedDate}</span>
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold">Status</h3>
                                <Badge
                                    variant={
                                        donation.status === 'completed'
                                            ? 'success'
                                            : donation.status === 'pending'
                                              ? 'warning'
                                              : 'destructive'
                                    }
                                    className="mt-1"
                                >
                                    {donation.status.charAt(0).toUpperCase() +
                                        donation.status.slice(1)}
                                </Badge>
                            </div>
                            <div>
                                <h3 className="font-semibold">Amount</h3>
                                <div className="mt-1 flex items-center gap-2">
                                    <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-lg font-bold">
                                        {formatCurrency(donation.amount)}
                                    </span>
                                </div>
                            </div>
                            {donation.message && (
                                <div>
                                    <h3 className="font-semibold">
                                        Your Message
                                    </h3>
                                    <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                                        {donation.message}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Course & Creator</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {donation.course ? (
                                <>
                                    <div>
                                        <h3 className="font-semibold">
                                            Course Title
                                        </h3>
                                        <Link
                                            href={route(
                                                'courses.show',
                                                donation.course.slug,
                                            )}
                                            className="text-primary hover:underline"
                                        >
                                            {donation.course.title}
                                        </Link>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Creator
                                        </h3>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="h-8 w-8 overflow-hidden rounded-full">
                                                {donation.course.user
                                                    ?.profile_photo_path ? (
                                                    <img
                                                        src={
                                                            donation.course.user
                                                                .profile_photo_path
                                                        }
                                                        alt={
                                                            donation.course.user
                                                                .name
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <span>
                                                {donation.course.user?.name ||
                                                    'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Category
                                        </h3>
                                        <p>
                                            {donation.course.category?.name ||
                                                'Uncategorized'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 text-center text-muted-foreground">
                                    <p>Course information unavailable</p>
                                    <p className="text-sm">
                                        The course may have been deleted
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Donation Impact</CardTitle>
                        <CardDescription>
                            Your donation helps course creators continue to
                            provide free educational content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p>
                                Thank you for supporting{' '}
                                {donation.course?.user?.name || 'the creator'}{' '}
                                with your donation. Your contribution helps
                                sustain the development of free educational
                                resources.
                            </p>

                            {donation.status === 'completed' && (
                                <div className="rounded-md bg-primary/10 p-4">
                                    <h3 className="font-semibold text-primary">
                                        Thank You!
                                    </h3>
                                    <p className="text-sm">
                                        Your donation of{' '}
                                        {formatCurrency(donation.amount)} has
                                        been successfully processed and received
                                        by the course creator.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        {donation.course && (
                            <Button asChild>
                                <Link
                                    href={route(
                                        'courses.show',
                                        donation.course.slug,
                                    )}
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    View Course
                                </Link>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
