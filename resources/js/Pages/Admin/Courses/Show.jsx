import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    Edit,
    Globe,
    Pencil,
    Star,
    User,
    Users,
    XCircle,
} from 'lucide-react';

export default function Show({ course, tab }) {
    const handleApprove = () => {
        router.post(route('admin.courses.approve', course.id), {
            _method: 'PATCH',
        });
    };

    const handleFeature = () => {
        router.post(route('admin.courses.feature', course.id), {
            _method: 'PATCH',
        });
    };

    const getStatusBadge = (course) => {
        if (!course.is_approved) {
            return <Badge variant="warning">Pending Approval</Badge>;
        }

        if (course.is_featured) {
            return <Badge variant="purple">Featured</Badge>;
        }

        if (course.is_published) {
            return <Badge variant="success">Published</Badge>;
        }

        return <Badge variant="secondary">Draft</Badge>;
    };

    return (
        <AuthenticatedLayout>
            <Head title={course.title} />

            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <div className="mt-2 flex items-center text-muted-foreground">
                            <span className="flex items-center">
                                <User className="mr-1 h-4 w-4" />
                                {course.user.name}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                                {course.category?.name || 'Uncategorized'}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                                <Star className="mr-1 h-4 w-4 text-yellow-500" />
                                {Number(course.average_rating).toFixed(1)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={course.is_approved ? 'default' : 'outline'}
                            onClick={handleApprove}
                        >
                            {course.is_approved ? (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Unapprove
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </>
                            )}
                        </Button>
                        <Button
                            variant={
                                course.is_featured ? 'secondary' : 'outline'
                            }
                            onClick={handleFeature}
                        >
                            {course.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.courses.edit', course.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <Tabs
                    defaultValue={tab}
                    className="w-full"
                    onValueChange={(value) => {
                        router.get(
                            route('admin.courses.show', {
                                course: course.id,
                                tab: value,
                            }),
                            {},
                            { preserveState: true },
                        );
                    }}
                >
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="lessons">Lessons</TabsTrigger>
                        <TabsTrigger value="enrollments">Students</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl font-bold">
                                            {getStatusBadge(course)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Lessons
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <div className="text-2xl font-bold">
                                            {course.lessons_count || 0}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Students
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <div className="text-2xl font-bold">
                                            {course.enrollments_count || 0}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Course Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <h3 className="mb-3 text-lg font-semibold">
                                            Basic Information
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Price:
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        course.price,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Level:
                                                </span>
                                                <span className="font-medium capitalize">
                                                    {course.level}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Language:
                                                </span>
                                                <span className="font-medium">
                                                    {course.language}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Created:
                                                </span>
                                                <span className="font-medium">
                                                    {new Date(
                                                        course.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Last updated:
                                                </span>
                                                <span className="font-medium">
                                                    {new Date(
                                                        course.updated_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-3 text-lg font-semibold">
                                            Preview
                                        </h3>
                                        <div className="flex flex-col gap-4">
                                            {course.thumbnail && (
                                                <div className="h-40 overflow-hidden rounded-md">
                                                    <img
                                                        src={`/storage/${course.thumbnail}`}
                                                        alt={course.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            {course.promotional_video && (
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                    <a
                                                        href={
                                                            course.promotional_video
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="truncate text-primary underline"
                                                    >
                                                        Watch promotional video
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-lg font-semibold">
                                        Description
                                    </h3>
                                    <div className="prose prose-sm max-w-none">
                                        <p>{course.description}</p>
                                    </div>
                                </div>

                                {course.requirements &&
                                    course.requirements.length > 0 && (
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold">
                                                Requirements
                                            </h3>
                                            <ul className="list-disc space-y-1 pl-5">
                                                {course.requirements.map(
                                                    (requirement, index) => (
                                                        <li key={index}>
                                                            {requirement}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                {course.what_you_will_learn &&
                                    course.what_you_will_learn.length > 0 && (
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold">
                                                What You Will Learn
                                            </h3>
                                            <ul className="list-disc space-y-1 pl-5">
                                                {course.what_you_will_learn.map(
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
                                            <h3 className="mb-3 text-lg font-semibold">
                                                Who This Course is For
                                            </h3>
                                            <ul className="list-disc space-y-1 pl-5">
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
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="lessons" className="mt-6 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lessons</CardTitle>
                                <CardDescription>
                                    All lessons in this course
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!course.lessons ||
                                course.lessons.data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-medium">
                                            No lessons found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            This course has no lessons yet.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Order</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>
                                                        Duration
                                                    </TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead className="text-right">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {course.lessons.data.map(
                                                    (lesson) => (
                                                        <TableRow
                                                            key={lesson.id}
                                                        >
                                                            <TableCell>
                                                                {lesson.order}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">
                                                                    {
                                                                        lesson.title
                                                                    }
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {lesson.duration
                                                                    ? `${lesson.duration} min`
                                                                    : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant={
                                                                        lesson.is_free
                                                                            ? 'outline'
                                                                            : 'secondary'
                                                                    }
                                                                >
                                                                    {lesson.is_free
                                                                        ? 'Free'
                                                                        : 'Premium'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`/instructor/lessons/${lesson.id}/edit`}
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        {course.lessons.links &&
                                            course.lessons.links.length > 3 && (
                                                <div className="mt-4 flex items-center justify-end space-x-2">
                                                    {course.lessons.links.map(
                                                        (link, i) => (
                                                            <Button
                                                                key={i}
                                                                variant={
                                                                    link.active
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                disabled={
                                                                    !link.url
                                                                }
                                                                onClick={() =>
                                                                    router.visit(
                                                                        link.url,
                                                                    )
                                                                }
                                                                size="sm"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            ></Button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="enrollments" className="mt-6 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Students</CardTitle>
                                <CardDescription>
                                    Students enrolled in this course
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!course.enrollments ||
                                course.enrollments.data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-medium">
                                            No students found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            This course has no enrollments yet.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Student
                                                    </TableHead>
                                                    <TableHead>
                                                        Enrolled On
                                                    </TableHead>
                                                    <TableHead>
                                                        Progress
                                                    </TableHead>
                                                    <TableHead>
                                                        Completed
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {course.enrollments.data.map(
                                                    (enrollment) => (
                                                        <TableRow
                                                            key={enrollment.id}
                                                        >
                                                            <TableCell>
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                                                                        {enrollment
                                                                            .user
                                                                            .profile_photo_path ? (
                                                                            <img
                                                                                src={`/storage/${enrollment.user.profile_photo_path}`}
                                                                                alt={
                                                                                    enrollment
                                                                                        .user
                                                                                        .name
                                                                                }
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                                                <User className="h-4 w-4 text-primary" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {
                                                                                enrollment
                                                                                    .user
                                                                                    .name
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {new Date(
                                                                    enrollment.created_at,
                                                                ).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>
                                                                {enrollment.progress
                                                                    ? `${enrollment.progress}%`
                                                                    : '0%'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {enrollment.completed_at ? (
                                                                    <Badge variant="success">
                                                                        Completed
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary">
                                                                        In
                                                                        Progress
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'admin.users.show',
                                                                            enrollment
                                                                                .user
                                                                                .id,
                                                                        )}
                                                                    >
                                                                        <User className="mr-2 h-4 w-4" />
                                                                        View
                                                                        Profile
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>

                                        {/* Pagination */}
                                        {course.enrollments.links &&
                                            course.enrollments.links.length >
                                                3 && (
                                                <div className="mt-4 flex items-center justify-end space-x-2">
                                                    {course.enrollments.links.map(
                                                        (link, i) => (
                                                            <Button
                                                                key={i}
                                                                variant={
                                                                    link.active
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                disabled={
                                                                    !link.url
                                                                }
                                                                onClick={() =>
                                                                    router.visit(
                                                                        link.url,
                                                                    )
                                                                }
                                                                size="sm"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            ></Button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-6 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Reviews</CardTitle>
                                <CardDescription>
                                    Student reviews for this course
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!course.reviews ||
                                course.reviews.data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Star className="mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-medium">
                                            No reviews found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            This course has no reviews yet.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-6">
                                            {course.reviews.data.map(
                                                (review) => (
                                                    <div
                                                        key={review.id}
                                                        className="border-b pb-6"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                                                                    {review.user
                                                                        .profile_photo_path ? (
                                                                        <img
                                                                            src={`/storage/${review.user.profile_photo_path}`}
                                                                            alt={
                                                                                review
                                                                                    .user
                                                                                    .name
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                                            <User className="h-4 w-4 text-primary" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {
                                                                            review
                                                                                .user
                                                                                .name
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {new Date(
                                                                            review.created_at,
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                {[
                                                                    ...Array(5),
                                                                ].map(
                                                                    (_, i) => (
                                                                        <Star
                                                                            key={
                                                                                i
                                                                            }
                                                                            className={`h-4 w-4 ${
                                                                                i <
                                                                                review.rating
                                                                                    ? 'fill-yellow-500 text-yellow-500'
                                                                                    : 'text-muted-foreground'
                                                                            }`}
                                                                        />
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="mt-3">
                                                            {review.content}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {/* Pagination */}
                                        {course.reviews.links &&
                                            course.reviews.links.length > 3 && (
                                                <div className="mt-4 flex items-center justify-end space-x-2">
                                                    {course.reviews.links.map(
                                                        (link, i) => (
                                                            <Button
                                                                key={i}
                                                                variant={
                                                                    link.active
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                disabled={
                                                                    !link.url
                                                                }
                                                                onClick={() =>
                                                                    router.visit(
                                                                        link.url,
                                                                    )
                                                                }
                                                                size="sm"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            ></Button>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AuthenticatedLayout>
    );
}
