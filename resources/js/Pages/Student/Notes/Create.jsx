import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Create({ course }) {
    const { data, setData, post, processing, errors } = useForm({
        content: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('student.notes.store', course.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Create Notes - ${course.title}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('student.notes.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Notes
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Notes for {course.title}</CardTitle>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="content">Notes Content</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) =>
                                        setData('content', e.target.value)
                                    }
                                    className="min-h-[300px]"
                                    placeholder="Write your notes here..."
                                />
                                {errors.content && (
                                    <p className="text-sm text-red-500">
                                        {errors.content}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" asChild>
                                <Link href={route('student.notes.index')}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Save Notes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
