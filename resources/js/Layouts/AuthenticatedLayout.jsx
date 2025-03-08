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
import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    BarChart2,
    BookOpen,
    CreditCard,
    DollarSign,
    FileText,
    GraduationCap,
    Heart,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    Settings,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Define navigation links based on user role
    const getNavigationLinks = () => {
        const role = user.role;

        if (role === 'admin') {
            return [
                {
                    name: 'Dashboard',
                    href: '/admin/dashboard',
                    icon: LayoutDashboard,
                },
                { name: 'Users', href: '/admin/users', icon: Users },
                { name: 'Courses', href: '/admin/courses', icon: BookOpen },
                {
                    name: 'Transactions',
                    href: '/admin/transactions',
                    icon: CreditCard,
                },
                {
                    name: 'Analytics',
                    href: '/admin/analytics',
                    icon: BarChart2,
                },
                { name: 'Settings', href: '/admin/settings', icon: Settings },
            ];
        } else if (role === 'instructor') {
            return [
                {
                    name: 'Dashboard',
                    href: '/instructor/dashboard',
                    icon: LayoutDashboard,
                },
                {
                    name: 'My Courses',
                    href: '/instructor/courses',
                    icon: BookOpen,
                },
                {
                    name: 'Lessons',
                    href: '/instructor/lessons',
                    icon: FileText,
                },
                {
                    name: 'Students',
                    href: '/instructor/students',
                    icon: GraduationCap,
                },
                {
                    name: 'Earnings',
                    href: '/instructor/earnings',
                    icon: DollarSign,
                },
                {
                    name: 'Settings',
                    href: '/instructor/settings',
                    icon: Settings,
                },
            ];
        } else if (role === 'student') {
            return [
                {
                    name: 'Dashboard',
                    href: '/student/dashboard',
                    icon: LayoutDashboard,
                },
                {
                    name: 'My Learning',
                    href: '/student/courses',
                    icon: BookOpen,
                },
                { name: 'Wishlist', href: '/student/wishlist', icon: Heart },
                {
                    name: 'Certificates',
                    href: '/student/certificates',
                    icon: Award,
                },
                { name: 'Notes', href: '/student/notes', icon: FileText },
                { name: 'Settings', href: '/student/settings', icon: Settings },
            ];
        } else {
            // Default navigation for other roles or unauthenticated users
            return [
                {
                    name: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutDashboard,
                },
                { name: 'Courses', href: '/courses', icon: BookOpen },
            ];
        }
    };

    const navigation = getNavigationLinks();

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar */}
            <div
                className={cn(
                    'fixed inset-0 z-50 bg-background lg:hidden',
                    sidebarOpen ? 'block' : 'hidden',
                )}
            >
                <div className="flex h-full flex-col overflow-y-auto py-6 shadow-lg">
                    <div className="px-4">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold">
                                Coursepedia
                            </span>
                        </Link>
                    </div>
                    <div className="mt-6 flex-1 px-4">
                        <nav className="grid items-start gap-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                                        window.location.pathname === item.href
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-6 px-4">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <LogOut className="h-5 w-5" />
                            Log Out
                        </Link>
                    </div>
                    <Button
                        variant="ghost"
                        className="absolute right-4 top-4 h-8 w-8 p-0"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden border-r lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
                <div className="flex h-full flex-col overflow-y-auto py-6">
                    <div className="px-6">
                        <Link href="/" className="flex items-center">
                            <span className="text-xl font-bold">
                                Coursepedia
                            </span>
                        </Link>
                    </div>
                    <div className="mt-10 flex-1 px-6">
                        <nav className="grid items-start gap-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                                        window.location.pathname === item.href
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-6 px-6">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <LogOut className="h-5 w-5" />
                            Log Out
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-60">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-4">
                        <Link
                            href="/search"
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                            <Search className="h-4 w-4" />
                            <span className="hidden md:inline-block">
                                Search
                            </span>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-8 w-8 rounded-full"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={
                                                user.profile_photo_path
                                                    ? `/storage/${user.profile_photo_path}`
                                                    : null
                                            }
                                            alt={user.name}
                                        />
                                        <AvatarFallback>
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                    My Account
                                </DropdownMenuLabel>
                                <DropdownMenuItem disabled>
                                    {user.name}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={route('profile.edit')}>
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="w-full text-left"
                                    >
                                        Log Out
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Main content */}
                <main className="min-h-[calc(100vh-4rem)] p-6">{children}</main>
            </div>

            {/* Toast notifications */}
            <Toaster position="top-right" />
        </div>
    );
}
