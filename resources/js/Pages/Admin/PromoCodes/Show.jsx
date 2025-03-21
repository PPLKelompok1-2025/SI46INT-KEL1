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
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle,
    Clock,
    DollarSign,
    PenSquare,
    Percent,
    Tag,
    Trash,
    Users,
    XCircle,
} from 'lucide-react';

export default function Show({
    promoCode,
    isValid,
    usageByMonth,
    recentTransactions,
}) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const toggleActive = () => {
        router.patch(
            route('admin.promo-codes.toggle-active', promoCode.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const confirmDelete = () => {
        if (promoCode.transactions.length > 0) {
            alert(
                'Cannot delete a promo code that has been used in transactions',
            );
            return;
        }

        if (confirm('Are you sure you want to delete this promo code?')) {
            router.delete(route('admin.promo-codes.destroy', promoCode.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Promo Code: ${promoCode.code}`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link
                            href={route('admin.promo-codes.index')}
                            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Promo Codes
                        </Link>
                        <h1 className="text-3xl font-bold">
                            Promo Code: {promoCode.code}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isValid ? 'destructive' : 'default'}
                            onClick={toggleActive}
                        >
                            {isValid ? (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activate
                                </>
                            )}
                        </Button>
                        <Button asChild variant="outline">
                            <Link
                                href={route(
                                    'admin.promo-codes.edit',
                                    promoCode.id,
                                )}
                            >
                                <PenSquare className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        {promoCode.transactions.length === 0 && (
                            <Button
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={confirmDelete}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Promo Code Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Code
                                </div>
                                <div className="font-semibold">
                                    {promoCode.code}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Description
                                </div>
                                <div className="font-semibold">
                                    {promoCode.description || 'No description'}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Discount Type
                                </div>
                                <div className="flex items-center font-semibold">
                                    {promoCode.discount_type ===
                                    'percentage' ? (
                                        <>
                                            <Percent className="mr-1 h-4 w-4 text-muted-foreground" />
                                            Percentage
                                        </>
                                    ) : (
                                        <>
                                            <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                                            Fixed Amount
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Discount Value
                                </div>
                                <div className="font-semibold">
                                    {promoCode.discount_type === 'percentage'
                                        ? `${promoCode.discount_value}%`
                                        : formatCurrency(
                                              promoCode.discount_value,
                                          )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Minimum Cart Value
                                </div>
                                <div className="font-semibold">
                                    {promoCode.min_cart_value > 0
                                        ? formatCurrency(
                                              promoCode.min_cart_value,
                                          )
                                        : 'None'}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Valid From
                                </div>
                                <div className="font-semibold">
                                    {promoCode.start_date
                                        ? formatDate(promoCode.start_date)
                                        : 'No start date'}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Valid Until
                                </div>
                                <div className="font-semibold">
                                    {promoCode.end_date
                                        ? formatDate(promoCode.end_date)
                                        : 'No end date'}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Max Uses
                                </div>
                                <div className="font-semibold">
                                    {promoCode.max_uses || 'Unlimited'}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Status
                                </div>
                                <div className="font-semibold">
                                    {isValid ? (
                                        <span className="flex items-center text-green-600">
                                            <CheckCircle className="mr-1 h-4 w-4" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-destructive">
                                            <XCircle className="mr-1 h-4 w-4" />
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b pb-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Created At
                                </div>
                                <div className="font-semibold">
                                    {formatDate(promoCode.created_at)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border p-4 text-center">
                                    <div className="flex justify-center">
                                        <Tag className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">
                                        {promoCode.used_count || 0}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Times Used
                                    </div>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <div className="flex justify-center">
                                        <Users className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">
                                        {promoCode.transactions?.length || 0}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Total Transactions
                                    </div>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <div className="flex justify-center">
                                        <DollarSign className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">
                                        {formatCurrency(
                                            promoCode.transactions?.reduce(
                                                (total, t) =>
                                                    total +
                                                    (t.discount_amount || 0),
                                                0,
                                            ) || 0,
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Total Discount Amount
                                    </div>
                                </div>
                                <div className="rounded-lg border p-4 text-center">
                                    <div className="flex justify-center">
                                        <Clock className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">
                                        {promoCode.max_uses
                                            ? Math.round(
                                                  (promoCode.used_count /
                                                      promoCode.max_uses) *
                                                      100,
                                              )
                                            : 0}
                                        %
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Usage Rate
                                    </div>
                                </div>
                            </div>

                            {usageByMonth && usageByMonth.length > 0 && (
                                <div>
                                    <h3 className="mb-2 font-medium">
                                        Monthly Usage
                                    </h3>
                                    <div className="max-h-64 overflow-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Month</TableHead>
                                                    <TableHead>Uses</TableHead>
                                                    <TableHead>
                                                        Discount Amount
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {usageByMonth.map((month) => (
                                                    <TableRow key={month.month}>
                                                        <TableCell>
                                                            {new Date(
                                                                month.month +
                                                                    '-01',
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                },
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {month.count}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatCurrency(
                                                                month.total_discount,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {recentTransactions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>
                                The most recent transactions using this promo
                                code
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Discount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                {formatDate(
                                                    transaction.created_at,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.user?.name}
                                                <div className="text-xs text-muted-foreground">
                                                    {transaction.user?.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {transaction.course?.title ||
                                                    'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    transaction.amount,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    transaction.discount_amount,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {promoCode.transactions.length > 5 && (
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="ml-auto"
                                    onClick={() =>
                                        router.visit(
                                            route('admin.transactions.index', {
                                                promo_code: promoCode.id,
                                            }),
                                        )
                                    }
                                >
                                    View All Transactions
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
