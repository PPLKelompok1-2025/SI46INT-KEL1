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
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function Show({ withdrawalRequest }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'processed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleApprove = () => {
        if (
            !confirm(
                'Are you sure you want to approve this withdrawal request?',
            )
        ) {
            return;
        }
        router.patch(
            route('admin.withdrawal-requests.approve', withdrawalRequest.id),
        );
    };

    const handleReject = () => {
        if (
            !confirm('Are you sure you want to reject this withdrawal request?')
        ) {
            return;
        }
        router.patch(
            route('admin.withdrawal-requests.reject', withdrawalRequest.id),
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Withdrawal Request #${withdrawalRequest.id}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-4">
                        <Link
                            href={route('admin.withdrawal-requests.index')}
                            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Withdrawal Requests
                        </Link>
                        <h1 className="text-3xl font-bold">
                            Withdrawal Request Details
                        </h1>
                    </div>
                    {withdrawalRequest.status === 'pending' && (
                        <div className="flex items-center gap-2">
                            <Button variant="default" onClick={handleApprove}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Withdrawal Request Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Request ID
                                        </p>
                                        <p className="text-base font-semibold">
                                            {withdrawalRequest.id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Instructor
                                        </p>
                                        <p className="text-base font-semibold">
                                            {withdrawalRequest.user.name} (
                                            {withdrawalRequest.user.email})
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Amount
                                        </p>
                                        <p className="text-base font-semibold">
                                            {formatCurrency(
                                                withdrawalRequest.amount,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Payment Method
                                        </p>
                                        <p className="text-base font-semibold">
                                            {withdrawalRequest.payment_method
                                                ? withdrawalRequest
                                                      .payment_method.type
                                                : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Bank Name
                                        </p>
                                        <p className="text-base font-semibold">
                                            {withdrawalRequest.payment_method
                                                ? withdrawalRequest
                                                      .payment_method.bank_name
                                                : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Account Name
                                        </p>
                                        <p className="text-base font-semibold">
                                            {withdrawalRequest.payment_method
                                                ? withdrawalRequest
                                                      .payment_method
                                                      .account_name
                                                : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Account Number
                                        </p>
                                        <p className="text-base font-semibold">
                                            {withdrawalRequest.payment_method
                                                ? withdrawalRequest
                                                      .payment_method
                                                      .account_number
                                                : 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Notes
                                        </p>
                                        <p className="text-base">
                                            {withdrawalRequest.notes || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </p>
                                        <Badge
                                            className={getStatusColor(
                                                withdrawalRequest.status,
                                            )}
                                            variant="outline"
                                        >
                                            {withdrawalRequest.status
                                                .charAt(0)
                                                .toUpperCase() +
                                                withdrawalRequest.status.slice(
                                                    1,
                                                )}
                                        </Badge>
                                    </div>
                                    {withdrawalRequest.processed_at && (
                                        <>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Processed By
                                                </p>
                                                <p className="text-base">
                                                    {
                                                        withdrawalRequest
                                                            .processor.name
                                                    }
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Processed At
                                                </p>
                                                <p className="text-base">
                                                    {new Date(
                                                        withdrawalRequest.processed_at,
                                                    ).toLocaleDateString()}{' '}
                                                    {new Date(
                                                        withdrawalRequest.processed_at,
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Method Details</CardTitle>
                                <CardDescription>
                                    Details of the payment method provided
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {withdrawalRequest.paymentMethod ? (
                                    <>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Type
                                            </p>
                                            <p className="text-base font-semibold">
                                                {
                                                    withdrawalRequest
                                                        .paymentMethod.type
                                                }
                                            </p>
                                        </div>
                                        {withdrawalRequest.paymentMethod
                                            .account_name && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Account Name
                                                </p>
                                                <p className="text-base font-semibold">
                                                    {
                                                        withdrawalRequest
                                                            .paymentMethod
                                                            .account_name
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {withdrawalRequest.paymentMethod
                                            .account_number && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Account Number
                                                </p>
                                                <p className="text-base font-semibold">
                                                    {
                                                        withdrawalRequest
                                                            .paymentMethod
                                                            .account_number
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {withdrawalRequest.paymentMethod
                                            .bank_name && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Bank Name
                                                </p>
                                                <p className="text-base font-semibold">
                                                    {
                                                        withdrawalRequest
                                                            .paymentMethod
                                                            .bank_name
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        {withdrawalRequest.paymentMethod
                                            .paypal_email && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    PayPal Email
                                                </p>
                                                <p className="text-base font-semibold">
                                                    {
                                                        withdrawalRequest
                                                            .paymentMethod
                                                            .paypal_email
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            No payment method details available
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
