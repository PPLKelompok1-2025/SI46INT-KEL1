import { Badge } from '@/Components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';

export default function CourseInformation({ course }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                    Basic information about your course
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Category
                        </h3>
                        <p>{course.category?.name || 'Uncategorized'}</p>
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Level
                        </h3>
                        <p className="capitalize">{course.level}</p>
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Language
                        </h3>
                        <p>{course.language}</p>
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Status
                        </h3>
                        <Badge
                            variant={
                                course.is_published ? 'success' : 'secondary'
                            }
                        >
                            {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                    </div>
                </div>

                <div>
                    <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                        Description
                    </h3>
                    <p className="text-sm">{course.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Price
                        </h3>
                        <p>
                            ${course.price}
                            {course.discount_price && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                    (Discounted: ${course.discount_price})
                                </span>
                            )}
                        </p>
                    </div>
                    <div>
                        <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                            Created At
                        </h3>
                        <p>
                            {new Date(course.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
