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
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router, useForm, WhenVisible } from '@inertiajs/react';
import { debounce } from 'lodash';
import {
    BookOpen,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    Layers,
    Search,
    Star,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({
    category,
    courses,
    levels,
    filters,
    page,
    isNextPageExists,
}) {
    const [showFilters, setShowFilters] = useState(false);

    const { data, setData } = useForm({
        search: filters.search || '',
        level: filters.level || '',
        sort: filters.sort || 'latest',
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

    const applyFilters = () => {
        router.get(
            route('categories.show', category.slug),
            {
                search: data.search,
                level: data.level,
                sort: data.sort,
                page: 1,
            },
            {
                preserveState: false,
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = (field, value) => {
        setData((prevData) => ({
            ...prevData,
            [field]: value,
        }));

        const updatedParams = {
            ...data,
            [field]: value,
            page: 1,
        };

        router.get(route('categories.show', category.slug), updatedParams, {
            preserveState: false,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        router.get(
            route('categories.show', category.slug),
            {},
            {
                preserveState: false,
            },
        );
    };

    const renderStarRating = (rating) => {
        const roundedRating = Math.round(Number(rating));
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={
                            i < roundedRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }
                    />
                ))}
                <span className="ml-1 text-sm text-gray-600">
                    ({roundedRating})
                </span>
            </div>
        );
    };

    return (
        <PublicLayout>
            <Head title={category.name} />

            <div className="mb-6">
                <Link
                    href={route('categories.index')}
                    className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Categories
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{category.name}</h1>
                        {category.parent && (
                            <div className="mt-1">
                                <Badge
                                    variant="outline"
                                    className="font-normal"
                                >
                                    <Link
                                        href={route(
                                            'categories.show',
                                            category.parent.slug,
                                        )}
                                        className="hover:underline"
                                    >
                                        {category.parent.name}
                                    </Link>
                                </Badge>
                            </div>
                        )}
                        <p className="mt-2 max-w-3xl text-muted-foreground">
                            {category.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            {category.courses_count} Course
                            {category.courses_count !== 1 && 's'}
                        </Badge>

                        {category.children_count > 0 && (
                            <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                            >
                                <Layers className="h-3.5 w-3.5" />
                                {category.children_count} Subcategor
                                {category.children_count !== 1 ? 'ies' : 'y'}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {category.children.length > 0 && (
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold">
                        Subcategories
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {category.children.map((child) => (
                            <Link
                                key={child.id}
                                href={route('categories.show', child.slug)}
                                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/50"
                            >
                                <span className="font-medium">
                                    {child.name}
                                </span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h2 className="mb-4 text-xl font-semibold">
                    Courses in {category.name}
                </h2>
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search courses..."
                        value={data.search}
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
                    <option value="latest">Latest</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                </select>
            </div>

            {showFilters && (
                <div className="mb-8 rounded-lg border p-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Level
                        </label>
                        <select
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            value={data.level}
                            onChange={(e) =>
                                handleFilterChange('level', e.target.value)
                            }
                        >
                            <option value="">All Levels</option>
                            {levels.map((level) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                    <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium">
                        No courses found
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">
                        Try adjusting your search or filter criteria
                    </p>
                    <Button onClick={resetFilters}>Clear Filters</Button>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="line-clamp-2 text-xl">
                                        <Link
                                            href={route(
                                                'courses.show',
                                                course.slug,
                                            )}
                                            className="hover:text-primary hover:underline"
                                        >
                                            {course.title}
                                        </Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <p className="line-clamp-2 text-muted-foreground">
                                        {course.short_description}
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                        <div className="flex items-center">
                                            <BookOpen className="mr-1 h-4 w-4" />
                                            {course.lessons_count} lessons
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="mr-1 h-4 w-4" />
                                            {course.enrollments_count} students
                                        </div>
                                        <div>
                                            {renderStarRating(
                                                course.average_rating,
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between border-t bg-muted/40 px-6 py-3">
                                    <div className="text-lg font-semibold">
                                        {formatCurrency(course.price)}
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            href={route(
                                                'courses.show',
                                                course.slug,
                                            )}
                                        >
                                            View Course
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
                                        search: data.search,
                                        level: data.level,
                                        sort: data.sort,
                                    },
                                    only: [
                                        'courses',
                                        'page',
                                        'isNextPageExists',
                                    ],
                                }}
                                fallback={
                                    <div className="flex justify-center">
                                        <p className="text-muted-foreground">
                                            You've reached the end of courses.
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
        </PublicLayout>
    );
}
