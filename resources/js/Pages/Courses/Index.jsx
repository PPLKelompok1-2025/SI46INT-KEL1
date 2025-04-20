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
import {
    Head,
    Link,
    router,
    useForm,
    usePage,
    WhenVisible,
} from '@inertiajs/react';
import { debounce } from 'lodash';
import {
    BookOpen,
    ChevronDown,
    Filter,
    Heart,
    Search,
    Star,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({
    courses,
    filters,
    categories,
    levels,
    page,
    isNextPageExists,
}) {
    const { auth } = usePage().props;
    const [showFilters, setShowFilters] = useState(false);

    const { data, setData } = useForm({
        search: filters.search || '',
        category: filters.category || '',
        level: filters.level || '',
        sort: filters.sort || 'latest',
        instructor: filters.instructor || '',
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
            route('courses.index'),
            {
                search: data.search,
                category: data.category,
                level: data.level,
                sort: data.sort,
                instructor: data.instructor,
            },
            {
                preserveState: true,
                preserveScroll: false,
            },
        );
    };

    const handleFilterChange = (field, value) => {
        setData(field, value);
        router.get(
            route('courses.index'),
            {
                ...data,
                [field]: value,
            },
            {
                preserveState: true,
                only: ['courses', 'page', 'isNextPageExists'],
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
        <PublicLayout title="Explore Courses">
            <Head title="Courses" />

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
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Category
                            </label>
                            <select
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                value={data.category}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'category',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                    <Button onClick={() => router.get(route('courses.index'))}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card
                                key={course.id}
                                className="overflow-hidden transition-shadow hover:shadow-md"
                            >
                                <Link
                                    href={route('courses.show', course.slug)}
                                    prefetch="hover"
                                >
                                    <div className="aspect-video w-full overflow-hidden">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="h-full w-full object-cover transition-all hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                                <BookOpen className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <Badge
                                            variant="outline"
                                            className="px-2 py-1 text-xs"
                                        >
                                            {course.category?.name}
                                        </Badge>
                                        <span className="text-sm font-medium">
                                            {course.level}
                                        </span>
                                    </div>
                                    <Link
                                        href={route(
                                            'courses.show',
                                            course.slug,
                                        )}
                                        prefetch="hover"
                                    >
                                        <CardTitle className="line-clamp-2 transition-colors hover:text-primary">
                                            {course.title}
                                        </CardTitle>
                                    </Link>
                                </CardHeader>

                                <CardContent className="pb-2">
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {course.short_description}
                                    </p>

                                    <div className="mt-3 flex items-center text-sm">
                                        <div className="mr-4 flex items-center">
                                            <BookOpen className="mr-1 h-4 w-4" />
                                            <span>
                                                {course.lessons_count} lessons
                                            </span>
                                        </div>
                                        {renderStarRating(
                                            course.average_rating,
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="flex items-center justify-between pt-2">
                                    <div className="text-lg font-bold">
                                        {course.price === 0
                                            ? 'Free'
                                            : `${formatCurrency(course.price)}`}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button asChild>
                                            <Link
                                                href={route(
                                                    'courses.show',
                                                    course.slug,
                                                )}
                                                prefetch="hover"
                                            >
                                                View Course
                                            </Link>
                                        </Button>
                                        {auth?.user && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        'student.courses.wishlist.toggle',
                                                        course.id,
                                                    )}
                                                    method="post"
                                                >
                                                    <Heart
                                                        className={`h-4 w-4 ${course.is_wishlisted ? 'fill-current text-red-500' : ''}`}
                                                    />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
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
                                        category: data.category,
                                        level: data.level,
                                        sort: data.sort,
                                        instructor: data.instructor,
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
                                            You've reached the end.
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
