import EmptyState from '@/Components/Student/EmptyState';
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, useForm, WhenVisible } from '@inertiajs/react';
import { BookOpen, Heart } from 'lucide-react';

export default function Wishlist({
    courses,
    page = 1,
    isNextPageExists = false,
}) {
    const { post } = useForm();

    const handleRemoveFromWishlist = (id) => {
        post(route('student.courses.wishlist.toggle', id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Wishlist" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Wishlist</h1>
                    <Button asChild>
                        <Link href="/courses" prefetch="hover">
                            Browse More Courses
                        </Link>
                    </Button>
                </div>

                {courses.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => (
                                <Card
                                    key={course.id}
                                    className="overflow-hidden"
                                >
                                    <div className="aspect-video w-full overflow-hidden">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail}
                                                alt={course.title}
                                                className="h-full w-full object-cover transition-all hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                                <BookOpen className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>

                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline">
                                                {course.category?.name}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-red-50"
                                                onClick={() =>
                                                    handleRemoveFromWishlist(
                                                        course.id,
                                                    )
                                                }
                                            >
                                                <Heart className="h-4 w-4 fill-current text-red-500" />
                                            </Button>
                                        </div>
                                        <CardTitle className="line-clamp-2">
                                            {course.title}
                                        </CardTitle>
                                        <CardDescription>
                                            By {course.user?.name}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <p className="text-lg font-bold">
                                                    {course.price > 0
                                                        ? `${formatCurrency(course.price)}`
                                                        : 'Free'}
                                                </p>
                                                {course.original_price >
                                                    course.price && (
                                                    <p className="ml-2 text-sm text-muted-foreground line-through">
                                                        $
                                                        {course.original_price.toFixed(
                                                            2,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center">
                                                <p className="text-sm">
                                                    {course.lessons?.length ||
                                                        0}{' '}
                                                    lessons
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex justify-between">
                                        <Button asChild variant="outline">
                                            <Link
                                                href={`/courses/${course.slug}`}
                                                prefetch="hover"
                                            >
                                                View Details
                                            </Link>
                                        </Button>
                                        {course.is_enrolled ? (
                                            <Button asChild>
                                                <Link
                                                    href={route(
                                                        'student.courses.learn',
                                                        course.id,
                                                    )}
                                                    prefetch="hover"
                                                >
                                                    Continue Learning
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button asChild>
                                                <Link
                                                    href={route(
                                                        'student.courses.enroll',
                                                        course.slug,
                                                    )}
                                                    method="post"
                                                    as="button"
                                                >
                                                    Enroll Now
                                                </Link>
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {isNextPageExists && (
                            <div className="mt-8">
                                <WhenVisible
                                    always
                                    params={{
                                        data: {
                                            page: Number(page) + 1,
                                        },
                                        only: [
                                            'courses',
                                            'page',
                                            'isNextPageExists',
                                        ],
                                        preserveState: true,
                                    }}
                                    fallback={
                                        <div className="flex justify-center">
                                            <p className="text-muted-foreground">
                                                You've reached the end.
                                            </p>
                                        </div>
                                    }
                                >
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    </div>
                                </WhenVisible>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={<BookOpen className="h-10 w-10" />}
                        title="Your wishlist is empty"
                        description="Save courses you're interested in to your wishlist for easy access later."
                        buttonText="Browse Courses"
                        buttonLink="/courses"
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
