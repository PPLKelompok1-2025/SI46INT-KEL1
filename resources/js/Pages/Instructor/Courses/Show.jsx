import CourseInformation from '@/Components/Instructor/Courses/CourseInformation';
import CourseLessons from '@/Components/Instructor/Courses/CourseLessons';
import CourseReviews from '@/Components/Instructor/Courses/CourseReviews';
import CourseStats from '@/Components/Instructor/Courses/CourseStats';
import CourseStudents from '@/Components/Instructor/Courses/CourseStudents';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Edit,
    LayoutDashboard,
    List,
    MessageSquare,
    Users,
} from 'lucide-react';

export default function Show({ course, stats, activeTab = 'overview' }) {
    const handleTabChange = (value) => {
        router.get(
            route('instructor.courses.show', course.id),
            { tab: value },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['activeTab'],
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${course.title} - Course Management`} />

            <div className="space-y-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <Button variant="ghost" asChild className="mr-4">
                            <Link href={route('instructor.courses.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to
                                Courses
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-semibold">
                            {course.title}
                        </h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={route(
                                    'instructor.courses.edit',
                                    course.id,
                                )}
                            >
                                <Edit className="mr-2 h-4 w-4" /> Edit Course
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={route(
                                    'instructor.courses.lessons.index',
                                    course.id,
                                )}
                            >
                                <List className="mr-2 h-4 w-4" /> Manage Lessons
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <Tabs
                            value={activeTab}
                            onValueChange={handleTabChange}
                            className="space-y-4"
                        >
                            <TabsList>
                                <TabsTrigger value="overview">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="content">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Content
                                </TabsTrigger>
                                <TabsTrigger value="students">
                                    <Users className="mr-2 h-4 w-4" />
                                    Students
                                </TabsTrigger>
                                <TabsTrigger value="reviews">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Reviews
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <CourseInformation course={course} />
                                <CourseStats stats={stats} />
                            </TabsContent>

                            <TabsContent value="content" className="space-y-4">
                                <CourseLessons course={course} />
                            </TabsContent>

                            <TabsContent value="students" className="space-y-4">
                                <CourseStudents course={course} />
                            </TabsContent>

                            <TabsContent value="reviews" className="space-y-4">
                                <CourseReviews course={course} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-lg border">
                            <div className="p-4">
                                <h2 className="mb-4 text-lg font-medium">
                                    Course Preview
                                </h2>
                                <div className="mb-4 aspect-video overflow-hidden rounded-md bg-muted">
                                    {course.thumbnail ? (
                                        <img
                                            src={`/storage/${course.thumbnail}`}
                                            alt={course.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                            <BookOpen className="h-12 w-12 text-primary" />
                                        </div>
                                    )}
                                </div>
                                <div className="mb-2 text-xl font-bold">
                                    {course.title}
                                </div>
                                {course.subtitle && (
                                    <div className="mb-4 text-muted-foreground">
                                        {course.subtitle}
                                    </div>
                                )}
                                <div className="mb-4 flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <BookOpen className="mr-1 h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {stats?.lessons_count || 0} lessons
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {stats?.enrollments_count || 0}{' '}
                                            students
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="mb-1 text-sm font-medium">
                                        Price
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-lg font-bold">
                                            {formatCurrency(course.price)}
                                        </span>
                                    </div>
                                </div>
                                <Button className="w-full" asChild>
                                    <Link
                                        href={route(
                                            'courses.show',
                                            course.slug || course.id,
                                        )}
                                    >
                                        View Public Page
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h2 className="mb-4 text-lg font-medium">
                                Quick Actions
                            </h2>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link
                                        href={route(
                                            'instructor.courses.lessons.create',
                                            course.id,
                                        )}
                                    >
                                        <BookOpen className="mr-2 h-4 w-4" />{' '}
                                        Add New Lesson
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link
                                        href={route(
                                            'instructor.courses.edit',
                                            course.id,
                                        )}
                                    >
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                        Course Details
                                    </Link>
                                </Button>
                                {!course.is_published ? (
                                    <Button
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link
                                            href={route(
                                                'instructor.courses.publish',
                                                course.id,
                                            )}
                                            method="patch"
                                        >
                                            Publish Course
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link
                                            href={route(
                                                'instructor.courses.publish',
                                                course.id,
                                            )}
                                            method="patch"
                                        >
                                            Unpublish Course
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
