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
import { Separator } from '@/Components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    CreditCard,
    Edit,
    Landmark,
    Plus,
    Star,
    Trash2,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ paymentMethods }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this payment method?')) {
            setIsDeleting(true);
            router.delete(route('instructor.payment-methods.destroy', id), {
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    const handleSetDefault = (id) => {
        router.patch(route('instructor.payment-methods.set-default', id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Payment Methods" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Payment Methods</h1>
                        <p className="text-muted-foreground">
                            Manage your payment methods for withdrawals
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('instructor.payment-methods.create')}>
                            <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Payment Methods</CardTitle>
                        <CardDescription>
                            These payment methods will be available when you
                            request a withdrawal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {paymentMethods.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">
                                            Type
                                        </TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentMethods.map((method) => (
                                        <TableRow key={method.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {method.type ===
                                                    'bank_transfer' ? (
                                                        <Landmark className="h-4 w-4 text-muted-foreground" />
                                                    ) : method.type ===
                                                      'paypal' ? (
                                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    <span className="capitalize">
                                                        {method.type.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {method.type ===
                                                'bank_transfer' ? (
                                                    <div className="space-y-1">
                                                        <p className="font-medium">
                                                            {method.bank_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Account:{' '}
                                                            {
                                                                method.account_name
                                                            }
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Number:{' '}
                                                            {
                                                                method.account_number
                                                            }
                                                        </p>
                                                    </div>
                                                ) : method.type === 'paypal' ? (
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                method.paypal_email
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p>Other payment details</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {method.is_default ? (
                                                    <Badge className="bg-primary text-primary-foreground">
                                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                                        Default
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleSetDefault(
                                                                method.id,
                                                            )
                                                        }
                                                    >
                                                        <Star className="mr-1 h-3 w-3" />
                                                        Set Default
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'instructor.payment-methods.edit',
                                                                            method.id,
                                                                        )}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Edit</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            method.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isDeleting
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Delete</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="text-lg font-medium">
                                    No payment methods yet
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add a payment method to request withdrawals
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link
                                        href={route(
                                            'instructor.payment-methods.create',
                                        )}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Payment Method
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    {paymentMethods.length > 0 && (
                        <CardFooter>
                            <div className="text-sm text-muted-foreground">
                                You can set one payment method as default for
                                faster withdrawals.
                            </div>
                        </CardFooter>
                    )}
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>About Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-2 text-lg font-medium">
                                    Supported Payment Methods
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Landmark className="h-5 w-5 text-primary" />
                                            <h4 className="font-medium">
                                                Bank Transfer
                                            </h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Receive payments directly to your
                                            bank account. Processing time is 1-3
                                            business days.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                            <h4 className="font-medium">
                                                PayPal
                                            </h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Receive payments to your PayPal
                                            account. Processing time is 1-2
                                            business days.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-2 text-lg font-medium">
                                    Important Notes
                                </h3>
                                <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                                    <li>
                                        Make sure your payment details are
                                        accurate to avoid delays
                                    </li>
                                    <li>
                                        Processing times may vary depending on
                                        your financial institution
                                    </li>
                                    <li>
                                        You must add at least one payment method
                                        before you can request a withdrawal
                                    </li>
                                    <li>
                                        For security reasons, we may verify your
                                        payment method before processing large
                                        withdrawals
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
