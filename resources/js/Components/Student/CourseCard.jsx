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
import { Textarea } from '@/Components/ui/textarea';
import { Link, useForm } from '@inertiajs/react';
import { Award, BookOpen, CheckCircle, PlayCircle, Star } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CourseCard({ course }) {
    const isCompleted = course.enrollment_status === 'completed';
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

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (course.has_reviewed) {
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
        <Card className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover transition-all hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                        <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                )}
            </div>
            <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="flex items-center">
                    <span className="mr-2 flex items-center">
                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.average_rating
                            ? Number(course.average_rating).toFixed(1)
                            : 'N/A'}
                    </span>
                    <span>•</span>
                    <span className="ml-2">{course.user.name}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isCompleted ? (
                    <div className="flex items-center text-sm text-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed on{' '}
                        {new Date(course.completed_at).toLocaleDateString()}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{course.progress?.percentage || 0}%</span>
                        </div>
                        <Progress value={course.progress?.percentage || 0} />
                    </div>
                )}
            </CardContent>
            <CardFooter
                className={
                    isCompleted ? 'grid grid-cols-1 gap-2 sm:grid-cols-2' : ''
                }
            >
                <Button className="w-full" asChild>
                    <Link
                        href={`/student/courses/${course.id}/learn`}
                        prefetch="hover"
                    >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue Learning
                    </Link>
                </Button>

                {isCompleted && (
                    <Dialog
                        open={isReviewDialogOpen}
                        onOpenChange={setIsReviewDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full"
                                title={
                                    course.has_reviewed
                                        ? 'Update your review'
                                        : 'Write a review'
                                }
                            >
                                <Star className="mr-2 h-4 w-4" />
                                {course.has_reviewed
                                    ? 'Update Review'
                                    : 'Write a Review'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <div className="flex items-center gap-2">
                                    <DialogTitle>
                                        {course.has_reviewed
                                            ? 'Update Review'
                                            : 'Write a Review'}
                                    </DialogTitle>
                                    {course.has_reviewed && (
                                        <Badge
                                            variant={
                                                course.is_approved
                                                    ? 'secondary'
                                                    : 'destructive'
                                            }
                                        >
                                            {course.is_approved
                                                ? 'Approved'
                                                : 'Pending'}
                                        </Badge>
                                    )}
                                </div>
                                <DialogDescription>
                                    Share your experience with this course to
                                    help other students.
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
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() =>
                                                        setData('rating', star)
                                                    }
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        className={`h-6 w-6 ${
                                                            star <= data.rating
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
                                        <Label htmlFor="comment">Comment</Label>
                                        <Textarea
                                            id="comment"
                                            value={data.comment}
                                            onChange={(e) =>
                                                setData(
                                                    'comment',
                                                    e.target.value,
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
                                <DialogFooter className="flex justify-between">
                                    {course.has_reviewed && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => {
                                                setIsReviewDialogOpen(false);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                        >
                                            Delete Review
                                        </Button>
                                    )}
                                    <Button type="submit" disabled={processing}>
                                        {course.has_reviewed
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
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your review. This
                                action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteReview}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {isCompleted && course.has_certificate && (
                    <Button variant="ghost" asChild>
                        <Link
                            href={`/student/certificates/${course.certificate_id}`}
                            prefetch="hover"
                        >
                            <Award className="mr-2 h-4 w-4" />
                            Certificate
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
