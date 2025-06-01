import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_instructor: false,
    });

    const [validationErrors, setValidationErrors] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Validate form fields on change
    useEffect(() => {
        validateForm();
    }, [data.name, data.email, data.password, data.password_confirmation]);

    const validateForm = () => {
        const newErrors = {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        };

        // Name validation
        if (data.name && data.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (data.password && data.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        // Password confirmation validation
        if (
            data.password_confirmation &&
            data.password !== data.password_confirmation
        ) {
            newErrors.password_confirmation =
                'The password confirmation does not match';
        }

        setValidationErrors(newErrors);
    };

    const submit = (e) => {
        e.preventDefault();

        // Check if there are any validation errors
        const hasErrors = Object.values(validationErrors).some(
            (error) => error !== '',
        );
        if (hasErrors) {
            return;
        }

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <PublicLayout>
            <Head title="Register" />

            <div className="container mx-auto max-w-md py-12">
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            Create an account
                        </CardTitle>
                        <CardDescription>
                            Enter your information to get started
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            errors.name || validationErrors.name
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full"
                                        autoComplete="username"
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            errors.email ||
                                            validationErrors.email
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            errors.password ||
                                            validationErrors.password
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={
                                            errors.password_confirmation ||
                                            validationErrors.password_confirmation
                                        }
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Label
                                        htmlFor="is_instructor"
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <Switch
                                            id="is_instructor"
                                            checked={data.is_instructor}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_instructor',
                                                    checked,
                                                )
                                            }
                                        />
                                        <span>Register as an instructor</span>
                                    </Label>
                                    <InputError
                                        message={errors.is_instructor}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button
                                    className="w-full justify-center"
                                    disabled={
                                        processing ||
                                        Object.values(validationErrors).some(
                                            (error) => error !== '',
                                        )
                                    }
                                >
                                    Register
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t p-4">
                        <div className="text-center text-sm">
                            Already have an account?{' '}
                            <Link
                                href={route('login')}
                                className="font-medium text-primary hover:underline"
                            >
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </PublicLayout>
    );
}
