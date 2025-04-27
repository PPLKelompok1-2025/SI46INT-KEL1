import StarRating from '@/Components/StarRating';
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

export default function Index({ auth, reviews }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Course Reviews" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                        All Reviews for My Courses
                    </h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Course Reviews</CardTitle>
                        <CardDescription>
                            Reviews and feedback from students on your courses
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
                                                <Link
                                                    href={route(
                                                        'instructor.reviews.show',
                                                        review.id,
                                                    )}
                                                    className="text-lg font-medium text-blue-600 hover:text-blue-800"
                                                    prefetch="hover"
                                                >
                                                    Review for{' '}
                                                    {review.course.title}
                                                </Link>
                                                <div className="mt-1 flex items-center">
                                                    <StarRating
                                                        rating={review.rating}
                                                        max={5}
                                                    />
                                                    <span className="ml-2 text-gray-600">
                                                        {review.rating}/5
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <p>By: {review.user.name}</p>
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
                                        <div className="mt-3 flex justify-end space-x-3">
                                            <Link
                                                href={route(
                                                    'instructor.reviews.show',
                                                    review.id,
                                                )}
                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                prefetch="hover"
                                            >
                                                View Details
                                            </Link>
                                            <Link
                                                href={route(
                                                    'instructor.reviews.course',
                                                    review.course.id,
                                                )}
                                                className="text-sm text-green-600 hover:text-green-800"
                                                prefetch="hover"
                                            >
                                                View All Course Reviews
                                            </Link>
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
                                    No reviews yet for any of your courses.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
