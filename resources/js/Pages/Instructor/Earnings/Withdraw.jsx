import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Wallet } from 'lucide-react';

export default function Withdraw({ availableEarnings, paymentMethods }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method_id: '',
        notes: '',
    });

    const onSubmit = (e) => {
        e.preventDefault();
        post(route('instructor.earnings.request-withdrawal'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Request Withdrawal" />

            <div className="space-y-6">
                <div className="flex items-center">
                    <Button variant="ghost" asChild className="mr-4">
                        <Link href={route('instructor.earnings.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to
                            Earnings
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">
                        Request Withdrawal
                    </h1>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Withdrawal Request</CardTitle>
                            <CardDescription>
                                Request a withdrawal of your available earnings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="amount"
                                        className="text-sm font-medium"
                                    >
                                        Amount
                                    </label>
                                    <div className="relative">
                                        <p className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            Rp
                                        </p>
                                        <Input
                                            id="amount"
                                            placeholder="Enter amount"
                                            className="pl-8"
                                            type="number"
                                            value={data.amount}
                                            onChange={(e) =>
                                                setData(
                                                    'amount',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Minimum withdrawal amount is{' '}
                                        {formatCurrency(50000)}
                                    </p>
                                    {errors.amount && (
                                        <p className="text-sm text-destructive">
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="payment_method_id"
                                        className="text-sm font-medium"
                                    >
                                        Payment Method
                                    </label>
                                    <Select
                                        value={data.payment_method_id}
                                        onValueChange={(value) =>
                                            setData('payment_method_id', value)
                                        }
                                    >
                                        <SelectTrigger id="payment_method_id">
                                            <SelectValue placeholder="Select a payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods.length > 0 ? (
                                                paymentMethods.map((method) => (
                                                    <SelectItem
                                                        key={method.id}
                                                        value={method.id.toString()}
                                                    >
                                                        {method.type ===
                                                        'bank_transfer'
                                                            ? `Bank Transfer - ${method.bank_name}`
                                                            : method.type ===
                                                                'paypal'
                                                              ? `PayPal - ${method.paypal_email}`
                                                              : method.type}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem
                                                    value="none"
                                                    disabled
                                                >
                                                    No payment methods available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Select the payment method you want to
                                        use for this withdrawal
                                    </p>
                                    {paymentMethods.length === 0 && (
                                        <div className="mt-2 rounded-md bg-yellow-50 p-3">
                                            <div className="flex">
                                                <p className="text-sm text-yellow-800">
                                                    You need to add a payment
                                                    method before you can
                                                    request a withdrawal.{' '}
                                                    <Link
                                                        href={route(
                                                            'instructor.payment-methods.create',
                                                        )}
                                                        className="font-medium text-yellow-800 underline hover:text-yellow-900"
                                                    >
                                                        Add a payment method
                                                    </Link>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {paymentMethods.length > 0 && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            <Link
                                                href={route(
                                                    'instructor.payment-methods.index',
                                                )}
                                                className="text-primary hover:underline"
                                            >
                                                Manage payment methods
                                            </Link>
                                        </div>
                                    )}
                                    {errors.payment_method_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.payment_method_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="notes"
                                        className="text-sm font-medium"
                                    >
                                        Notes (Optional)
                                    </label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any additional information"
                                        className="resize-none"
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Any additional information for the admin
                                    </p>
                                    {errors.notes && (
                                        <p className="text-sm text-destructive">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.visit(
                                                route(
                                                    'instructor.earnings.index',
                                                ),
                                            )
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Processing...'
                                            : 'Submit Request'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Available Balance</CardTitle>
                            <CardDescription>
                                Your current available balance for withdrawal
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center space-x-2">
                                <Wallet className="h-8 w-8 text-primary" />
                                <span className="text-3xl font-bold">
                                    {formatCurrency(availableEarnings)}
                                </span>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="rounded-lg bg-muted p-4">
                                    <h3 className="font-medium">
                                        Withdrawal Guidelines
                                    </h3>
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                        <li>
                                            Minimum withdrawal amount is{' '}
                                            {formatCurrency(50000)}
                                        </li>
                                        <li>
                                            Withdrawals are processed within 1-3
                                            business days
                                        </li>
                                        <li>
                                            A 2% processing fee may apply
                                            depending on the payment method
                                        </li>
                                        <li>
                                            Make sure your payment details are
                                            correct
                                        </li>
                                    </ul>
                                </div>

                                <div className="rounded-lg bg-muted p-4">
                                    <h3 className="font-medium">Need Help?</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        If you have any questions about
                                        withdrawals, please contact our support
                                        team.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="mt-2 h-auto p-0 text-sm"
                                    >
                                        Contact Support
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}