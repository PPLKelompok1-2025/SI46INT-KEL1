import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
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
import { Checkbox } from '@/Components/ui/checkbox';
import { Progress } from '@/Components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Separator } from '@/Components/ui/separator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ShowQuiz({
    quiz,
    lesson,
    course,
    attempts,
    canTakeQuiz,
    isDuePassed,
}) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(
        quiz.time_limit ? quiz.time_limit * 60 : null,
    );
    const [quizStarted, setQuizStarted] = useState(false);
    const [, setQuizCompleted] = useState(false);

    const { setData, post, processing } = useForm({
        answers: [],
    });

    // Start timer when quiz starts
    useEffect(() => {
        if (!quizStarted || !timeLeft) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizStarted, timeLeft]);

    const startQuiz = () => {
        setQuizStarted(true);

        // Initialize selected answers
        const initialAnswers = {};
        quiz.questions.forEach((question) => {
            initialAnswers[question.id] = [];
        });
        setSelectedAnswers(initialAnswers);
    };

    const handleSelectAnswer = (questionId, answerId) => {
        const question = quiz.questions.find((q) => q.id === questionId);

        if (question.type === 'multiple_choice') {
            // For multiple choice, toggle the answer
            setSelectedAnswers((prev) => {
                const currentSelections = prev[questionId] || [];

                if (currentSelections.includes(answerId)) {
                    return {
                        ...prev,
                        [questionId]: currentSelections.filter(
                            (id) => id !== answerId,
                        ),
                    };
                } else {
                    return {
                        ...prev,
                        [questionId]: [...currentSelections, answerId],
                    };
                }
            });
        } else if (question.type === 'true_false') {
            // For true/false, select only one answer
            setSelectedAnswers((prev) => ({
                ...prev,
                [questionId]: [answerId],
            }));
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion((prev) => prev - 1);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const submitQuiz = () => {
        // Convert selectedAnswers to the format expected by the backend
        const formattedAnswers = Object.entries(selectedAnswers).map(
            ([questionId, answerIds]) => ({
                question_id: parseInt(questionId),
                selected_answers: answerIds,
            }),
        );

        // update form data and submit
        setData('answers', formattedAnswers);
        post(route('student.quizzes.submit', quiz.id), {
            onSuccess: () => {
                setQuizCompleted(true);
            },
        });
    };

    const isQuestionAnswered = (questionId) => {
        return (
            selectedAnswers[questionId] &&
            selectedAnswers[questionId].length > 0
        );
    };

    const currentQuestionObj = quiz.questions
        ? quiz.questions[currentQuestion]
        : null;
    const progress = quiz.questions
        ? ((currentQuestion + 1) / quiz.questions.length) * 100
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title={`Quiz: ${quiz.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {quiz.title}
                        </h1>
                        <p className="text-muted-foreground">
                            {lesson.title} - {course.title}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('student.courses.learn', course.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Lesson
                        </Link>
                    </Button>
                </div>

                <Separator />

                {!quizStarted ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Information</CardTitle>
                            <CardDescription>
                                {quiz.description ||
                                    'Complete this quiz to test your knowledge of the lesson material.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Passing Score
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.passing_score}%
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
                                                Questions
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.questions
                                                    ? quiz.questions.length
                                                    : 0}
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
                                </div>

                                {quiz.due_date && (
                                    <Alert
                                        variant={
                                            isDuePassed
                                                ? 'destructive'
                                                : 'default'
                                        }
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Due Date</AlertTitle>
                                        <AlertDescription>
                                            {isDuePassed
                                                ? `This quiz was due on ${format(new Date(quiz.due_date), 'MMMM d, yyyy h:mm a')}`
                                                : `This quiz is due by ${format(new Date(quiz.due_date), 'MMMM d, yyyy h:mm a')}`}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {attempts.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-lg font-medium">
                                            Previous Attempts
                                        </h3>
                                        <div className="space-y-2">
                                            {attempts.map((attempt, index) => (
                                                <div
                                                    key={attempt.id}
                                                    className="flex items-center justify-between rounded-md border p-3"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {attempt.passed ? (
                                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                                        ) : (
                                                            <AlertCircle className="h-5 w-5 text-amber-500" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium">
                                                                Attempt{' '}
                                                                {attempts.length -
                                                                    index}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {format(
                                                                    new Date(
                                                                        attempt.completed_at,
                                                                    ),
                                                                    'MMM d, yyyy h:mm a',
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Badge
                                                            variant={
                                                                attempt.passed
                                                                    ? 'success'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            Score:{' '}
                                                            {attempt.score}%
                                                        </Badge>
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    'student.quizzes.results',
                                                                    attempt.id,
                                                                )}
                                                            >
                                                                View Results
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <div>
                                {isDuePassed && (
                                    <Alert
                                        variant="destructive"
                                        className="mb-4"
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>
                                            Quiz is past due
                                        </AlertTitle>
                                        <AlertDescription>
                                            You can no longer take this quiz as
                                            it is past the due date.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {!isDuePassed &&
                                    attempts.some((a) => a.passed) && (
                                        <Alert className="mb-4">
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertTitle>
                                                Quiz already passed
                                            </AlertTitle>
                                            <AlertDescription>
                                                You have already passed this
                                                quiz. You can view your previous
                                                attempts above.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                            </div>

                            <Button
                                onClick={startQuiz}
                                disabled={
                                    !canTakeQuiz ||
                                    !quiz.questions ||
                                    quiz.questions.length === 0
                                }
                            >
                                Start Quiz
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {timeLeft !== null && (
                            <div className="rounded-md bg-primary/10 p-2 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">
                                        Time Remaining: {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <Progress value={progress} className="h-2 w-full" />

                        <div className="flex items-center justify-between text-sm">
                            <span>
                                Question {currentQuestion + 1} of{' '}
                                {quiz.questions.length}
                            </span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>

                        {currentQuestionObj && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        {currentQuestionObj.question}
                                    </CardTitle>
                                    <CardDescription>
                                        {currentQuestionObj.type ===
                                        'multiple_choice'
                                            ? 'Select all that apply'
                                            : 'Select one option'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {currentQuestionObj.type ===
                                        'multiple_choice' ? (
                                            currentQuestionObj.answers.map(
                                                (answer) => (
                                                    <div
                                                        key={answer.id}
                                                        className="flex items-start space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={`answer-${answer.id}`}
                                                            checked={(
                                                                selectedAnswers[
                                                                    currentQuestionObj
                                                                        .id
                                                                ] || []
                                                            ).includes(
                                                                answer.id,
                                                            )}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                if (checked) {
                                                                    handleSelectAnswer(
                                                                        currentQuestionObj.id,
                                                                        answer.id,
                                                                    );
                                                                } else {
                                                                    handleSelectAnswer(
                                                                        currentQuestionObj.id,
                                                                        answer.id,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`answer-${answer.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {answer.answer}
                                                        </label>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <RadioGroup
                                                onValueChange={(value) => {
                                                    handleSelectAnswer(
                                                        currentQuestionObj.id,
                                                        parseInt(value),
                                                    );
                                                }}
                                                value={(selectedAnswers[
                                                    currentQuestionObj.id
                                                ] || [])[0]?.toString()}
                                            >
                                                {currentQuestionObj.answers.map(
                                                    (answer) => (
                                                        <div
                                                            key={answer.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <RadioGroupItem
                                                                value={answer.id.toString()}
                                                                id={`answer-${answer.id}`}
                                                            />
                                                            <label
                                                                htmlFor={`answer-${answer.id}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {answer.answer}
                                                            </label>
                                                        </div>
                                                    ),
                                                )}
                                            </RadioGroup>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={prevQuestion}
                                        disabled={currentQuestion === 0}
                                    >
                                        Previous
                                    </Button>
                                    <div>
                                        {currentQuestion ===
                                        quiz.questions.length - 1 ? (
                                            <Button
                                                onClick={submitQuiz}
                                                disabled={processing}
                                                variant="default"
                                            >
                                                {processing
                                                    ? 'Submitting...'
                                                    : 'Submit Quiz'}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={nextQuestion}
                                                disabled={
                                                    !isQuestionAnswered(
                                                        currentQuestionObj.id,
                                                    )
                                                }
                                            >
                                                Next
                                            </Button>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        )}

                        <div className="flex justify-center">
                            <div className="flex flex-wrap gap-2">
                                {quiz.questions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            setCurrentQuestion(index)
                                        }
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                                            currentQuestion === index
                                                ? 'bg-primary text-primary-foreground'
                                                : isQuestionAnswered(
                                                        question.id,
                                                    )
                                                  ? 'bg-primary/20 text-primary'
                                                  : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
