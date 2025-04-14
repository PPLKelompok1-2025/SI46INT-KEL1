import TableTemplate from '@/Components/TableTemplate';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle,
    Clock,
    GraduationCap,
    User,
} from 'lucide-react';

export default function Course({ course, enrollments, filters = {}, stats }) {
    const columns = [
        {
            label: 'Student',
            key: 'user.name',
            render: (enrollment) => (
                <div className="flex items-center">
                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {enrollment.user.profile_photo_path ? (
                            <img
                                src={`/storage/${enrollment.user.profile_photo_path}`}
                                alt={enrollment.user.name}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <User className="h-4 w-4 text-primary" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium">
                            {enrollment.user.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {enrollment.user.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            label: 'Progress',
            key: 'progress',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (enrollment) => (
                <div className="flex flex-col items-center justify-center">
                    <div className="mb-1 flex items-center">
                        {enrollment.is_completed ? (
                            <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                        ) : (
                            <Clock className="mr-1 h-4 w-4 text-amber-500" />
                        )}
                        <span>{enrollment.progress || 0}% Complete</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${enrollment.progress || 0}%` }}
                        ></div>
                    </div>
                </div>
            ),
        },
        {
            label: 'Enrolled On',
            key: 'created_at',
            render: (enrollment) => (
                <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(enrollment.created_at).toLocaleDateString()}
                </div>
            ),
        },
        {
            label: 'Status',
            key: 'status',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (enrollment) => (
                <Badge
                    variant={enrollment.is_completed ? 'success' : 'secondary'}
                >
                    {enrollment.is_completed ? 'Completed' : 'In Progress'}
                </Badge>
            ),
        },
        {
            label: 'Actions',
            key: 'actions',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (enrollment) => (
                <Button variant="outline" size="sm" asChild>
                    <Link
                        href={route('instructor.students.show', enrollment.id)}
                        prefetch="hover"
                    >
                        View Details
                    </Link>
                </Button>
            ),
        },
    ];

    const filterOptions = {
        searchEnabled: true,
        searchPlaceholder: 'Search students by name or email...',
        selectFilters: {
            date_range: {
                label: 'Enrollment Date',
                placeholder: 'Filter by enrollment date',
                allLabel: 'All Time',
                options: [
                    { value: 'last_week', label: 'Last Week' },
                    { value: 'last_month', label: 'Last Month' },
                    { value: 'last_3_months', label: 'Last 3 Months' },
                    { value: 'last_6_months', label: 'Last 6 Months' },
                    { value: 'last_year', label: 'Last Year' },
                ],
            },
        },
        sortOptions: [
            { value: 'created_at_desc', label: 'Newest First' },
            { value: 'created_at_asc', label: 'Oldest First' },
            { value: 'user.name_asc', label: 'Name (A-Z)' },
            { value: 'user.name_desc', label: 'Name (Z-A)' },
        ],
        defaultSort: filters.sort || 'created_at_desc',
    };

    const statsConfig = {
        items: [
            {
                title: 'Total Enrollments',
                value: stats.totalEnrollments,
                description: 'Students enrolled in this course',
                icon: (
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                ),
            },
            {
                title: 'Recent Enrollments',
                value: stats.recentEnrollments,
                description: 'In the last 30 days',
                icon: (
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                ),
            },
            {
                title: 'Active Students',
                value: stats.activeStudents,
                description: 'Active in the last 30 days',
                icon: <User className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Completion Rate',
                value: `${stats.completionRate}%`,
                description: 'Students who completed the course',
                icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
            },
        ],
    };

    const emptyState = {
        icon: <User className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No students found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription:
            'No students are currently enrolled in this course.',
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${course.title} - Students`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link
                                    href={route(
                                        'instructor.courses.show',
                                        course.id,
                                    )}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Course
                                </Link>
                            </Button>
                        </div>
                        <h1 className="mt-2 text-3xl font-bold">
                            {course.title}
                        </h1>
                        <p className="text-muted-foreground">
                            Student Enrollments
                        </p>
                    </div>
                </div>

                <TableTemplate
                    title="Enrolled Students"
                    description="Students enrolled in this course"
                    columns={columns}
                    data={enrollments}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="instructor.courses.students"
                    routeParams={{ course: course.id }}
                    stats={statsConfig}
                    emptyState={emptyState}
                />
            </div>
        </AuthenticatedLayout>
    );
}
