import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Clock, Edit, ListChecks, Plus, Trash2 } from 'lucide-react';

export default function QuizIndex({ lesson, course, quizzes }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Quizzes - ${lesson.title}`} />

            <div className="mb-6">
                <Link
                    href={route('instructor.courses.lessons.show', [
                        course.id,
                        lesson.id,
                    ])}
                    className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Lesson
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Quizzes</h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage quizzes for {lesson.title}
                        </p>
                    </div>

                    <Button asChild>
                        <Link
                            href={route(
                                'instructor.lessons.quizzes.create',
                                lesson.id,
                            )}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Quiz
                        </Link>
                    </Button>
                </div>
            </div>

            <Separator className="my-6" />

            {quizzes.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Quizzes Found</CardTitle>
                        <CardDescription>
                            You haven't created any quizzes for this lesson yet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center py-6">
                            <Button asChild>
                                <Link
                                    href={route(
                                        'instructor.lessons.quizzes.create',
                                        lesson.id,
                                    )}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Quiz
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Quizzes</CardTitle>
                        <CardDescription>
                            You have {quizzes.length} quiz
                            {quizzes.length !== 1 ? 'zes' : ''} for this lesson
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Questions</TableHead>
                                    <TableHead>Time Limit</TableHead>
                                    <TableHead>Passing Score</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quizzes.map((quiz) => (
                                    <TableRow key={quiz.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={route(
                                                    'instructor.lessons.quizzes.show',
                                                    [lesson.id, quiz.id],
                                                )}
                                                className="text-primary hover:underline"
                                            >
                                                {quiz.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {quiz.questions_count} Question
                                                {quiz.questions_count !== 1
                                                    ? 's'
                                                    : ''}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {quiz.time_limit ? (
                                                <div className="flex items-center">
                                                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                                                    {quiz.time_limit} minutes
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    No time limit
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {quiz.passing_score}%
                                        </TableCell>
                                        <TableCell>
                                            {quiz.due_date ? (
                                                format(
                                                    new Date(quiz.due_date),
                                                    'MMM d, yyyy',
                                                )
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    No due date
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'instructor.lessons.quizzes.show',
                                                            [
                                                                lesson.id,
                                                                quiz.id,
                                                            ],
                                                        )}
                                                    >
                                                        <ListChecks className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route(
                                                            'instructor.lessons.quizzes.edit',
                                                            [
                                                                lesson.id,
                                                                quiz.id,
                                                            ],
                                                        )}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                'Are you sure you want to delete this quiz?',
                                                            )
                                                        ) {
                                                            router.delete(
                                                                route(
                                                                    'instructor.lessons.quizzes.destroy',
                                                                    [
                                                                        lesson.id,
                                                                        quiz.id,
                                                                    ],
                                                                ),
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </AuthenticatedLayout>
    );
}
