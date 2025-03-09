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
import Pagination from '@/Components/ui/pagination';
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
import { ArrowLeft, Calendar, Search, Trash2, User } from 'lucide-react';
import { useState } from 'react';

export default function Course({ course, enrollments }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState(null);

    const { delete: deleteEnrollment, processing } = useForm();

    const filteredEnrollments = enrollments.data.filter(
        (enrollment) =>
            enrollment.user.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            enrollment.user.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    const handleRemoveStudent = () => {
        if (studentToRemove) {
            deleteEnrollment(
                route('instructor.students.remove', studentToRemove.id),
                {
                    onSuccess: () => {
                        setIsRemoveDialogOpen(false);
                        setStudentToRemove(null);
                    },
                },
            );
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${course.title} - Students`} />

            <div className="space-y-6">
                <div className="flex items-center">
                    <Button variant="ghost" asChild className="mr-4">
                        <Link href={route('instructor.students.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All
                            Students
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">
                        {course.title} - Students
                    </h1>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Total Enrollments: {enrollments.total}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 pl-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Enrolled Students</CardTitle>
                        <CardDescription>
                            Students enrolled in {course.title}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Enrolled On</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEnrollments.length > 0 ? (
                                    filteredEnrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center">
                                                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                        {enrollment.user
                                                            .profile_photo_path ? (
                                                            <img
                                                                src={`/storage/${enrollment.user.profile_photo_path}`}
                                                                alt={
                                                                    enrollment
                                                                        .user
                                                                        .name
                                                                }
                                                                className="h-8 w-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="h-4 w-4 text-primary" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div>
                                                            {
                                                                enrollment.user
                                                                    .name
                                                            }
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {
                                                                enrollment.user
                                                                    .email
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {new Date(
                                                        enrollment.created_at,
                                                    ).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'instructor.students.show',
                                                                enrollment.id,
                                                            )}
                                                        >
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setStudentToRemove(
                                                                enrollment,
                                                            );
                                                            setIsRemoveDialogOpen(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="h-24 text-center"
                                        >
                                            No students found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="mt-4">
                            <Pagination links={enrollments.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog
                open={isRemoveDialogOpen}
                onOpenChange={setIsRemoveDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Student</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove{' '}
                            {studentToRemove?.user.name} from this course? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveStudent}
                            disabled={processing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {processing ? 'Removing...' : 'Remove Student'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
