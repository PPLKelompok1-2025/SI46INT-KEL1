import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import { ArrowLeft } from 'lucide-react';
import { useRef } from 'react';

export default function Create({ course }) {
    const editorRef = useRef(null);
    const { data, setData, post, processing, errors } = useForm({
        content: '',
    });

    const handleEditorChange = (content) => {
        setData('content', content);
    };

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
                                <Editor
                                    onInit={(evt, editor) =>
                                        (editorRef.current = editor)
                                    }
                                    value={data.content}
                                    onEditorChange={handleEditorChange}
                                    init={{
                                        height: 400,
                                        menubar: false,
                                        plugins: [
                                            'advlist',
                                            'autolink',
                                            'lists',
                                            'link',
                                            'image',
                                            'charmap',
                                            'preview',
                                            'anchor',
                                            'searchreplace',
                                            'visualblocks',
                                            'code',
                                            'fullscreen',
                                            'insertdatetime',
                                            'media',
                                            'table',
                                            'code',
                                            'help',
                                            'wordcount',
                                        ],
                                        toolbar:
                                            'undo redo | blocks | ' +
                                            'bold italic forecolor | alignleft aligncenter ' +
                                            'alignright alignjustify | bullist numlist outdent indent | ' +
                                            'removeformat | help',
                                        content_style:
                                            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                    }}
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
