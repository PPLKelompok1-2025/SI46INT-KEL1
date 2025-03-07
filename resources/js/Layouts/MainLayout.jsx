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
import { Input } from '@/Components/ui/input';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/Components/ui/navigation-menu';
import { Link } from '@inertiajs/react';
import { Search } from 'lucide-react';

export default function MainLayout({ children, auth }) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-2xl font-bold text-primary"
                        >
                            Coursepedia
                        </Link>

                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>
                                        Categories
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                            {/* This would be populated dynamically */}
                                            <li className="row-span-3">
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href="/categories"
                                                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                                    >
                                                        <div className="mb-2 mt-4 text-lg font-medium">
                                                            All Categories
                                                        </div>
                                                        <p className="text-sm leading-tight text-muted-foreground">
                                                            Browse all course
                                                            categories
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                            <li>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href="/categories/web-development"
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                    >
                                                        <div className="text-sm font-medium leading-none">
                                                            Web Development
                                                        </div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            Learn to build
                                                            websites and web
                                                            applications
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                            <li>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href="/categories/data-science"
                                                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                    >
                                                        <div className="text-sm font-medium leading-none">
                                                            Data Science
                                                        </div>
                                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                            Master data analysis
                                                            and machine learning
                                                        </p>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <Link
                                        href="/courses"
                                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                                    >
                                        Courses
                                    </Link>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="flex items-center space-x-4">
                        <form
                            action="/search"
                            method="GET"
                            className="relative"
                        >
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="query"
                                placeholder="Search courses..."
                                className="w-[200px] pl-8 lg:w-[300px]"
                            />
                        </form>

                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={
                                                    auth.user.profile_photo_path
                                                }
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

                                    {auth.user.role === 'admin' && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin/dashboard">
                                                    Admin Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}

                                    {auth.user.role === 'instructor' && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/instructor/dashboard">
                                                    Instructor Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/instructor/courses">
                                                    My Courses
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/instructor/earnings">
                                                    Earnings
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}

                                    {auth.user.role === 'student' && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/student/dashboard">
                                                    My Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/student/courses">
                                                    My Learning
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/student/certificates">
                                                    Certificates
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}

                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="w-full text-left"
                                        >
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/register">Sign up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">{children}</main>

            <footer className="mt-12 bg-muted py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">
                                Coursepedia
                            </h3>
                            <p className="text-muted-foreground">
                                Learn from the best instructors and expand your
                                knowledge with our comprehensive courses.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">
                                Categories
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/categories/web-development"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Web Development
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/categories/data-science"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Data Science
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/categories/mobile-development"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Mobile Development
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/categories/design"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Design
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">
                                Company
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/about"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Contact
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/careers"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/blog"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Blog
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">
                                Legal
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/terms"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/cookie-policy"
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Cookie Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
                        <p>
                            &copy; {new Date().getFullYear()} Coursepedia. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
