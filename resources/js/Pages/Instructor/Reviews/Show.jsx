import InputError from '@/Components/InputError';
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
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function ReviewShow({ review }) {
    const [showReportModal, setShowReportModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        response: '',
    });

    const handleSubmitResponse = (e) => {
        e.preventDefault();
        post(route('instructor.reviews.respond', review.id), {
            onSuccess: () => reset(),
        });
    };

    const handleReportReview = () => {
        post(route('instructor.reviews.report', review.id), {
            onSuccess: () => setShowReportModal(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Review Details" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Review Details</h1>
                    <div className="flex space-x-3">
                        <Button variant="outline" asChild>
                            <Link
                                href={route(
                                    'instructor.reviews.course',
                                    review.course.id,
                                )}
                                prefetch="hover"
                            >
                                All Course Reviews
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link
                                href={route('instructor.reviews.index')}
                                prefetch="hover"
                            >
                                All Reviews
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Review for {review.course.title}</CardTitle>
                        <CardDescription>
                            <div className="flex items-center">
                                <StarRating rating={review.rating} max={5} />
                                <span className="ml-2 text-muted-foreground">
                                    {review.rating}/5
                                </span>
                                {review.is_reported && (
                                    <span className="ml-4 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                        Reported to Admins
                                    </span>
                                )}
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-medium">
                                    Review Content:
                                </h3>
                                <p className="mt-2 whitespace-pre-line text-gray-700">
                                    {review.comment}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">
                                    By: {review.user.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {format(
                                        new Date(review.created_at),
                                        'MMM d, yyyy',
                                    )}
                                </p>
                            </div>
                        </div>

                        {review.instructor_response && (
                            <div className="rounded-md bg-blue-50 p-4">
                                <h3 className="text-lg font-medium text-blue-800">
                                    Your Response:
                                </h3>
                                <p className="mt-2 whitespace-pre-line text-gray-700">
                                    {review.instructor_response}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {review.response_date &&
                                        format(
                                            new Date(review.response_date),
                                            'MMM d, yyyy',
                                        )}
                                </p>
                            </div>
                        )}

                        {!review.instructor_response && (
                            <div>
                                <h3 className="text-lg font-medium">
                                    Respond to Review:
                                </h3>
                                <form
                                    onSubmit={handleSubmitResponse}
                                    className="mt-2"
                                >
                                    <Textarea
                                        name="response"
                                        value={data.response}
                                        onChange={(e) =>
                                            setData('response', e.target.value)
                                        }
                                        className="w-full"
                                        rows={4}
                                        placeholder="Enter your response to this review..."
                                    />
                                    <InputError
                                        message={errors.response}
                                        className="mt-2"
                                    />

                                    <div className="mt-4">
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

                        {!review.is_reported && (
                            <div className="border-t pt-4">
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowReportModal(true)}
                                >
                                    Report Inappropriate Review
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Report Confirmation Modal */}
            <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Review</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to report this review as
                            inappropriate? This will notify administrators to
                            review this content.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowReportModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReportReview}
                            disabled={processing}
                        >
                            {processing ? 'Reporting...' : 'Report Review'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
