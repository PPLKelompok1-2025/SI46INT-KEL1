import EmptyState from '@/Components/Student/EmptyState';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, WhenVisible } from '@inertiajs/react';
import { BookOpen, Edit, FileText, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Index({ notes, page = 1, isNextPageExists = false }) {
    const [noteToDelete, setNoteToDelete] = useState(null);
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (noteToDelete) {
            destroy(route('student.notes.destroy', noteToDelete.id), {
                onSuccess: () => setNoteToDelete(null),
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Notes" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">My Notes</h1>
                </div>

                {notes.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {notes.map((note) => (
                                <Card key={note.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="line-clamp-1">
                                            {note.course.title}
                                        </CardTitle>
                                        <CardDescription>
                                            Last updated:{' '}
                                            {new Date(
                                                note.updated_at,
                                            ).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="prose dark:prose-invert max-h-40 overflow-y-auto">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        note.content.substring(
                                                            0,
                                                            200,
                                                        ) +
                                                        (note.content.length >
                                                        200
                                                            ? '...'
                                                            : ''),
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between">
                                        <Button variant="outline" asChild>
                                            <Link
                                                href={route(
                                                    'student.courses.learn',
                                                    note.course.id,
                                                )}
                                                prefetch="hover"
                                            >
                                                <BookOpen className="mr-2 h-4 w-4" />
                                                Go to Course
                                            </Link>
                                        </Button>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                asChild
                                            >
                                                <Link
                                                    href={route(
                                                        'student.notes.edit',
                                                        note.id,
                                                    )}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    setNoteToDelete(note)
                                                }
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {isNextPageExists && (
                            <div className="mt-8">
                                <WhenVisible
                                    always
                                    params={{
                                        data: {
                                            page: Number(page) + 1,
                                        },
                                        only: [
                                            'notes',
                                            'page',
                                            'isNextPageExists',
                                        ],
                                        preserveState: true,
                                    }}
                                    fallback={
                                        <div className="flex justify-center">
                                            <p className="text-muted-foreground">
                                                You've reached the end.
                                            </p>
                                        </div>
                                    }
                                >
                                    <div className="flex justify-center">
                                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    </div>
                                </WhenVisible>
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon={FileText}
                        title="No notes yet"
                        description="Create notes for your courses to help with your studies."
                        buttonText="Browse Courses"
                        buttonLink="/courses"
                    />
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={!!noteToDelete}
                onOpenChange={(open) => !open && setNoteToDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Note</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this note? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setNoteToDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={processing}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
