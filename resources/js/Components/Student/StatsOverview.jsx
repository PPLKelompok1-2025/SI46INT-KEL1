import { Card, CardContent } from '@/Components/ui/card';
import { Award, BookOpen, Clock } from 'lucide-react';

export default function StatsOverview({ enrolledCourses, certificates }) {
    const totalHoursLearned = enrolledCourses
        .reduce(
            (total, course) => total + (course.progress?.hours_spent || 0),
            0,
        )
        .toFixed(1);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Enrolled Courses
                        </p>
                        <h3 className="text-2xl font-bold">
                            {enrolledCourses.length}
                        </h3>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Hours Learned
                        </p>
                        <h3 className="text-2xl font-bold">
                            {totalHoursLearned}
                        </h3>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Certificates Earned
                        </p>
                        <h3 className="text-2xl font-bold">
                            {certificates.length}
                        </h3>
                    </div>
                    <Award className="h-8 w-8 text-primary" />
                </CardContent>
            </Card>
        </div>
    );
}
