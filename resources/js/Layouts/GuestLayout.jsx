import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, title, description }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b bg-background py-4">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <span className="text-xl font-bold">Coursepedia</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('login')}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Log in
                        </Link>
                        <Button asChild size="sm">
                            <Link href={route('register')}>Sign up</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-lg">
                    {(title || description) && (
                        <CardHeader>
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && (
                                <CardDescription>{description}</CardDescription>
                            )}
                        </CardHeader>
                    )}
                    <CardContent className="pt-6">{children}</CardContent>
                </Card>
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
