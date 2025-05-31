import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm as useReactHookForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    quiz_id: z.number(),
    question: z.string().min(1, 'Question text is required'),
    type: z.enum(['multiple_choice', 'true_false']),
    points: z.coerce
        .number()
        .min(1, 'Points must be at least 1')
        .max(100, 'Points cannot exceed 100'),
    answers: z
        .array(
            z.object({
                id: z.number().optional(),
                answer: z.string().min(1, 'Answer text is required'),
                is_correct: z.boolean(),
            }),
        )
        .min(2, 'At least 2 answers are required'),
});

export default function EditQuestion({ quiz, question, lesson }) {
    // Initialize with existing answers
    const [answers, setAnswers] = useState(
        question.answers.map((answer) => ({
            id: answer.id,
            answer: answer.answer,
            is_correct: answer.is_correct,
        })),
    );

    const form = useReactHookForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quiz_id: quiz.id,
            question: question.question,
            type: question.type,
            points: question.points,
            answers: answers,
        },
    });

    const { data, setData, put, processing, errors } = useForm({
        quiz_id: quiz.id,
        question: question.question,
        type: question.type,
        points: question.points,
        answers: answers,
    });

    const addAnswer = () => {
        const newAnswers = [...answers, { answer: '', is_correct: false }];
        setAnswers(newAnswers);
        setData('answers', newAnswers);
        form.setValue('answers', newAnswers);
    };

    const removeAnswer = (index) => {
        if (answers.length <= 2) {
            alert('You need at least 2 answers');
            return;
        }

        const newAnswers = [...answers];
        newAnswers.splice(index, 1);
        setAnswers(newAnswers);
        setData('answers', newAnswers);
        form.setValue('answers', newAnswers);
    };

    const updateAnswer = (index, field, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = {
            ...newAnswers[index],
            [field]: value,
        };

        setAnswers(newAnswers);
        setData('answers', newAnswers);
        form.setValue('answers', newAnswers);
    };

    const handleTypeChange = (type) => {
        setData('type', type);
        form.setValue('type', type);

        // If changing to true/false, reset answers to just True and False
        if (type === 'true_false') {
            const tfAnswers = [
                { answer: 'True', is_correct: true },
                { answer: 'False', is_correct: false },
            ];

            // If we had existing true/false answers with IDs, preserve them
            if (
                answers.length === 2 &&
                (answers[0].answer === 'True' ||
                    answers[0].answer === 'False') &&
                (answers[1].answer === 'True' || answers[1].answer === 'False')
            ) {
                tfAnswers[0].id = answers[0].id;
                tfAnswers[1].id = answers[1].id;
            }

            setAnswers(tfAnswers);
            setData('answers', tfAnswers);
            form.setValue('answers', tfAnswers);
        }
    };

    const handleTrueFalseToggle = (index) => {
        const newAnswers = answers.map((answer, idx) => ({
            ...answer,
            is_correct: idx === index,
        }));

        setAnswers(newAnswers);
        setData('answers', newAnswers);
        form.setValue('answers', newAnswers);
    };

    const handleSubmit = (values) => {
        put(
            route('instructor.quizzes.questions.update', [
                quiz.id,
                question.id,
            ]),
            values,
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Question" />

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
                        <h1 className="text-3xl font-bold">Edit Question</h1>
                        <p className="mt-1 text-muted-foreground">
                            Update question for {quiz.title}
                        </p>
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            <Card>
                <CardHeader>
                    <CardTitle>Question Details</CardTitle>
                    <CardDescription>
                        Edit the question content and answers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormProvider {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Question Text</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter your question here"
                                                className="min-h-[100px]"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setData(
                                                        'question',
                                                        e.target.value,
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        {errors.question && (
                                            <p className="text-sm text-destructive">
                                                {errors.question}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Type</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleTypeChange(value);
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select question type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="multiple_choice">
                                                        Multiple Choice
                                                    </SelectItem>
                                                    <SelectItem value="true_false">
                                                        True/False
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Choose the type of question
                                            </FormDescription>
                                            <FormMessage />
                                            {errors.type && (
                                                <p className="text-sm text-destructive">
                                                    {errors.type}
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="points"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Points</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    placeholder="e.g., 5"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        setData(
                                                            'points',
                                                            e.target.value,
                                                        );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Points awarded for a correct
                                                answer
                                            </FormDescription>
                                            <FormMessage />
                                            {errors.points && (
                                                <p className="text-sm text-destructive">
                                                    {errors.points}
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">
                                        Answers
                                    </h3>
                                    {data.type !== 'true_false' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addAnswer}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Answer
                                        </Button>
                                    )}
                                </div>

                                {errors.answers && (
                                    <p className="text-sm text-destructive">
                                        {errors.answers}
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {answers.map((answer, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 rounded-md border p-3"
                                        >
                                            <div className="mt-3">
                                                {data.type === 'true_false' ? (
                                                    <div className="flex h-4 w-4 items-center justify-center rounded-full border">
                                                        {answer.is_correct && (
                                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Checkbox
                                                        checked={
                                                            answer.is_correct
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) => {
                                                            updateAnswer(
                                                                index,
                                                                'is_correct',
                                                                checked,
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="space-y-1">
                                                    <Label
                                                        htmlFor={`answer-${index}`}
                                                    >
                                                        Answer {index + 1}
                                                    </Label>
                                                    {data.type ===
                                                    'true_false' ? (
                                                        <Input
                                                            id={`answer-${index}`}
                                                            value={
                                                                answer.answer
                                                            }
                                                            disabled
                                                        />
                                                    ) : (
                                                        <Input
                                                            id={`answer-${index}`}
                                                            value={
                                                                answer.answer
                                                            }
                                                            onChange={(e) => {
                                                                updateAnswer(
                                                                    index,
                                                                    'answer',
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                            placeholder="Enter answer text"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {data.type === 'true_false' ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleTrueFalseToggle(
                                                                index,
                                                            )
                                                        }
                                                        disabled={
                                                            answer.is_correct
                                                        }
                                                    >
                                                        Set Correct
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            removeAnswer(index)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Question
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
