import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle,
    Download,
    FileText,
    Loader2,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Submissions({ assignment, submissions }) {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isGradingOpen, setIsGradingOpen] = useState(false);

    const { data, setData, patch, errors, processing, reset } = useForm({
        score: '',
        feedback: '',
    });

    // Filter submissions based on the active tab
    const filteredSubmissions = submissions.filter((submission) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'graded') return submission.graded_at !== null;
        if (activeTab === 'ungraded') return submission.graded_at === null;
        return true;
    });

    const openGradingDialog = (submission) => {
        setSelectedSubmission(submission);
        setData({
            score: submission.score || '',
            feedback: submission.feedback || '',
        });
        setIsGradingOpen(true);
    };

    const handleGradeSubmit = (e) => {
        e.preventDefault();

        patch(
            route('instructor.assignments.submissions.grade', {
                submission: selectedSubmission.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsGradingOpen(false);
                    toast.success('Submission graded successfully!');
                    reset();
                },
                onError: () => {
                    toast.error('Failed to grade submission');
                },
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Submissions for ${assignment.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Submissions
                        </h1>
                        <p className="text-muted-foreground">
                            Reviewing submissions for {assignment.title} in{' '}
                            {assignment.lesson.title}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button asChild variant="outline">
                            <Link
                                href={route(
                                    'instructor.lessons.assignments.show',
                                    {
                                        lesson: assignment.lesson_id,
                                        assignment: assignment.id,
                                    },
                                )}
                            >
                                Back to Assignment
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Information</CardTitle>
                        <CardDescription>
                            Quick overview of the assignment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
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
                                Total Submissions
                            </p>
                            <p className="text-base font-medium">
                                {submissions.length}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Tabs
                    defaultValue="all"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="all">
                                All Submissions
                            </TabsTrigger>
                            <TabsTrigger value="graded">Graded</TabsTrigger>
                            <TabsTrigger value="ungraded">Ungraded</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="all" className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                {filteredSubmissions.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>
                                                    Submitted On
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-center">
                                                    Score
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSubmissions.map(
                                                (submission) => (
                                                    <TableRow
                                                        key={submission.id}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                {
                                                                    submission
                                                                        .user
                                                                        ?.name
                                                                }
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                submission.submitted_at,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {submission.graded_at ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-green-500 text-green-500"
                                                                >
                                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                                    Graded
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-amber-500 text-amber-500"
                                                                >
                                                                    <XCircle className="mr-1 h-3 w-3" />
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {submission.score !==
                                                            null ? (
                                                                <span>
                                                                    {
                                                                        submission.score
                                                                    }{' '}
                                                                    /{' '}
                                                                    {
                                                                        assignment.points
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    --
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openGradingDialog(
                                                                            submission,
                                                                        )
                                                                    }
                                                                >
                                                                    {submission.graded_at
                                                                        ? 'Update Grade'
                                                                        : 'Grade'}
                                                                </Button>
                                                                {submission.file_path && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={`/storage/${submission.file_path}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            download
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <FileText className="mb-3 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-1 text-lg font-medium">
                                            No submissions found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            There are no{' '}
                                            {activeTab === 'all'
                                                ? ''
                                                : activeTab}{' '}
                                            submissions yet.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="graded" className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                {filteredSubmissions.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>
                                                    Submitted On
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-center">
                                                    Score
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSubmissions.map(
                                                (submission) => (
                                                    <TableRow
                                                        key={submission.id}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                {
                                                                    submission
                                                                        .user
                                                                        ?.name
                                                                }
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                submission.submitted_at,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-green-500 text-green-500"
                                                            >
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Graded
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {submission.score} /{' '}
                                                            {assignment.points}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openGradingDialog(
                                                                            submission,
                                                                        )
                                                                    }
                                                                >
                                                                    Update Grade
                                                                </Button>
                                                                {submission.file_path && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={`/storage/${submission.file_path}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            download
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <FileText className="mb-3 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-1 text-lg font-medium">
                                            No graded submissions
                                        </h3>
                                        <p className="text-muted-foreground">
                                            There are no graded submissions yet.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="ungraded" className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                {filteredSubmissions.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>
                                                    Submitted On
                                                </TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-center">
                                                    Score
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredSubmissions.map(
                                                (submission) => (
                                                    <TableRow
                                                        key={submission.id}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                {
                                                                    submission
                                                                        .user
                                                                        ?.name
                                                                }
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(
                                                                submission.submitted_at,
                                                            ).toLocaleDateString(
                                                                'en-US',
                                                                {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className="border-amber-500 text-amber-500"
                                                            >
                                                                <XCircle className="mr-1 h-3 w-3" />
                                                                Pending
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="text-muted-foreground">
                                                                --
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        openGradingDialog(
                                                                            submission,
                                                                        )
                                                                    }
                                                                >
                                                                    Grade
                                                                </Button>
                                                                {submission.file_path && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        asChild
                                                                    >
                                                                        <a
                                                                            href={`/storage/${submission.file_path}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            download
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <FileText className="mb-3 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-1 text-lg font-medium">
                                            No pending submissions
                                        </h3>
                                        <p className="text-muted-foreground">
                                            All submissions have been graded.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Grading Dialog */}
            <Dialog open={isGradingOpen} onOpenChange={setIsGradingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Grade Submission</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission ? (
                                <span>
                                    Reviewing submission by{' '}
                                    {selectedSubmission.user?.name}
                                </span>
                            ) : (
                                'Loading...'
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <form onSubmit={handleGradeSubmit}>
                            <div className="grid gap-4 py-4">
                                {selectedSubmission.submission_text && (
                                    <div className="space-y-2">
                                        <Label>Student's Response</Label>
                                        <div className="rounded-md border p-4">
                                            <p className="text-sm">
                                                {
                                                    selectedSubmission.submission_text
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedSubmission.file_path && (
                                    <div className="space-y-2">
                                        <Label>Submitted File</Label>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <a
                                                href={`/storage/${selectedSubmission.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                View/Download Submission File
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="score">
                                        Score{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="score"
                                            type="number"
                                            min="0"
                                            max={assignment.points}
                                            value={data.score}
                                            onChange={(e) =>
                                                setData('score', e.target.value)
                                            }
                                            placeholder="0"
                                            className="w-24"
                                        />
                                        <span className="text-muted-foreground">
                                            / {assignment.points} points
                                        </span>
                                    </div>
                                    {errors.score && (
                                        <p className="text-sm text-red-500">
                                            {errors.score}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="feedback">Feedback</Label>
                                    <Textarea
                                        id="feedback"
                                        placeholder="Provide feedback to the student..."
                                        value={data.feedback}
                                        onChange={(e) =>
                                            setData('feedback', e.target.value)
                                        }
                                        rows={4}
                                    />
                                    {errors.feedback && (
                                        <p className="text-sm text-red-500">
                                            {errors.feedback}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsGradingOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {selectedSubmission.graded_at
                                        ? 'Update Grade'
                                        : 'Submit Grade'}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
