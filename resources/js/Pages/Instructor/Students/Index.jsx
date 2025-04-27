import TableTemplate from '@/Components/TableTemplate';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    GraduationCap,
    User,
    Users,
} from 'lucide-react';

export default function Index({ enrollments, stats, courses, filters = {} }) {
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
            label: 'Course',
            key: 'course.title',
            render: (enrollment) => (
                <Link
                    href={route(
                        'instructor.courses.show',
                        enrollment.course.id,
                    )}
                    className="text-primary hover:underline"
                >
                    {enrollment.course.title}
                </Link>
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
            course: {
                label: 'Course',
                placeholder: 'Filter by course',
                allLabel: 'All Courses',
                options: courses.map((course) => ({
                    value: course.id.toString(),
                    label: course.title,
                })),
            },
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
                title: 'Total Students',
                value: stats.totalStudents,
                description: `Across ${courses.length} courses`,
                icon: <Users className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Total Enrollments',
                value: stats.totalEnrollments,
                description: `${stats.activeStudents} active students`,
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
                title: 'Most Popular Course',
                value:
                    Object.keys(stats.courseDistribution).length > 0
                        ? Object.keys(stats.courseDistribution).reduce(
                              (a, b) =>
                                  stats.courseDistribution[a] >
                                  stats.courseDistribution[b]
                                      ? a
                                      : b,
                          )
                        : 'N/A',
                description: 'By enrollment count',
                icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
            },
        ],
    };

    const emptyState = {
        icon: <Users className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No students found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription:
            "You don't have any students enrolled in your courses yet.",
    };

    return (
        <AuthenticatedLayout>
            <Head title="Students" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Students</h1>
                </div>

                <TableTemplate
                    title="All Students"
                    description="Students enrolled in your courses"
                    columns={columns}
                    data={enrollments}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="instructor.students.index"
                    stats={statsConfig}
                    emptyState={emptyState}
                />
            </div>
        </AuthenticatedLayout>
    );
}
