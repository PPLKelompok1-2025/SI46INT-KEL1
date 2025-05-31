import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="block w-full pr-10"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                            }
                        >
                            {showCurrentPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            type={showPassword ? 'text' : 'password'}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={
                                showPasswordConfirmation ? 'text' : 'password'
                            }
                            className="block w-full pr-10"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() =>
                                setShowPasswordConfirmation(
                                    !showPasswordConfirmation,
                                )
                            }
                        >
                            {showPasswordConfirmation ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
