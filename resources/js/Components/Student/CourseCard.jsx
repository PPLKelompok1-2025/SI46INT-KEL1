import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Link } from '@inertiajs/react';
import { Award, CheckCircle, PlayCircle, Star } from 'lucide-react';

export default function CourseCard({ course, type }) {
    const isCompleted = type === 'completed';

    return (
        <Card className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
                <img
                    src={
                        course.thumbnail_url || '/images/course-placeholder.jpg'
                    }
                    alt={course.title}
                    className="h-full w-full object-cover"
                />
            </div>
            <CardHeader>
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="flex items-center">
                    <span className="mr-2 flex items-center">
                        <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.average_rating
                            ? course.average_rating.toFixed(1)
                            : 'N/A'}
                    </span>
                    <span>•</span>
                    <span className="ml-2">{course.instructor.name}</span>
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
            <CardFooter className={isCompleted ? 'flex justify-between' : ''}>
                <Button
                    className={isCompleted ? '' : 'w-full'}
                    variant={isCompleted ? 'outline' : 'default'}
                    asChild
                >
                    <Link href={`/courses/${course.id}/learn`}>
                        {isCompleted ? (
                            'Review Course'
                        ) : (
                            <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Continue Learning
                            </>
                        )}
                    </Link>
                </Button>

                {isCompleted && course.has_certificate && (
                    <Button variant="ghost" asChild>
                        <Link
                            href={`/student/certificates/${course.certificate_id}`}
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
