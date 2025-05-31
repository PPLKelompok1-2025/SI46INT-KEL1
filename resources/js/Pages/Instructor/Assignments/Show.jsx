import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Download, Edit, FileText, Users } from 'lucide-react';

export default function ShowAssignment({ lesson, assignment }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Assignment: ${assignment.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {assignment.title}
                        </h1>
                        <p className="text-muted-foreground">
                            Assignment for lesson: {lesson.title}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button asChild variant="outline">
                            <Link
                                href={route(
                                    'instructor.lessons.assignments.index',
                                    { lesson: lesson.id },
                                )}
                            >
                                Back to Assignments
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={route(
                                    'instructor.lessons.assignments.edit',
                                    {
                                        lesson: lesson.id,
                                        assignment: assignment.id,
                                    },
                                )}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Assignment
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Details</CardTitle>
                                <CardDescription>
                                    Complete information about this assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-2 text-lg font-medium">
                                        Description
                                    </h3>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: assignment.description,
                                            }}
                                        />
                                    </div>
                                </div>

                                {assignment.file_path && (
                                    <div>
                                        <h3 className="mb-2 text-lg font-medium">
                                            Assignment Files
                                        </h3>
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="text-sm"
                                        >
                                            <a
                                                href={`/storage/${assignment.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                download
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Download Assignment File
                                                <Download className="ml-2 h-3 w-3 text-muted-foreground" />
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Due Date
                                    </p>
                                    <p className="flex items-center text-base font-medium">
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        {new Date(
                                            assignment.due_date,
                                        ).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Maximum Points
                                    </p>
                                    <p className="text-base font-medium">
                                        {assignment.points} points
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Submissions
                                    </p>
                                    <Link
                                        href={route(
                                            'instructor.assignments.submissions',
                                            assignment.id,
                                        )}
                                        className="mt-1 flex items-center text-primary hover:underline"
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        View {assignment.submissions_count ||
                                            0}{' '}
                                        submissions
                                    </Link>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link
                                        href={route(
                                            'instructor.assignments.submissions',
                                            assignment.id,
                                        )}
                                    >
                                        View Submissions
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
