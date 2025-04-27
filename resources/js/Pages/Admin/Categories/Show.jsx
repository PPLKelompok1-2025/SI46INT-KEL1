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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Folder,
    FolderTree,
    PenSquare,
    Star,
} from 'lucide-react';

export default function Show({ category, courses }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Category: ${category.name}`} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <Link
                        href={route('admin.categories.index')}
                        className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Categories
                    </Link>
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold">{category.name}</h1>
                        <Button asChild variant="outline">
                            <Link
                                href={route(
                                    'admin.categories.edit',
                                    category.id,
                                )}
                            >
                                <PenSquare className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Name
                                    </dt>
                                    <dd className="mt-1 flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                            {category.icon ? (
                                                <span className="text-xl text-primary">
                                                    {category.icon}
                                                </span>
                                            ) : (
                                                <Folder className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <span className="font-medium">
                                            {category.name}
                                        </span>
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Slug
                                    </dt>
                                    <dd className="mt-1 text-sm">
                                        <code className="rounded bg-muted px-1 py-0.5">
                                            {category.slug}
                                        </code>
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Parent Category
                                    </dt>
                                    <dd className="mt-1">
                                        {category.parent ? (
                                            <Badge variant="outline">
                                                <Link
                                                    href={route(
                                                        'admin.categories.show',
                                                        category.parent.id,
                                                    )}
                                                >
                                                    {category.parent.name}
                                                </Link>
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                None
                                            </span>
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Description
                                    </dt>
                                    <dd className="mt-1">
                                        {category.description || (
                                            <span className="italic text-muted-foreground">
                                                No description provided
                                            </span>
                                        )}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        Statistics
                                    </dt>
                                    <dd className="mt-1 flex gap-3">
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            <BookOpen className="h-3 w-3" />
                                            {category.courses_count} Course
                                            {category.courses_count !== 1 &&
                                                's'}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            <FolderTree className="h-3 w-3" />
                                            {/* {category.children_count}{' '} */}
                                            Subcategor
                                            {category.children_count !== 1
                                                ? 'ies'
                                                : 'y'}
                                        </Badge>
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {category.children && category.children.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Subcategories</CardTitle>
                                <CardDescription>
                                    Categories that are children of{' '}
                                    {category.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {category.children.map((child) => (
                                        <div
                                            key={child.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                    {child.icon ? (
                                                        <span className="text-primary">
                                                            {child.icon}
                                                        </span>
                                                    ) : (
                                                        <Folder className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {child.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {child.courses_count}{' '}
                                                        course
                                                        {child.courses_count !==
                                                            1 && 's'}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        'admin.categories.show',
                                                        child.id,
                                                    )}
                                                >
                                                    View
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Courses in this Category</CardTitle>
                        <CardDescription>
                            All courses assigned to {category.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {courses.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">
                                    No courses found
                                </h3>
                                <p className="text-muted-foreground">
                                    This category doesn't have any courses
                                    assigned yet.
                                </p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Instructor</TableHead>
                                            <TableHead className="text-center">
                                                Price
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Rating
                                            </TableHead>
                                            <TableHead className="text-center">
                                                Students
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courses.data.map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                            {course.thumbnail ? (
                                                                <img
                                                                    src={`/storage/${course.thumbnail}`}
                                                                    alt={
                                                                        course.title
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                                                    <BookOpen className="h-5 w-5 text-primary" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">
                                                                {course.title}
                                                            </div>
                                                            {course.level && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {course.level
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() +
                                                                        course.level.slice(
                                                                            1,
                                                                        )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {course.user?.name || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {formatCurrency(
                                                        course.price,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Star className="mr-1 h-4 w-4 text-yellow-500" />
                                                        <span>
                                                            {Number(
                                                                course.average_rating,
                                                            ).toFixed(1)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {course.enrollments_count ||
                                                        0}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'admin.courses.show',
                                                                course.id,
                                                            )}
                                                        >
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {courses.last_page > 1 && (
                                    <div className="mt-4">
                                        <Pagination>
                                            <PaginationContent>
                                                {courses.current_page > 1 && (
                                                    <PaginationItem>
                                                        <PaginationPrevious
                                                            href={`${route('admin.categories.show', category.id)}?page=${
                                                                courses.current_page -
                                                                1
                                                            }`}
                                                        />
                                                    </PaginationItem>
                                                )}

                                                {[
                                                    ...Array(courses.last_page),
                                                ].map((_, i) => {
                                                    const page = i + 1;
                                                    // Show current page, first, last, and pages adjacent to current
                                                    if (
                                                        page === 1 ||
                                                        page ===
                                                            courses.last_page ||
                                                        Math.abs(
                                                            page -
                                                                courses.current_page,
                                                        ) <= 1
                                                    ) {
                                                        return (
                                                            <PaginationItem
                                                                key={page}
                                                            >
                                                                <PaginationLink
                                                                    href={`${route('admin.categories.show', category.id)}?page=${page}`}
                                                                    isActive={
                                                                        page ===
                                                                        courses.current_page
                                                                    }
                                                                >
                                                                    {page}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        );
                                                    }
                                                    // Add ellipses for skipped pages
                                                    if (
                                                        page === 2 ||
                                                        page ===
                                                            courses.last_page -
                                                                1
                                                    ) {
                                                        return (
                                                            <PaginationItem
                                                                key={page}
                                                            >
                                                                <PaginationEllipsis />
                                                            </PaginationItem>
                                                        );
                                                    }
                                                    return null;
                                                })}

                                                {courses.current_page <
                                                    courses.last_page && (
                                                    <PaginationItem>
                                                        <PaginationNext
                                                            href={`${route('admin.categories.show', category.id)}?page=${
                                                                courses.current_page +
                                                                1
                                                            }`}
                                                        />
                                                    </PaginationItem>
                                                )}
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
