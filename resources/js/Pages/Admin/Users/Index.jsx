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
import { Input } from '@/Components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import {
    Edit,
    Eye,
    PlusCircle,
    Search,
    Trash,
    User as UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index({ auth, users, filters }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleSearch = debounce((value) => {
        router.get(
            route('admin.users.index'),
            { search: value, role: roleFilter },
            { preserveState: true },
        );
    }, 300);

    const handleRoleFilter = (value) => {
        setRoleFilter(value);
        router.get(
            route('admin.users.index'),
            { search: searchTerm, role: value },
            { preserveState: true },
        );
    };

    useEffect(() => {
        setSearchTerm(filters.search || '');
        setRoleFilter(filters.role || 'all');
    }, [filters]);

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

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>
                            Manage user accounts across the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search users..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                />
                            </div>
                            <Select
                                value={roleFilter}
                                onValueChange={handleRoleFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Roles
                                    </SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="instructor">
                                        Instructor
                                    </SelectItem>
                                    <SelectItem value="student">
                                        Student
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {users.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <UserIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">
                                    No users found
                                </h3>
                                <p className="text-muted-foreground">
                                    {searchTerm || roleFilter !== 'all'
                                        ? "Try adjusting your search or filter to find what you're looking for."
                                        : 'There are no users in the system yet.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-center">
                                                Role
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Courses
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Enrollments
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Reviews
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                                                            {user.profile_photo_path ? (
                                                                <img
                                                                    src={`/storage/${user.profile_photo_path}`}
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                                    <UserIcon className="h-5 w-5 text-primary" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {user.name}
                                                            </div>
                                                            {user.headline && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {
                                                                        user.headline
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={getRoleBadgeVariant(
                                                            user.role,
                                                        )}
                                                    >
                                                        {user.role
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            user.role.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {user.courses_count || 0}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {user.enrollments_count ||
                                                        0}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {user.reviews_count || 0}
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
                                                                    'admin.users.show',
                                                                    user.id,
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
                                                                    'admin.users.edit',
                                                                    user.id,
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
                                                                    user,
                                                                )
                                                            }
                                                            disabled={
                                                                user.id ===
                                                                    auth.user
                                                                        .id ||
                                                                user.courses_count >
                                                                    0 ||
                                                                user.enrollments_count >
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

                                {/* Pagination */}
                                <div className="mt-4">
                                    <Pagination className="justify-end">
                                        <PaginationContent>
                                            {users.links.map((link, i) => {
                                                if (
                                                    !link.url &&
                                                    link.label === '...'
                                                ) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationEllipsis />
                                                        </PaginationItem>
                                                    );
                                                }

                                                if (
                                                    link.label.includes(
                                                        'Previous',
                                                    )
                                                ) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationPrevious
                                                                onClick={() =>
                                                                    link.url &&
                                                                    router.visit(
                                                                        link.url,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !link.url
                                                                }
                                                                className={
                                                                    !link.url
                                                                        ? 'pointer-events-none opacity-50'
                                                                        : 'cursor-pointer'
                                                                }
                                                            />
                                                        </PaginationItem>
                                                    );
                                                }

                                                if (
                                                    link.label.includes('Next')
                                                ) {
                                                    return (
                                                        <PaginationItem key={i}>
                                                            <PaginationNext
                                                                onClick={() =>
                                                                    link.url &&
                                                                    router.visit(
                                                                        link.url,
                                                                    )
                                                                }
                                                                disabled={
                                                                    !link.url
                                                                }
                                                                className={
                                                                    !link.url
                                                                        ? 'pointer-events-none opacity-50'
                                                                        : 'cursor-pointer'
                                                                }
                                                            />
                                                        </PaginationItem>
                                                    );
                                                }

                                                return (
                                                    <PaginationItem key={i}>
                                                        <PaginationLink
                                                            onClick={() =>
                                                                link.url &&
                                                                router.visit(
                                                                    link.url,
                                                                )
                                                            }
                                                            isActive={
                                                                link.active
                                                            }
                                                            disabled={!link.url}
                                                            className={
                                                                !link.url
                                                                    ? 'pointer-events-none opacity-50'
                                                                    : 'cursor-pointer'
                                                            }
                                                        >
                                                            {link.label}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
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
