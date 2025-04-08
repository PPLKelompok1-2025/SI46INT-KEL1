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
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Edit,
    Eye,
    Folder,
    FolderTree,
    PlusCircle,
    Trash,
} from 'lucide-react';
import { useState } from 'react';

export default function Index({ categories, filters = {}, stats }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        router.delete(route('admin.categories.destroy', categoryToDelete.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
            },
        });
    };

    const columns = [
        {
            label: 'Name',
            key: 'name',
            render: (category) => (
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        {category.icon ? (
                            <span className="text-primary">
                                {category.icon}
                            </span>
                        ) : (
                            <Folder className="h-5 w-5 text-primary" />
                        )}
                    </div>
                    <div className="font-medium">{category.name}</div>
                </div>
            ),
        },
        {
            label: 'Description',
            key: 'description',
            render: (category) => (
                <div className="max-w-xs truncate">
                    {category.description || 'No description'}
                </div>
            ),
        },
        {
            label: 'Parent',
            key: 'parent.name',
            render: (category) =>
                category.parent ? (
                    <Badge variant="outline">{category.parent.name}</Badge>
                ) : (
                    <span className="text-muted-foreground">None</span>
                ),
        },
        {
            label: 'Courses',
            key: 'courses_count',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (category) => (
                <Badge variant="secondary">{category.courses_count}</Badge>
            ),
        },
        {
            label: 'Subcategories',
            key: 'children_count',
            className: 'text-center',
            cellClassName: 'text-center',
            render: (category) => (
                <Badge variant="secondary">{category.children_count}</Badge>
            ),
        },
        {
            label: 'Actions',
            key: 'actions',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (category) => (
                <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" asChild>
                                    <Link
                                        href={route(
                                            'admin.categories.show',
                                            category.id,
                                        )}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View category details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" asChild>
                                    <Link
                                        href={route(
                                            'admin.categories.edit',
                                            category.id,
                                        )}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit category</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => confirmDelete(category)}
                                    disabled={
                                        category.courses_count > 0 ||
                                        category.children_count > 0
                                    }
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delete category</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
    ];

    const filterOptions = {
        searchEnabled: true,
        searchPlaceholder: 'Search categories...',
        selectFilters: {
            parent: {
                label: 'Type',
                placeholder: 'Filter by type',
                allLabel: 'All Categories',
                options: [
                    { value: 'parent', label: 'Parent Categories' },
                    { value: 'child', label: 'Sub Categories' },
                ],
            },
        },
        sortOptions: [
            { value: 'name_asc', label: 'Name (A-Z)' },
            { value: 'name_desc', label: 'Name (Z-A)' },
            { value: 'created_at_desc', label: 'Newest First' },
            { value: 'created_at_asc', label: 'Oldest First' },
            { value: 'courses_count_desc', label: 'Most Courses' },
            { value: 'courses_count_asc', label: 'Least Courses' },
        ],
        defaultSort: filters.sort || 'name_asc',
    };

    const statsConfig = {
        items: [
            {
                title: 'Total Categories',
                value: stats.total,
                description: `${stats.parent} parent, ${stats.child} subcategories`,
                icon: <Folder className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Parent Categories',
                value: stats.parent,
                description: 'Top-level categories',
                icon: <FolderTree className="h-4 w-4 text-muted-foreground" />,
            },
            {
                title: 'Total Courses',
                value: stats.totalCourses,
                description: 'Across all categories',
                icon: <BookOpen className="h-4 w-4 text-muted-foreground" />,
            },
        ],
    };

    const emptyState = {
        icon: <FolderTree className="mb-4 h-12 w-12 text-muted-foreground" />,
        title: 'No categories found',
        description:
            "Try adjusting your search or filters to find what you're looking for.",
        noFilterDescription: 'There are no categories in the system yet.',
    };

    return (
        <AuthenticatedLayout>
            <Head title="Category Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Category Management</h1>
                    <Button asChild>
                        <Link href={route('admin.categories.create')}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                        </Link>
                    </Button>
                </div>

                <TableTemplate
                    title="Categories"
                    description="Manage course categories across the platform"
                    columns={columns}
                    data={categories}
                    filterOptions={filterOptions}
                    filters={filters}
                    routeName="admin.categories.index"
                    stats={statsConfig}
                    emptyState={emptyState}
                />
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the category "
                            {categoryToDelete?.name}"? This action cannot be
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
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
