import { Button } from '@/Components/ui/button';
import { Link, usePage } from '@inertiajs/react';

export default function PublicLayout({ children, title }) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b bg-background py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <span className="text-xl font-bold">Coursepedia</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <Button asChild>
                                <Link
                                    href={route('logout')}
                                    prefetch="hover"
                                    method="post"
                                >
                                    Log out
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                    prefetch="hover"
                                >
                                    Log in
                                </Link>
                                <Button asChild>
                                    <Link
                                        href={route('register')}
                                        prefetch="hover"
                                    >
                                        Sign up
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 py-8">
                <div className="container mx-auto">
                    {title && (
                        <h1 className="mb-8 text-3xl font-bold">{title}</h1>
                    )}
                    {children}
                </div>
            </main>

            <footer className="border-t bg-background py-6">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} Coursepedia. All rights
                        reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
