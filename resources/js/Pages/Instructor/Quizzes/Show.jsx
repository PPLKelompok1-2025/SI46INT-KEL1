import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Separator } from '@/Components/ui/separator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    CheckCircle,
    Edit,
    FileText,
    Plus,
    Trash2,
    XCircle,
} from 'lucide-react';

export default function ShowQuiz({ quiz, lesson, course, stats }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Quiz: ${quiz.title}`} />

            <div className="mb-6">
                <Link
                    href={route('instructor.lessons.quizzes.index', lesson.id)}
                    className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Quizzes
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{quiz.title}</h1>
                        <p className="mt-1 text-muted-foreground">
                            {lesson.title} - {course.title}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={route('instructor.lessons.quizzes.edit', [
                                    lesson.id,
                                    quiz.id,
                                ])}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Quiz
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Are you sure you want to delete this quiz? This action cannot be undone.',
                                    )
                                ) {
                                    // Delete functionality would go here
                                }
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Information</CardTitle>
                        <CardDescription>
                            Details about this quiz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {quiz.description && (
                                <div>
                                    <h3 className="mb-2 font-medium">
                                        Description
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {quiz.description}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        Questions
                                    </p>
                                    <p className="text-lg font-medium">
                                        {quiz.questions.length}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        Passing Score
                                    </p>
                                    <p className="text-lg font-medium">
                                        {quiz.passing_score}%
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        Time Limit
                                    </p>
                                    <p className="text-lg font-medium">
                                        {quiz.time_limit
                                            ? `${quiz.time_limit} minutes`
                                            : 'No limit'}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        Due Date
                                    </p>
                                    <p className="text-lg font-medium">
                                        {quiz.due_date
                                            ? format(
                                                  new Date(quiz.due_date),
                                                  'MMM d, yyyy',
                                              )
                                            : 'No due date'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Statistics</CardTitle>
                        <CardDescription>
                            How students are performing on this quiz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        Total Attempts
                                    </p>
                                    <p className="text-lg font-medium">
                                        {stats.totalAttempts}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        Passed Attempts
                                    </p>
                                    <p className="text-lg font-medium">
                                        {stats.passedAttempts}
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        Pass Rate
                                    </p>
                                    <p className="text-lg font-medium">
                                        {stats.passRate}%
                                    </p>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-sm text-muted-foreground">
                                        Average Score
                                    </p>
                                    <p className="text-lg font-medium">
                                        {Math.round(stats.averageScore)}%
                                    </p>
                                </div>
                            </div>

                            {stats.totalAttempts > 0 && (
                                <div className="mt-4">
                                    <h3 className="mb-2 font-medium">
                                        Pass Rate
                                    </h3>
                                    <Progress
                                        value={stats.passRate}
                                        className="h-2"
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Questions</CardTitle>
                            <CardDescription>
                                Manage the questions in this quiz
                            </CardDescription>
                        </div>
                        <Button asChild>
                            <Link
                                href={route(
                                    'instructor.quizzes.questions.create',
                                    quiz.id,
                                )}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {quiz.questions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                <FileText className="h-10 w-10 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">
                                    No Questions Added
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Add questions to your quiz to get started.
                                </p>
                                <Button className="mt-4" asChild>
                                    <Link
                                        href={route(
                                            'instructor.quizzes.questions.create',
                                            quiz.id,
                                        )}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Question
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {quiz.questions.map((question, index) => (
                                    <Card
                                        key={question.id}
                                        className="overflow-hidden"
                                    >
                                        <CardHeader className="bg-muted/40 pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        Q{index + 1}
                                                    </Badge>
                                                    <Badge>
                                                        {question.type ===
                                                        'multiple_choice'
                                                            ? 'Multiple Choice'
                                                            : 'True/False'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'instructor.quizzes.questions.edit',
                                                                [
                                                                    quiz.id,
                                                                    question.id,
                                                                ],
                                                            )}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-lg font-medium">
                                                        {question.question}
                                                    </p>
                                                    <div className="mt-1 text-sm text-muted-foreground">
                                                        {question.points} point
                                                        {question.points !== 1
                                                            ? 's'
                                                            : ''}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {question.answers.map(
                                                        (answer) => (
                                                            <div
                                                                key={answer.id}
                                                                className={`flex items-center rounded-md border p-3 ${
                                                                    answer.is_correct
                                                                        ? 'border-green-500 bg-green-50'
                                                                        : 'border-border'
                                                                }`}
                                                            >
                                                                {answer.is_correct ? (
                                                                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                                                ) : (
                                                                    <XCircle className="mr-2 h-5 w-5 text-muted-foreground" />
                                                                )}
                                                                <span>
                                                                    {
                                                                        answer.answer
                                                                    }
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
