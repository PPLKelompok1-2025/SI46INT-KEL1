import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import InstructorLayout from '@/Layouts/InstructorLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, DollarSign, PlusCircle, Star, Users } from 'lucide-react';

export default function Dashboard({
    auth,
    stats,
    recentCourses,
    recentEnrollments,
    recentReviews,
}) {
    return (
        <InstructorLayout auth={auth}>
            <Head title="Instructor Dashboard" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Dashboard</h1>

                    <Button asChild>
                        <Link href="/instructor/courses/create">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create New Course
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Courses
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalCourses}
                                </h3>
                            </div>
                            <BookOpen className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Students
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.totalStudents}
                                </h3>
                            </div>
                            <Users className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Earnings
                                </p>
                                <h3 className="text-2xl font-bold">
                                    ${stats.totalEarnings.toFixed(2)}
                                </h3>
                            </div>
                            <DollarSign className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Average Rating
                                </p>
                                <h3 className="text-2xl font-bold">
                                    {stats.averageRating.toFixed(1)}
                                </h3>
                            </div>
                            <Star className="h-8 w-8 text-primary" />
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="courses">Courses</TabsTrigger>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Earnings Overview</CardTitle>
                                    <CardDescription>
                                        Monthly earnings for the current year
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        {/* This would be a chart component */}
                                        <p className="text-center text-muted-foreground">
                                            Earnings chart will be displayed
                                            here
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Enrollment Overview</CardTitle>
                                    <CardDescription>
                                        Monthly enrollments for the current year
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        {/* This would be a chart component */}
                                        <p className="text-center text-muted-foreground">
                                            Enrollment chart will be displayed
                                            here
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Enrollments</CardTitle>
                                <CardDescription>
                                    Latest students enrolled in your courses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentEnrollments.map((enrollment) => (
                                        <div
                                            key={enrollment.id}
                                            className="flex items-center justify-between border-b pb-2"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="rounded-full bg-primary/10 p-2">
                                                    <Users className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {enrollment.user.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            enrollment.course
                                                                .title
                                                        }{' '}
                                                        •{' '}
                                                        {new Date(
                                                            enrollment.enrolled_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/instructor/courses/${enrollment.course.id}/students`}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="courses" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Your Courses</CardTitle>
                                    <CardDescription>
                                        Manage and monitor your courses
                                    </CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href="/instructor/courses/create">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Create Course
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentCourses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="flex items-center justify-between border-b pb-4"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 overflow-hidden rounded-md">
                                                    <img
                                                        src={
                                                            course.thumbnail_url ||
                                                            '/images/course-placeholder.jpg'
                                                        }
                                                        alt={course.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {course.title}
                                                    </p>
                                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                        <span className="flex items-center">
                                                            <Users className="mr-1 h-3 w-3" />
                                                            {course.enrollments_count ||
                                                                0}{' '}
                                                            students
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center">
                                                            <Star className="mr-1 h-3 w-3" />
                                                            {course.average_rating
                                                                ? course.average_rating.toFixed(
                                                                      1,
                                                                  )
                                                                : 'N/A'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {course.is_published
                                                                ? 'Published'
                                                                : 'Draft'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/instructor/courses/${course.id}/edit`}
                                                    >
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/instructor/courses/${course.id}`}
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 text-center">
                                    <Button variant="outline" asChild>
                                        <Link href="/instructor/courses">
                                            View All Courses
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="students" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Students</CardTitle>
                                <CardDescription>
                                    Students enrolled in your courses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentEnrollments.map((enrollment) => (
                                        <div
                                            key={enrollment.id}
                                            className="flex items-center justify-between border-b pb-4"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 overflow-hidden rounded-full">
                                                    <img
                                                        src={
                                                            enrollment.user
                                                                .profile_photo_path ||
                                                            '/images/avatar-placeholder.jpg'
                                                        }
                                                        alt={
                                                            enrollment.user.name
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {enrollment.user.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Enrolled in{' '}
                                                        {
                                                            enrollment.course
                                                                .title
                                                        }{' '}
                                                        •{' '}
                                                        {new Date(
                                                            enrollment.enrolled_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/instructor/students/${enrollment.user.id}`}
                                                    >
                                                        View Profile
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 text-center">
                                    <Button variant="outline" asChild>
                                        <Link href="/instructor/students">
                                            View All Students
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Reviews</CardTitle>
                                <CardDescription>
                                    What students are saying about your courses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border-b pb-4"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-8 w-8 overflow-hidden rounded-full">
                                                        <img
                                                            src={
                                                                review.user
                                                                    .profile_photo_path ||
                                                                '/images/avatar-placeholder.jpg'
                                                            }
                                                            alt={
                                                                review.user.name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <span className="font-medium">
                                                        {review.user.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map(
                                                        (_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <p className="mb-1 text-sm">
                                                {review.comment}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>
                                                    For: {review.course.title}
                                                </span>
                                                <span>
                                                    {new Date(
                                                        review.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 text-center">
                                    <Button variant="outline" asChild>
                                        <Link href="/instructor/reviews">
                                            View All Reviews
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </InstructorLayout>
    );
}
