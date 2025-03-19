import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

export default function Edit({ category, parentCategories }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: category.name || '',
        description: category.description || '',
        parent_id: category.parent_id ? category.parent_id.toString() : '',
        icon: category.icon || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.categories.update', category.id));
    };

    // Filter out the current category and its descendants from parent options
    // to prevent circular references
    const getValidParentOptions = () => {
        const excludedIds = [category.id];

        // Recursively collect all descendant IDs
        const collectDescendantIds = (parentId) => {
            parentCategories.forEach((cat) => {
                if (cat.parent_id === parentId) {
                    excludedIds.push(cat.id);
                    collectDescendantIds(cat.id);
                }
            });
        };

        collectDescendantIds(category.id);

        return parentCategories.filter((cat) => !excludedIds.includes(cat.id));
    };

    const validParentOptions = getValidParentOptions();

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Category: ${category.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild className="gap-1">
                        <a href={route('admin.categories.index')}>
                            <ChevronLeft className="h-4 w-4" />
                            Back to Categories
                        </a>
                    </Button>
                    <h1 className="text-3xl font-bold">Edit Category</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>
                            Update information for "{category.name}"
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="icon">
                                        Icon (optional)
                                    </Label>
                                    <Input
                                        id="icon"
                                        value={data.icon}
                                        onChange={(e) =>
                                            setData('icon', e.target.value)
                                        }
                                        placeholder="CSS class or emoji icon"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        You can use an emoji or FontAwesome
                                        class
                                    </p>
                                    {errors.icon && (
                                        <p className="text-sm text-red-500">
                                            {errors.icon}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parent_id">
                                    Parent Category (optional)
                                </Label>
                                <Select
                                    value={data.parent_id}
                                    onValueChange={(value) =>
                                        setData('parent_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a parent category (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None
                                        </SelectItem>
                                        {validParentOptions.map(
                                            (parentCategory) => (
                                                <SelectItem
                                                    key={parentCategory.id}
                                                    value={parentCategory.id.toString()}
                                                >
                                                    {parentCategory.name}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.parent_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.parent_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description (optional)
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Brief description of this category"
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    Update Category
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
