import VideoPlayer from '@/Components/Student/VideoPlayer';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, CheckCircle } from 'lucide-react';

export default function Lesson({
    lesson,
    course,
    previousLesson,
    nextLesson,
    isCompleted,
}) {
    return (
        <AuthenticatedLayout>
            <Head title={lesson.title} />

            <div className="container mx-auto py-6">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href={route('student.courses.learn', course.slug)}
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Course
                    </Link>
                    <div className="flex items-center gap-4">
                        {isCompleted ? (
                            <div className="flex items-center text-sm font-medium text-green-600">
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Completed
                            </div>
                        ) : (
                            <Button
                                onClick={() => markLessonComplete(lesson.id)}
                                className="flex items-center"
                                variant="outline"
                                size="sm"
                            >
                                <Check className="mr-1.5 h-4 w-4" />
                                Mark as Completed
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold">{lesson.title}</h1>
                    {lesson.description && (
                        <p className="text-lg text-muted-foreground">
                            {lesson.description}
                        </p>
                    )}
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        {/* Video Player */}
                        {(lesson.video_path || lesson.video_url) && (
                            <div className="mb-8">
                                {lesson.video_path ? (
                                    <VideoPlayer
                                        lesson={lesson}
                                        autoPlay={true}
                                    />
                                ) : lesson.video_url ? (
                                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                                        <iframe
                                            src={lesson.video_url}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="h-full w-full"
                                        ></iframe>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Lesson Content */}
                        <div className="prose dark:prose-invert max-w-none">
                            {lesson.content ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: lesson.content,
                                    }}
                                />
                            ) : (
                                <p className="text-muted-foreground">
                                    No content available for this lesson.
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="p-4">
                                <h3 className="mb-4 text-lg font-medium">
                                    Lesson Navigation
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {previousLesson ? (
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="justify-start"
                                        >
                                            <Link
                                                href={route(
                                                    'student.courses.lessons.show',
                                                    {
                                                        course: course.slug,
                                                        lesson: previousLesson.id,
                                                    },
                                                )}
                                            >
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Previous: {previousLesson.title}
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            disabled
                                            className="justify-start text-muted-foreground"
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            This is the first lesson
                                        </Button>
                                    )}

                                    {nextLesson ? (
                                        <Button
                                            asChild
                                            className="justify-start"
                                        >
                                            <Link
                                                href={route(
                                                    'student.courses.lessons.show',
                                                    {
                                                        course: course.slug,
                                                        lesson: nextLesson.id,
                                                    },
                                                )}
                                            >
                                                Next: {nextLesson.title}
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="justify-start"
                                        >
                                            <Link
                                                href={route(
                                                    'student.courses.learn',
                                                    course.slug,
                                                )}
                                            >
                                                Back to Course Overview
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function markLessonComplete(lessonId) {
    // Implement lesson completion functionality
    alert('Mark lesson as complete: ' + lessonId);
}
