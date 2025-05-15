import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router, useForm, WhenVisible } from '@inertiajs/react';
import { debounce } from 'lodash';
import {
    BookOpen,
    ChevronDown,
    Filter,
    FolderTree,
    Layers,
    Search,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function Index({
    parentCategories,
    allCategories,
    filters,
    page,
    allPage,
    isNextPageExists,
    isAllNextPageExists,
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchInputValue, setSearchInputValue] = useState(
        filters?.search || '',
    );

    const { data, setData } = useForm({
        search: filters?.search || '',
        sort: filters?.sort || 'name_asc',
    });

    const debouncedSearch = useCallback(
        debounce((value) => {
            setData('search', value);
            router.get(
                route('categories.index'),
                {
                    search: value,
                    sort: data.sort,
                    page: 1,
                    allPage: 1,
                },
                {
                    preserveState: false,
                    preserveScroll: true,
                    only: [],
                },
            );
        }, 500),
        [data.sort],
    );

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInputValue(value);
        debouncedSearch(value);
    };

    const handleFilterChange = (field, value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));

        router.get(
            route('categories.index'),
            {
                ...data,
                [field]: value,
                page: 1,
                allPage: 1,
            },
            {
                preserveState: false,
                preserveScroll: true,
                only: [],
            },
        );
    };

    const resetFilters = () => {
        setSearchInputValue('');
        router.get(route('categories.index'), {}, { preserveState: false });
    };

    return (
        <PublicLayout>
            <Head title="Categories" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold">Browse Categories</h1>
                <p className="mt-2 text-muted-foreground">
                    Explore our wide range of categories and find the perfect
                    course for you
                </p>
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search categories..."
                        value={searchInputValue}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                </div>

                <Button
                    variant="outline"
                    className="sm:w-auto"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    <ChevronDown
                        className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                    />
                </Button>

                <select
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={data.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="courses_high">Courses (High to Low)</option>
                    <option value="courses_low">Courses (Low to High)</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                </select>
            </div>

            {showFilters && (
                <div className="mb-8 rounded-lg border p-4">
                    <div>
                        <p className="mb-2 text-sm text-muted-foreground">
                            Use the search box to find categories by name or
                            description. Sort the results using the dropdown
                            menu above.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-2"
                            onClick={resetFilters}
                        >
                            Reset All Filters
                        </Button>
                    </div>
                </div>
            )}

            <div className="mb-10">
                <h2 className="mb-4 text-2xl font-semibold">
                    Parent Categories
                </h2>

                {parentCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <FolderTree className="mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-medium">
                            No categories found
                        </h3>
                        <p className="text-sm text-gray-500">
                            {data.search
                                ? 'Try adjusting your search criteria'
                                : 'Check back later for new categories'}
                        </p>
                        {data.search && (
                            <Button onClick={resetFilters}>Clear Search</Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {parentCategories.map((category) => (
                                <Card
                                    key={category.id}
                                    className="overflow-hidden"
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-xl">
                                            <Link
                                                href={route(
                                                    'categories.show',
                                                    category.slug,
                                                )}
                                                className="hover:text-primary hover:underline"
                                                prefetch="hover"
                                            >
                                                {category.name}
                                            </Link>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <p className="line-clamp-2 text-muted-foreground">
                                            {category.description ||
                                                'Explore courses in this category'}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex items-center justify-between border-t bg-muted/40 px-6 py-3">
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant="secondary"
                                                className="flex items-center gap-1"
                                            >
                                                <BookOpen className="h-3 w-3" />
                                                {category.courses_count} Course
                                                {category.courses_count !== 1 &&
                                                    's'}
                                            </Badge>

                                            {category.children?.length > 0 && (
                                                <Badge
                                                    variant="outline"
                                                    className="flex items-center gap-1"
                                                >
                                                    <Layers className="h-3 w-3" />
                                                    {category.children.length}{' '}
                                                    Subcategor
                                                    {category.children
                                                        .length !== 1
                                                        ? 'ies'
                                                        : 'y'}
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={route(
                                                    'categories.show',
                                                    category.slug,
                                                )}
                                                prefetch="hover"
                                            >
                                                Explore
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {isNextPageExists && (
                            <div className="mt-8">
                                <WhenVisible
                                    always
                                    params={{
                                        data: {
                                            page: Number(page) + 1,
                                            allPage: allPage,
                                            search: data.search,
                                            sort: data.sort,
                                        },
                                        only: [
                                            'parentCategories',
                                            'page',
                                            'isNextPageExists',
                                        ],
                                    }}
                                    fallback={
                                        <div className="flex justify-center">
                                            <p className="text-muted-foreground">
                                                You've reached the end of parent
                                                categories.
                                            </p>
                                        </div>
                                    }
                                >
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    </div>
                                </WhenVisible>
                            </div>
                        )}
                    </>
                )}
            </div>

            {allCategories.length > 0 && (
                <div className="mt-12">
                    <h2 className="mb-4 text-2xl font-semibold">
                        All Categories
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {allCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={route('categories.show', category.slug)}
                                className="rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/50"
                                prefetch="hover"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        {category.name}
                                    </span>
                                    <Badge variant="secondary" className="ml-2">
                                        {category.courses_count}
                                    </Badge>
                                </div>
                                {category.parent_id && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Subcategory
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>

                    {isAllNextPageExists && (
                        <div className="mt-8">
                            <WhenVisible
                                always
                                params={{
                                    data: {
                                        page: page,
                                        allPage: Number(allPage) + 1,
                                        search: data.search,
                                        sort: data.sort,
                                    },
                                    only: [
                                        'allCategories',
                                        'allPage',
                                        'isAllNextPageExists',
                                    ],
                                }}
                                fallback={
                                    <div className="mt-4 flex justify-center">
                                        <p className="text-muted-foreground">
                                            You've reached the end of all
                                            categories.
                                        </p>
                                    </div>
                                }
                            >
                                <div className="mt-4 flex justify-center">
                                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                </div>
                            </WhenVisible>
                        </div>
                    )}
                </div>
            )}
        </PublicLayout>
    );
}
