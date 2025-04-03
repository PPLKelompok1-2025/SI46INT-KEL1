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
import { router, useForm } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Search } from 'lucide-react';
import { useCallback } from 'react';

/**
 * A reusable table component with filtering, sorting, and pagination.
 *
 * @param {Object} props
 * @param {Array} props.columns - Array of column configuration objects
 * @param {Object} props.data - Object with data array and pagination links
 * @param {Object} props.filterOptions - Object with filter configurations
 * @param {Object} props.filters - Current active filters
 * @param {String} props.routeName - Route name for navigation
 * @param {Object} props.stats - Optional stats to display above the table
 * @param {Object} props.emptyState - Configuration for empty state display
 * @param {String} props.title - Table title
 * @param {String} props.description - Table description
 */
export default function TableTemplate({
    columns,
    data,
    filterOptions,
    filters = {},
    routeName,
    stats,
    emptyState = {
        icon: null,
        title: 'No data found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription: 'There is no data in the system yet.',
    },
    title = 'Data Table',
    description = 'Manage your data',
}) {
    const { data: formData, setData } = useForm({
        search: filters.search || '',
        ...Object.fromEntries(
            Object.entries(filterOptions.selectFilters || {}).map(([key]) => [
                key,
                filters[key] || 'all',
            ]),
        ),
        sort: filters.sort || filterOptions.defaultSort || 'created_at_desc',
    });

    const debouncedSearch = debounce((value) => {
        setData('search', value);
        applyFilters();
    }, 500);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setData('search', value);
        debouncedSearch(value);
    };

    const applyFilters = useCallback(() => {
        router.get(
            route(routeName),
            { ...formData },
            {
                preserveState: false,
                preserveScroll: true,
                only: [],
            },
        );
    }, [formData, routeName]);

    const handleFilterChange = (field, value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));

        router.get(
            route(routeName),
            {
                ...formData,
                [field]: value,
            },
            {
                preserveState: false,
                preserveScroll: true,
                only: [],
            },
        );
    };

    const resetFilters = () => {
        router.get(route(routeName), {}, { preserveState: false });
    };
    const hasActiveFilters = useCallback(() => {
        return (
            formData.search ||
            Object.entries(filterOptions.selectFilters || {}).some(
                ([key]) => formData[key] !== 'all',
            )
        );
    }, [formData, filterOptions.selectFilters]);

    const renderStats = () => {
        if (!stats || !stats.items || stats.items.length === 0) return null;

        return (
            <div
                className={`grid gap-4 md:grid-cols-2 lg:grid-cols-${Math.min(stats.items.length, 5)}`}
            >
                {stats.items.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            {stat.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stat.value}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {stats && renderStats()}

            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                        {filterOptions.searchEnabled && (
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder={
                                        filterOptions.searchPlaceholder ||
                                        'Search...'
                                    }
                                    className="pl-8"
                                    value={formData.search}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        )}

                        {filterOptions.selectFilters &&
                            Object.entries(filterOptions.selectFilters).map(
                                ([key, filter]) => (
                                    <Select
                                        key={key}
                                        value={formData[key]}
                                        onValueChange={(value) =>
                                            handleFilterChange(key, value)
                                        }
                                    >
                                        <SelectTrigger className="w-full sm:w-[180px]">
                                            <SelectValue
                                                placeholder={filter.placeholder}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                {filter.allLabel ||
                                                    `All ${filter.label}`}
                                            </SelectItem>
                                            {filter.options.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value.toString()}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ),
                            )}

                        {filterOptions.sortOptions && (
                            <Select
                                value={formData.sort}
                                onValueChange={(value) =>
                                    handleFilterChange('sort', value)
                                }
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filterOptions.sortOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {hasActiveFilters() && (
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="whitespace-nowrap"
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {data.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            {emptyState.icon}
                            <h3 className="mb-2 text-lg font-medium">
                                {emptyState.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {hasActiveFilters()
                                    ? emptyState.description
                                    : emptyState.noFilterDescription}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {columns.map((column, index) => (
                                                <TableHead
                                                    key={index}
                                                    className={
                                                        column.className || ''
                                                    }
                                                >
                                                    {column.label}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.data.map((row, rowIndex) => (
                                            <TableRow key={row.id || rowIndex}>
                                                {columns.map(
                                                    (column, colIndex) => (
                                                        <TableCell
                                                            key={colIndex}
                                                            className={
                                                                column.cellClassName ||
                                                                ''
                                                            }
                                                        >
                                                            {column.render
                                                                ? column.render(
                                                                      row,
                                                                  )
                                                                : row[
                                                                      column.key
                                                                  ]}
                                                        </TableCell>
                                                    ),
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {data.links && data.links.length > 3 && (
                                <div className="mt-4">
                                    <Pagination className="justify-end">
                                        <PaginationContent>
                                            {data.links.map((link, i) => {
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
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
