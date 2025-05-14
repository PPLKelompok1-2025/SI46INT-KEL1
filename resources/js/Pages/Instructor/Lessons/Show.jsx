import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    GraduationCap,
    ListChecks,
    Save,
    Trash2,
    Video,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Show({ lesson, course }) {
    const videoPlayerRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        duration: lesson.duration,
        order: lesson.order,
        is_preview: lesson.is_preview,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('lessons.update', lesson.id));
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this lesson?')) {
            router.delete(route('lessons.destroy', lesson.id));
        }
    };

    useEffect(() => {
        // Initialize video player if there's an encrypted video
        if (lesson.video_path && videoPlayerRef.current) {
            // Check if any HLS player script is already loaded
            if (!window.Hls) {
                // Load HLS.js script
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
                script.async = true;
                script.onload = initializeVideoPlayer;
                document.body.appendChild(script);
            } else {
                initializeVideoPlayer();
            }
        }
    }, [lesson.video_path]);

    const initializeVideoPlayer = () => {
        const videoElement = videoPlayerRef.current;
        if (!videoElement) return;

        const streamUrl =
            route('instructor.lessons.videos.stream', lesson.id) +
            '?playlist=true';

        if (window.Hls.isSupported()) {
            const hls = new window.Hls({
                xhrSetup: function (xhr) {
                    // Add CSRF token to prevent unauthorized access
                    xhr.setRequestHeader(
                        'X-CSRF-TOKEN',
                        document.querySelector('meta[name="csrf-token"]')
                            .content,
                    );
                },
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(videoElement);
            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play();
            });

            hls.on(window.Hls.Events.ERROR, (event, data) => {
                console.error('HLS error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case window.Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Network error');
                            hls.startLoad();
                            break;
                        case window.Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Media error');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Unrecoverable error');
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            videoElement.src = streamUrl;
            videoElement.addEventListener('loadedmetadata', () => {
                videoElement.play();
            });
        } else {
            console.error('HLS is not supported in this browser');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Lesson - ${lesson.title}`} />

            <div className="mb-6">
                <Link
                    href={route('instructor.courses.show', course.id)}
                    className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Course
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{lesson.title}</h1>
                        <p className="mt-2 text-muted-foreground">
                            Course: {course.title}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Lesson
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add video player if there's an encrypted video */}
            {lesson.video_path && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Lesson Video</CardTitle>
                        <CardDescription>
                            Preview your encrypted video
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                            <video
                                ref={videoPlayerRef}
                                className="h-full w-full"
                                controls
                                playsInline
                            ></video>
                        </div>
                    </CardContent>
                </Card>
            )}

            {lesson.video_url && !lesson.video_path && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>External Video</CardTitle>
                        <CardDescription>
                            This lesson uses an external video link
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                            <div className="flex items-center">
                                <Video className="mr-2 h-5 w-5" />
                                <span className="font-medium">
                                    {lesson.video_url}
                                </span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={lesson.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open Video
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lesson Details</CardTitle>
                            <CardDescription>
                                Update the basic information about your lesson
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Enter lesson title"
                                    className={
                                        errors.title ? 'border-destructive' : ''
                                    }
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Enter lesson description"
                                    className={
                                        errors.description
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">
                                        Duration (minutes)
                                    </Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={data.duration}
                                        onChange={(e) =>
                                            setData(
                                                'duration',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        min="0"
                                        className={
                                            errors.duration
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors.duration && (
                                        <p className="text-sm text-destructive">
                                            {errors.duration}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order">Order</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={data.order}
                                        onChange={(e) =>
                                            setData(
                                                'order',
                                                parseInt(e.target.value),
                                            )
                                        }
                                        min="0"
                                        className={
                                            errors.order
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors.order && (
                                        <p className="text-sm text-destructive">
                                            {errors.order}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_preview"
                                    checked={data.is_preview}
                                    onChange={(e) =>
                                        setData('is_preview', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="is_preview">
                                    Allow preview (free access)
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lesson Content</CardTitle>
                            <CardDescription>
                                The main content of your lesson
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) =>
                                        setData('content', e.target.value)
                                    }
                                    placeholder="Enter lesson content"
                                    className={`min-h-[300px] ${
                                        errors.content
                                            ? 'border-destructive'
                                            : ''
                                    }`}
                                />
                                {errors.content && (
                                    <p className="text-sm text-destructive">
                                        {errors.content}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lesson Resources</CardTitle>
                            <CardDescription>
                                Additional resources for this lesson
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <Link
                                    // href={route(
                                    //     'lessons.quizzes.index',
                                    //     lesson.id,
                                    // )}
                                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/50"
                                >
                                    <ListChecks className="h-5 w-5" />
                                    <div>
                                        <h3 className="font-medium">Quizzes</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Create and manage quizzes
                                        </p>
                                    </div>
                                </Link>

                                <Link
                                    // href={route(
                                    //     'lessons.assignments.index',
                                    //     lesson.id,
                                    // )}
                                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/50"
                                >
                                    <FileText className="h-5 w-5" />
                                    <div>
                                        <h3 className="font-medium">
                                            Assignments
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Create and manage assignments
                                        </p>
                                    </div>
                                </Link>

                                <Link
                                    // href={route(
                                    //     'lessons.resources.index',
                                    //     lesson.id,
                                    // )}
                                    className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/50"
                                >
                                    <GraduationCap className="h-5 w-5" />
                                    <div>
                                        <h3 className="font-medium">
                                            Resources
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Add additional resources
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
