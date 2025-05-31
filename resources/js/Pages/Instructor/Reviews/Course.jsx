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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';

export default function CourseReviews({ course, reviews }) {
    // Calculate average rating
    const avgRating =
        reviews.data.length > 0
            ? reviews.data.reduce((sum, review) => sum + review.rating, 0) /
              reviews.data.length
            : 0;

    return (
        <AuthenticatedLayout>
            <Head title={`${course.title} - Reviews`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                        Reviews for: {course.title}
                    </h1>
                    <Button asChild>
                        <Link
                            href={route('instructor.reviews.index')}
                            prefetch="hover"
                        >
                            Back to All Reviews
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Course Feedback</CardTitle>
                        <CardDescription>
                            {reviews.data.length > 0 ? (
                                <div className="flex items-center">
                                    <StarRating rating={avgRating} max={5} />
                                    <span className="ml-2 text-muted-foreground">
                                        {avgRating.toFixed(1)}/5 (
                                        {reviews.data.length}{' '}
                                        {reviews.data.length === 1
                                            ? 'review'
                                            : 'reviews'}
                                        )
                                    </span>
                                </div>
                            ) : (
                                'No reviews yet for this course'
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reviews.data.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.data.map((review) => (
                                    <div
                                        key={review.id}
                                        className="rounded-lg bg-gray-50 p-4 shadow-sm"
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <div className="flex items-center">
                                                    <StarRating
                                                        rating={review.rating}
                                                        max={5}
                                                    />
                                                    <span className="ml-2 text-gray-600">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                                <p className="mt-1 font-medium">
                                                    By: {review.user.name}
                                                </p>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <p>
                                                    {format(
                                                        new Date(
                                                            review.created_at,
                                                        ),
                                                        'MMM d, yyyy',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-gray-700">
                                            {review.comment}
                                        </p>

                                        {review.instructor_response && (
                                            <div className="mt-3 rounded-md bg-blue-50 p-3">
                                                <p className="text-sm font-medium text-blue-800">
                                                    Your Response:
                                                </p>
                                                <p className="text-gray-700">
                                                    {review.instructor_response}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-3 flex justify-end">
                                            <Button asChild>
                                                <Link
                                                    href={route(
                                                        'instructor.reviews.show',
                                                        review.id,
                                                    )}
                                                    prefetch="hover"
                                                >
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}

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
                            </div>
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-lg text-gray-500">
                                    No reviews yet for this course.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
