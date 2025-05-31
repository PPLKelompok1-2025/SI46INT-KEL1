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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
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

const generationSchema = z.object({
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
    document: z
        .instanceof(File)
        .refine((file) => file.size <= 10 * 1024 * 1024, {
            message: 'Document must be less than 10MB',
        })
        .refine(
            (file) =>
                [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/msword',
                ].includes(file.type),
            {
                message:
                    'Document must be a PDF or Word document (.pdf, .docx, .doc)',
            },
        ),
    num_questions: z
        .string()
        .min(1, 'Number of questions is required')
        .refine(
            (val) => !isNaN(val) && parseInt(val) >= 5 && parseInt(val) <= 30,
            {
                message: 'Number of questions must be between 5 and 30',
            },
        ),
    question_types: z
        .array(z.enum(['multiple_choice', 'true_false']))
        .refine((val) => val.length > 0, {
            message: 'At least one question type must be selected',
        }),
});

export default function CreateQuiz({ lesson }) {
    const [activeTab, setActiveTab] = useState('manual');

    // Manual creation form
    const form = useReactHookForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            time_limit: '',
            passing_score: '70',
            due_date: '',
        },
    });

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        time_limit: '',
        passing_score: '70',
        due_date: '',
    });

    // Auto generation form
    const genForm = useReactHookForm({
        resolver: zodResolver(generationSchema),
        defaultValues: {
            title: '',
            description: '',
            time_limit: '',
            passing_score: '70',
            due_date: '',
            document: undefined,
            num_questions: '10',
            question_types: ['multiple_choice', 'true_false'],
        },
    });

    const {
        data: genData,
        setData: setGenData,
        post: postGeneration,
        processing: generationProcessing,
        errors: genErrors,
    } = useForm({
        title: '',
        description: '',
        time_limit: '',
        passing_score: '70',
        due_date: '',
        document: null,
        num_questions: '10',
        question_types: ['multiple_choice', 'true_false'],
    });

    const handleManualSubmit = (values) => {
        post(route('instructor.lessons.quizzes.store', lesson.id), {
            ...values,
            time_limit: values.time_limit ? parseInt(values.time_limit) : null,
            passing_score: parseInt(values.passing_score),
        });
    };

    const handleGenerationSubmit = (values) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('time_limit', values.time_limit || '');
        formData.append('passing_score', values.passing_score);
        formData.append('due_date', values.due_date || '');
        formData.append('document', values.document);
        formData.append('num_questions', values.num_questions);
        values.question_types.forEach((type) => {
            formData.append('question_types[]', type);
        });

        postGeneration(
            route('instructor.lessons.quizzes.generate', lesson.id),
            {
                data: formData,
                forceFormData: true,
            },
        );
    };

    const updateData = (field, value) => {
        setData({ ...data, [field]: value });
    };

    const updateGenData = (field, value) => {
        setGenData({ ...genData, [field]: value });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Create Quiz - ${lesson.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Create Quiz
                        </h1>
                        <p className="text-muted-foreground">
                            Add a new quiz to lesson: {lesson.title}
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link
                            href={route(
                                'instructor.lessons.quizzes.index',
                                lesson.id,
                            )}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Quizzes
                        </Link>
                    </Button>
                </div>

                <Separator />

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">
                            Create Manually
                        </TabsTrigger>
                        <TabsTrigger value="generate">
                            Generate from Document
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Details</CardTitle>
                                <CardDescription>
                                    Create a new quiz by filling out the form
                                    below.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormProvider {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(
                                            handleManualSubmit,
                                        )}
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
                                                                field.onChange(
                                                                    e,
                                                                );
                                                                updateData(
                                                                    'title',
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage>
                                                        {errors.title}
                                                    </FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter quiz description (optional)"
                                                            className="resize-none"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(
                                                                    e,
                                                                );
                                                                updateData(
                                                                    'description',
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage>
                                                        {errors.description}
                                                    </FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="time_limit"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Time Limit (minutes)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="No limit"
                                                                {...field}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    field.onChange(
                                                                        e,
                                                                    );
                                                                    updateData(
                                                                        'time_limit',
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Leave empty for no
                                                            time limit
                                                        </FormDescription>
                                                        <FormMessage>
                                                            {errors.time_limit}
                                                        </FormMessage>
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
                                                                min="1"
                                                                max="100"
                                                                placeholder="70"
                                                                {...field}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    field.onChange(
                                                                        e,
                                                                    );
                                                                    updateData(
                                                                        'passing_score',
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage>
                                                            {
                                                                errors.passing_score
                                                            }
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />

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
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    field.onChange(
                                                                        e,
                                                                    );
                                                                    updateData(
                                                                        'due_date',
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Leave empty for no
                                                            due date
                                                        </FormDescription>
                                                        <FormMessage>
                                                            {errors.due_date}
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create Quiz
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="generate">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Generate Quiz from Document
                                </CardTitle>
                                <CardDescription>
                                    Upload a document (PDF or Word) to
                                    automatically generate quiz questions using
                                    AI.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormProvider {...genForm}>
                                    <form
                                        onSubmit={genForm.handleSubmit(
                                            handleGenerationSubmit,
                                        )}
                                        className="space-y-6"
                                    >
                                        <FormField
                                            control={genForm.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter quiz title"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(
                                                                    e,
                                                                );
                                                                updateGenData(
                                                                    'title',
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage>
                                                        {genErrors.title}
                                                    </FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={genForm.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter quiz description (optional)"
                                                            className="resize-none"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(
                                                                    e,
                                                                );
                                                                updateGenData(
                                                                    'description',
                                                                    e.target
                                                                        .value,
                                                                );
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage>
                                                        {genErrors.description}
                                                    </FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            <FormField
                                                control={genForm.control}
                                                name="time_limit"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Time Limit (minutes)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="No limit"
                                                                {...field}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    field.onChange(
                                                                        e,
                                                                    );
                                                                    updateGenData(
                                                                        'time_limit',
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Leave empty for no
                                                            time limit
                                                        </FormDescription>
                                                        <FormMessage>
                                                            {
                                                                genErrors.time_limit
                                                            }
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={genForm.control}
                                                name="passing_score"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Passing Score (%)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                max="100"
                                                                placeholder="70"
                                                                {...field}
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    field.onChange(
                                                                        e,
                                                                    );
                                                                    updateGenData(
                                                                        'passing_score',
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage>
                                                            {
                                                                genErrors.passing_score
                                                            }
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={genForm.control}
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
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    field.onChange(
                                                                        e,
                                                                    );
                                                                    updateGenData(
                                                                        'due_date',
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Leave empty for no
                                                            due date
                                                        </FormDescription>
                                                        <FormMessage>
                                                            {genErrors.due_date}
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="space-y-6">
                                            <FormField
                                                control={genForm.control}
                                                name="document"
                                                render={({
                                                    field: {
                                                        value,
                                                        onChange,
                                                        ...fieldProps
                                                    },
                                                }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Document
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="grid w-full items-center gap-1.5">
                                                                <Input
                                                                    id="document"
                                                                    type="file"
                                                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const file =
                                                                            e
                                                                                .target
                                                                                .files?.[0];
                                                                        onChange(
                                                                            file,
                                                                        );
                                                                        if (
                                                                            file
                                                                        ) {
                                                                            updateGenData(
                                                                                'document',
                                                                                file,
                                                                            );
                                                                        }
                                                                    }}
                                                                    {...fieldProps}
                                                                    value={
                                                                        fieldProps.value
                                                                    }
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription>
                                                            Upload a PDF or Word
                                                            document (.pdf,
                                                            .docx, .doc)
                                                        </FormDescription>
                                                        <FormMessage>
                                                            {genErrors.document}
                                                        </FormMessage>
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <FormField
                                                    control={genForm.control}
                                                    name="num_questions"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Number of
                                                                Questions
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="5"
                                                                    max="30"
                                                                    placeholder="10"
                                                                    {...field}
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        field.onChange(
                                                                            e,
                                                                        );
                                                                        updateGenData(
                                                                            'num_questions',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Between 5 and 30
                                                                questions
                                                            </FormDescription>
                                                            <FormMessage>
                                                                {
                                                                    genErrors.num_questions
                                                                }
                                                            </FormMessage>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={genForm.control}
                                                    name="question_types"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Question Types
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="flex gap-4">
                                                                    <label className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            value="multiple_choice"
                                                                            checked={field.value.includes(
                                                                                'multiple_choice',
                                                                            )}
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                const updatedTypes =
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                                        ? [
                                                                                              ...field.value,
                                                                                              'multiple_choice',
                                                                                          ]
                                                                                        : field.value.filter(
                                                                                              (
                                                                                                  type,
                                                                                              ) =>
                                                                                                  type !==
                                                                                                  'multiple_choice',
                                                                                          );
                                                                                field.onChange(
                                                                                    updatedTypes,
                                                                                );
                                                                                updateGenData(
                                                                                    'question_types',
                                                                                    updatedTypes,
                                                                                );
                                                                            }}
                                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                        />
                                                                        <span>
                                                                            Multiple
                                                                            Choice
                                                                        </span>
                                                                    </label>
                                                                    <label className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            value="true_false"
                                                                            checked={field.value.includes(
                                                                                'true_false',
                                                                            )}
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                const updatedTypes =
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                                        ? [
                                                                                              ...field.value,
                                                                                              'true_false',
                                                                                          ]
                                                                                        : field.value.filter(
                                                                                              (
                                                                                                  type,
                                                                                              ) =>
                                                                                                  type !==
                                                                                                  'true_false',
                                                                                          );
                                                                                field.onChange(
                                                                                    updatedTypes,
                                                                                );
                                                                                updateGenData(
                                                                                    'question_types',
                                                                                    updatedTypes,
                                                                                );
                                                                            }}
                                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                        />
                                                                        <span>
                                                                            True/False
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage>
                                                                {
                                                                    genErrors.question_types
                                                                }
                                                            </FormMessage>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={generationProcessing}
                                            >
                                                {generationProcessing ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Generate Quiz
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </FormProvider>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
