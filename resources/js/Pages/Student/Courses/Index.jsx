import EmptyState from '@/Components/Student/EmptyState';
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
import { Progress } from '@/Components/ui/progress';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Clock } from 'lucide-react';

export default function Index({ courses }) {
    return (
        <AuthenticatedLayout>
            <Head title="My Courses" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <Button asChild>
                        <Link href="/courses">Browse More Courses</Link>
                    </Button>
                </div>

                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                                <div className="aspect-video w-full overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
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
                                    <div className="flex items-center justify-between">
                                        <Badge
                                            variant={
                                                course.enrollment_status ===
                                                'completed'
                                                    ? 'success'
                                                    : 'default'
                                            }
                                        >
                                            {course.enrollment_status ===
                                            'completed'
                                                ? 'Completed'
                                                : 'In Progress'}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {course.category?.name}
                                        </span>
                                    </div>
                                    <CardTitle className="line-clamp-2">
                                        {course.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            Last accessed:{' '}
                                            {course.progress?.last_accessed
                                                ? new Date(
                                                      course.progress.last_accessed,
                                                  ).toLocaleDateString()
                                                : 'Never'}
                                        </span>
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Progress</span>
                                            <span>
                                                {course.progress?.percentage ||
                                                    0}
                                                %
                                            </span>
                                        </div>
                                        <Progress
                                            value={
                                                course.progress?.percentage || 0
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {course.progress
                                                ?.completed_lessons || 0}{' '}
                                            of{' '}
                                            {course.progress?.total_lessons ||
                                                0}{' '}
                                            lessons completed
                                        </p>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex justify-between">
                                    <Button asChild variant="outline">
                                        <Link
                                            href={`/student/courses/${course.slug}`}
                                        >
                                            View Details
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link
                                            href={`/student/courses/${course.slug}/learn`}
                                        >
                                            Continue Learning
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="BookOpen"
                        title="No enrolled courses"
                        description="You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you."
                        buttonText="Browse Courses"
                        buttonLink="/courses"
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
