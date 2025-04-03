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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle,
    Edit,
    Eye,
    Star,
    Trash,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ courses, categories, filters = {} }) {
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
                                    course.level.slice(1).replace('-', ' ')}
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
                <div>
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
                </div>
            ),
        },
        {
            label: 'Price',
            key: 'price',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (course) => formatCurrency(course.price),
        },
        {
            label: 'Rating',
            key: 'average_rating',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (course) => (
                <div className="flex items-center justify-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                    <span>{Number(course.average_rating).toFixed(1)}</span>
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
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.courses.show', course.id)}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.courses.edit', course.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant={course.is_approved ? 'outline' : 'success'}
                        size="icon"
                        asChild
                        title={course.is_approved ? 'Unapprove' : 'Approve'}
                    >
                        <Link
                            href={route('admin.courses.approve', course.id)}
                            method="patch"
                        >
                            {course.is_approved ? (
                                <XCircle className="h-4 w-4" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => confirmDelete(course)}
                        disabled={course.enrollments_count > 0}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
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
        defaultSort: filters.sort || 'created_at_desc',
    };

    const statsConfig = {
        items: [
            {
                title: 'Total Courses',
                value: courses.total,
                icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Published',
                value: courses.data.filter((course) => course.is_published)
                    .length,
                icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Drafts',
                value: courses.data.filter((course) => !course.is_published)
                    .length,
                icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
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
            <Head title="Manage Courses" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Manage Courses</h1>
                    <Button asChild>
                        <Link href={route('admin.courses.create')}>
                            <BookOpen className="mr-2 h-4 w-4" /> Add Course
                        </Link>
                    </Button>
                </div>

                <TableTemplate
                    title="Courses"
                    description="Manage all courses in the system"
                    columns={columns}
                    data={courses}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="admin.courses.index"
                    stats={statsConfig}
                    emptyState={emptyState}
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
                                              'admin.courses.destroy',
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
