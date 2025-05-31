import { Badge } from '@/Components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Users } from 'lucide-react';

export default function CourseStudents({ course }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                    Students who have enrolled in your course
                </CardDescription>
            </CardHeader>
            <CardContent>
                {course.enrollments && course.enrollments.length > 0 ? (
                    <div className="space-y-4">
                        {course.enrollments.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">
                                            {enrollment.user.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Enrolled on{' '}
                                            {new Date(
                                                enrollment.created_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Badge>{enrollment.progress}% Complete</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-medium">
                            No students yet
                        </h3>
                        <p className="text-center text-muted-foreground">
                            No students have enrolled in this course yet.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
