import TableTemplate from '@/Components/TableTemplate';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import {
    CalendarDays,
    Download,
    Eye,
    PieChart,
    RefreshCw,
    Wallet,
} from 'lucide-react';

export default function Index({
    transactions,
    filters,
    summary,
    statuses,
    types,
}) {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

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

    const columns = [
        {
            label: 'Transaction ID',
            key: 'transaction_id',
            render: (transaction) => (
                <div className="font-medium">{transaction.transaction_id}</div>
            ),
        },
        {
            label: 'Date',
            key: 'created_at',
            render: (transaction) => formatDate(transaction.created_at),
        },
        {
            label: 'User',
            key: 'user.name',
            render: (transaction) =>
                transaction.user ? transaction.user.name : 'N/A',
        },
        {
            label: 'Course',
            key: 'course.title',
            render: (transaction) =>
                transaction.course ? transaction.course.title : 'N/A',
        },
        {
            label: 'Amount',
            key: 'amount',
            render: (transaction) => formatCurrency(transaction.amount),
        },
        {
            label: 'Status',
            key: 'status',
            render: (transaction) => (
                <Badge
                    className={getStatusColor(transaction.status)}
                    variant="outline"
                >
                    {transaction.status}
                </Badge>
            ),
        },
        {
            label: 'Type',
            key: 'type',
            render: (transaction) => (
                <Badge
                    className={getTypeColor(transaction.type)}
                    variant="outline"
                >
                    {transaction.type}
                </Badge>
            ),
        },
        {
            label: 'Actions',
            key: 'actions',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (transaction) => (
                <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
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
                                <p>View transaction details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {transaction.status === 'completed' &&
                        transaction.type === 'purchase' && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
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
                                        <p>Process refund</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                </div>
            ),
        },
    ];

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

    const filterOptions = {
        searchEnabled: true,
        searchPlaceholder: 'Search transactions...',
        selectFilters: {
            status: {
                label: 'Status',
                placeholder: 'Filter by status',
                allLabel: statuses['all'],
                options: Object.entries(statuses)
                    .filter(([value]) => value !== 'all')
                    .map(([value, label]) => ({ value, label })),
            },
            type: {
                label: 'Type',
                placeholder: 'Filter by type',
                allLabel: types['all'],
                options: Object.entries(types)
                    .filter(([value]) => value !== 'all')
                    .map(([value, label]) => ({ value, label })),
            },
            date_range: {
                label: 'Date Range',
                placeholder: 'Filter by date',
                allLabel: 'All Time',
                options: dateRangeOptions.filter(
                    (option) => option.value !== 'all',
                ),
            },
        },
        sortOptions: [
            { value: 'created_at_desc', label: 'Newest First' },
            { value: 'created_at_asc', label: 'Oldest First' },
            { value: 'amount_desc', label: 'Amount High to Low' },
            { value: 'amount_asc', label: 'Amount Low to High' },
        ],
        defaultSort: filters.sort || 'created_at_desc',
    };

    const statsConfig = {
        items: [
            {
                title: 'Total Revenue',
                value: formatCurrency(summary.total_revenue),
                description: `From ${summary.total_transactions} transactions`,
                icon: <Wallet className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Transaction Status',
                value: summary.completed_count,
                description: `${summary.completed_count} completed, ${summary.pending_count} pending, ${summary.failed_count} failed`,
                icon: <PieChart className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Refunded Amount',
                value: formatCurrency(summary.total_refunded),
                description: `${summary.refunded_count} transactions refunded`,
                icon: <RefreshCw className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Recent Activity',
                value: summary.recent_transactions,
                description: 'Transactions in the last 30 days',
                icon: (
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                ),
            },
        ],
    };

    const emptyState = {
        icon: <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No transactions found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription: 'There are no transactions in the system yet.',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <Button
                        variant="outline"
                        onClick={() =>
                            (window.location.href = route(
                                'admin.transactions.export',
                                {
                                    search: filters.search,
                                    status: filters.status,
                                    type: filters.type,
                                    date_range: filters.date_range,
                                },
                            ))
                        }
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Transactions
                    </Button>
                </div>

                <TableTemplate
                    title="All Transactions"
                    description="Manage payment transactions across the platform"
                    columns={columns}
                    data={transactions}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="admin.transactions.index"
                    stats={statsConfig}
                    emptyState={emptyState}
                />
            </div>
        </AuthenticatedLayout>
    );
}
