import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Link } from '@inertiajs/react';
import { FileText, PlayCircle } from 'lucide-react';

export default function CourseLessons({ course }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>
                        Manage your course lessons and sections
                    </CardDescription>
                </div>
                <Button asChild>
                    <Link
                        href={route(
                            'instructor.courses.lessons.create',
                            course.id,
                        )}
                    >
                        Add New Lesson
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {course.lessons && course.lessons.length > 0 ? (
                    <div className="space-y-4">
                        {course.lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <PlayCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">
                                            {lesson.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {lesson.duration_minutes} minutes
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link
                                            href={route(
                                                'instructor.courses.lessons.edit',
                                                {
                                                    course,
                                                    lesson,
                                                },
                                            )}
                                        >
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-medium">
                            No lessons yet
                        </h3>
                        <p className="mb-4 text-center text-muted-foreground">
                            You haven't added any lessons to this course yet.
                        </p>
                        <Button asChild>
                            <Link
                                href={route(
                                    'instructor.courses.lessons.create',
                                    course.id,
                                )}
                            >
                                Add Your First Lesson
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
