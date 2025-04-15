import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Link } from '@inertiajs/react';
import { PlayCircle } from 'lucide-react';

export default function WelcomeCard({
    userName,
    inProgressCount,
    inProgressCourses = [],
}) {
    const hasInProgressCourses =
        inProgressCourses?.length > 0 ||
        (inProgressCount && inProgressCount > 0);
    const progressCount = inProgressCourses?.length || inProgressCount || 0;

    return (
        <Card className="bg-gradient-to-r from-primary/20 to-primary/5">
            <CardContent className="p-6">
                <h2 className="mb-2 text-2xl font-semibold">
                    Welcome back, {userName}!
                </h2>
                <p className="mb-4 text-muted-foreground">
                    {hasInProgressCourses
                        ? `You have ${progressCount} course${progressCount > 1 ? 's' : ''} in progress. Keep learning!`
                        : 'Ready to start learning? Browse our courses and begin your journey!'}
                </p>

                {inProgressCourses && inProgressCourses.length > 0 && (
                    <Button variant="outline" asChild>
                        <Link
                            href={`/courses/${inProgressCourses[0].id}/learn`}
                        >
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Continue Learning
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
