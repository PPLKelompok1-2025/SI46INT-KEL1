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
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CheckCircle, Edit, MessageSquare, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Show({ auth, review }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        response: '',
    });

    const handleSubmitResponse = (e) => {
        e.preventDefault();
        post(route('admin.reviews.respond', review.id), {
            onSuccess: () => reset(),
        });
    };

    const handleApprove = () => {
        router.patch(
            route('admin.reviews.approve-reported', review.id),
            {},
            {
                onSuccess: () => setApproveDialogOpen(false),
            },
        );
    };

    const handleDelete = () => {
        router.delete(route('admin.reviews.destroy', review.id), {
            onSuccess: () => router.visit(route('admin.reviews.index')),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Review Details" />

            <div className="sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">
                                    Review Details
                                </CardTitle>
                                <CardDescription>
                                    Review for course:{' '}
                                    <Link
                                        href={route(
                                            'admin.reviews.course',
                                            review.course.id,
                                        )}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {review.course.title}
                                    </Link>
                                </CardDescription>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.reviews.index')}>
                                        Back to All Reviews
                                    </Link>
                                </Button>
                                {review.is_reported && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setApproveDialogOpen(true)
                                        }
                                        className="flex items-center"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve Review
                                    </Button>
                                )}
                                <Button variant="outline" asChild>
                                    <Link
                                        href={route(
                                            'admin.reviews.edit',
                                            review.id,
                                        )}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-lg bg-gray-50 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <StarRating
                                            rating={review.rating}
                                            size="md"
                                        />
                                        <span className="text-lg font-medium">
                                            {review.rating}/5
                                        </span>
                                        {review.is_reported && (
                                            <Badge variant="destructive">
                                                Reported
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        By: {review.user.name} (
                                        {review.user.email})
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {format(
                                        new Date(review.created_at),
                                        'MMMM d, yyyy',
                                    )}
                                </p>
                            </div>
                            <Separator className="my-4" />
                            <div className="prose max-w-none">
                                <h3 className="mb-2 text-lg font-medium">
                                    Review Content:
                                </h3>
                                <p className="whitespace-pre-line">
                                    {review.comment}
                                </p>
                            </div>
                        </div>

                        {/* Instructor Response Section */}
                        {review.instructor_response && (
                            <div className="rounded-lg bg-blue-50 p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-blue-800">
                                        Instructor Response:
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {format(
                                            new Date(review.response_date),
                                            'MMMM d, yyyy',
                                        )}
                                    </p>
                                </div>
                                <Separator className="my-3 bg-blue-200" />
                                <p className="whitespace-pre-line">
                                    {review.instructor_response}
                                </p>
                                <p className="mt-2 text-sm text-blue-600">
                                    By: {review.course.user.name}
                                </p>
                            </div>
                        )}

                        {/* Admin Response Section */}
                        {review.admin_response ? (
                            <div className="rounded-lg bg-purple-50 p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-purple-800">
                                        Admin Response:
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {format(
                                            new Date(
                                                review.admin_response_date,
                                            ),
                                            'MMMM d, yyyy',
                                        )}
                                    </p>
                                </div>
                                <Separator className="my-3 bg-purple-200" />
                                <p className="whitespace-pre-line">
                                    {review.admin_response}
                                </p>
                                <p className="mt-2 text-sm text-purple-600">
                                    By Admin: {auth.user.name}
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-gray-200 p-6">
                                <h3 className="mb-4 flex items-center text-lg font-medium">
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    Add Admin Response
                                </h3>
                                <form onSubmit={handleSubmitResponse}>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="response">
                                                Your Response
                                            </Label>
                                            <Textarea
                                                id="response"
                                                placeholder="Write your response to this review..."
                                                rows={5}
                                                value={data.response}
                                                onChange={(e) =>
                                                    setData(
                                                        'response',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            {errors.response && (
                                                <p className="text-sm text-red-500">
                                                    {errors.response}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Submitting...'
                                                : 'Submit Response'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>
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
                        <Button onClick={handleApprove}>Approve Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
