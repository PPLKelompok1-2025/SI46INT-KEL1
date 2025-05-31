import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    CreditCard,
    ShoppingBag,
} from 'lucide-react';

export default function TransactionShow({ transaction }) {
    // Format date to be more readable
    const formattedDate = new Date(transaction.created_at).toLocaleString(
        undefined,
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    );

    const paymentDate = transaction.paid_at
        ? new Date(transaction.paid_at).toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    return (
        <AuthenticatedLayout>
            <Head title={`Transaction Details - ${transaction.order_id}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('student.transactions.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Transaction Details</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                <span>Order Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Order ID</h3>
                                <p className="font-mono text-sm">
                                    {transaction.order_id}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    Transaction ID
                                </h3>
                                <p className="font-mono text-sm">
                                    {transaction.transaction_id}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Date</h3>
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                                    <span>{formattedDate}</span>
                                </div>
                            </div>
                            {paymentDate && (
                                <div>
                                    <h3 className="font-semibold">
                                        Payment Date
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <span>{paymentDate}</span>
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold">Status</h3>
                                <Badge
                                    variant={
                                        transaction.status === 'completed'
                                            ? 'success'
                                            : transaction.status === 'pending'
                                              ? 'warning'
                                              : transaction.status ===
                                                  'refunded'
                                                ? 'outline'
                                                : 'destructive'
                                    }
                                    className="mt-1"
                                >
                                    {transaction.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        transaction.status.slice(1)}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Course Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {transaction.course ? (
                                <>
                                    <div>
                                        <h3 className="font-semibold">
                                            Course Title
                                        </h3>
                                        <Link
                                            href={route(
                                                'courses.show',
                                                transaction.course.slug,
                                            )}
                                            className="text-primary hover:underline"
                                        >
                                            {transaction.course.title}
                                        </Link>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Instructor
                                        </h3>
                                        <p>
                                            {transaction.course.user?.name ||
                                                'Unknown'}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Category
                                        </h3>
                                        <p>
                                            {transaction.course.category
                                                ?.name || 'Uncategorized'}
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
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span>Payment Method</span>
                                <span className="font-medium">
                                    {transaction.payment_method
                                        ? transaction.payment_method
                                              .charAt(0)
                                              .toUpperCase() +
                                          transaction.payment_method.slice(1)
                                        : 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    {formatCurrency(transaction.amount)}
                                </span>
                            </div>
                            {transaction.payment_details?.discount && (
                                <div className="flex justify-between text-primary">
                                    <span>Discount</span>
                                    <span>
                                        -
                                        {formatCurrency(
                                            transaction.payment_details
                                                .discount,
                                        )}
                                    </span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>
                                    {formatCurrency(transaction.amount)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        {transaction.status === 'pending' && (
                            <Button variant="outline" asChild>
                                <Link
                                    href={route(
                                        'payment.checkout',
                                        transaction.course_id,
                                    )}
                                >
                                    Complete Payment
                                </Link>
                            </Button>
                        )}
                        {transaction.status === 'completed' &&
                            transaction.course && (
                                <Button asChild>
                                    <Link
                                        href={route(
                                            'student.courses.show',
                                            transaction.course.slug,
                                        )}
                                    >
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
