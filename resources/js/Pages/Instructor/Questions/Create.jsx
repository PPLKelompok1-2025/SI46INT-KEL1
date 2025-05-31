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
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { FormProvider, useForm as useReactHookForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z
    .object({
        question: z.string().min(1, 'Question is required'),
        type: z.enum(['multiple_choice', 'true_false']),
        points: z
            .string()
            .min(1, 'Points are required')
            .refine((val) => !isNaN(val) && parseInt(val) > 0, {
                message: 'Points must be a positive number',
            }),
        answers: z
            .array(
                z.object({
                    answer: z.string().min(1, 'Answer text is required'),
                    is_correct: z.boolean(),
                }),
            )
            .min(2, 'At least 2 answers are required')
            .refine((answers) => answers.some((answer) => answer.is_correct), {
                message: 'At least one answer must be marked as correct',
            }),
    })
    .refine(
        (data) => {
            if (data.type === 'true_false') {
                return data.answers.length === 2;
            }
            return true;
        },
        {
            path: ['answers'],
            message: 'True/False questions must have exactly 2 answers',
        },
    );

export default function CreateQuestion({ quiz, lesson, questionTypes }) {
    const form = useReactHookForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: '',
            type: 'multiple_choice',
            points: '1',
            answers: [
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
            ],
        },
    });

    const { data, setData, post, processing, errors } = useForm({
        question: '',
        type: 'multiple_choice',
        points: '1',
        answers: [
            { answer: '', is_correct: false },
            { answer: '', is_correct: false },
            { answer: '', is_correct: false },
            { answer: '', is_correct: false },
        ],
        addAnother: false,
    });

    const addAnswer = () => {
        const currentAnswers = form.getValues('answers');
        form.setValue('answers', [
            ...currentAnswers,
            { answer: '', is_correct: false },
        ]);
        setData('answers', [
            ...data.answers,
            { answer: '', is_correct: false },
        ]);
    };

    const removeAnswer = (index) => {
        const currentAnswers = form.getValues('answers');
        if (currentAnswers.length <= 2) return;

        const newAnswers = currentAnswers.filter((_, i) => i !== index);
        form.setValue('answers', newAnswers);
        setData('answers', newAnswers);
    };

    const onTypeChange = (type) => {
        form.setValue('type', type);
        setData('type', type);

        if (type === 'true_false') {
            const truefalseAnswers = [
                { answer: 'True', is_correct: false },
                { answer: 'False', is_correct: false },
            ];
            form.setValue('answers', truefalseAnswers);
            setData('answers', truefalseAnswers);
        } else if (form.getValues('answers').length < 3) {
            // If coming from true/false, ensure we have at least 4 answers for multiple choice
            const newAnswers = [
                ...form.getValues('answers'),
                { answer: '', is_correct: false },
                { answer: '', is_correct: false },
            ];
            form.setValue('answers', newAnswers);
            setData('answers', newAnswers);
        }
    };

    const onSubmit = (values) => {
        post(route('instructor.quizzes.questions.store', quiz.id), {
            ...values,
            points: parseInt(values.points),
            addAnother: data.addAnother,
        });
    };

    const updateAnswerField = (index, field, value) => {
        const updatedAnswers = [...data.answers];
        updatedAnswers[index][field] = value;
        setData('answers', updatedAnswers);

        const formAnswers = [...form.getValues('answers')];
        formAnswers[index][field] = value;
        form.setValue('answers', formAnswers);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Add Question - ${quiz.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Add Question
                        </h1>
                        <p className="text-muted-foreground">
                            Add a new question to quiz: {quiz.title}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link
                            href={route('instructor.lessons.quizzes.show', [
                                lesson.id,
                                quiz.id,
                            ])}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Quiz
                        </Link>
                    </Button>
                </div>

                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Question Details</CardTitle>
                        <CardDescription>
                            Create a new question for this quiz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormProvider {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <FormField
                                    control={form.control}
                                    name="question"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter your question"
                                                    className="resize-none"
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
                                            <FormMessage>
                                                {errors.question}
                                            </FormMessage>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Question Type
                                                </FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(
                                                            value,
                                                        ) => {
                                                            field.onChange(
                                                                value,
                                                            );
                                                            onTypeChange(value);
                                                        }}
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a question type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(
                                                                questionTypes,
                                                            ).map(
                                                                ([
                                                                    value,
                                                                    label,
                                                                ]) => (
                                                                    <SelectItem
                                                                        key={
                                                                            value
                                                                        }
                                                                        value={
                                                                            value
                                                                        }
                                                                    >
                                                                        {label}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage>
                                                    {errors.type}
                                                </FormMessage>
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
                                                        placeholder="1"
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
                                                <FormMessage>
                                                    {errors.points}
                                                </FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium">
                                            Answers
                                        </h3>
                                        {data.type === 'multiple_choice' && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addAnswer}
                                                size="sm"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Answer
                                            </Button>
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="answers"
                                        render={() => (
                                            <FormItem>
                                                <div className="space-y-4">
                                                    {form
                                                        .watch('answers')
                                                        .map(
                                                            (answer, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-start space-x-2"
                                                                >
                                                                    <Checkbox
                                                                        id={`answer-correct-${index}`}
                                                                        checked={
                                                                            answer.is_correct
                                                                        }
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) => {
                                                                            updateAnswerField(
                                                                                index,
                                                                                'is_correct',
                                                                                checked,
                                                                            );
                                                                        }}
                                                                        className="mt-2.5"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <Input
                                                                            id={`answer-text-${index}`}
                                                                            value={
                                                                                answer.answer
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateAnswerField(
                                                                                    index,
                                                                                    'answer',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder={`Answer ${index + 1}`}
                                                                        />
                                                                    </div>
                                                                    {data.type ===
                                                                        'multiple_choice' &&
                                                                        data
                                                                            .answers
                                                                            .length >
                                                                            2 && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    removeAnswer(
                                                                                        index,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                </div>
                                                            ),
                                                        )}
                                                </div>
                                                <FormMessage>
                                                    {errors.answers}
                                                </FormMessage>
                                                <FormDescription>
                                                    Check the correct answer(s)
                                                    for this question.
                                                    {data.type ===
                                                        'true_false' &&
                                                        ' True/False questions must have exactly 2 answers.'}
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="add-another"
                                            checked={data.addAnother}
                                            onCheckedChange={(checked) => {
                                                setData(
                                                    'addAnother',
                                                    !!checked,
                                                );
                                            }}
                                        />
                                        <label
                                            htmlFor="add-another"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Add another question after saving
                                        </label>
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Question
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </FormProvider>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
