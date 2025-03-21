import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Edit,
    Eye,
    PlusCircle,
    Search,
    Tag,
    Trash,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ promoCodes, filters, stats }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [promoCodeToDelete, setPromoCodeToDelete] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters({ search: searchTerm });
    };

    const applyFilters = (newFilters) => {
        router.get(
            route('admin.promo-codes.index'),
            {
                ...filters,
                ...newFilters,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const resetFilters = () => {
        router.get(
            route('admin.promo-codes.index'),
            {},
            { preserveState: true },
        );
    };

    const handleStatusChange = (status) => {
        applyFilters({ status: status === filters.status ? null : status });
    };

    const handleSortChange = (sort) => {
        applyFilters({ sort });
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
                onSuccess: () => setDeleteDialogOpen(false),
            },
        );
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

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Promo Codes
                            </CardTitle>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Active Promo Codes
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.active}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Discount Amount
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.totalDiscounts)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Promo Codes</CardTitle>
                        <CardDescription>
                            Manage promotional codes across the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search promo codes..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        handleSearch(e);
                                    }}
                                />
                            </div>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) =>
                                    handleStatusChange(value)
                                }
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="expired">
                                        Expired
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.sort || 'created_at_desc'}
                                onValueChange={handleSortChange}
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
                                    <SelectItem value="code_asc">
                                        Code (A-Z)
                                    </SelectItem>
                                    <SelectItem value="code_desc">
                                        Code (Z-A)
                                    </SelectItem>
                                    <SelectItem value="usage_desc">
                                        Most Used
                                    </SelectItem>
                                    <SelectItem value="usage_asc">
                                        Least Used
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {(filters.search || filters.status !== 'all') && (
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="whitespace-nowrap"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>

                        {promoCodes.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">
                                    No promo codes found
                                </h3>
                                <p className="text-muted-foreground">
                                    {filters.search || filters.status !== 'all'
                                        ? "Try adjusting your search or filter to find what you're looking for."
                                        : 'There are no promo codes in the system yet.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Usage</TableHead>
                                                <TableHead>
                                                    Valid Until
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {promoCodes.data.map(
                                                (promoCode) => (
                                                    <TableRow
                                                        key={promoCode.id}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div>
                                                                {promoCode.code}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    promoCode.description
                                                                }
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {promoCode.discount_type ===
                                                            'percentage'
                                                                ? 'Percentage'
                                                                : 'Fixed'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {promoCode.discount_type ===
                                                            'percentage'
                                                                ? `${promoCode.discount_value}%`
                                                                : formatCurrency(
                                                                      promoCode.discount_value,
                                                                  )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                {
                                                                    promoCode.used_count
                                                                }
                                                                /
                                                                {promoCode.max_uses ??
                                                                    '∞'}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {
                                                                    promoCode.transactions_count
                                                                }{' '}
                                                                transactions
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDate(
                                                                promoCode.end_date,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {isExpired(
                                                                promoCode,
                                                            ) ? (
                                                                <span className="flex items-center text-destructive">
                                                                    <XCircle className="mr-1 h-4 w-4" />
                                                                    Expired
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center text-green-600">
                                                                    <CheckCircle className="mr-1 h-4 w-4" />
                                                                    Active
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'admin.promo-codes.show',
                                                                            promoCode.id,
                                                                        )}
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'admin.promo-codes.edit',
                                                                            promoCode.id,
                                                                        )}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        toggleActive(
                                                                            promoCode,
                                                                        )
                                                                    }
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
                                                                    onClick={() =>
                                                                        confirmDelete(
                                                                            promoCode,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        promoCode.transactions_count >
                                                                        0
                                                                    }
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                <div className="mt-4">
                                    <Pagination className="justify-end">
                                        <PaginationContent>
                                            {promoCodes.links.map((link, i) => {
                                                if (
                                                    !link.url &&
                                                    link.label === '...'
                                                ) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    );
                                                }

                                                if (
                                                    link.label.includes(
                                                        'Previous',
                                                    )
                                                ) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationPrevious
                                                                onClick={() =>
                                                                    link.url &&
                                                                    router.visit(
                                                                        link.url,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !link.url
                                                                }
                                                                className={
                                                                    !link.url
                                                                        ? 'pointer-events-none opacity-50'
                                                                        : 'cursor-pointer'
                                                                }
                                                            />
                                                        </PaginationItem>
                                                    );
                                                }

                                                if (
                                                    link.label.includes('Next')
                                                ) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationNext
                                                                onClick={() =>
                                                                    link.url &&
                                                                    router.visit(
                                                                        link.url,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !link.url
                                                                }
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
                                                                router.visit(
                                                                    link.url,
                                                                )
                                                            }
                                                            isActive={
                                                                link.active
                                                            }
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
                            </>
                        )}
                    </CardContent>
                </Card>
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
