import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, CheckCircle, Clock, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Show({
    course,
    reviews,
    similarCourses,
    auth,
    activeTab: initialActiveTab,
}) {
    const [activeTab, setActiveTab] = useState(initialActiveTab || 'overview');

    const handleTabChange = (value) => {
        setActiveTab(value);

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tab', value);
        window.history.pushState({}, '', currentUrl.toString());
    };

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam) {
                setActiveTab(tabParam);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const renderStarRating = (rating) => {
        const roundedRating = Math.round(Number(rating));
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={
                            i < roundedRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }
                    />
                ))}
                <span className="ml-1 text-sm">({roundedRating})</span>
            </div>
        );
    };

    return (
        <PublicLayout>
            <Head title={course.title} />

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <h1 className="mb-4 text-3xl font-bold">{course.title}</h1>

                    <div className="mb-6">
                        <p className="text-lg text-muted-foreground">
                            {course.short_description}
                        </p>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-4">
                        <div className="flex items-center">
                            <Badge variant="outline" className="px-2 py-1">
                                {course.category?.name}
                            </Badge>
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>
                                {course.lessons.reduce(
                                    (acc, lesson) =>
                                        acc + (lesson.duration || 0),
                                    0,
                                )}{' '}
                                min total
                            </span>
                        </div>
                        <div className="flex items-center">
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>{course.lessons_count} Lessons</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            <span>{course.enrollments_count} Enrolled</span>
                        </div>
                        <div className="flex items-center">
                            {renderStarRating(course.average_rating)}
                            <span className="ml-1">
                                ({course.reviews_count} reviews)
                            </span>
                        </div>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="curriculum">
                                Curriculum
                            </TabsTrigger>
                            <TabsTrigger value="instructor">
                                Instructor
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-4">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-2 text-xl font-semibold">
                                        About This Course
                                    </h3>
                                    <div className="prose max-w-none">
                                        {course.description}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-xl font-semibold">
                                        What You'll Learn
                                    </h3>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {course.what_you_will_learn &&
                                            course.what_you_will_learn.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start"
                                                    >
                                                        <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                                                        <span>{item}</span>
                                                    </div>
                                                ),
                                            )}
                                    </div>
                                </div>

                                {course.requirements &&
                                    course.requirements.length > 0 && (
                                        <div>
                                            <h3 className="mb-4 text-xl font-semibold">
                                                Requirements
                                            </h3>
                                            <ul className="list-inside list-disc space-y-2">
                                                {course.requirements.map(
                                                    (item, index) => (
                                                        <li key={index}>
                                                            {item}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {course.who_is_this_course_for &&
                                    course.who_is_this_course_for.length >
                                        0 && (
                                        <div>
                                            <h3 className="mb-4 text-xl font-semibold">
                                                Who This Course is For
                                            </h3>
                                            <ul className="list-inside list-disc space-y-2">
                                                {course.who_is_this_course_for.map(
                                                    (item, index) => (
                                                        <li key={index}>
                                                            {item}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}
                            </div>
                        </TabsContent>

                        <TabsContent value="curriculum" className="mt-4">
                            <h3 className="mb-4 text-xl font-semibold">
                                Course Content
                            </h3>
                            <div className="rounded-md border">
                                {course.lessons.map((lesson, index) => (
                                    <div
                                        key={lesson.id}
                                        className={`flex items-center justify-between p-4 ${
                                            index !== course.lessons.length - 1
                                                ? 'border-b'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-medium">
                                                    {lesson.title}
                                                </h4>
                                                {lesson.duration && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {lesson.duration} min
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled
                                        >
                                            Preview
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="instructor" className="mt-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-full">
                                        {course.user.profile_photo_path ? (
                                            <img
                                                src={
                                                    course.user
                                                        .profile_photo_path
                                                }
                                                alt={course.user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                                {course.user.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {course.user.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Instructor
                                        </p>
                                    </div>
                                </div>

                                {course.user.bio && (
                                    <div>
                                        <h4 className="mb-2 font-medium">
                                            About the Instructor
                                        </h4>
                                        <p>{course.user.bio}</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {reviews.length > 0 && (
                        <div className="mt-8">
                            <h3 className="mb-4 text-xl font-semibold">
                                Student Reviews
                            </h3>
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <Card key={review.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-10 w-10 overflow-hidden rounded-full">
                                                        {review.user
                                                            .profile_photo_path ? (
                                                            <img
                                                                src={
                                                                    review.user
                                                                        .profile_photo_path
                                                                }
                                                                alt={
                                                                    review.user
                                                                        .name
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-muted text-sm">
                                                                {
                                                                    review.user
                                                                        .name[0]
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-base">
                                                            {review.user.name}
                                                        </CardTitle>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                review.created_at,
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {renderStarRating(
                                                    review.rating,
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{review.comment}</p>
                                        </CardContent>
                                    </Card>
                                ))}

                                {course.reviews_count > 5 && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        View All Reviews
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardContent className="p-6">
                            <div className="mb-4 aspect-video w-full overflow-hidden rounded-md bg-muted">
                                {course.promotional_video ? (
                                    <iframe
                                        src={course.promotional_video}
                                        title="Course preview"
                                        className="h-full w-full"
                                        allowFullScreen
                                    />
                                ) : course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 text-center">
                                <div className="mb-2 text-3xl font-bold">
                                    {course.price === 0
                                        ? 'Free'
                                        : `${formatCurrency(course.price)}`}
                                </div>
                            </div>

                            {auth.user ? (
                                <Button className="w-full">Enroll Now</Button>
                            ) : (
                                <>
                                    <Button asChild className="mb-2 w-full">
                                        <Link href={route('login')}>
                                            Log in to Enroll
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Link href={route('register')}>
                                            Sign up
                                        </Link>
                                    </Button>
                                </>
                            )}

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Lessons
                                    </span>
                                    <span className="font-medium">
                                        {course.lessons_count}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Level
                                    </span>
                                    <span className="font-medium">
                                        {course.level}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Language
                                    </span>
                                    <span className="font-medium">
                                        {course.language}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Students
                                    </span>
                                    <span className="font-medium">
                                        {course.enrollments_count}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {similarCourses.length > 0 && (
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">
                                Similar Courses
                            </h3>
                            <div className="space-y-4">
                                {similarCourses.map((course) => (
                                    <Card
                                        key={course.id}
                                        className="overflow-hidden"
                                    >
                                        <Link
                                            href={route(
                                                'courses.show',
                                                course.slug,
                                            )}
                                        >
                                            <div className="aspect-video w-full overflow-hidden">
                                                {course.thumbnail ? (
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <BookOpen className="h-10 w-10 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader className="pb-2 pt-3">
                                                <CardTitle className="line-clamp-2 text-base">
                                                    {course.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pb-3 pt-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium">
                                                        {course.price === 0
                                                            ? 'Free'
                                                            : `${formatCurrency(course.price)}`}
                                                    </div>
                                                    {renderStarRating(
                                                        course.average_rating ||
                                                            0,
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
