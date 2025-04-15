import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { MessageSquare, Star } from 'lucide-react';

export default function CourseReviews({ course }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Reviews</CardTitle>
                <CardDescription>
                    Reviews from students who have taken your course
                </CardDescription>
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
                                    <div className="flex items-center space-x-2">
                                        <div className="font-medium">
                                            {review.user.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(
                                                review.created_at,
                                            ).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                    i < review.rating
                                                        ? 'fill-yellow-500 text-yellow-500'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-medium">
                            No reviews yet
                        </h3>
                        <p className="text-center text-muted-foreground">
                            Your course hasn't received any reviews yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
