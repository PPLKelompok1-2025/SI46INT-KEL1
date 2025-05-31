import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function EditAssignment({ lesson, assignment }) {
    const { data, setData, put, errors, processing } = useForm({
        title: assignment.title || '',
        description: assignment.description || '',
        due_date: assignment.due_date || '',
        points: assignment.points || 100,
        file: null,
    });

    const [date, setDate] = useState(
        assignment.due_date ? new Date(assignment.due_date) : null,
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        put(
            route('instructor.lessons.assignments.update', {
                lesson: lesson.id,
                assignment: assignment.id,
            }),
            {
                preserveScroll: true,
            },
        );
    };

    const handleFileChange = (e) => {
        setData('file', e.target.files[0]);
    };

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setData('due_date', newDate);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Assignment" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Edit Assignment
                    </h1>
                    <p className="text-muted-foreground">
                        Edit assignment for the lesson: {lesson.title}
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Assignment Details</CardTitle>
                            <CardDescription>
                                Update the details for this assignment.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Title{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Enter assignment title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter assignment description, instructions, and requirements"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    rows={6}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="due_date">
                                        Due Date{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    'w-full justify-start text-left font-normal',
                                                    !date &&
                                                        'text-muted-foreground',
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date
                                                    ? format(date, 'PPP')
                                                    : 'Select a due date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={handleDateChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.due_date && (
                                        <p className="text-sm text-red-500">
                                            {errors.due_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="points">
                                        Points{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="points"
                                        type="number"
                                        min={1}
                                        placeholder="100"
                                        value={data.points}
                                        onChange={(e) =>
                                            setData('points', e.target.value)
                                        }
                                    />
                                    {errors.points && (
                                        <p className="text-sm text-red-500">
                                            {errors.points}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">
                                    Update Assignment File (Optional)
                                </Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {assignment.file_path
                                        ? 'This will replace the existing file. Leave blank to keep the current file.'
                                        : 'Upload a file with assignment materials or instructions (max 10MB)'}
                                </p>
                                {errors.file && (
                                    <p className="text-sm text-red-500">
                                        {errors.file}
                                    </p>
                                )}

                                {assignment.file_path && (
                                    <div className="mt-2 text-sm">
                                        <span className="font-medium">
                                            Current file:{' '}
                                        </span>
                                        <a
                                            href={`/storage/${assignment.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            View file
                                        </a>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Update Assignment
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
