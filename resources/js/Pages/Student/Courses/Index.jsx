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
import { Head, Link, WhenVisible } from '@inertiajs/react';
import { BookOpen, Clock, Eye, PlayCircle } from 'lucide-react';

export default function Index({ courses, page = 1, isNextPageExists = false }) {
    return (
        <AuthenticatedLayout>
            <Head title="My Courses" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <Button asChild>
                        <Link href="/courses" prefetch="hover">
                            Browse More Courses
                        </Link>
                    </Button>
                </div>

                {courses.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => (
                                <Card
                                    key={course.id}
                                    className="overflow-hidden"
                                >
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
                                                      ).toLocaleDateString(
                                                          'en-US',
                                                          {
                                                              year: 'numeric',
                                                              month: 'short',
                                                              day: 'numeric',
                                                          },
                                                      )
                                                    : 'Never'}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Progress</span>
                                                <span>
                                                    {course.progress
                                                        ?.percentage ?? 0}
                                                    %
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    course.progress
                                                        ?.percentage ?? 0
                                                }
                                                className="h-2"
                                            />
                                            <p className="pt-1 text-sm text-muted-foreground">
                                                {course.progress
                                                    ?.completed_lessons ??
                                                    0}{' '}
                                                of{' '}
                                                {course.progress
                                                    ?.total_lessons ?? 0}{' '}
                                                lessons completed
                                            </p>
                                        </div>
                                    </CardContent>

                                    <CardFooter>
                                        <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        'student.courses.show',
                                                        course.slug,
                                                    )}
                                                    prefetch="hover"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Course
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="w-full"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        'student.courses.learn',
                                                        course.id,
                                                    )}
                                                    prefetch="hover"
                                                >
                                                    <PlayCircle className="mr-2 h-4 w-4" />
                                                    Continue Learning
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {isNextPageExists && (
                            <div className="mt-8">
                                <WhenVisible
                                    always
                                    params={{
                                        data: {
                                            page: Number(page) + 1,
                                        },
                                        only: [
                                            'courses',
                                            'page',
                                            'isNextPageExists',
                                        ],
                                        preserveState: true,
                                    }}
                                    fallback={
                                        <div className="flex justify-center">
                                            <p className="text-muted-foreground">
                                                You've reached the end.
                                            </p>
                                        </div>
                                    }
                                >
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    </div>
                                </WhenVisible>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        title="No courses"
                        description="You haven't enrolled in any courses yet"
                        icon={<BookOpen className="h-10 w-10" />}
                        action={
                            <Button asChild>
                                <Link href="/courses">Browse Courses</Link>
                            </Button>
                        }
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
