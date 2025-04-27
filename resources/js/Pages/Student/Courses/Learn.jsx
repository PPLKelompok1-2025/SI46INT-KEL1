import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Separator } from '@/Components/ui/separator';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    ChevronLeft,
    Clock,
    ExternalLink,
    FileText,
    LockIcon,
    PlayCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Learn({
    course,
    completedLessons,
    nextLesson,
    progress,
}) {
    const [activeLesson, setActiveLesson] = useState(nextLesson?.id || null);
    const [currentVideo, setCurrentVideo] = useState(null);
    const { post, processing } = useForm();

    useEffect(() => {
        if (nextLesson?.id) {
            setActiveLesson(nextLesson.id);
        }
    }, [nextLesson]);

    const handleLessonSelect = (lessonId) => {
        // Only allow selecting if the lesson is free or user has completed prerequisites
        const lesson = course.lessons.find((lesson) => lesson.id === lessonId);
        const lessonIndex = course.lessons.findIndex(
            (lesson) => lesson.id === lessonId,
        );

        // Check if the lesson can be accessed (is free or previous lesson is completed)
        const canAccess =
            lesson.is_free ||
            lessonIndex === 0 ||
            completedLessons.includes(course.lessons[lessonIndex - 1].id);

        if (canAccess) {
            setActiveLesson(lessonId);
            router.get(
                route('student.courses.lessons.show', [course.slug, lessonId]),
                {},
                {
                    preserveState: true,
                    only: ['lesson'],
                },
            );
        }
    };

    const handleCompleteLesson = (lessonId) => {
        post(route('student.lessons.complete', lessonId), {
            onSuccess: () => {
                // Add the lesson to completed lessons if not already there
                if (!completedLessons.includes(lessonId)) {
                    completedLessons.push(lessonId);
                }
            },
        });
    };

    const handleCompleteCourse = () => {
        post(route('student.courses.complete', course.id), {
            onSuccess: () => {
                // Redirect to certificate or course completion page
                router.visit(route('student.courses.show', course.slug));
            },
        });
    };

    // Find the selected lesson object
    const selectedLesson = course.lessons.find(
        (lesson) => lesson.id === activeLesson,
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Learning: ${course.title}`} />

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                    >
                        <Link href={route('student.courses.show', course.slug)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">{course.title}</h1>
                </div>

                {progress.percentage === 100 ? (
                    <Badge variant="success" className="text-sm">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Completed
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="text-sm">
                        <Clock className="mr-1 h-4 w-4" />
                        In Progress
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Course Content Sidebar */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Course Content</CardTitle>
                        <CardDescription>
                            {progress.completed_lessons} of{' '}
                            {progress.total_lessons} lessons completed
                        </CardDescription>
                        <Progress value={progress.percentage} className="h-2" />
                    </CardHeader>
                    <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto p-0">
                        <div className="divide-y">
                            {course.lessons.map((lesson, index) => {
                                const isCompleted = completedLessons.includes(
                                    lesson.id,
                                );
                                const isActive = activeLesson === lesson.id;
                                const lessonNumber = index + 1;

                                // Check if lesson is accessible (free, or previous completed)
                                const isPreviousCompleted =
                                    index === 0 ||
                                    completedLessons.includes(
                                        course.lessons[index - 1].id,
                                    );
                                const isAccessible =
                                    lesson.is_free || isPreviousCompleted;

                                return (
                                    <div
                                        key={lesson.id}
                                        className={`flex cursor-pointer items-center justify-between p-4 ${
                                            isActive ? 'bg-muted' : ''
                                        } ${isAccessible ? 'opacity-100' : 'opacity-50'}`}
                                        onClick={() =>
                                            isAccessible &&
                                            handleLessonSelect(lesson.id)
                                        }
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-background text-xs font-medium">
                                                {isCompleted ? (
                                                    <CheckCircle className="h-5 w-5 text-primary" />
                                                ) : (
                                                    lessonNumber
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {lesson.title}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {lesson.duration} min
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            {!isAccessible && (
                                                <LockIcon className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            {isCompleted && (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2 border-green-500 text-green-500"
                                                >
                                                    Completed
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch gap-2">
                        <Progress value={progress.percentage} className="h-2" />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {progress.percentage}% Complete
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {progress.completed_lessons}/
                                {progress.total_lessons} Lessons
                            </span>
                        </div>

                        {progress.percentage === 100 ? (
                            <Button asChild className="mt-2">
                                <Link
                                    href={route('student.certificates.index')}
                                >
                                    View Certificate
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="mt-2"
                                onClick={handleCompleteCourse}
                                disabled={
                                    progress.percentage < 100 || processing
                                }
                            >
                                Complete Course
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Lesson Content */}
                <Card className="lg:col-span-2">
                    {selectedLesson ? (
                        <>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <div>
                                        <CardTitle>
                                            {selectedLesson.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {selectedLesson.duration} minutes
                                        </CardDescription>
                                    </div>

                                    <div>
                                        {completedLessons.includes(
                                            selectedLesson.id,
                                        ) ? (
                                            <Badge
                                                variant="outline"
                                                className="border-green-500 text-green-500"
                                            >
                                                <CheckCircle className="mr-1 h-4 w-4" />
                                                Completed
                                            </Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleCompleteLesson(
                                                        selectedLesson.id,
                                                    )
                                                }
                                                disabled={processing}
                                            >
                                                Mark as Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Video Player Placeholder */}
                                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                                    {currentVideo ? (
                                        <video
                                            controls
                                            className="h-full w-full"
                                            autoPlay
                                            src={route(
                                                'student.lessons.videos.stream',
                                                selectedLesson.id,
                                            )}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center">
                                            <PlayCircle className="mb-2 h-12 w-12 text-muted-foreground" />
                                            <p className="text-center text-sm text-muted-foreground">
                                                Click to play video
                                            </p>
                                            <Button
                                                variant="secondary"
                                                className="mt-4"
                                                onClick={() =>
                                                    setCurrentVideo(true)
                                                }
                                            >
                                                Watch Lesson
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Lesson Description */}
                                <div className="prose dark:prose-invert max-w-none">
                                    <h3 className="mb-2 text-lg font-medium">
                                        Lesson Description
                                    </h3>
                                    <p>
                                        This lesson covers the key concepts and
                                        practical examples to help you master
                                        the topic. Follow along with the video
                                        and complete the exercises to get the
                                        most out of this lesson.
                                    </p>
                                </div>

                                {/* Lesson Resources */}
                                <div>
                                    <h3 className="mb-2 text-lg font-medium">
                                        Resources
                                    </h3>
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            asChild
                                        >
                                            <a
                                                href="#"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Lesson Slides
                                                <ExternalLink className="ml-2 h-3 w-3 opacity-70" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            asChild
                                        >
                                            <a
                                                href="#"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Exercise Files
                                                <ExternalLink className="ml-2 h-3 w-3 opacity-70" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="flex justify-between">
                                {/* Previous Lesson Button */}
                                {course.lessons.findIndex(
                                    (l) => l.id === selectedLesson.id,
                                ) > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const currentIndex =
                                                course.lessons.findIndex(
                                                    (l) =>
                                                        l.id ===
                                                        selectedLesson.id,
                                                );
                                            if (currentIndex > 0) {
                                                handleLessonSelect(
                                                    course.lessons[
                                                        currentIndex - 1
                                                    ].id,
                                                );
                                            }
                                        }}
                                    >
                                        Previous Lesson
                                    </Button>
                                )}

                                {/* Spacer if only next button is shown */}
                                {course.lessons.findIndex(
                                    (l) => l.id === selectedLesson.id,
                                ) === 0 && <div></div>}

                                {/* Next Lesson Button */}
                                {course.lessons.findIndex(
                                    (l) => l.id === selectedLesson.id,
                                ) <
                                    course.lessons.length - 1 && (
                                    <Button
                                        onClick={() => {
                                            const currentIndex =
                                                course.lessons.findIndex(
                                                    (l) =>
                                                        l.id ===
                                                        selectedLesson.id,
                                                );
                                            if (
                                                currentIndex <
                                                course.lessons.length - 1
                                            ) {
                                                handleLessonSelect(
                                                    course.lessons[
                                                        currentIndex + 1
                                                    ].id,
                                                );
                                            }
                                        }}
                                    >
                                        Next Lesson
                                    </Button>
                                )}

                                {/* Complete Course Button if on last lesson */}
                                {course.lessons.findIndex(
                                    (l) => l.id === selectedLesson.id,
                                ) ===
                                    course.lessons.length - 1 && (
                                    <Button
                                        disabled={
                                            progress.percentage < 100 ||
                                            processing
                                        }
                                        onClick={handleCompleteCourse}
                                    >
                                        Complete Course
                                    </Button>
                                )}
                            </CardFooter>
                        </>
                    ) : (
                        <div className="flex h-[60vh] flex-col items-center justify-center p-6 text-center">
                            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-xl font-medium">
                                Select a lesson to begin
                            </h3>
                            <p className="mb-4 text-muted-foreground">
                                Choose a lesson from the curriculum to start
                                learning
                            </p>
                            <Button
                                onClick={() =>
                                    nextLesson &&
                                    handleLessonSelect(nextLesson.id)
                                }
                                disabled={!nextLesson}
                            >
                                Start Next Lesson
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
