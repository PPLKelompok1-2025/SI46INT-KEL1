import { Badge } from '@/Components/ui/badge';
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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { Download, Eye, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function Index({
    transactions,
    filters,
    summary,
    statuses,
    types,
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [type, setType] = useState(filters.type || 'all');
    const [dateRange, setDateRange] = useState(filters.date_range || 'all');
    const [sortField, setSortField] = useState(
        filters.sort_field || 'created_at',
    );
    const [sortDirection, setSortDirection] = useState(
        filters.sort_direction || 'desc',
    );

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

    const dateRangeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'this_week', label: 'This Week' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_year', label: 'This Year' },
        { value: 'last_year', label: 'Last Year' },
    ];

    const applyFilters = useCallback(
        () =>
            router.get(
                route('admin.transactions.index'),
                {
                    search: searchTerm,
                    status,
                    type,
                    date_range: dateRange,
                    sort_field: sortField,
                    sort_direction: sortDirection,
                },
                {
                    preserveState: true,
                    replace: true,
                },
            ),
        [searchTerm, status, type, dateRange, sortField, sortDirection],
    );

    const handleSort = (field) => {
        if (field === 'created') {
            field = 'created_at';
        }

        const direction =
            field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(direction);

        router.get(
            route('admin.transactions.index'),
            {
                search: searchTerm,
                status,
                type,
                date_range: dateRange,
                sort_field: field,
                sort_direction: direction,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    useEffect(() => {
        if (status !== 'all' || type !== 'all' || dateRange !== 'all') {
            applyFilters();
        }
    }, [status, type, dateRange, applyFilters]);

    const resetFilters = () => {
        setSearchTerm('');
        setStatus('all');
        setType('all');
        setDateRange('all');
        setSortField('created_at');
        setSortDirection('desc');
        router.get(route('admin.transactions.index'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Transactions</h1>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(summary.total_revenue)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across {summary.total_transactions} transactions
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Refunded
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(summary.total_refunded)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Recent Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary.recent_transactions}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                In the last 30 days
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Average Transaction
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(
                                    summary.total_transactions > 0
                                        ? summary.total_revenue /
                                              summary.total_transactions
                                        : 0,
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>
                            Manage payment transactions across the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search transactions..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && applyFilters()
                                    }
                                />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(statuses).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(types).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            <Select
                                value={dateRange}
                                onValueChange={setDateRange}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by date" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dateRangeOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={
                                    sortField === 'created_at'
                                        ? sortDirection === 'desc'
                                            ? 'created_at_desc'
                                            : 'created_at_asc'
                                        : sortField === 'amount'
                                          ? sortDirection === 'desc'
                                              ? 'amount_desc'
                                              : 'amount_asc'
                                          : 'created_at_desc'
                                }
                                onValueChange={(value) => {
                                    const [field, direction] = value.split('_');
                                    setSortField(field);
                                    setSortDirection(direction);
                                    handleSort(field);
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at_desc">
                                        Newest First
                                    </SelectItem>
                                    <SelectItem value="created_at_asc">
                                        Oldest First
                                    </SelectItem>
                                    <SelectItem value="amount_desc">
                                        Amount High to Low
                                    </SelectItem>
                                    <SelectItem value="amount_asc">
                                        Amount Low to High
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {(searchTerm ||
                                status !== 'all' ||
                                type !== 'all' ||
                                dateRange !== 'all' ||
                                sortField !== 'created_at' ||
                                sortDirection !== 'desc') && (
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="whitespace-nowrap"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>

                        <div className="mb-4 ml-auto w-fit">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    (window.location.href = route(
                                        'admin.transactions.export',
                                        {
                                            search: searchTerm,
                                            status,
                                            type,
                                            date_range: dateRange,
                                        },
                                    ))
                                }
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() =>
                                                handleSort('transaction_id')
                                            }
                                        >
                                            Transaction ID
                                            {sortField === 'transaction_id' && (
                                                <span className="ml-1">
                                                    {sortDirection === 'asc'
                                                        ? '↑'
                                                        : '↓'}
                                                </span>
                                            )}
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() =>
                                                handleSort('created_at')
                                            }
                                        >
                                            Date
                                            {sortField === 'created_at' && (
                                                <span className="ml-1">
                                                    {sortDirection === 'asc'
                                                        ? '↑'
                                                        : '↓'}
                                                </span>
                                            )}
                                        </TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => handleSort('amount')}
                                        >
                                            Amount
                                            {sortField === 'amount' && (
                                                <span className="ml-1">
                                                    {sortDirection === 'asc'
                                                        ? '↑'
                                                        : '↓'}
                                                </span>
                                            )}
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan="8"
                                                className="h-24 text-center"
                                            >
                                                No transactions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {transaction.transaction_id}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(
                                                        transaction.created_at,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.user
                                                        ? transaction.user.name
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.course
                                                        ? transaction.course
                                                              .title
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        transaction.amount,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getStatusColor(
                                                            transaction.status,
                                                        )}
                                                        variant="outline"
                                                    >
                                                        {transaction.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getTypeColor(
                                                            transaction.type,
                                                        )}
                                                        variant="outline"
                                                    >
                                                        {transaction.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end space-x-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            router.visit(
                                                                                route(
                                                                                    'admin.transactions.show',
                                                                                    transaction.id,
                                                                                ),
                                                                            )
                                                                        }
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        View
                                                                        transaction
                                                                        details
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {transaction.status ===
                                                            'completed' &&
                                                            transaction.type ===
                                                                'purchase' && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            asChild
                                                                        >
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    router.post(
                                                                                        route(
                                                                                            'admin.transactions.refund',
                                                                                            transaction.id,
                                                                                        ),
                                                                                    )
                                                                                }
                                                                            >
                                                                                <RefreshCw className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>
                                                                                Process
                                                                                refund
                                                                            </p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-4">
                            <Pagination className="justify-end">
                                <PaginationContent>
                                    {transactions.links.map((link, i) => {
                                        if (!link.url && link.label === '...') {
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        if (link.label.includes('Previous')) {
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationPrevious
                                                        onClick={() =>
                                                            link.url &&
                                                            router.visit(
                                                                link.url,
                                                                {
                                                                    data: {
                                                                        search: searchTerm,
                                                                        status,
                                                                        type,
                                                                        date_range:
                                                                            dateRange,
                                                                        sort_field:
                                                                            sortField,
                                                                        sort_direction:
                                                                            sortDirection,
                                                                    },
                                                                    preserveState: true,
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        disabled={!link.url}
                                                        className={
                                                            !link.url
                                                                ? 'pointer-events-none opacity-50'
                                                                : 'cursor-pointer'
                                                        }
                                                    />
                                                </PaginationItem>
                                            );
                                        }

                                        if (link.label.includes('Next')) {
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationNext
                                                        onClick={() =>
                                                            link.url &&
                                                            router.visit(
                                                                link.url,
                                                                {
                                                                    data: {
                                                                        search: searchTerm,
                                                                        status,
                                                                        type,
                                                                        date_range:
                                                                            dateRange,
                                                                        sort_field:
                                                                            sortField,
                                                                        sort_direction:
                                                                            sortDirection,
                                                                    },
                                                                    preserveState: true,
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                        disabled={!link.url}
                                                        className={
                                                            !link.url
                                                                ? 'pointer-events-none opacity-50'
                                                                : 'cursor-pointer'
                                                        }
                                                    />
                                                </PaginationItem>
                                            );
                                        }

                                        return (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    onClick={() =>
                                                        link.url &&
                                                        router.visit(link.url, {
                                                            data: {
                                                                search: searchTerm,
                                                                status,
                                                                type,
                                                                date_range:
                                                                    dateRange,
                                                                sort_field:
                                                                    sortField,
                                                                sort_direction:
                                                                    sortDirection,
                                                            },
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        })
                                                    }
                                                    isActive={link.active}
                                                    disabled={!link.url}
                                                    className={
                                                        !link.url
                                                            ? 'pointer-events-none opacity-50'
                                                            : 'cursor-pointer'
                                                    }
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
