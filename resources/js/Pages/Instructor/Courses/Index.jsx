import TableTemplate from '@/Components/TableTemplate';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Edit,
    Eye,
    GraduationCap,
    Layers,
    PlusCircle,
    Star,
    Trash,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ courses, categories, filters = {}, stats }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const confirmDelete = (course) => {
        setCourseToDelete(course);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
    };

    const columns = [
        {
            label: 'Course',
            key: 'title',
            render: (course) => (
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                        {course.thumbnail ? (
                            <img
                                src={`/storage/${course.thumbnail}`}
                                alt={course.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium">{course.title}</div>
                        {course.level && (
                            <div className="text-sm text-muted-foreground">
                                {course.level.charAt(0).toUpperCase() +
                                    course.level.slice(1)}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            label: 'Instructor',
            key: 'user.name',
            render: (course) => course.user?.name || 'N/A',
        },
        {
            label: 'Category',
            key: 'category.name',
            render: (course) => course.category?.name || 'Uncategorized',
        },
        {
            label: 'Status',
            key: 'is_published',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (course) => (
                <>
                    <Badge
                        variant={course.is_published ? 'success' : 'secondary'}
                    >
                        {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    {course.is_free && (
                        <Badge variant="outline" className="ml-2">
                            Free
                        </Badge>
                    )}
                    {course.is_featured && (
                        <Badge variant="outline" className="ml-2">
                            Featured
                        </Badge>
                    )}
                </>
            ),
        },
        {
            label: 'Price',
            key: 'price',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (course) =>
                course.is_free ? 'Free' : formatCurrency(course.price),
        },
        {
            label: 'Rating',
            key: 'average_rating',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (course) => (
                <div className="flex items-center justify-center">
                    <Star
                        className="mr-1 h-4 w-4 text-yellow-400"
                        fill="currentColor"
                    />
                    <span>
                        {course.average_rating > 0
                            ? Number(course.average_rating).toFixed(1)
                            : 'N/A'}
                    </span>
                </div>
            ),
        },
        {
            label: 'Lessons',
            key: 'lessons_count',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (course) => course.lessons_count || 0,
        },
        {
            label: 'Students',
            key: 'enrollments_count',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (course) => course.enrollments_count || 0,
        },
        {
            label: 'Actions',
            key: 'actions',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (course) => (
                <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" asChild>
                                    <Link
                                        href={route(
                                            'instructor.courses.show',
                                            course.id,
                                        )}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View course details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" asChild>
                                    <Link
                                        href={route(
                                            'instructor.courses.edit',
                                            course.id,
                                        )}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit course details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => confirmDelete(course)}
                                    disabled={course.enrollments_count > 0}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delete course</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
    ];

    const filterOptions = {
        searchEnabled: true,
        searchPlaceholder: 'Search courses...',
        selectFilters: {
            category: {
                label: 'Categories',
                placeholder: 'Filter by category',
                allLabel: 'All Categories',
                options: categories.map((category) => ({
                    value: category.id.toString(),
                    label: category.name,
                })),
            },
            status: {
                label: 'Status',
                placeholder: 'Filter by status',
                allLabel: 'All Status',
                options: [
                    { value: 'published', label: 'Published' },
                    { value: 'unpublished', label: 'Unpublished' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'unapproved', label: 'Unapproved' },
                    { value: 'featured', label: 'Featured' },
                ],
            },
        },
        sortOptions: [
            { value: 'created_at_desc', label: 'Newest First' },
            { value: 'created_at_asc', label: 'Oldest First' },
            { value: 'title_asc', label: 'Title (A-Z)' },
            { value: 'title_desc', label: 'Title (Z-A)' },
            { value: 'price_desc', label: 'Price (High-Low)' },
            { value: 'price_asc', label: 'Price (Low-High)' },
            { value: 'enrollments_desc', label: 'Most Enrolled' },
            { value: 'enrollments_asc', label: 'Least Enrolled' },
        ],
        defaultSort: 'created_at_desc',
    };

    const statsConfig = {
        items: [
            {
                title: 'Total Courses',
                value: stats.totalCourses,
                description: `${stats.publishedCourses} published`,
                icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Total Students',
                value: stats.totalStudents,
                description: 'Enrolled in your courses',
                icon: <Users className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Total Lessons',
                value: stats.totalLessons,
                description: 'Across all courses',
                icon: <Layers className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Average Rating',
                value: stats.averageRating > 0 ? stats.averageRating : 'N/A',
                description: 'From student reviews',
                icon: <Star className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Publishing Rate',
                value:
                    stats.totalCourses > 0
                        ? `${Math.round((stats.publishedCourses / stats.totalCourses) * 100)}%`
                        : '0%',
                description: 'Courses published',
                icon: (
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                ),
            },
        ],
    };

    const emptyState = {
        icon: <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No courses found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription: 'There are no courses in the system yet.',
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Courses" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Course Management</h1>
                    <Button asChild>
                        <Link href={route('instructor.courses.create')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Course
                        </Link>
                    </Button>
                </div>

                <TableTemplate
                    columns={columns}
                    data={courses}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="instructor.courses.index"
                    stats={statsConfig}
                    emptyState={emptyState}
                    title="My Courses"
                    description="Manage all your courses"
                />
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
                                method="delete"
                                onSuccess={handleDelete}
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
