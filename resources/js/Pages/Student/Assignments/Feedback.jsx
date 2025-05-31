import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, CheckCircle, Download, FileText } from 'lucide-react';

export default function Feedback({ assignment, lesson, course, submission }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Feedback - ${assignment.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Assignment Feedback
                        </h1>
                        <p className="text-muted-foreground">
                            {assignment.title} for {lesson.title} in{' '}
                            {course.title}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button asChild variant="outline">
                            <Link
                                href={route(
                                    'student.assignments.show',
                                    assignment.id,
                                )}
                            >
                                Back to Assignment
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={route('student.courses.learn', course.id)}
                            >
                                Continue Learning
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Submission</CardTitle>
                                <CardDescription>
                                    Submitted on{' '}
                                    {new Date(
                                        submission.submitted_at,
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {submission.submission_text && (
                                    <div>
                                        <h3 className="mb-2 text-lg font-medium">
                                            Your Answer
                                        </h3>
                                        <div className="rounded-md border p-4">
                                            <p className="whitespace-pre-line">
                                                {submission.submission_text}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {submission.file_path && (
                                    <div>
                                        <h3 className="mb-2 text-lg font-medium">
                                            Submitted File
                                        </h3>
                                        <Button variant="outline" asChild>
                                            <a
                                                href={`/storage/${submission.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                download
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Download Your Submission
                                                <Download className="ml-2 h-3 w-3 text-muted-foreground" />
                                            </a>
                                        </Button>
                                    </div>
                                )}

                                <Separator />

                                <div>
                                    <h3 className="mb-4 text-lg font-medium">
                                        Instructor Feedback
                                    </h3>
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                                <span className="font-medium">
                                                    Graded on
                                                </span>
                                            </div>
                                            <span>
                                                {new Date(
                                                    submission.graded_at,
                                                ).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>

                                        <div className="mb-6 flex items-center justify-between rounded-md bg-primary/10 p-3">
                                            <span className="font-medium">
                                                Your Score
                                            </span>
                                            <span className="text-xl font-bold">
                                                {submission.score} /{' '}
                                                {assignment.points}
                                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                                    (
                                                    {Math.round(
                                                        (submission.score /
                                                            assignment.points) *
                                                            100,
                                                    )}
                                                    %)
                                                </span>
                                            </span>
                                        </div>

                                        {submission.feedback ? (
                                            <div className="prose dark:prose-invert max-w-none">
                                                <h4 className="text-base font-medium">
                                                    Comments
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {submission.feedback}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No additional feedback was
                                                provided by the instructor.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Details</CardTitle>
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
                                        Your Grade
                                    </p>
                                    <div className="mt-1 flex items-center justify-between">
                                        <p className="text-base font-medium">
                                            {submission.score} points
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {Math.round(
                                                (submission.score /
                                                    assignment.points) *
                                                    100,
                                            )}
                                            %
                                        </p>
                                    </div>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{
                                                width: `${(submission.score / assignment.points) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
