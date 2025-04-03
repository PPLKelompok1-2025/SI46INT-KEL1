import TableTemplate from '@/Components/TableTemplate';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Calendar, CheckCircle, User } from 'lucide-react';

export default function Show({
    enrollment,
    completedLessons,
    progress,
    filters,
}) {
    const columns = [
        {
            label: 'Lesson',
            key: 'title',
            render: (lesson) => (
                <div className="font-medium">{lesson.title}</div>
            ),
        },
        {
            label: 'Completed At',
            key: 'completed_at',
            render: (lesson) => (
                <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(lesson.completed_at).toLocaleString()}
                </div>
            ),
        },
        {
            label: 'Status',
            key: 'status',
            render: () => (
                <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Completed</span>
                </div>
            ),
        },
    ];

    const filterOptions = {
        searchEnabled: true,
        searchPlaceholder: 'Search lessons...',
        sortOptions: [
            { value: 'completed_at_desc', label: 'Most Recently Completed' },
            { value: 'completed_at_asc', label: 'Oldest Completed First' },
            { value: 'title_asc', label: 'Lesson Title (A-Z)' },
            { value: 'title_desc', label: 'Lesson Title (Z-A)' },
        ],
        defaultSort: filters.sort || 'completed_at_desc',
    };

    const emptyState = {
        icon: <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No lessons completed',
        description: "This student hasn't completed any lessons yet.",
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${enrollment.user.name} - Student Details`} />

            <div className="space-y-6">
                <div className="flex items-center">
                    <Button variant="ghost" asChild className="mr-4">
                        <Link
                            href={route(
                                'instructor.students.course',
                                enrollment.course.id,
                            )}
                            prefetch="hover"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to
                            Course Students
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">Student Details</h1>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Information</CardTitle>
                            <CardDescription>
                                Personal details and enrollment information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    {enrollment.user.profile_photo_path ? (
                                        <img
                                            src={`/storage/${enrollment.user.profile_photo_path}`}
                                            alt={enrollment.user.name}
                                            className="h-16 w-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-8 w-8 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {enrollment.user.name}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {enrollment.user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">Course</span>
                                    <span>{enrollment.course.title}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">
                                        Enrolled On
                                    </span>
                                    <div className="flex items-center">
                                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {new Date(
                                            enrollment.created_at,
                                        ).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">
                                        Progress
                                    </span>
                                    <span>{progress.percentage}% Complete</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="font-medium">
                                        Lessons Completed
                                    </span>
                                    <span>
                                        {progress.completed} of {progress.total}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Course Progress</CardTitle>
                            <CardDescription>
                                Student's progress through the course
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm font-medium">
                                        Overall Progress
                                    </span>
                                    <span className="text-sm font-medium">
                                        {progress.percentage}%
                                    </span>
                                </div>
                                <Progress
                                    value={progress.percentage}
                                    className="h-2"
                                />
                            </div>

                            <div className="mt-6 flex items-center justify-between rounded-lg bg-muted p-4">
                                <div className="flex items-center">
                                    <BookOpen className="mr-2 h-5 w-5 text-primary" />
                                    <div>
                                        <div className="font-medium">
                                            Lessons Completed
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {progress.completed} of{' '}
                                            {progress.total} lessons
                                        </div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">
                                    {progress.percentage}%
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <TableTemplate
                    title="Completed Lessons"
                    description="Lessons the student has completed in this course"
                    columns={columns}
                    data={completedLessons}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="instructor.students.show"
                    routeParams={{ enrollment: enrollment.id }}
                    emptyState={emptyState}
                />

                <div className="flex justify-end">
                    <Button asChild>
                        <Link href={`mailto:${enrollment.user.email}`}>
                            Contact Student
                        </Link>
                    </Button>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
