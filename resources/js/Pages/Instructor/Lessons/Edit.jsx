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
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Edit({ course, lesson }) {
    const { data, setData, put, processing, errors } = useForm({
        title: lesson.title || '',
        slug: lesson.slug || '',
        description: lesson.description || '',
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        temp_video: '', // For temporary uploaded video
        duration: lesson.duration || '',
        order: lesson.order || 1,
        is_free: lesson.is_free || false,
        is_published: lesson.is_published || false,
        section: lesson.section || '',
    });

    const [activeTab, setActiveTab] = useState('basic');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [hasExistingVideo, setHasExistingVideo] = useState(
        !!lesson.video_path,
    );

    // Clean up temporary video on component unmount
    useEffect(() => {
        return () => {
            if (data.temp_video) {
                deleteTempVideo(data.temp_video);
            }
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(
            route('instructor.courses.lessons.update', {
                course: course.id,
                lesson: lesson.id,
            }),
        );
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Check file type
        const validTypes = [
            'video/mp4',
            'video/webm',
            'video/avi',
            'video/mpeg',
            'video/quicktime',
        ];
        if (!validTypes.includes(file.type)) {
            setUploadError(
                'Invalid file type. Please upload a video file (MP4, WebM, AVI, etc.)',
            );
            return;
        }

        // Check file size (100MB max)
        const maxSize = 100 * 1024 * 1024; // 100 MB
        if (file.size > maxSize) {
            setUploadError('File is too large. Maximum size is 100MB.');
            return;
        }

        setUploadError('');
        setIsUploading(true);
        setUploadProgress(0);

        // If there's already a temp video, delete it first
        if (data.temp_video) {
            deleteTempVideo(data.temp_video);
        }

        const formData = new FormData();
        formData.append('video', file);

        const xhr = new XMLHttpRequest();

        xhr.open('POST', route('instructor.lessons.videos.upload'), true);
        xhr.setRequestHeader(
            'X-CSRF-TOKEN',
            document.querySelector('meta[name="csrf-token"]').content,
        );

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(progress);
            }
        };

        xhr.onload = function () {
            setIsUploading(false);

            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                setData('temp_video', response.path);
                setData('video_url', ''); // Clear video URL when uploading a file
                setHasExistingVideo(false); // We're replacing the existing video
            } else {
                setUploadError('Error uploading file. Please try again.');
            }
        };

        xhr.onerror = function () {
            setIsUploading(false);
            setUploadError('Error uploading file. Please try again.');
        };

        xhr.send(formData);
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

    const renderVideoUploader = () => {
        return (
            <div className="space-y-3">
                <Label htmlFor="video">Video File</Label>
                <div className="grid gap-2">
                    {hasExistingVideo && !data.temp_video ? (
                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                            <div className="flex items-center">
                                <span className="font-medium">
                                    This lesson has an encrypted video
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setHasExistingVideo(false);
                                }}
                            >
                                Replace Video
                            </Button>
                        </div>
                    ) : data.temp_video ? (
                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                            <div className="flex items-center">
                                <span className="font-medium">
                                    New video uploaded successfully
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    deleteTempVideo(data.temp_video);
                                    setHasExistingVideo(!!lesson.video_path);
                                }}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <div className="flex items-center justify-center rounded-md border border-dashed border-border p-6">
                                <div className="text-center">
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <div className="mt-4">
                                        <label
                                            htmlFor="video-upload"
                                            className="inline-flex cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                                        >
                                            Select Video File
                                            <input
                                                id="video-upload"
                                                name="video"
                                                type="file"
                                                accept="video/*"
                                                className="sr-only"
                                                onChange={handleVideoUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        MP4, WebM, AVI up to 100MB
                                    </p>
                                </div>
                            </div>
                            {isUploading && (
                                <div>
                                    <div className="relative h-2 w-full rounded-full bg-muted">
                                        <div
                                            className="absolute h-2 rounded-full bg-primary"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <span className="mt-1 text-xs text-muted-foreground">
                                        Uploading... {uploadProgress}%
                                    </span>
                                </div>
                            )}
                            {uploadError && (
                                <span className="text-sm text-destructive">
                                    {uploadError}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {(!hasExistingVideo || data.temp_video) && (
                    <div className="flex items-center space-x-2">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="video_url">
                                Alternative: Video URL
                            </Label>
                            <Input
                                id="video_url"
                                type="url"
                                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                value={data.video_url}
                                onChange={(e) =>
                                    setData('video_url', e.target.value)
                                }
                                disabled={!!data.temp_video}
                            />
                            {data.temp_video && (
                                <p className="text-xs text-muted-foreground">
                                    To use a URL instead, remove the uploaded
                                    video first.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Lesson" />

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
                        Edit Lesson: {lesson.title}
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
                                        Edit the basic details for your lesson
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <LessonBasicForm
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                    />

                                    <div className="mt-6">
                                        {renderVideoUploader()}
                                    </div>
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
                                        Edit the main content for your lesson
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
                                            ? 'Saving...'
                                            : 'Save Changes'}
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
