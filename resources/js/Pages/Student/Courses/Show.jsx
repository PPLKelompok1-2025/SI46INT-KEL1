import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, WhenVisible } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Lock as LockIcon,
    MessageSquare,
    Pencil,
    Star,
    User,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Show({
    course,
    isEnrolled,
    progress,
    hasReviewed,
    hasPendingReview,
    activeTab = 'overview',
    reviews = [],
    page = 1,
    isNextPageExists = false,
}) {
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const {
        post,
        put,
        delete: destroy,
        processing,
        errors,
        setData,
        data,
        reset,
    } = useForm({
        rating: course.review ? course.review.rating : 5,
        comment: course.review ? course.review.comment : '',
    });

    const handleEnroll = () => {
        post(route('student.courses.enroll', course.slug));
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();

        if (hasReviewed) {
            put(
                route('student.courses.review.update', [
                    course.id,
                    course.review.id,
                ]),
                {
                    onSuccess: () => {
                        setIsReviewDialogOpen(false);
                        toast.success('Review updated successfully!');
                    },
                    onError: (err) => {
                        toast.error('Failed to update review', err.message);
                    },
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        } else {
            post(route('student.courses.review', course.id), {
                onSuccess: () => {
                    setIsReviewDialogOpen(false);
                    toast.success('Review submitted successfully!');
                },
                onError: (err) => {
                    toast.error('Failed to submit review', err.message);
                },
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleTabChange = (value) => {
        router.get(
            route('student.courses.show', course.slug),
            { tab: value },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['activeTab'],
                replace: true,
            },
        );
    };

    const handleDeleteReview = () => {
        destroy(
            route('student.courses.review.delete', [
                course.id,
                course.review.id,
            ]),
            {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    toast.success('Review deleted successfully!');
                },
                onError: (err) => {
                    toast.error('Failed to delete review', err.message);
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
        reset();
    };

    return (
        <AuthenticatedLayout>
            <Head title={course.title} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <p className="text-muted-foreground">
                            By {course.user?.name} • {course.category?.name}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isEnrolled ? (
                            <Button asChild>
                                <Link
                                    href={route(
                                        'student.courses.learn',
                                        course.id,
                                    )}
                                >
                                    {progress?.percentage === 100
                                        ? 'Review Course'
                                        : 'Continue Learning'}
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                onClick={handleEnroll}
                                disabled={processing}
                            >
                                Enroll Now
                            </Button>
                        )}
                    </div>
                </div>

                {isEnrolled && progress && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span>{progress.percentage}% Complete</span>
                                    <span>
                                        {progress.completed_lessons} of{' '}
                                        {progress.total_lessons} lessons
                                    </span>
                                </div>
                                <Progress value={progress.percentage} />
                                <p className="text-sm text-muted-foreground">
                                    <Clock className="mr-1 inline h-4 w-4" />
                                    Last accessed:{' '}
                                    {progress.last_accessed
                                        ? new Date(
                                              progress.last_accessed,
                                          ).toLocaleString()
                                        : 'Never'}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button asChild>
                                <Link
                                    href={route(
                                        'student.courses.learn',
                                        course.id,
                                    )}
                                >
                                    Continue Learning
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="space-y-4"
                >
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>About This Course</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: course.description,
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>What You'll Learn</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: course.what_you_will_learn,
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: course.requirements,
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="curriculum" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Curriculum</CardTitle>
                                <CardDescription>
                                    {course.lessons?.length || 0} lessons •
                                    Approximately {course.duration || 'N/A'}{' '}
                                    hours
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {course.lessons && course.lessons.length > 0 ? (
                                    <div className="space-y-2">
                                        {course.lessons.map((lesson, index) => (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {lesson.title}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {lesson.duration +
                                                                ' mins' ||
                                                                'N/A'}{' '}
                                                            •{' '}
                                                            {lesson.type ||
                                                                'Lesson'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isEnrolled ? (
                                                    progress?.completedLessons?.includes(
                                                        lesson.id,
                                                    ) ? (
                                                        <Badge variant="success">
                                                            <CheckCircle className="mr-1 h-3 w-3" />{' '}
                                                            Completed
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Not Started
                                                        </Badge>
                                                    )
                                                ) : (
                                                    <Badge variant="outline">
                                                        <LockIcon className="mr-1 h-3 w-3" />{' '}
                                                        Locked
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>
                                            No lessons available
                                        </AlertTitle>
                                        <AlertDescription>
                                            This course doesn't have any lessons
                                            yet.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                        {hasPendingReview && (
                            <Alert className="mb-4 flex items-center bg-amber-50 dark:bg-amber-950/50">
                                <div className="flex items-center gap-4">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                    <div className="flex flex-col gap-1">
                                        <AlertTitle className="text-amber-800 dark:text-amber-400">
                                            Review Pending Approval
                                        </AlertTitle>
                                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                                            Your review has been submitted and
                                            is awaiting approval from our
                                            administrators. It will be visible
                                            to other students once approved.
                                        </AlertDescription>
                                    </div>
                                </div>

                                <Button
                                    className="ml-auto"
                                    type="button"
                                    onClick={() => setIsReviewDialogOpen(true)}
                                    variant="outline"
                                >
                                    Edit Review
                                </Button>
                            </Alert>
                        )}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Student Reviews</CardTitle>
                                {isEnrolled && (
                                    <Dialog
                                        open={isReviewDialogOpen}
                                        onOpenChange={setIsReviewDialogOpen}
                                    >
                                        {!hasReviewed && (
                                            <DialogTrigger asChild>
                                                <Button>Write a Review</Button>
                                            </DialogTrigger>
                                        )}
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Write a Review
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Share your experience with
                                                    this course to help other
                                                    students.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmitReview}>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="rating">
                                                            Rating{' '}
                                                            <span className="text-red-500">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <div className="flex gap-1">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setData(
                                                                            'rating',
                                                                            star,
                                                                        )
                                                                    }
                                                                    className="focus:outline-none"
                                                                >
                                                                    <Star
                                                                        className={`h-6 w-6 ${
                                                                            star <=
                                                                            data.rating
                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {errors.rating && (
                                                            <div className="mt-1 text-sm text-red-500">
                                                                {errors.rating}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="comment">
                                                            Comment
                                                        </Label>
                                                        <Textarea
                                                            id="comment"
                                                            value={data.comment}
                                                            onChange={(e) =>
                                                                setData(
                                                                    'comment',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Share your experience with this course..."
                                                            rows={5}
                                                        />
                                                        {errors.comment && (
                                                            <div className="mt-1 text-sm text-red-500">
                                                                {errors.comment}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    {hasReviewed && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                setIsReviewDialogOpen(
                                                                    false,
                                                                );
                                                                setIsDeleteDialogOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            Delete Review
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        {hasReviewed
                                                            ? 'Update Review'
                                                            : 'Submit Review'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                <AlertDialog
                                    open={isDeleteDialogOpen}
                                    onOpenChange={setIsDeleteDialogOpen}
                                >
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Are you sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete
                                                your review. This action cannot
                                                be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDeleteReview}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardHeader>
                            <CardContent>
                                {reviews && reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div
                                                key={review.id}
                                                className="rounded-lg border p-4"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-medium">
                                                            {review.user?.name}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            className="ml-2"
                                                            size="icon"
                                                            onClick={() => {
                                                                setIsReviewDialogOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${
                                                                        i <
                                                                        review.rating
                                                                            ? 'fill-yellow-400 text-yellow-400'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {review.comment}
                                                </p>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    {new Date(
                                                        review.created_at,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                        {isNextPageExists && (
                                            <WhenVisible
                                                always
                                                href={route(
                                                    'student.courses.show',
                                                    course.slug,
                                                )}
                                                params={{
                                                    data: {
                                                        page: Number(page) + 1,
                                                        tab: 'reviews',
                                                    },
                                                    only: [
                                                        'reviews',
                                                        'page',
                                                        'isNextPageExists',
                                                    ],
                                                    preserveScroll: true,
                                                }}
                                                fallback={
                                                    <div className="flex justify-center">
                                                        <p className="text-muted-foreground">
                                                            You've reached the
                                                            end.
                                                        </p>
                                                    </div>
                                                }
                                            >
                                                <div className="flex justify-center">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                                </div>
                                            </WhenVisible>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <MessageSquare className="mb-2 h-12 w-12 text-gray-300" />
                                        <h3 className="text-lg font-medium">
                                            No reviews yet
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Be the first to review this course
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
