import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
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
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Lock as LockIcon,
    Star,
    User,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({ course, isEnrolled, progress, hasReviewed }) {
    const { post, processing } = useForm();
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const handleEnroll = () => {
        post(route('student.courses.enroll', course.slug));
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        post(route('student.courses.review', course.slug), {
            rating,
            comment,
            onSuccess: () => {
                setIsReviewDialogOpen(false);
            },
        });
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
                                        course.slug,
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
                                        course.slug,
                                    )}
                                >
                                    Continue Learning
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                <Tabs defaultValue="overview" className="space-y-4">
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
                                                            {lesson.duration ||
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
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Student Reviews</CardTitle>
                                {isEnrolled && !hasReviewed && (
                                    <Dialog
                                        open={isReviewDialogOpen}
                                        onOpenChange={setIsReviewDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button>Write a Review</Button>
                                        </DialogTrigger>
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
                                                            Rating
                                                        </Label>
                                                        <div className="flex gap-1">
                                                            {[
                                                                1, 2, 3, 4, 5,
                                                            ].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setRating(
                                                                            star,
                                                                        )
                                                                    }
                                                                    className="focus:outline-none"
                                                                >
                                                                    <Star
                                                                        className={`h-6 w-6 ${
                                                                            star <=
                                                                            rating
                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="comment">
                                                            Comment
                                                        </Label>
                                                        <Textarea
                                                            id="comment"
                                                            value={comment}
                                                            onChange={(e) =>
                                                                setComment(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Share your experience with this course..."
                                                            rows={5}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        Submit Review
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </CardHeader>
                            <CardContent>
                                {course.reviews && course.reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {course.reviews.map((review) => (
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
                                                    {new Date(
                                                        review.created_at,
                                                    ).toLocaleDateString()}
                                                </p>
                                                <p className="mt-2">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>No reviews yet</AlertTitle>
                                        <AlertDescription>
                                            This course doesn't have any reviews
                                            yet. Be the first to share your
                                            experience!
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
