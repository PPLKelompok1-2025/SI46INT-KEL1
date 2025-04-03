import StarRating from '@/Components/StarRating';
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
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertCircle,
    CheckCircle,
    Edit,
    Eye,
    Filter,
    Star,
    Trash,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({
    reviews,
    filters = {},
    courses,
    instructors,
    stats,
}) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const confirmDelete = (review) => {
        setReviewToDelete(review);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        router.delete(route('admin.reviews.destroy', reviewToDelete.id), {
            preserveScroll: true,
            // onError: (err) => {
            //     toast.error('Failed to delete review', err.message);
            // },
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setReviewToDelete(null);
                // toast.success('Review deleted!');
            },
        });
    };

    const handleApprove = (review) => {
        router.patch(route('admin.reviews.approve', review.id), {
            preserveScroll: true,
            // onError: (err) => {
            //     toast.error(
            //         `Failed to ${review.is_approved ? 'un' : ''}approve review`,
            //         err.message,
            //     );
            // },
            onSuccess: () => {
                setReviewToDelete(null);
                // toast.success('Review approved!');
            },
        });
    };

    const columns = [
        {
            label: 'Rating',
            key: 'rating',
            className: 'w-[80px]',
            render: (review) => (
                <div className="flex items-center">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="ml-1 text-sm">{review.rating}</span>
                </div>
            ),
        },
        {
            label: 'Review',
            key: 'comment',
            render: (review) => (
                <div className="max-w-xs truncate">
                    {review.comment
                        ? review.comment.substring(0, 100) +
                          (review.comment.length > 100 ? '...' : '')
                        : 'No comment'}
                </div>
            ),
        },
        {
            label: 'Course',
            key: 'course.title',
            render: (review) => (
                <Link
                    href={route('admin.reviews.course', review.course.id)}
                    className="text-blue-600 hover:underline"
                >
                    {review.course.title}
                </Link>
            ),
        },
        {
            label: 'Student',
            key: 'user.name',
            render: (review) => review.user.name,
        },
        {
            label: 'Instructor',
            key: 'course.user.name',
            render: (review) => review.course.user.name,
        },
        {
            label: 'Date',
            key: 'created_at',
            className: 'w-[100px]',
            render: (review) => (
                <span className="text-sm">
                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                </span>
            ),
        },
        {
            label: 'Status',
            key: 'is_reported',
            className: 'w-[100px]',
            render: (review) =>
                review.is_reported ? (
                    <Badge variant="destructive">Reported</Badge>
                ) : (
                    <Badge variant="outline">Active</Badge>
                ),
        },
        {
            label: 'Actions',
            key: 'actions',
            className: 'w-[100px] text-right',
            cellClassName: 'text-right',
            render: (review) => (
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.reviews.show', review.id)}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleApprove(review)}
                    >
                        <CheckCircle
                            className={
                                ('h-4 w-4',
                                !review.is_approved
                                    ? 'text-green-500'
                                    : 'text-red-500')
                            }
                        />
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.reviews.edit', review.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => confirmDelete(review)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const filterOptions = {
        searchEnabled: true,
        searchPlaceholder: 'Search reviews...',
        selectFilters: {
            course_id: {
                label: 'Course',
                placeholder: 'Filter by course',
                allLabel: 'All Courses',
                options: courses.map((course) => ({
                    value: course.id.toString(),
                    label: course.title,
                })),
            },
            instructor_id: {
                label: 'Instructor',
                placeholder: 'Filter by instructor',
                allLabel: 'All Instructors',
                options: instructors.map((instructor) => ({
                    value: instructor.id.toString(),
                    label: instructor.name,
                })),
            },
            rating: {
                label: 'Rating',
                placeholder: 'Filter by rating',
                allLabel: 'All Ratings',
                options: [5, 4, 3, 2, 1].map((rating) => ({
                    value: rating.toString(),
                    label: `${rating} Star${rating !== 1 ? 's' : ''}`,
                })),
            },
            reported: {
                label: 'Status',
                placeholder: 'Filter by status',
                allLabel: 'All Reviews',
                options: [{ value: '1', label: 'Reported Only' }],
            },
        },
        sortOptions: [
            { value: 'created_at_desc', label: 'Newest First' },
            { value: 'created_at_asc', label: 'Oldest First' },
            { value: 'rating_desc', label: 'Rating High to Low' },
            { value: 'rating_asc', label: 'Rating Low to High' },
        ],
        defaultSort: filters.sort || 'created_at_desc',
    };

    const statsConfig = {
        items: [
            {
                title: 'Total Reviews',
                value: stats.total,
                description: 'From all students',
                icon: <Eye className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Reported Reviews',
                value: stats.reported,
                description: 'Flagged by users',
                icon: <AlertCircle className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Average Rating',
                value: stats.average_rating,
                description: 'Across all courses',
                icon: <Star className="h-4 w-4 text-muted-foreground" />,
            },
        ],
    };

    const emptyState = {
        icon: <Filter className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No reviews found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription: 'There are no reviews in the system yet.',
    };

    return (
        <AuthenticatedLayout>
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

                <TableTemplate
                    title="Reviews"
                    description="Manage course reviews across the platform"
                    columns={columns}
                    data={reviews}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="admin.reviews.index"
                    stats={statsConfig}
                    emptyState={emptyState}
                />
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
