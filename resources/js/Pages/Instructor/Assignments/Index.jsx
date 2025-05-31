import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    Edit,
    File,
    Loader2,
    Plus,
    Trash,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AssignmentIndex({ lesson, assignments }) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    const { delete: destroy, processing } = useForm();

    const handleDelete = (assignment) => {
        setAssignmentToDelete(assignment);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        destroy(
            route('instructor.lessons.assignments.destroy', {
                lesson: lesson.id,
                assignment: assignmentToDelete.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteConfirmOpen(false);
                    toast.success('Assignment deleted successfully');
                },
                onError: () => toast.error('Failed to delete assignment'),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Assignments - ${lesson.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Assignments
                        </h1>
                        <p className="text-muted-foreground">
                            Manage assignments for {lesson.title}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button asChild variant="outline">
                            <Link
                                href={route('instructor.courses.lessons.show', {
                                    course: lesson.course_id,
                                    lesson: lesson.id,
                                })}
                            >
                                Back to Lesson
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={route(
                                    'instructor.lessons.assignments.create',
                                    {
                                        lesson: lesson.id,
                                    },
                                )}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Assignment
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Assignments</CardTitle>
                        <CardDescription>
                            Assignments created for the lesson "{lesson.title}"
                            in the course "{lesson.course.title}"
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assignments && assignments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead className="text-center">
                                            Points
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Submissions
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.map((assignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium">
                                                {assignment.title}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm">
                                                    <CalendarDays className="mr-1 h-4 w-4 text-muted-foreground" />
                                                    {new Date(
                                                        assignment.due_date,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {assignment.points}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link
                                                    href={route(
                                                        'instructor.assignments.submissions',
                                                        assignment.id,
                                                    )}
                                                    className="flex items-center justify-center text-sm text-primary hover:underline"
                                                >
                                                    <Users className="mr-1 h-4 w-4" />
                                                    {assignment.submissions_count ||
                                                        0}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'instructor.lessons.assignments.show',
                                                                {
                                                                    lesson: lesson.id,
                                                                    assignment:
                                                                        assignment.id,
                                                                },
                                                            )}
                                                        >
                                                            <File className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        className="bg-yellow-500 text-foreground hover:bg-yellow-600"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'instructor.lessons.assignments.edit',
                                                                {
                                                                    lesson: lesson.id,
                                                                    assignment:
                                                                        assignment.id,
                                                                },
                                                            )}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                assignment,
                                                            )
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
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <File className="mb-3 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-1 text-lg font-medium">
                                    No assignments yet
                                </h3>
                                <p className="mb-4 text-muted-foreground">
                                    There are no assignments created for this
                                    lesson yet.
                                </p>
                                <Button asChild>
                                    <Link
                                        href={route(
                                            'instructor.lessons.assignments.create',
                                            {
                                                lesson: lesson.id,
                                            },
                                        )}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Assignment
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the assignment "
                            {assignmentToDelete?.title}"? This action cannot be
                            undone and all student submissions will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={processing}
                        >
                            {processing && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
