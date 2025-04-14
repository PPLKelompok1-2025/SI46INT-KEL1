import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

export default function Edit({ auth, review }) {
    const { data, setData, put, processing, errors } = useForm({
        rating: review.rating,
        comment: review.comment,
        is_reported: review.is_reported,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.reviews.update', review.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Review" />

            <div className="sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">
                                    Edit Review
                                </CardTitle>
                                <CardDescription>
                                    Editing review for course:{' '}
                                    <Link
                                        href={route(
                                            'admin.reviews.course',
                                            review.course.id,
                                        )}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {review.course.title}
                                    </Link>
                                </CardDescription>
                            </div>
                            <Button variant="outline" asChild>
                                <Link
                                    href={route(
                                        'admin.reviews.show',
                                        review.id,
                                    )}
                                >
                                    Cancel
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="rating">Rating</Label>
                                    <Select
                                        value={data.rating.toString()}
                                        onValueChange={(value) =>
                                            setData('rating', parseInt(value))
                                        }
                                    >
                                        <SelectTrigger id="rating">
                                            <SelectValue placeholder="Select rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[5, 4, 3, 2, 1].map((rating) => (
                                                <SelectItem
                                                    key={rating}
                                                    value={rating.toString()}
                                                >
                                                    {rating} Star
                                                    {rating !== 1 && 's'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.rating && (
                                        <p className="text-sm text-red-500">
                                            {errors.rating}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="student">Student</Label>
                                    <Input
                                        id="student"
                                        value={review.user.name}
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comment">Review Content</Label>
                                <Textarea
                                    id="comment"
                                    value={data.comment}
                                    onChange={(e) =>
                                        setData('comment', e.target.value)
                                    }
                                    rows={5}
                                />
                                {errors.comment && (
                                    <p className="text-sm text-red-500">
                                        {errors.comment}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_reported"
                                    checked={data.is_reported}
                                    onCheckedChange={(checked) =>
                                        setData('is_reported', checked)
                                    }
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="is_reported"
                                        className="flex items-center text-sm font-medium"
                                    >
                                        <AlertTriangle className="mr-1 h-4 w-4 text-amber-500" />
                                        Mark as reported
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Reported reviews will be flagged for
                                        further review.
                                    </p>
                                </div>
                            </div>

                            {review.instructor_response && (
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <Label className="mb-2 block text-sm font-medium">
                                        Instructor Response
                                    </Label>
                                    <p className="whitespace-pre-line text-sm text-gray-700">
                                        {review.instructor_response}
                                    </p>
                                </div>
                            )}

                            {review.admin_response && (
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <Label className="mb-2 block text-sm font-medium">
                                        Admin Response
                                    </Label>
                                    <p className="whitespace-pre-line text-sm text-gray-700">
                                        {review.admin_response}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" asChild>
                                    <Link
                                        href={route(
                                            'admin.reviews.show',
                                            review.id,
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
