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
import { CheckCircle, Eye, Wallet, XCircle } from 'lucide-react';

export default function Index({ withdrawalRequests, filters, statuses }) {
    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    };

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

    const columns = [
        {
            label: 'Date',
            key: 'created_at',
            render: (request) => formatDate(request.created_at),
        },
        {
            label: 'Instructor',
            key: 'user.name',
            render: (request) => (request.user ? request.user.name : 'N/A'),
        },
        {
            label: 'Amount',
            key: 'amount',
            render: (request) => formatCurrency(request.amount),
        },
        {
            label: 'Payment Method',
            key: 'paymentMethod.type',
            render: (request) =>
                request.payment_method.type
                    ? request.payment_method.type
                    : 'N/A',
        },
        {
            label: 'Status',
            key: 'status',
            render: (request) => (
                <Badge
                    className={getStatusColor(request.status)}
                    variant="outline"
                >
                    {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                </Badge>
            ),
        },
        {
            label: 'Actions',
            key: 'actions',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (request) => (
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
                                                'admin.withdrawal-requests.show',
                                                request.id,
                                            ),
                                        )
                                    }
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {request.status === 'pending' && (
                        <>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                router.patch(
                                                    route(
                                                        'admin.withdrawal-requests.approve',
                                                        request.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Approve request</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                router.patch(
                                                    route(
                                                        'admin.withdrawal-requests.reject',
                                                        request.id,
                                                    ),
                                                )
                                            }
                                        >
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Reject request</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const filterOptions = {
        searchEnabled: false,
        selectFilters: {
            status: {
                label: 'Status',
                placeholder: 'Filter by status',
                allLabel: statuses['all'],
                options: Object.entries(statuses)
                    .filter(([value]) => value !== 'all')
                    .map(([value, label]) => ({ value, label })),
            },
        },
    };

    const emptyState = {
        icon: <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No withdrawal requests found',
        description: 'No withdrawal requests at this time.',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Withdrawal Requests" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
                </div>

                <TableTemplate
                    title="Withdrawal Requests"
                    description="Manage instructor withdrawal requests"
                    columns={columns}
                    data={withdrawalRequests}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="admin.withdrawal-requests.index"
                    emptyState={emptyState}
                />
            </div>
        </AuthenticatedLayout>
    );
}
