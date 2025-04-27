import ListItemField from '@/Components/Instructor/Courses/ListItemField';
import ThumbnailUpload from '@/Components/Instructor/Courses/ThumbnailUpload';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function Edit({ course, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        title: course.title || '',
        slug: course.slug || '',
        short_description: course.short_description || '',
        description: course.description || '',
        category_id: course.category_id ? course.category_id.toString() : '',
        level: course.level || 'beginner',
        language: course.language || 'English',
        price: course.price || 0,
        thumbnail: null,
        promotional_video: course.promotional_video || '',
        is_published: course.is_published || false,
        is_featured: course.is_featured || false,
        is_approved: course.is_approved || false,
        requirements: course.requirements || [''],
        what_you_will_learn: course.what_you_will_learn || [''],
        who_is_this_course_for: course.who_is_this_course_for || [''],
    });

    const [activeTab, setActiveTab] = useState('basic');

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('instructor.courses.update', course.id), {
            onSuccess: () => {
                // Redirect is handled by the controller
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Course" />

            <div className="space-y-6">
                <div className="mb-6 flex items-center">
                    <Button variant="ghost" asChild className="mr-4">
                        <Link
                            href={route('instructor.courses.show', course.id)}
                            prefetch="hover"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to
                            Course
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">
                        Edit Course: {course.title}
                    </h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-4"
                    >
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">
                                Basic Information
                            </TabsTrigger>
                            <TabsTrigger value="details">
                                Course Details
                            </TabsTrigger>
                            <TabsTrigger value="media">Media</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Enter the basic information about your
                                        course
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">
                                            Course Title *
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) =>
                                                setData('title', e.target.value)
                                            }
                                            placeholder="Enter course title"
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">
                                            URL Slug (optional)
                                        </Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) =>
                                                setData('slug', e.target.value)
                                            }
                                            placeholder="course-url-slug"
                                        />
                                        {errors.slug && (
                                            <p className="text-sm text-destructive">
                                                {errors.slug}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Leave empty to generate
                                            automatically from title
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="short_description">
                                            Short Description (optional)
                                        </Label>
                                        <Input
                                            id="short_description"
                                            value={data.short_description}
                                            onChange={(e) =>
                                                setData(
                                                    'short_description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="A brief description for your course"
                                        />
                                        {errors.short_description && (
                                            <p className="text-sm text-destructive">
                                                {errors.short_description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category_id">
                                            Category *
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
                                            <p className="text-sm text-destructive">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">
                                            Course Description *
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Describe your course in detail"
                                            rows={6}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-destructive">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('details')}
                                    >
                                        Next: Course Details
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Details</CardTitle>
                                    <CardDescription>
                                        Provide additional details about your
                                        course
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="level">
                                                Level *
                                            </Label>
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
                                                <p className="text-sm text-destructive">
                                                    {errors.level}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="language">
                                                Language *
                                            </Label>
                                            <Input
                                                id="language"
                                                value={data.language}
                                                onChange={(e) =>
                                                    setData(
                                                        'language',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Course language"
                                            />
                                            {errors.language && (
                                                <p className="text-sm text-destructive">
                                                    {errors.language}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <ListItemField
                                        label="Requirements"
                                        items={data.requirements}
                                        onChange={(items) =>
                                            setData('requirements', items)
                                        }
                                        placeholder="What should students know before starting?"
                                        addButtonText="Add Requirement"
                                    />

                                    <ListItemField
                                        label="Learning Outcomes"
                                        items={data.what_you_will_learn}
                                        onChange={(items) =>
                                            setData(
                                                'what_you_will_learn',
                                                items,
                                            )
                                        }
                                        placeholder="What will students learn?"
                                        addButtonText="Add Outcome"
                                    />

                                    <ListItemField
                                        label="Target Audience"
                                        items={data.who_is_this_course_for}
                                        onChange={(items) =>
                                            setData(
                                                'who_is_this_course_for',
                                                items,
                                            )
                                        }
                                        placeholder="Who is this course for?"
                                        addButtonText="Add Target Audience"
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('basic')}
                                    >
                                        Previous: Basic Information
                                    </Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('media')}
                                    >
                                        Next: Media
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="media">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Media</CardTitle>
                                    <CardDescription>
                                        Upload thumbnail and preview video for
                                        your course
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <ThumbnailUpload
                                        value={data.thumbnail}
                                        onChange={(file) =>
                                            setData('thumbnail', file)
                                        }
                                        error={errors.thumbnail}
                                    />

                                    <div className="space-y-2">
                                        <Label htmlFor="promotional_video">
                                            Preview Video URL (optional)
                                        </Label>
                                        <Input
                                            id="promotional_video"
                                            value={data.promotional_video}
                                            onChange={(e) =>
                                                setData(
                                                    'promotional_video',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="YouTube or Vimeo URL"
                                        />
                                        {errors.promotional_video && (
                                            <p className="text-sm text-destructive">
                                                {errors.promotional_video}
                                            </p>
                                        )}
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Enter a YouTube or Vimeo URL for
                                            your course preview video
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('details')}
                                    >
                                        Previous: Course Details
                                    </Button>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('pricing')}
                                    >
                                        Next: Pricing
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pricing">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Pricing</CardTitle>
                                    <CardDescription>
                                        Set the price for your course
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">
                                                Regular Price (IDR) *
                                            </Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(e) =>
                                                    setData(
                                                        'price',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="29.99"
                                            />
                                            {errors.price && (
                                                <p className="text-sm text-destructive">
                                                    {errors.price}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_published"
                                            checked={data.is_published}
                                            onCheckedChange={(checked) =>
                                                setData('is_published', checked)
                                            }
                                        />
                                        <Label htmlFor="is_published">
                                            Publish course immediately
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        If unchecked, your course will be saved
                                        as a draft
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        onClick={() => setActiveTab('media')}
                                    >
                                        Previous: Media
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Editing...'
                                            : 'Edit Course'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
