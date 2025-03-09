import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Pagination } from '@/Components/ui/pagination';
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
import { Calendar, Search, User } from 'lucide-react';
import { useState } from 'react';

export default function Index({ enrollments }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEnrollments = enrollments.data.filter(
        (enrollment) =>
            enrollment.user.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            enrollment.user.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            enrollment.course.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    return (
        <AuthenticatedLayout>
            <Head title="Students" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Students</h1>
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
                        <CardTitle>All Students</CardTitle>
                        <CardDescription>
                            Students enrolled in your courses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Course</TableHead>
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
                                                <Link
                                                    href={route(
                                                        'instructor.courses.show',
                                                        enrollment.course.id,
                                                    )}
                                                    className="text-primary hover:underline"
                                                >
                                                    {enrollment.course.title}
                                                </Link>
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
                                                        prefetch="hover"
                                                    >
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
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
        </AuthenticatedLayout>
    );
}
