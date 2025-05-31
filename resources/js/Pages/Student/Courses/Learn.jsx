import VideoPlayer from '@/Components/Student/VideoPlayer';
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
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Progress } from '@/Components/ui/progress';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    ChevronLeft,
    Clock,
    FileText,
    ListChecks,
    LockIcon,
    PlayCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Learn({
    course,
    completedLessons,
    nextLesson,
    progress,
    activeLesson: initialActiveLesson,
    note,
}) {
    const [activeLesson, setActiveLesson] = useState(
        initialActiveLesson?.id || nextLesson?.id || null,
    );
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const { post, processing } = useForm();
    const initialNoteContent =
        note?.content ?? localStorage.getItem('note-' + course.id) ?? '';
    const noteForm = useForm({ content: initialNoteContent });
    const {
        data: noteData,
        setData: setNoteData,
        post: storeNote,
        put: updateNote,
        processing: noteProcessing,
    } = noteForm;

    useEffect(() => {
        if (initialActiveLesson?.id) {
            setActiveLesson(initialActiveLesson.id);
        } else if (nextLesson?.id) {
            setActiveLesson(nextLesson.id);
        }
    }, [initialActiveLesson, nextLesson]);

    useEffect(() => {
        localStorage.setItem('note-' + course.id, noteData.content);
    }, [noteData.content, course.id]);

    const handleSaveNote = (e) => {
        e.preventDefault();
        if (note?.id) {
            updateNote(route('student.notes.update', note.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Note saved');
                    setIsNoteDialogOpen(false);
                    localStorage.removeItem('note-' + course.id);
                },
            });
        } else {
            storeNote(route('student.notes.store', course.id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success('Note created');
                    setIsNoteDialogOpen(false);
                    localStorage.removeItem('note-' + course.id);
                    if (page.props.flash && page.props.flash.new_note_id) {
                        noteForm.setData('id', page.props.flash.new_note_id);
                    }
                },
            });
        }
    };

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
            // Update the URL to include the lesson ID as a query parameter without a full page reload
            const url = new URL(window.location);
            url.searchParams.set('lesson', lessonId);
            window.history.pushState({}, '', url);
        }
    };

    const handleCompleteLesson = (lessonId) => {
        post(route('student.lessons.complete', lessonId), {
            onSuccess: () => {
                // Add the lesson to completed lessons if not already there
                if (!completedLessons.includes(lessonId)) {
                    completedLessons.push(lessonId);

                    // Update progress calculation
                    const newCompletedCount = completedLessons.length;
                    const totalLessons = course.lessons.length;
                    const newPercentage = Math.round(
                        (newCompletedCount / totalLessons) * 100,
                    );

                    // Update progress state
                    progress.completed_lessons = newCompletedCount;
                    progress.percentage = newPercentage;

                    // Show success notification
                    toast.success('Lesson completed!');
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

                            {/* Display assignments for the selected lesson */}
                            {selectedLesson &&
                                selectedLesson.assignments &&
                                selectedLesson.assignments.length > 0 && (
                                    <div className="border-t p-4">
                                        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                                            Assignments for{' '}
                                            {selectedLesson.title}
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedLesson.assignments.map(
                                                (assignment) => (
                                                    <Button
                                                        key={assignment.id}
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="w-full justify-start text-sm"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'student.assignments.show',
                                                                assignment.id,
                                                            )}
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            {assignment.title}
                                                        </Link>
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Display quizzes for the selected lesson */}
                            {selectedLesson &&
                                selectedLesson.quizzes &&
                                selectedLesson.quizzes.length > 0 && (
                                    <div className="border-t p-4">
                                        <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                                            Quizzes for {selectedLesson.title}
                                        </h4>
                                        <div className="space-y-2">
                                            {selectedLesson.quizzes.map(
                                                (quiz) => (
                                                    <Button
                                                        key={quiz.id}
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="w-full justify-start text-sm"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'student.quizzes.show',
                                                                quiz.id,
                                                            )}
                                                        >
                                                            <ListChecks className="mr-2 h-4 w-4" />
                                                            {quiz.title}
                                                        </Link>
                                                    </Button>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
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
                                    {selectedLesson &&
                                    (selectedLesson.video_path ||
                                        selectedLesson.video_url) ? (
                                        selectedLesson.video_path ? (
                                            <VideoPlayer
                                                lesson={selectedLesson}
                                                autoPlay={true}
                                            />
                                        ) : selectedLesson.video_url ? (
                                            <div className="aspect-video w-full overflow-hidden rounded-lg">
                                                <iframe
                                                    src={
                                                        selectedLesson.video_url
                                                    }
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="h-full w-full"
                                                ></iframe>
                                            </div>
                                        ) : null
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center">
                                            <PlayCircle className="mb-2 h-12 w-12 text-muted-foreground" />
                                            <p className="text-center text-sm text-muted-foreground">
                                                {selectedLesson
                                                    ? 'No video for this lesson.'
                                                    : 'Select a lesson to see video.'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Lesson Description & Content */}
                                {selectedLesson?.description && (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="mb-2 text-lg font-medium">
                                            Lesson Description
                                        </h3>
                                        <p>{selectedLesson.description}</p>
                                    </div>
                                )}

                                <div className="prose dark:prose-invert max-w-none">
                                    {selectedLesson?.content ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: selectedLesson.content,
                                            }}
                                        />
                                    ) : (
                                        selectedLesson && (
                                            <p className="text-muted-foreground">
                                                No content available for this
                                                lesson.
                                            </p>
                                        )
                                    )}
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

            {/* Note-taking Dialog */}
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-lg"
                        variant="secondary"
                    >
                        <FileText className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Course Notes</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveNote} className="space-y-4">
                        <Textarea
                            value={noteData.content}
                            onChange={(e) =>
                                setNoteData('content', e.target.value)
                            }
                            className="h-40 w-full"
                            placeholder="Write your notes here..."
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsNoteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={noteProcessing}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
