import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
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
    ChevronDown,
    Eye,
    Filter,
    MoreHorizontal,
    PenSquare,
    Plus,
    Search,
    Tag,
    Trash,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ promoCodes, filters, stats }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

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

    return (
        <AuthenticatedLayout>
            <Head title="Promo Codes" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">Promo Codes</h1>
                    <Button asChild>
                        <Link href={route('admin.promo-codes.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Promo Code
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
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
                            <CardTitle className="text-sm font-medium">
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
                            <CardTitle className="text-sm font-medium">
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

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <form
                            onSubmit={handleSearch}
                            className="relative flex-1"
                        >
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <Input
                                placeholder="Search promo codes..."
                                className="w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Status{' '}
                                        {filters.status &&
                                            `(${filters.status})`}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleStatusChange('active')
                                        }
                                    >
                                        <CheckCircle
                                            className={`mr-2 h-4 w-4 ${
                                                filters.status === 'active'
                                                    ? 'text-primary'
                                                    : ''
                                            }`}
                                        />
                                        Active
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleStatusChange('expired')
                                        }
                                    >
                                        <XCircle
                                            className={`mr-2 h-4 w-4 ${
                                                filters.status === 'expired'
                                                    ? 'text-primary'
                                                    : ''
                                            }`}
                                        />
                                        Expired
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        Sort
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleSortChange('created_at_desc')
                                        }
                                    >
                                        Newest First
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleSortChange('created_at_asc')
                                        }
                                    >
                                        Oldest First
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleSortChange('code_asc')
                                        }
                                    >
                                        Code (A-Z)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleSortChange('code_desc')
                                        }
                                    >
                                        Code (Z-A)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleSortChange('usage_desc')
                                        }
                                    >
                                        Most Used
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleSortChange('usage_asc')
                                        }
                                    >
                                        Least Used
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {(filters.search || filters.status) && (
                                <Button variant="ghost" onClick={resetFilters}>
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Valid Until</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-16">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promoCodes.data.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center"
                                        >
                                            No promo codes found
                                        </TableCell>
                                    </TableRow>
                                )}
                                {promoCodes.data.map((promoCode) => (
                                    <TableRow key={promoCode.id}>
                                        <TableCell className="font-medium">
                                            <div>{promoCode.code}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {promoCode.description}
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
                                                {promoCode.used_count}/
                                                {promoCode.max_uses ?? '∞'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {promoCode.transactions_count}{' '}
                                                transactions
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(promoCode.end_date)}
                                        </TableCell>
                                        <TableCell>
                                            {isExpired(promoCode) ? (
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
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">
                                                            Open menu
                                                        </span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route(
                                                                'admin.promo-codes.show',
                                                                promoCode.id,
                                                            )}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route(
                                                                'admin.promo-codes.edit',
                                                                promoCode.id,
                                                            )}
                                                        >
                                                            <PenSquare className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            toggleActive(
                                                                promoCode,
                                                            )
                                                        }
                                                    >
                                                        {promoCode.is_active ? (
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
                                                    </DropdownMenuItem>
                                                    {promoCode.transactions_count ===
                                                        0 && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                if (
                                                                    confirm(
                                                                        'Are you sure you want to delete this promo code?',
                                                                    )
                                                                ) {
                                                                    router.delete(
                                                                        route(
                                                                            'admin.promo-codes.destroy',
                                                                            promoCode.id,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                            className="text-destructive"
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {promoCodes.links && promoCodes.links.length > 3 && (
                        <div className="mt-4 flex justify-center">
                            <div className="flex space-x-1">
                                {promoCodes.links.map((link, i) => {
                                    if (link.url === null) return null;

                                    return (
                                        <Button
                                            key={i}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            onClick={() =>
                                                router.visit(link.url)
                                            }
                                            disabled={link.active}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
