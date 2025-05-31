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
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    Download,
    FileText,
    Loader2,
    PencilIcon,
    Upload,
    X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ShowAssignment({
    assignment,
    lesson,
    course,
    submission,
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { data, setData, errors, post, progress, processing, reset } =
        useForm({
            submission_text: submission?.submission_text || '',
            file: null,
        });

    const [, setFileSelected] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsConfirmOpen(true);
    };

    const confirmSubmit = () => {
        post(route('student.assignments.submit', assignment.id), {
            preserveScroll: true,
            onSuccess: () => {
                setFileSelected(false);
                setIsEditing(false);
                toast.success('Assignment submitted successfully!');
            },
            onError: () => {
                toast.error('Failed to submit assignment');
            },
        });
        setIsConfirmOpen(false);
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setData('file', e.target.files[0]);
            setFileSelected(true);
        }
    };

    const startEditing = () => {
        setData('submission_text', submission?.submission_text || '');
        setData('file', null);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        reset();
        setIsEditing(false);
    };

    const renderSubmissionForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="submission_text">Your Answer</Label>
                <Textarea
                    id="submission_text"
                    placeholder="Write your response here..."
                    value={data.submission_text}
                    onChange={(e) => setData('submission_text', e.target.value)}
                    rows={6}
                />
                {errors.submission_text && (
                    <p className="text-sm text-red-500">
                        {errors.submission_text}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="file">
                    Attachment{' '}
                    {submission?.file_path
                        ? '(Replace existing file)'
                        : '(Optional)'}
                </Label>
                <Input id="file" type="file" onChange={handleFileChange} />
                <p className="text-xs text-muted-foreground">
                    Upload a file with your assignment submission (max 10MB)
                </p>
                {errors.file && (
                    <p className="text-sm text-red-500">{errors.file}</p>
                )}
                {progress && (
                    <div className="mt-2">
                        <div className="h-2 w-full rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{
                                    width: `${progress.percentage}%`,
                                }}
                            />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {progress.percentage}% uploaded
                        </p>
                    </div>
                )}
            </div>

            <div className="flex space-x-2">
                <Button type="submit" disabled={processing} className="mt-2">
                    {processing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    Submit Assignment
                </Button>

                {isEditing && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEditing}
                        className="mt-2"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );

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
                            Assignment for {lesson.title} in {course.title}
                        </p>
                    </div>

                    <Button asChild variant="outline">
                        <Link href={route('student.courses.learn', course.id)}>
                            Back to Course
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assignment Details</CardTitle>
                                <CardDescription>
                                    Instructions and requirements for this
                                    assignment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="prose dark:prose-invert max-w-none">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: assignment.description,
                                        }}
                                    />
                                </div>

                                {assignment.file_path && (
                                    <div className="rounded-lg border p-4">
                                        <h3 className="mb-2 text-lg font-medium">
                                            Assignment Files
                                        </h3>
                                        <Button variant="outline" asChild>
                                            <a
                                                href={route(
                                                    'student.assignments.download-materials',
                                                    assignment.id,
                                                )}
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Download Assignment Materials
                                                <Download className="ml-2 h-3 w-3 text-muted-foreground" />
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {submission?.graded_at ? (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Feedback</CardTitle>
                                    <CardDescription>
                                        Your assignment has been graded
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-lg border p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-lg font-medium">
                                                Your Score
                                            </h3>
                                            <div className="text-lg font-bold">
                                                {submission.score} /{' '}
                                                {assignment.points}
                                            </div>
                                        </div>

                                        <Separator className="my-4" />

                                        <div>
                                            <h3 className="mb-2 text-lg font-medium">
                                                Instructor Feedback
                                            </h3>
                                            {submission.feedback ? (
                                                <p className="text-sm text-muted-foreground">
                                                    {submission.feedback}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    No detailed feedback
                                                    provided.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : submission && !isEditing ? (
                            <Card className="mt-6">
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div>
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
                                    </div>
                                    {!assignment.is_past_due && (
                                        <Button
                                            variant="outline"
                                            className="bg-yellow-500 hover:bg-yellow-600"
                                            size="sm"
                                            onClick={startEditing}
                                        >
                                            <PencilIcon className="mr-2 h-4 w-4" />
                                            Edit Submission
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {submission.submission_text && (
                                        <div>
                                            <h3 className="mb-2 text-base font-medium">
                                                Your Answer
                                            </h3>
                                            <div className="rounded-md border p-4 text-sm">
                                                <p className="whitespace-pre-line">
                                                    {submission.submission_text}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {submission.file_path && (
                                        <div>
                                            <h3 className="mb-2 text-base font-medium">
                                                Submitted File
                                            </h3>
                                            <Button
                                                className="bg-blue-500 hover:bg-blue-600"
                                                asChild
                                            >
                                                <a
                                                    href={route(
                                                        'student.assignments.submissions.download',
                                                        submission.id,
                                                    )}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View Submitted File
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <p className="text-xs text-muted-foreground">
                                        Your submission is awaiting grading from
                                        the instructor.
                                    </p>
                                </CardFooter>
                            </Card>
                        ) : (
                            !assignment.is_past_due && (
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle>
                                            {submission
                                                ? 'Edit Your Submission'
                                                : 'Submit Your Assignment'}
                                        </CardTitle>
                                        <CardDescription>
                                            {submission
                                                ? 'Update your submission before grading'
                                                : 'Complete and submit your assignment before the due date'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {renderSubmissionForm()}
                                    </CardContent>
                                </Card>
                            )
                        )}
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

                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Status
                                    </p>
                                    {submission?.graded_at ? (
                                        <p className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                            Graded
                                        </p>
                                    ) : submission ? (
                                        <p className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                            Submitted
                                        </p>
                                    ) : assignment.is_past_due ? (
                                        <p className="mt-1 inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                            Past Due
                                        </p>
                                    ) : (
                                        <p className="mt-1 inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                            Pending
                                        </p>
                                    )}
                                </div>

                                {assignment.is_past_due && !submission && (
                                    <div className="rounded-md bg-yellow-50 p-3">
                                        <div className="flex">
                                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    Assignment Past Due
                                                </h3>
                                                <p className="mt-1 text-xs text-yellow-700">
                                                    This assignment is past its
                                                    due date and can no longer
                                                    be submitted.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Assignment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to submit this assignment?
                            {submission &&
                                ' This will update your previous submission.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={confirmSubmit}>
                            {submission
                                ? 'Update Submission'
                                : 'Submit Assignment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
