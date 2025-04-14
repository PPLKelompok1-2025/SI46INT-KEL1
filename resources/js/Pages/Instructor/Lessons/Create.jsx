import LessonBasicForm from '@/Components/Instructor/Lessons/LessonBasicForm';
import LessonContentForm from '@/Components/Instructor/Lessons/LessonContentForm';
import LessonSettingsForm from '@/Components/Instructor/Lessons/LessonSettingsForm';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Create({ course, nextOrder }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        description: '',
        content: '',
        video_url: '',
        temp_video: '', // For temporary uploaded video path
        duration: '',
        order: nextOrder,
        is_free: false,
        is_published: false,
        section: '',
    });

    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        return () => {
            if (data.temp_video) {
                deleteTempVideo(data.temp_video);
            }
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('instructor.courses.lessons.store', course.id));
    };

    const deleteTempVideo = (path) => {
        if (!path) return;

        fetch(route('instructor.lessons.videos.delete'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector(
                    'meta[name="csrf-token"]',
                ).content,
            },
            body: JSON.stringify({ path }),
        }).then((response) => {
            if (response.ok) {
                setData('temp_video', '');
                setUploadProgress(0);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Lesson" />

            <div className="space-y-6">
                <div className="mb-6 flex items-center">
                    <Button variant="ghost" asChild className="mr-4">
                        <Link
                            href={route(
                                'instructor.courses.lessons.index',
                                course.id,
                            )}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to
                            Lessons
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">
                        Create New Lesson for {course.title}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-4"
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">
                                Basic Information
                            </TabsTrigger>
                            <TabsTrigger value="content">
                                Lesson Content
                            </TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Enter the basic details for your new
                                        lesson
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <LessonBasicForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('content')}
                                    >
                                        Next: Lesson Content
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="content">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lesson Content</CardTitle>
                                    <CardDescription>
                                        Add the main content for your lesson
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <LessonContentForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('basic')}
                                    >
                                        Previous: Basic Information
                                    </Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('settings')}
                                    >
                                        Next: Settings
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lesson Settings</CardTitle>
                                    <CardDescription>
                                        Configure additional settings for your
                                        lesson
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <LessonSettingsForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('content')}
                                    >
                                        Previous: Lesson Content
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Creating...'
                                            : 'Create Lesson'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
