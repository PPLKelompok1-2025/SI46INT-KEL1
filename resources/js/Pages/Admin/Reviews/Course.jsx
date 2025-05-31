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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, Eye, Trash, User } from 'lucide-react';
import { useState } from 'react';

export default function Course({ course, reviews }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    // Calculate average rating
    const avgRating =
        reviews.data.length > 0
            ? reviews.data.reduce((sum, review) => sum + review.rating, 0) /
              reviews.data.length
            : 0;

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
        <AuthenticatedLayout>
            <Head title={`${course.title} - Reviews`} />

            <div className="sm:px-6 lg:px-8">
                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">
                                    Reviews for: {course.title}
                                </CardTitle>
                                <div className="mt-2 flex items-center">
                                    <StarRating rating={avgRating} />
                                    <span className="ml-2 text-gray-600">
                                        {avgRating.toFixed(1)}/5 (
                                        {reviews.data.length}{' '}
                                        {reviews.data.length === 1
                                            ? 'review'
                                            : 'reviews'}
                                        )
                                    </span>
                                </div>
                                <CardDescription className="mt-2">
                                    Instructor: {course.user.name}
                                </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.reviews.index')}>
                                        Back to All Reviews
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {reviews.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <User className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">
                                    No reviews yet
                                </h3>
                                <p className="text-muted-foreground">
                                    This course doesn't have any reviews yet.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">
                                            Rating
                                        </TableHead>
                                        <TableHead>Review</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Responses</TableHead>
                                        <TableHead className="w-[100px]">
                                            Date
                                        </TableHead>
                                        <TableHead className="w-[100px]">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right">
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
                                                        rating={review.rating}
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
                                                      (review.comment.length >
                                                      100
                                                          ? '...'
                                                          : '')
                                                    : 'No comment'}
                                            </TableCell>
                                            <TableCell>
                                                {review.user.name}
                                            </TableCell>
                                            <TableCell>
                                                {review.instructor_response && (
                                                    <Badge
                                                        variant="outline"
                                                        className="mr-2"
                                                    >
                                                        Instructor
                                                    </Badge>
                                                )}
                                                {review.admin_response && (
                                                    <Badge variant="secondary">
                                                        Admin
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {format(
                                                    new Date(review.created_at),
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
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <div className="mt-4">
                            <Pagination>
                                <PaginationContent>
                                    {reviews.links.map((link, i) => {
                                        if (!link.url && link.label === '...') {
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        if (link.label.includes('Previous')) {
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationPrevious
                                                        onClick={() =>
                                                            link.url &&
                                                            router.visit(
                                                                link.url,
                                                            )
                                                        }
                                                        disabled={!link.url}
                                                        className={
                                                            !link.url
                                                                ? 'pointer-events-none opacity-50'
                                                                : 'cursor-pointer'
                                                        }
                                                    />
                                                </PaginationItem>
                                            );
                                        }

                                        if (link.label.includes('Next')) {
                                            return (
                                                <PaginationItem key={i}>
                                                    <PaginationNext
                                                        onClick={() =>
                                                            link.url &&
                                                            router.visit(
                                                                link.url,
                                                            )
                                                        }
                                                        disabled={!link.url}
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
                                                        router.visit(link.url)
                                                    }
                                                    isActive={link.active}
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
