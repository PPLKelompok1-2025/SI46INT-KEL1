import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const [photoPreview, setPhotoPreview] = useState(null);
    const photoInput = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        photo: null,
    });

    const selectNewPhoto = () => {
        photoInput.current.click();
    };

    const updatePhotoPreview = () => {
        const photo = photoInput.current.files[0];

        if (!photo) {
            return;
        }

        setData('photo', photo);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPhotoPreview(e.target.result);
        };

        reader.readAsDataURL(photo);
    };

    const uploadPhoto = () => {
        if (!data.photo) {
            return;
        }

        const formData = new FormData();
        formData.append('photo', data.photo);

        post(route('profile.photo'), {
            preserveScroll: true,
            onSuccess: () => {
                reset('photo');
                setPhotoPreview(null);
                toast.success('Profile photo updated successfully');
            },
            onError: () => {
                toast.error('Failed to update profile photo');
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <div className="max-w-xl">
                            <section className="space-y-6">
                                <header>
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Profile Photo
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Update your profile photo.
                                    </p>
                                </header>

                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage
                                                src={
                                                    photoPreview ??
                                                    'storage/' +
                                                        auth.user
                                                            .profile_photo_path
                                                }
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback>
                                                {auth.user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={photoInput}
                                            onChange={updatePhotoPreview}
                                            accept="image/*"
                                        />

                                        <div className="flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={selectNewPhoto}
                                            >
                                                Select New Photo
                                            </Button>

                                            {photoPreview && (
                                                <Button
                                                    type="button"
                                                    onClick={uploadPhoto}
                                                    disabled={processing}
                                                >
                                                    Save
                                                </Button>
                                            )}
                                        </div>

                                        {errors.photo && (
                                            <p className="text-sm text-red-600">
                                                {errors.photo}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">
                                Profile Information
                            </TabsTrigger>
                            <TabsTrigger value="password">
                                Update Password
                            </TabsTrigger>
                            <TabsTrigger value="delete">
                                Delete Account
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Update your account's profile
                                        information and email address.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="max-w-xl"
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Update Password</CardTitle>
                                    <CardDescription>
                                        Ensure your account is using a long,
                                        random password to stay secure.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <UpdatePasswordForm className="max-w-xl" />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="delete" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Delete Account</CardTitle>
                                    <CardDescription>
                                        Once your account is deleted, all of its
                                        resources and data will be permanently
                                        deleted.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeleteUserForm className="max-w-xl" />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
