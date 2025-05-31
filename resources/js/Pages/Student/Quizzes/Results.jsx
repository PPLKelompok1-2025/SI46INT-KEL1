import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
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
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
} from 'lucide-react';

export default function QuizResults({
    attempt,
    quiz,
    lesson,
    course,
    questions,
}) {
    const formatAnswerStatus = (questionId, answerId) => {
        const questionAttempt = attempt.answers.find(
            (a) => a.question_id === questionId,
        );
        if (!questionAttempt) return 'neutral';

        const isSelected = questionAttempt.selected_answers.includes(answerId);
        const isCorrect = questionAttempt.correct_answers.includes(answerId);

        if (isSelected && isCorrect) return 'correct';
        if (isSelected && !isCorrect) return 'incorrect';
        if (!isSelected && isCorrect) return 'missed';
        return 'neutral';
    };

    const getQuestionStatus = (questionId) => {
        const questionAttempt = attempt.answers.find(
            (a) => a.question_id === questionId,
        );
        return questionAttempt ? questionAttempt.is_correct : false;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Quiz Results - ${quiz.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Quiz Results
                        </h1>
                        <p className="text-muted-foreground">
                            {quiz.title} - {lesson.title}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('student.quizzes.show', quiz.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Quiz
                        </Link>
                    </Button>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Results Summary</CardTitle>
                            <CardDescription>
                                Your performance on this quiz
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="text-center">
                                    {attempt.passed ? (
                                        <div className="inline-flex rounded-full bg-green-100 p-3 text-green-600">
                                            <CheckCircle className="h-8 w-8" />
                                        </div>
                                    ) : (
                                        <div className="inline-flex rounded-full bg-red-100 p-3 text-red-600">
                                            <XCircle className="h-8 w-8" />
                                        </div>
                                    )}
                                    <h2 className="mt-2 text-3xl font-bold">
                                        {attempt.score}%
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {attempt.passed ? 'Passed' : 'Failed'}
                                    </p>
                                </div>

                                <Progress
                                    value={attempt.score}
                                    className="h-2 w-full"
                                />

                                <div className="grid grid-cols-2 gap-4 text-center">
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
                                            Completed
                                        </p>
                                        <p className="text-lg font-medium">
                                            {format(
                                                new Date(attempt.completed_at),
                                                'MMM d, h:mm a',
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-medium">
                                        Performance Details
                                    </h3>
                                    <div className="space-y-1">
                                        {attempt.answers.filter(
                                            (a) => a.is_correct,
                                        ).length > 0 && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    <span>Correct</span>
                                                </div>
                                                <Badge variant="outline">
                                                    {
                                                        attempt.answers.filter(
                                                            (a) => a.is_correct,
                                                        ).length
                                                    }{' '}
                                                    of {questions.length}
                                                </Badge>
                                            </div>
                                        )}

                                        {attempt.answers.filter(
                                            (a) => !a.is_correct,
                                        ).length > 0 && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                    <span>Incorrect</span>
                                                </div>
                                                <Badge variant="outline">
                                                    {
                                                        attempt.answers.filter(
                                                            (a) =>
                                                                !a.is_correct,
                                                        ).length
                                                    }{' '}
                                                    of {questions.length}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Information</CardTitle>
                            <CardDescription>
                                Details about this quiz
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5 text-muted-foreground"
                                        >
                                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                            <rect
                                                width="8"
                                                height="4"
                                                x="8"
                                                y="2"
                                                rx="1"
                                                ry="1"
                                            ></rect>
                                            <path d="M12 11h4"></path>
                                            <path d="M12 16h4"></path>
                                            <path d="M8 11h.01"></path>
                                            <path d="M8 16h.01"></path>
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Title
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.title}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-5 w-5 text-muted-foreground"
                                        >
                                            <rect
                                                width="18"
                                                height="18"
                                                x="3"
                                                y="3"
                                                rx="2"
                                                ry="2"
                                            ></rect>
                                            <path d="M3 9h18"></path>
                                            <path d="M9 21V9"></path>
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Lesson
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {lesson.title}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                Time Limit
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.time_limit
                                                    ? `${quiz.time_limit} minutes`
                                                    : 'No time limit'}
                                            </p>
                                        </div>
                                    </div>

                                    {quiz.due_date && (
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Due Date
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(
                                                        new Date(quiz.due_date),
                                                        'MMMM d, yyyy h:mm a',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Alert
                                    className={
                                        attempt.passed
                                            ? 'bg-green-50'
                                            : 'bg-amber-50'
                                    }
                                >
                                    {attempt.passed ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                    )}
                                    <AlertTitle>
                                        {attempt.passed
                                            ? 'Quiz Passed'
                                            : 'Quiz Not Passed'}
                                    </AlertTitle>
                                    <AlertDescription>
                                        {attempt.passed
                                            ? "Congratulations! You've successfully passed this quiz."
                                            : `You need at least ${quiz.passing_score}% to pass this quiz.`}
                                    </AlertDescription>
                                </Alert>

                                <Button asChild className="w-full">
                                    <Link
                                        href={route(
                                            'student.courses.learn',
                                            course.id,
                                        )}
                                    >
                                        Continue Learning
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Question Review</h2>
                    <p className="text-muted-foreground">
                        Review your answers and see the correct solutions
                    </p>

                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <Card
                                key={question.id}
                                className={
                                    getQuestionStatus(question.id)
                                        ? 'border-green-200'
                                        : 'border-red-200'
                                }
                            >
                                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-lg font-medium">
                                            Question {index + 1}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {question.question}
                                        </CardDescription>
                                    </div>
                                    {getQuestionStatus(question.id) ? (
                                        <Badge variant="success">Correct</Badge>
                                    ) : (
                                        <Badge variant="destructive">
                                            Incorrect
                                        </Badge>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {question.answers.map((answer) => {
                                            const status = formatAnswerStatus(
                                                question.id,
                                                answer.id,
                                            );
                                            return (
                                                <div
                                                    key={answer.id}
                                                    className={`flex items-start space-x-2 rounded-md border p-3 ${
                                                        status === 'correct'
                                                            ? 'border-green-200 bg-green-50'
                                                            : status ===
                                                                'incorrect'
                                                              ? 'border-red-200 bg-red-50'
                                                              : status ===
                                                                  'missed'
                                                                ? 'border-amber-200 bg-amber-50'
                                                                : 'border-gray-200'
                                                    }`}
                                                >
                                                    {status === 'correct' ? (
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    ) : status ===
                                                      'incorrect' ? (
                                                        <XCircle className="h-5 w-5 text-red-500" />
                                                    ) : status === 'missed' ? (
                                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                                    ) : (
                                                        <div className="h-5 w-5" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">
                                                            {answer.answer}
                                                        </p>
                                                        {status ===
                                                            'correct' && (
                                                            <p className="text-sm text-green-600">
                                                                Correct answer -
                                                                you selected
                                                                this
                                                            </p>
                                                        )}
                                                        {status ===
                                                            'incorrect' && (
                                                            <p className="text-sm text-red-600">
                                                                Wrong answer -
                                                                you selected
                                                                this
                                                            </p>
                                                        )}
                                                        {status ===
                                                            'missed' && (
                                                            <p className="text-sm text-amber-600">
                                                                Correct answer -
                                                                you didn't
                                                                select this
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
