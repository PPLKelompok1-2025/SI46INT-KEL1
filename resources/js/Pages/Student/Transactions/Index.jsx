import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarIcon,
    CreditCard,
    HeartHandshake,
    ShoppingCart,
} from 'lucide-react';

export default function TransactionsIndex({
    transactions,
    donations,
    tab = 'purchases',
    filters,
    summary,
    statuses,
}) {
    const handleTabChange = (value) => {
        router.get(
            route('student.transactions.index'),
            { tab: value, status: filters.status },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['transactions', 'donations', 'tab', 'summary'],
                replace: true,
            },
        );
    };

    const handleStatusChange = (value) => {
        const params = { tab };
        if (value !== 'all') {
            params.status = value;
        }

        router.get(route('student.transactions.index'), params, {
            preserveState: true,
            only: ['transactions', 'donations', 'summary'],
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Transactions" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Transactions</h1>
                    <div className="flex items-center gap-2">
                        <Select
                            value={filters.status}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(statuses).map(
                                    ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs
                    value={tab}
                    onValueChange={handleTabChange}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="purchases"
                            className="flex items-center gap-2"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>Course Purchases</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="donations"
                            className="flex items-center gap-2"
                        >
                            <HeartHandshake className="h-4 w-4" />
                            <span>Donations</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="purchases" className="mt-6">
                        <div className="mb-6 grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Spent
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(
                                            summary?.total_spent || 0,
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Transactions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {summary?.total_transactions || 0}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Pending Transactions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {summary?.pending_transactions || 0}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>
                                    Your course purchases and payments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {transactions?.data?.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Order ID</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.data.map(
                                                (transaction) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                                <span>
                                                                    {new Date(
                                                                        transaction.created_at,
                                                                    ).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {
                                                                transaction.order_id
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.course ? (
                                                                <Link
                                                                    href={route(
                                                                        'courses.show',
                                                                        transaction
                                                                            .course
                                                                            .slug,
                                                                    )}
                                                                    className="hover:underline"
                                                                >
                                                                    {
                                                                        transaction
                                                                            .course
                                                                            .title
                                                                    }
                                                                </Link>
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    Course
                                                                    Deleted
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                                <span>
                                                                    {formatCurrency(
                                                                        transaction.amount,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    transaction.status ===
                                                                    'completed'
                                                                        ? 'success'
                                                                        : transaction.status ===
                                                                            'pending'
                                                                          ? 'warning'
                                                                          : transaction.status ===
                                                                              'refunded'
                                                                            ? 'outline'
                                                                            : 'destructive'
                                                                }
                                                            >
                                                                {transaction.status
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    transaction.status.slice(
                                                                        1,
                                                                    )}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'student.transactions.show',
                                                                        transaction.id,
                                                                    )}
                                                                >
                                                                    View Details
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="text-lg font-medium">
                                            No transactions yet
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            You haven't made any course
                                            purchases yet.
                                        </p>
                                        <Button className="mt-4" asChild>
                                            <Link href={route('courses.index')}>
                                                Browse Courses
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                            {transactions?.data?.length > 0 &&
                                transactions.links && (
                                    <div className="flex items-center justify-between border-t px-6 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {transactions.from} to{' '}
                                            {transactions.to} of{' '}
                                            {transactions.total} transactions
                                        </div>
                                        <div className="flex gap-2">
                                            {transactions.links.map(
                                                (link, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={
                                                            link.active
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() =>
                                                            link.url &&
                                                            router.visit(
                                                                link.url,
                                                            )
                                                        }
                                                    >
                                                        {link.label
                                                            .replace(
                                                                '&laquo;',
                                                                '«',
                                                            )
                                                            .replace(
                                                                '&raquo;',
                                                                '»',
                                                            )}
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="donations" className="mt-6">
                        <div className="mb-6 grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Donated
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {formatCurrency(
                                            summary?.total_donated || 0,
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Donations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {summary?.total_donations || 0}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Pending Donations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {summary?.pending_donations || 0}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Donation History</CardTitle>
                                <CardDescription>
                                    Your donations to course creators
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {donations?.data?.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Recipient</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {donations.data.map((donation) => (
                                                <TableRow key={donation.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                {donation.donated_at
                                                                    ? new Date(
                                                                          donation.donated_at,
                                                                      ).toLocaleDateString()
                                                                    : new Date(
                                                                          donation.created_at,
                                                                      ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {donation.course ? (
                                                            <Link
                                                                href={route(
                                                                    'courses.show',
                                                                    donation
                                                                        .course
                                                                        .slug,
                                                                )}
                                                                className="hover:underline"
                                                            >
                                                                {
                                                                    donation
                                                                        .course
                                                                        .title
                                                                }
                                                            </Link>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                Course Deleted
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {donation.course?.user
                                                            ?.name || 'Unknown'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                                                            <span>
                                                                {formatCurrency(
                                                                    donation.amount,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                donation.status ===
                                                                'completed'
                                                                    ? 'success'
                                                                    : donation.status ===
                                                                        'pending'
                                                                      ? 'warning'
                                                                      : 'destructive'
                                                            }
                                                        >
                                                            {donation.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                donation.status.slice(
                                                                    1,
                                                                )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'student.donations.show',
                                                                    donation.id,
                                                                )}
                                                            >
                                                                View Details
                                                            </Link>
                                                        </Button>
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
                                            You haven't made any donations to
                                            course creators yet.
                                        </p>
                                        <Button className="mt-4" asChild>
                                            <Link href={route('courses.index')}>
                                                Find Free Courses to Support
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                            {donations?.data?.length > 0 && donations.links && (
                                <div className="flex items-center justify-between border-t px-6 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {donations.from} to{' '}
                                        {donations.to} of {donations.total}{' '}
                                        donations
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
                                                onClick={() =>
                                                    link.url &&
                                                    router.visit(link.url)
                                                }
                                            >
                                                {link.label
                                                    .replace('&laquo;', '«')
                                                    .replace('&raquo;', '»')}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
