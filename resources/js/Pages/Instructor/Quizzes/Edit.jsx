import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { FormProvider, useForm as useReactHookForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    time_limit: z
        .string()
        .refine((val) => !val || (!isNaN(val) && parseInt(val) > 0), {
            message: 'Time limit must be a positive number',
        })
        .optional()
        .transform((val) => (val === '' ? null : val)),
    passing_score: z
        .string()
        .min(1, 'Passing score is required')
        .refine(
            (val) => !isNaN(val) && parseInt(val) >= 1 && parseInt(val) <= 100,
            {
                message: 'Passing score must be between 1 and 100',
            },
        ),
    due_date: z.string().optional(),
});

export default function EditQuiz({ quiz, lesson, course }) {
    const form = useReactHookForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: quiz.title,
            description: quiz.description || '',
            time_limit: quiz.time_limit ? String(quiz.time_limit) : '',
            passing_score: String(quiz.passing_score),
            due_date: quiz.due_date || '',
        },
    });

    const { data, setData, put, processing, errors } = useForm({
        title: quiz.title,
        description: quiz.description || '',
        time_limit: quiz.time_limit ? String(quiz.time_limit) : '',
        passing_score: String(quiz.passing_score),
        due_date: quiz.due_date || '',
    });

    const handleSubmit = (values) => {
        put(route('instructor.lessons.quizzes.update', [lesson.id, quiz.id]), {
            ...values,
            time_limit: values.time_limit ? parseInt(values.time_limit) : null,
            passing_score: parseInt(values.passing_score),
        });
    };

    const updateData = (field, value) => {
        setData({ ...data, [field]: value });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Quiz - ${quiz.title}`} />

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
                        <h1 className="text-3xl font-bold">Edit Quiz</h1>
                        <p className="mt-1 text-muted-foreground">
                            Update quiz information for {lesson.title} -{' '}
                            {course.title}
                        </p>
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            <Card>
                <CardHeader>
                    <CardTitle>Quiz Details</CardTitle>
                    <CardDescription>
                        Edit the basic information for your quiz
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
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter quiz title"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    updateData(
                                                        'title',
                                                        e.target.value,
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Description (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter a description for this quiz"
                                                className="min-h-[100px]"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    updateData(
                                                        'description',
                                                        e.target.value,
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        {errors.description && (
                                            <p className="text-sm text-destructive">
                                                {errors.description}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="time_limit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Time Limit (Minutes, Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 30"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        updateData(
                                                            'time_limit',
                                                            e.target.value,
                                                        );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Leave blank for no time limit
                                            </FormDescription>
                                            <FormMessage />
                                            {errors.time_limit && (
                                                <p className="text-sm text-destructive">
                                                    {errors.time_limit}
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="passing_score"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Passing Score (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 70"
                                                    min="1"
                                                    max="100"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        updateData(
                                                            'passing_score',
                                                            e.target.value,
                                                        );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Set the minimum score needed to
                                                pass (1-100)
                                            </FormDescription>
                                            <FormMessage />
                                            {errors.passing_score && (
                                                <p className="text-sm text-destructive">
                                                    {errors.passing_score}
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="due_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Due Date (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    updateData(
                                                        'due_date',
                                                        e.target.value,
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Leave blank if there is no due date
                                        </FormDescription>
                                        <FormMessage />
                                        {errors.due_date && (
                                            <p className="text-sm text-destructive">
                                                {errors.due_date}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

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
                                            Save Changes
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
