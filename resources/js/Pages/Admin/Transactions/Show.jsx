import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';

export default function Show({ transaction, relatedTransactions }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'purchase':
                return 'bg-blue-100 text-blue-800';
            case 'refund':
                return 'bg-purple-100 text-purple-800';
            case 'payout':
                return 'bg-emerald-100 text-emerald-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleRefund = () => {
        if (!confirm('Are you sure you want to refund this transaction?')) {
            return;
        }

        router.post(route('admin.transactions.refund', transaction.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Transaction: ${transaction.transaction_id}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.transactions.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Transactions
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold">
                            Transaction Details
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
                        </Button>
                        {transaction.status === 'completed' &&
                            transaction.type === 'purchase' && (
                                <Button
                                    variant="destructive"
                                    onClick={handleRefund}
                                >
                                    Process Refund
                                </Button>
                            )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Main Details */}
                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Information</CardTitle>
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        className={getStatusColor(
                                            transaction.status,
                                        )}
                                        variant="outline"
                                    >
                                        {transaction.status}
                                    </Badge>
                                    <Badge
                                        className={getTypeColor(
                                            transaction.type,
                                        )}
                                        variant="outline"
                                    >
                                        {transaction.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Transaction ID
                                        </p>
                                        <p className="text-base font-semibold">
                                            {transaction.transaction_id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Date
                                        </p>
                                        <p className="text-base font-semibold">
                                            {new Date(
                                                transaction.created_at,
                                            ).toLocaleDateString()}{' '}
                                            {new Date(
                                                transaction.created_at,
                                            ).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Amount
                                        </p>
                                        <p className="text-base font-semibold">
                                            {formatCurrency(transaction.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Instructor Amount
                                        </p>
                                        <p className="text-base font-semibold">
                                            {formatCurrency(
                                                transaction.instructor_amount,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Payment Method
                                        </p>
                                        <p className="text-base font-semibold">
                                            {transaction.payment_method}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Currency
                                        </p>
                                        <p className="text-base font-semibold">
                                            {transaction.currency}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {transaction.course && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        {transaction.course.thumbnail && (
                                            <img
                                                src={`/storage/${transaction.course.thumbnail}`}
                                                alt={transaction.course.title}
                                                className="h-16 w-16 rounded-md object-cover"
                                            />
                                        )}
                                        <div>
                                            <p className="text-lg font-semibold">
                                                {transaction.course.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    transaction.course
                                                        .short_description
                                                }
                                            </p>
                                            <div className="mt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'admin.courses.show',
                                                            transaction.course
                                                                .id,
                                                        )}
                                                    >
                                                        View Course
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Name
                                    </p>
                                    <p className="text-base font-semibold">
                                        {transaction.user.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Email
                                    </p>
                                    <p className="text-base font-semibold">
                                        {transaction.user.email}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            href={route(
                                                'admin.users.show',
                                                transaction.user.id,
                                            )}
                                        >
                                            View User Profile
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {relatedTransactions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Related Transactions</CardTitle>
                                    <CardDescription>
                                        Other transactions from this user or for
                                        this course
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {relatedTransactions.map(
                                            (relatedTransaction) => (
                                                <li
                                                    key={relatedTransaction.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                relatedTransaction.transaction_id
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                relatedTransaction.created_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold">
                                                            {formatCurrency(
                                                                relatedTransaction.amount,
                                                            )}
                                                        </p>
                                                        <Badge
                                                            className={getStatusColor(
                                                                relatedTransaction.status,
                                                            )}
                                                            variant="outline"
                                                        >
                                                            {
                                                                relatedTransaction.status
                                                            }
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'admin.transactions.show',
                                                                relatedTransaction.id,
                                                            )}
                                                        >
                                                            View
                                                        </Link>
                                                    </Button>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
