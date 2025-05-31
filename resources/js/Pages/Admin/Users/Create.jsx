import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
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
import { ArrowLeft } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'student',
        bio: '',
        headline: '',
        website: '',
        twitter: '',
        linkedin: '',
        youtube: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create User" />

            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="icon">
                        <Link href={route('admin.users.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold">Create New User</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new user account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                {/* Basic Information */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="name"
                                            className="text-sm font-medium"
                                        >
                                            Name *
                                        </label>
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
                                        <label
                                            htmlFor="email"
                                            className="text-sm font-medium"
                                        >
                                            Email *
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="password"
                                            className="text-sm font-medium"
                                        >
                                            Password *
                                        </label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.password && (
                                            <p className="text-sm text-red-500">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="role"
                                            className="text-sm font-medium"
                                        >
                                            Role *
                                        </label>
                                        <Select
                                            value={data.role}
                                            onValueChange={(value) =>
                                                setData('role', value)
                                            }
                                            required
                                        >
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">
                                                    Admin
                                                </SelectItem>
                                                <SelectItem value="instructor">
                                                    Instructor
                                                </SelectItem>
                                                <SelectItem value="student">
                                                    Student
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.role && (
                                            <p className="text-sm text-red-500">
                                                {errors.role}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Profile Information */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="headline"
                                        className="text-sm font-medium"
                                    >
                                        Headline
                                    </label>
                                    <Input
                                        id="headline"
                                        value={data.headline}
                                        onChange={(e) =>
                                            setData('headline', e.target.value)
                                        }
                                        placeholder="e.g., Senior Developer at Company"
                                    />
                                    {errors.headline && (
                                        <p className="text-sm text-red-500">
                                            {errors.headline}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="bio"
                                        className="text-sm font-medium"
                                    >
                                        Bio
                                    </label>
                                    <Textarea
                                        id="bio"
                                        value={data.bio}
                                        onChange={(e) =>
                                            setData('bio', e.target.value)
                                        }
                                        placeholder="Tell us about this user..."
                                        rows={4}
                                    />
                                    {errors.bio && (
                                        <p className="text-sm text-red-500">
                                            {errors.bio}
                                        </p>
                                    )}
                                </div>

                                {/* Social Links */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="website"
                                            className="text-sm font-medium"
                                        >
                                            Website
                                        </label>
                                        <Input
                                            id="website"
                                            type="url"
                                            value={data.website}
                                            onChange={(e) =>
                                                setData(
                                                    'website',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="https://example.com"
                                        />
                                        {errors.website && (
                                            <p className="text-sm text-red-500">
                                                {errors.website}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="twitter"
                                            className="text-sm font-medium"
                                        >
                                            Twitter Username
                                        </label>
                                        <Input
                                            id="twitter"
                                            value={data.twitter}
                                            onChange={(e) =>
                                                setData(
                                                    'twitter',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="username (without @)"
                                        />
                                        {errors.twitter && (
                                            <p className="text-sm text-red-500">
                                                {errors.twitter}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="linkedin"
                                            className="text-sm font-medium"
                                        >
                                            LinkedIn Username
                                        </label>
                                        <Input
                                            id="linkedin"
                                            value={data.linkedin}
                                            onChange={(e) =>
                                                setData(
                                                    'linkedin',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="username"
                                        />
                                        {errors.linkedin && (
                                            <p className="text-sm text-red-500">
                                                {errors.linkedin}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="youtube"
                                            className="text-sm font-medium"
                                        >
                                            YouTube Channel ID
                                        </label>
                                        <Input
                                            id="youtube"
                                            value={data.youtube}
                                            onChange={(e) =>
                                                setData(
                                                    'youtube',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="channel-id"
                                        />
                                        {errors.youtube && (
                                            <p className="text-sm text-red-500">
                                                {errors.youtube}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create User
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
