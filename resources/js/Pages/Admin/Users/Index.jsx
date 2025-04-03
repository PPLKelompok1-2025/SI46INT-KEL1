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
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    Edit,
    Eye,
    GraduationCap,
    PlusCircle,
    Star,
    Trash,
    User as UserIcon,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, users, filters = {}, stats }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'instructor':
                return 'purple';
            case 'student':
                return 'success';
            default:
                return 'secondary';
        }
    };

    const columns = [
        {
            label: 'User',
            key: 'name',
            render: (user) => (
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                        {user.profile_photo_path ? (
                            <img
                                src={`/storage/${user.profile_photo_path}`}
                                alt={user.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium">{user.name}</div>
                        {user.headline && (
                            <div className="text-sm text-muted-foreground">
                                {user.headline}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            label: 'Email',
            key: 'email',
        },
        {
            label: 'Role',
            key: 'role',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (user) => (
                <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
            ),
        },
        {
            label: 'Courses',
            key: 'courses_count',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (user) => user.courses_count || 0,
        },
        {
            label: 'Enrollments',
            key: 'enrollments_count',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (user) => user.enrollments_count || 0,
        },
        {
            label: 'Reviews',
            key: 'reviews_count',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (user) => user.reviews_count || 0,
        },
        {
            label: 'Actions',
            key: 'actions',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (user) => (
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.users.show', user.id)}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.users.edit', user.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => confirmDelete(user)}
                        disabled={
                            user.id === auth.user.id ||
                            user.courses_count > 0 ||
                            user.enrollments_count > 0
                        }
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const filterOptions = {
        searchEnabled: true,
        searchPlaceholder: 'Search users...',
        selectFilters: {
            role: {
                label: 'Roles',
                placeholder: 'Filter by role',
                allLabel: 'All Roles',
                options: [
                    { value: 'admin', label: 'Admin' },
                    { value: 'instructor', label: 'Instructor' },
                    { value: 'student', label: 'Student' },
                ],
            },
        },
        sortOptions: [
            { value: 'created_at_desc', label: 'Newest First' },
            { value: 'created_at_asc', label: 'Oldest First' },
            { value: 'name_asc', label: 'Name (A-Z)' },
            { value: 'name_desc', label: 'Name (Z-A)' },
            { value: 'email_asc', label: 'Email (A-Z)' },
            { value: 'email_desc', label: 'Email (Z-A)' },
            { value: 'courses_desc', label: 'Most Courses' },
            { value: 'enrollments_desc', label: 'Most Enrollments' },
        ],
        defaultSort: filters.sort || 'created_at_desc',
    };

    const statsConfig = {
        items: [
            {
                title: 'Total Users',
                value: stats.totalUsers,
                description: `${stats.totalAdmins} admins, ${stats.totalInstructors} instructors, ${stats.totalStudents} students`,
                icon: <Users className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Total Courses',
                value: stats.totalCourses,
                description: 'Created by instructors',
                icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Total Enrollments',
                value: stats.totalEnrollments,
                description: 'Across all courses',
                icon: (
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                ),
            },
            {
                title: 'Total Reviews',
                value: stats.totalReviews,
                description: 'From students',
                icon: <Star className="h-4 w-4 text-muted-foreground" />,
            },
        ],
    };

    const emptyState = {
        icon: <UserIcon className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No users found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription: 'There are no users in the system yet.',
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <Button asChild>
                        <Link href={route('admin.users.create')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add User
                        </Link>
                    </Button>
                </div>

                <TableTemplate
                    title="Users"
                    description="Manage user accounts across the platform"
                    columns={columns}
                    data={users}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="admin.users.index"
                    stats={statsConfig}
                    emptyState={emptyState}
                />
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "
                            {userToDelete?.name}"? This action cannot be undone.
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
                                    userToDelete
                                        ? route(
                                              'admin.users.destroy',
                                              userToDelete.id,
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
