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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Edit, Eye, PlusCircle, Star, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, courses }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const confirmDelete = (course) => {
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="My Courses" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Courses</h1>
                    <Button asChild>
                        <Link href={route('instructor.courses.create')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create
                            Course
                        </Link>
                    </Button>
                </div>

                {courses.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-12">
                            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-medium">
                                No courses yet
                            </h3>
                            <p className="mb-4 text-center text-muted-foreground">
                                You haven't created any courses yet. Start
                                creating your first course now.
                            </p>
                            <Button asChild>
                                <Link href={route('instructor.courses.create')}>
                                    <PlusCircle className="mr-2 h-4 w-4" />{' '}
                                    Create Your First Course
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Courses</CardTitle>
                            <CardDescription>
                                Manage and monitor all your courses
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course</TableHead>
                                        <TableHead className="text-center">
                                            Lessons
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Students
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Rating
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-12 w-12 overflow-hidden rounded bg-muted">
                                                        {course.thumbnail ? (
                                                            <img
                                                                src={`/storage/${course.thumbnail}`}
                                                                alt={
                                                                    course.title
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                                <BookOpen className="h-6 w-6 text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {course.title}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {course.category
                                                                ?.name ||
                                                                'Uncategorized'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {course.lessons_count}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {course.enrollments_count}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                                                    <span>
                                                        {course.reviews_count >
                                                        0
                                                            ? Number(
                                                                  course.average_rating,
                                                              ).toFixed(1)
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        course.is_published
                                                            ? 'success'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {course.is_published
                                                        ? 'Published'
                                                        : 'Draft'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'instructor.courses.show',
                                                                course.id,
                                                            )}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'instructor.courses.edit',
                                                                course.id,
                                                            )}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            confirmDelete(
                                                                course,
                                                            )
                                                        }
                                                        disabled={
                                                            course.enrollments_count >
                                                            0
                                                        }
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Course</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {courseToDelete?.title}"? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button asChild variant="destructive">
                            <Link
                                href={
                                    courseToDelete
                                        ? route(
                                              'instructor.courses.destroy',
                                              courseToDelete.id,
                                          )
                                        : '#'
                                }
                            >
                                Delete
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
