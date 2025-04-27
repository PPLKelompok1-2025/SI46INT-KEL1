import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Edit({ course, categories, instructors }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: course.title || '',
        description: course.description || '',
        short_description: course.short_description || '',
        user_id: course.user_id ? course.user_id.toString() : '',
        category_id: course.category_id ? course.category_id.toString() : '',
        price: course.price ? course.price.toString() : '0',
        level: course.level || 'beginner',
        language: course.language || 'English',
        requirements: Array.isArray(course.requirements)
            ? course.requirements
            : [],
        what_you_will_learn: Array.isArray(course.what_you_will_learn)
            ? course.what_you_will_learn
            : [],
        who_is_this_course_for: Array.isArray(course.who_is_this_course_for)
            ? course.who_is_this_course_for
            : [],
        thumbnail: null,
        promotional_video: course.promotional_video || '',
        is_published: course.is_published || false,
        is_featured: course.is_featured || false,
        is_approved: course.is_approved || false,
    });

    const [newRequirement, setNewRequirement] = useState('');
    const [newLearningPoint, setNewLearningPoint] = useState('');
    const [newTargetAudience, setNewTargetAudience] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.courses.update', course.id));
    };

    const handleAddRequirement = () => {
        if (newRequirement.trim()) {
            setData('requirements', [
                ...data.requirements,
                newRequirement.trim(),
            ]);
            setNewRequirement('');
        }
    };

    const handleRemoveRequirement = (index) => {
        setData(
            'requirements',
            data.requirements.filter((_, i) => i !== index),
        );
    };

    const handleAddLearningPoint = () => {
        if (newLearningPoint.trim()) {
            setData('what_you_will_learn', [
                ...data.what_you_will_learn,
                newLearningPoint.trim(),
            ]);
            setNewLearningPoint('');
        }
    };

    const handleRemoveLearningPoint = (index) => {
        setData(
            'what_you_will_learn',
            data.what_you_will_learn.filter((_, i) => i !== index),
        );
    };

    const handleAddTargetAudience = () => {
        if (newTargetAudience.trim()) {
            setData('who_is_this_course_for', [
                ...data.who_is_this_course_for,
                newTargetAudience.trim(),
            ]);
            setNewTargetAudience('');
        }
    };

    const handleRemoveTargetAudience = (index) => {
        setData(
            'who_is_this_course_for',
            data.who_is_this_course_for.filter((_, i) => i !== index),
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Course - ${course.title}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.courses.show', course.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Course
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold">Edit Course</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Update the essential details about the
                                        course.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">
                                            Course Title
                                        </Label>
                                        <Input
                                            id="title"
                                            placeholder="Enter course title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-500">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Describe the course"
                                            rows={5}
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="short_description">
                                            Short Description
                                        </Label>
                                        <Textarea
                                            id="short_description"
                                            placeholder="Enter a brief description (max 500 characters)"
                                            rows={3}
                                            maxLength={500}
                                            value={data.short_description}
                                            onChange={(e) =>
                                                setData(
                                                    'short_description',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.short_description && (
                                            <p className="text-sm text-red-500">
                                                {errors.short_description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="user_id">
                                            Instructor
                                        </Label>
                                        <Select
                                            value={data.user_id}
                                            onValueChange={(value) =>
                                                setData('user_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an instructor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {instructors.map(
                                                    (instructor) => (
                                                        <SelectItem
                                                            key={instructor.id}
                                                            value={instructor.id.toString()}
                                                        >
                                                            {instructor.name}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.user_id && (
                                            <p className="text-sm text-red-500">
                                                {errors.user_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">
                                            Category
                                        </Label>
                                        <Select
                                            value={data.category_id}
                                            onValueChange={(value) =>
                                                setData('category_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id.toString()}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && (
                                            <p className="text-sm text-red-500">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price">
                                            Price (in IDR)
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step=".01"
                                            placeholder="0.00"
                                            value={data.price}
                                            onChange={(e) =>
                                                setData('price', e.target.value)
                                            }
                                            required
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-red-500">
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="level">Level</Label>
                                            <Select
                                                value={data.level}
                                                onValueChange={(value) =>
                                                    setData('level', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="beginner">
                                                        Beginner
                                                    </SelectItem>
                                                    <SelectItem value="intermediate">
                                                        Intermediate
                                                    </SelectItem>
                                                    <SelectItem value="advanced">
                                                        Advanced
                                                    </SelectItem>
                                                    <SelectItem value="all-levels">
                                                        All Levels
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.level && (
                                                <p className="text-sm text-red-500">
                                                    {errors.level}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="language">
                                                Language
                                            </Label>
                                            <Input
                                                id="language"
                                                placeholder="e.g., English"
                                                value={data.language}
                                                onChange={(e) =>
                                                    setData(
                                                        'language',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {errors.language && (
                                                <p className="text-sm text-red-500">
                                                    {errors.language}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Media</CardTitle>
                                    <CardDescription>
                                        Update visual elements for your course
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="thumbnail">
                                            Course Thumbnail
                                        </Label>
                                        {course.thumbnail && (
                                            <div className="mb-2 h-40 w-full overflow-hidden rounded-md">
                                                <img
                                                    src={`/storage/${course.thumbnail}`}
                                                    alt={course.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <Input
                                            id="thumbnail"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                setData(
                                                    'thumbnail',
                                                    e.target.files[0],
                                                )
                                            }
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Leave empty to keep the current
                                            image
                                        </p>
                                        {errors.thumbnail && (
                                            <p className="text-sm text-red-500">
                                                {errors.thumbnail}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="promotional_video">
                                            Promotional Video URL
                                        </Label>
                                        <Input
                                            id="promotional_video"
                                            placeholder="e.g., https://youtube.com/watch?v=..."
                                            value={data.promotional_video}
                                            onChange={(e) =>
                                                setData(
                                                    'promotional_video',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.promotional_video && (
                                            <p className="text-sm text-red-500">
                                                {errors.promotional_video}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Content</CardTitle>
                                    <CardDescription>
                                        Update what students will learn and
                                        requirements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Requirements</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add a requirement"
                                                value={newRequirement}
                                                onChange={(e) =>
                                                    setNewRequirement(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddRequirement();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddRequirement}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.requirements && (
                                            <p className="text-sm text-red-500">
                                                {errors.requirements}
                                            </p>
                                        )}
                                        <ul className="mt-2 space-y-2">
                                            {data.requirements.map(
                                                (requirement, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center justify-between rounded-md border border-border p-2"
                                                    >
                                                        <span>
                                                            {requirement}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveRequirement(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>What You Will Learn</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add a learning point"
                                                value={newLearningPoint}
                                                onChange={(e) =>
                                                    setNewLearningPoint(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddLearningPoint();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddLearningPoint}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.what_you_will_learn && (
                                            <p className="text-sm text-red-500">
                                                {errors.what_you_will_learn}
                                            </p>
                                        )}
                                        <ul className="mt-2 space-y-2">
                                            {data.what_you_will_learn.map(
                                                (point, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center justify-between rounded-md border border-border p-2"
                                                    >
                                                        <span>{point}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveLearningPoint(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Who This Course is For</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Add target audience"
                                                value={newTargetAudience}
                                                onChange={(e) =>
                                                    setNewTargetAudience(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddTargetAudience();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={
                                                    handleAddTargetAudience
                                                }
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.who_is_this_course_for && (
                                            <p className="text-sm text-red-500">
                                                {errors.who_is_this_course_for}
                                            </p>
                                        )}
                                        <ul className="mt-2 space-y-2">
                                            {data.who_is_this_course_for.map(
                                                (item, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-center justify-between rounded-md border border-border p-2"
                                                    >
                                                        <span>{item}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveTargetAudience(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Publication Settings</CardTitle>
                                    <CardDescription>
                                        Configure visibility and status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_published"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) =>
                                                setData('is_published', checked)
                                            }
                                        />
                                        <Label htmlFor="is_published">
                                            Published
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_featured"
                                            checked={data.is_featured}
                                            onCheckedChange={(checked) =>
                                                setData('is_featured', checked)
                                            }
                                        />
                                        <Label htmlFor="is_featured">
                                            Featured
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_approved"
                                            checked={data.is_approved}
                                            onCheckedChange={(checked) =>
                                                setData('is_approved', checked)
                                            }
                                        />
                                        <Label htmlFor="is_approved">
                                            Approved
                                        </Label>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t px-6 py-4">
                                    <Button
                                        type="submit"
                                        className="ml-auto"
                                        disabled={processing}
                                    >
                                        Update Course
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
