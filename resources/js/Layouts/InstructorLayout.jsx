import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    DollarSign,
    FileText,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    PlusCircle,
    Settings,
    X,
} from 'lucide-react';
import React from 'react';

export default function InstructorLayout({ children, auth }) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const navigation = [
        {
            name: 'Dashboard',
            href: '/instructor/dashboard',
            icon: LayoutDashboard,
        },
        { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
        { name: 'Lessons', href: '/instructor/lessons', icon: FileText },
        { name: 'Students', href: '/instructor/students', icon: GraduationCap },
        { name: 'Earnings', href: '/instructor/earnings', icon: DollarSign },
        { name: 'Settings', href: '/instructor/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar */}
            <div
                className={cn(
                    'fixed inset-0 z-50 bg-background lg:hidden',
                    sidebarOpen ? 'block' : 'hidden',
                )}
            >
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />

                <div className="fixed inset-y-0 left-0 w-64 border-r bg-background">
                    <div className="flex h-16 items-center justify-between border-b px-4">
                        <Link
                            href="/"
                            className="text-xl font-bold text-primary"
                        >
                            Coursepedia
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <nav className="space-y-1 p-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                                    window.location.pathname === item.href
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted',
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-grow flex-col border-r bg-background">
                    <div className="flex h-16 items-center border-b px-4">
                        <Link
                            href="/"
                            className="text-xl font-bold text-primary"
                        >
                            Coursepedia
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-1 p-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                                    window.location.pathname === item.href
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted',
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                <div className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4 lg:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="ml-auto flex items-center space-x-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/instructor/courses/create">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create Course
                            </Link>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-8 w-8 rounded-full"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={auth.user.profile_photo_path}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback>
                                            {auth.user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                                forceMount
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {auth.user.name}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {auth.user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/instructor/settings">
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full text-left"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log Out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <main className="p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
