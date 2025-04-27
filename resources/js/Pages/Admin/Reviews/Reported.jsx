import StarRating from '@/Components/StarRating';
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
import { AlertCircle, CheckCircle, Edit, Eye, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Reported({ auth, reviews }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [reviewToApprove, setReviewToApprove] = useState(null);

    const confirmDelete = (review) => {
        setReviewToDelete(review);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        router.delete(route('admin.reviews.destroy', reviewToDelete.id), {
            onSuccess: () => setDeleteDialogOpen(false),
        });
    };

    const confirmApprove = (review) => {
        setReviewToApprove(review);
        setApproveDialogOpen(true);
    };

    const handleApprove = () => {
        router.patch(
            route('admin.reviews.approve-reported', reviewToApprove.id),
            {},
            {
                onSuccess: () => setApproveDialogOpen(false),
            },
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reported Reviews" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-bold">
                                        Reported Reviews
                                    </CardTitle>
                                    <CardDescription>
                                        Reviews that have been flagged by
                                        instructors as inappropriate
                                    </CardDescription>
                                </div>
                                <Link href={route('admin.reviews.index')}>
                                    <Button variant="outline">
                                        Back to All Reviews
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {reviews.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-medium">
                                        No reported reviews
                                    </h3>
                                    <p className="text-muted-foreground">
                                        There are currently no reviews that have
                                        been reported by instructors.
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
                                            <TableHead>Course</TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Instructor</TableHead>
                                            <TableHead className="w-[100px]">
                                                Date
                                            </TableHead>
                                            <TableHead className="w-[150px] text-right">
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
                                                            review.course.id,
                                                        )}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {review.course.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {review.user.name}
                                                </TableCell>
                                                <TableCell>
                                                    {review.course.user.name}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {format(
                                                        new Date(
                                                            review.created_at,
                                                        ),
                                                        'MMM d, yyyy',
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
                                                                confirmApprove(
                                                                    review,
                                                                )
                                                            }
                                                            title="Approve review (remove reported flag)"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    review,
                                                                )
                                                            }
                                                            title="Delete review"
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
                                                link.label.includes('Previous')
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
                                                            router.visit(
                                                                link.url,
                                                            )
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
            </div>

            {/* Delete Confirmation Dialog */}
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

            {/* Approve Confirmation Dialog */}
            <Dialog
                open={approveDialogOpen}
                onOpenChange={setApproveDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Review</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this review? This
                            will remove the reported flag and mark it as
                            appropriate.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="default" onClick={handleApprove}>
                            Approve Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
