import TableTemplate from '@/Components/TableTemplate';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Edit,
    Eye,
    PlusCircle,
    Tag,
    Trash,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ promoCodes, filters = {}, stats }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [promoCodeToDelete, setPromoCodeToDelete] = useState(null);

    const confirmDelete = (promoCode) => {
        if (promoCode.transactions_count > 0) {
            return;
        }
        setPromoCodeToDelete(promoCode);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        router.delete(
            route('admin.promo-codes.destroy', promoCodeToDelete.id),
            {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPromoCodeToDelete(null);
                },
            },
        );
    };

    const toggleActive = (promoCode) => {
        router.patch(
            route('admin.promo-codes.toggle-active', promoCode.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const isExpired = (promoCode) => {
        if (!promoCode.is_active) return true;
        if (promoCode.end_date && new Date(promoCode.end_date) < new Date())
            return true;
        if (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses)
            return true;
        return false;
    };

    const columns = [
        {
            label: 'Code',
            key: 'code',
            render: (promoCode) => (
                <div>
                    <div className="font-medium">{promoCode.code}</div>
                    {promoCode.description && (
                        <div className="text-xs text-muted-foreground">
                            {promoCode.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            label: 'Type',
            key: 'discount_type',
            render: (promoCode) => (
                <Badge variant="outline">
                    {promoCode.discount_type === 'percentage'
                        ? 'Percentage'
                        : 'Fixed'}
                </Badge>
            ),
        },
        {
            label: 'Value',
            key: 'discount_value',
            render: (promoCode) => (
                <span className="font-medium">
                    {promoCode.discount_type === 'percentage'
                        ? `${promoCode.discount_value}%`
                        : formatCurrency(promoCode.discount_value)}
                </span>
            ),
        },
        {
            label: 'Usage',
            key: 'used_count',
            render: (promoCode) => (
                <div>
                    <div>
                        {promoCode.used_count}/{promoCode.max_uses ?? '∞'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {promoCode.transactions_count} transactions
                    </div>
                </div>
            ),
        },
        {
            label: 'Valid Until',
            key: 'end_date',
            render: (promoCode) => formatDate(promoCode.end_date),
        },
        {
            label: 'Status',
            key: 'is_active',
            render: (promoCode) =>
                isExpired(promoCode) ? (
                    <span className="flex items-center text-destructive">
                        <XCircle className="mr-1 h-4 w-4" />
                        Expired
                    </span>
                ) : (
                    <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Active
                    </span>
                ),
        },
        {
            label: 'Actions',
            key: 'actions',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (promoCode) => (
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link
                            href={route('admin.promo-codes.show', promoCode.id)}
                        >
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link
                            href={route('admin.promo-codes.edit', promoCode.id)}
                        >
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleActive(promoCode)}
                    >
                        {promoCode.is_active ? (
                            <XCircle className="h-4 w-4" />
                        ) : (
                            <CheckCircle className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => confirmDelete(promoCode)}
                        disabled={promoCode.transactions_count > 0}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const filterOptions = {
        searchEnabled: true,
        searchPlaceholder: 'Search promo codes...',
        selectFilters: {
            status: {
                label: 'Status',
                placeholder: 'Filter by status',
                allLabel: 'All Status',
                options: [
                    { value: 'active', label: 'Active' },
                    { value: 'expired', label: 'Expired' },
                ],
            },
        },
        sortOptions: [
            { value: 'created_at_desc', label: 'Newest First' },
            { value: 'created_at_asc', label: 'Oldest First' },
            { value: 'code_asc', label: 'Code (A-Z)' },
            { value: 'code_desc', label: 'Code (Z-A)' },
            { value: 'usage_desc', label: 'Most Used' },
            { value: 'usage_asc', label: 'Least Used' },
        ],
        defaultSort: filters.sort || 'created_at_desc',
    };

    const statsConfig = {
        items: [
            {
                title: 'Total Promo Codes',
                value: stats.total,
                description: `${stats.active} active, ${stats.expired} expired`,
                icon: <Tag className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Used Promo Codes',
                value: stats.used,
                description: `${stats.totalTransactions} transactions`,
                icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Total Discounts',
                value: formatCurrency(stats.totalDiscounts),
                description: 'Across all transactions',
                icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
            },
        ],
    };

    const emptyState = {
        icon: <Tag className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No promo codes found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription: 'There are no promo codes in the system yet.',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Promo Codes" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Promo Codes</h1>
                    <Button asChild>
                        <Link href={route('admin.promo-codes.create')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Promo Code
                        </Link>
                    </Button>
                </div>

                <TableTemplate
                    title="Promo Codes"
                    description="Manage promotional codes across the platform"
                    columns={columns}
                    data={promoCodes}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="admin.promo-codes.index"
                    stats={statsConfig}
                    emptyState={emptyState}
                />
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Promo Code</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the promo code "
                            {promoCodeToDelete?.code}"? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
