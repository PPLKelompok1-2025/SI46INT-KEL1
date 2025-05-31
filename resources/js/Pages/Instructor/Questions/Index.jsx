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
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';

export default function QuestionIndex({ quiz, questions, lesson }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Questions - ${quiz.title}`} />

            <div className="mb-6">
                <Link
                    href={route('instructor.lessons.quizzes.show', [
                        lesson.id,
                        quiz.id,
                    ])}
                    className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Quiz
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Questions</h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage questions for {quiz.title}
                        </p>
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
                </div>
            </div>

            <Separator className="my-6" />

            {questions.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Questions Found</CardTitle>
                        <CardDescription>
                            You haven't created any questions for this quiz yet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center py-6">
                            <Button asChild>
                                <Link
                                    href={route(
                                        'instructor.quizzes.questions.create',
                                        quiz.id,
                                    )}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Question
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>All Questions</CardTitle>
                        <CardDescription>
                            You have {questions.length} question
                            {questions.length !== 1 ? 's' : ''} for this quiz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Answers</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {questions.map((question, index) => (
                                    <TableRow key={question.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="max-w-md truncate font-medium">
                                            {question.question}
                                        </TableCell>
                                        <TableCell>
                                            <Badge>
                                                {question.type ===
                                                'multiple_choice'
                                                    ? 'Multiple Choice'
                                                    : question.type ===
                                                        'true_false'
                                                      ? 'True/False'
                                                      : question.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {question.points} pt
                                            {question.points !== 1 ? 's' : ''}
                                        </TableCell>
                                        <TableCell>
                                            {question.answers
                                                ? question.answers.length
                                                : 0}{' '}
                                            answer
                                            {question.answers &&
                                            question.answers.length !== 1
                                                ? 's'
                                                : ''}
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
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                'Are you sure you want to delete this question?',
                                                            )
                                                        ) {
                                                            // Delete functionality would go here
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
