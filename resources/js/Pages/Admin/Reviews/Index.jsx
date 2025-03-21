import StarRating from '@/Components/StarRating';
import { Badge } from '@/Components/ui/badge';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import {
    AlertCircle,
    Edit,
    Eye,
    Filter,
    Search,
    Star,
    Trash,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index({
    auth,
    reviews,
    filters,
    courses,
    instructors,
    stats,
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [courseFilter, setCourseFilter] = useState(
        filters.course_id || 'all',
    );
    const [instructorFilter, setInstructorFilter] = useState(
        filters.instructor_id || 'all',
    );
    const [ratingFilter, setRatingFilter] = useState(filters.rating || 'all');
    const [reportedFilter, setReportedFilter] = useState(
        filters.reported || 'all',
    );
    const [sortFilter, setSortFilter] = useState(
        filters.sort || 'created_at_desc',
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const handleSearch = debounce((value) => {
        applyFilters({ search: value });
    }, 300);

    const applyFilters = (newFilters) => {
        router.get(
            route('admin.reviews.index'),
            {
                ...filters,
                ...newFilters,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilters = () => {
        router.get(route('admin.reviews.index'), {}, { preserveState: true });
    };

    const handleSortChange = (value) => {
        setSortFilter(value);
        applyFilters({ sort: value });
    };

    useEffect(() => {
        setSearchTerm(filters.search || '');
        setCourseFilter(filters.course_id || 'all');
        setInstructorFilter(filters.instructor_id || 'all');
        setRatingFilter(filters.rating || 'all');
        setReportedFilter(filters.reported || 'all');
        setSortFilter(filters.sort || 'created_at_desc');
    }, [filters]);

    const confirmDelete = (review) => {
        setReviewToDelete(review);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        router.delete(route('admin.reviews.destroy', reviewToDelete.id), {
            onSuccess: () => setDeleteDialogOpen(false),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Review Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Review Management</h1>
                    <Link href={route('admin.reviews.reported')}>
                        <Button
                            variant="destructive"
                            className="flex items-center gap-1"
                        >
                            <AlertCircle className="h-4 w-4" />
                            <span>Reported Reviews</span>
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Reviews
                            </CardTitle>
                            <Eye className="h-4 w-4 text-muted-foreground" />
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
                                Reported Reviews
                            </CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.reported}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Average Rating
                            </CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.average_rating}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Reviews</CardTitle>
                        <CardDescription>
                            Manage course reviews across the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search reviews..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                />
                            </div>
                            <Select
                                value={courseFilter}
                                onValueChange={(value) => {
                                    setCourseFilter(value);
                                    applyFilters({ course_id: value });
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Courses
                                    </SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem
                                            key={course.id}
                                            value={course.id.toString()}
                                        >
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={instructorFilter}
                                onValueChange={(value) => {
                                    setInstructorFilter(value);
                                    applyFilters({ instructor_id: value });
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by instructor" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Instructors
                                    </SelectItem>
                                    {instructors.map((instructor) => (
                                        <SelectItem
                                            key={instructor.id}
                                            value={instructor.id.toString()}
                                        >
                                            {instructor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={ratingFilter}
                                onValueChange={(value) => {
                                    setRatingFilter(value);
                                    applyFilters({ rating: value });
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Ratings
                                    </SelectItem>
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <SelectItem
                                            key={rating}
                                            value={rating.toString()}
                                        >
                                            {rating} Star{rating !== 1 && 's'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={reportedFilter}
                                onValueChange={(value) => {
                                    setReportedFilter(value);
                                    applyFilters({ reported: value });
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Reviews
                                    </SelectItem>
                                    <SelectItem value="1">
                                        Reported Only
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={sortFilter}
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
                                    <SelectItem value="rating_desc">
                                        Rating High to Low
                                    </SelectItem>
                                    <SelectItem value="rating_asc">
                                        Rating Low to High
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {(searchTerm ||
                                courseFilter ||
                                instructorFilter ||
                                ratingFilter ||
                                reportedFilter ||
                                sortFilter !== 'created_at_desc') && (
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="whitespace-nowrap"
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>

                        {reviews.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">
                                    No reviews found
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchTerm ||
                                    courseFilter ||
                                    instructorFilter ||
                                    ratingFilter ||
                                    reportedFilter
                                        ? "Try adjusting your filters to find what you're looking for."
                                        : 'There are no reviews in the system yet.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[80px]">
                                                    Rating
                                                </TableHead>
                                                <TableHead>Review</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Student</TableHead>
                                                <TableHead>
                                                    Instructor
                                                </TableHead>
                                                <TableHead className="w-[100px]">
                                                    Date
                                                </TableHead>
                                                <TableHead className="w-[100px]">
                                                    Status
                                                </TableHead>
                                                <TableHead className="w-[100px] text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reviews.data.map((review) => (
                                                <TableRow key={review.id}>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <StarRating
                                                                rating={
                                                                    review.rating
                                                                }
                                                                size="sm"
                                                            />
                                                            <span className="ml-1 text-sm">
                                                                {review.rating}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {review.comment
                                                            ? review.comment.substring(
                                                                  0,
                                                                  100,
                                                              ) +
                                                              (review.comment
                                                                  .length > 100
                                                                  ? '...'
                                                                  : '')
                                                            : 'No comment'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={route(
                                                                'admin.reviews.course',
                                                                review.course
                                                                    .id,
                                                            )}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {
                                                                review.course
                                                                    .title
                                                            }
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        {review.user.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            review.course.user
                                                                .name
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {format(
                                                            new Date(
                                                                review.created_at,
                                                            ),
                                                            'MMM d, yyyy',
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {review.is_reported ? (
                                                            <Badge variant="destructive">
                                                                Reported
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">
                                                                Active
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={route(
                                                                                    'admin.reviews.show',
                                                                                    review.id,
                                                                                )}
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>
                                                                            View
                                                                            review
                                                                            details
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={route(
                                                                                    'admin.reviews.edit',
                                                                                    review.id,
                                                                                )}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>
                                                                            Edit
                                                                            review
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                confirmDelete(
                                                                                    review,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>
                                                                            Delete
                                                                            review
                                                                        </p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="mt-4">
                                    <Pagination className="justify-end">
                                        <PaginationContent>
                                            {reviews.links.map((link, i) => {
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
                        <DialogTitle>Delete Review</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this review? This
                            action cannot be undone.
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
