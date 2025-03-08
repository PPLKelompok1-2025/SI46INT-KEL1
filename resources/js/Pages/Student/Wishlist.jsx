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
import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, Trash2 } from 'lucide-react';

export default function Wishlist({ courses }) {
    const { delete: destroy } = useForm();

    const handleRemoveFromWishlist = (courseSlug) => {
        destroy(route('student.courses.wishlist.remove', courseSlug), {
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
                        <Link href="/courses">Browse More Courses</Link>
                    </Button>
                </div>

                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id} className="overflow-hidden">
                                <div className="aspect-video w-full overflow-hidden">
                                    {course.thumbnail_url ? (
                                        <img
                                            src={course.thumbnail_url}
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
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() =>
                                                handleRemoveFromWishlist(
                                                    course.slug,
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
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
                                                    ? `$${course.price.toFixed(2)}`
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
                                                {course.lessons?.length || 0}{' '}
                                                lessons
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex justify-between">
                                    <Button asChild variant="outline">
                                        <Link href={`/courses/${course.slug}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                    {course.is_enrolled ? (
                                        <Button asChild>
                                            <Link
                                                href={`/student/courses/${course.slug}/learn`}
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
                ) : (
                    <EmptyState
                        icon="Heart"
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
