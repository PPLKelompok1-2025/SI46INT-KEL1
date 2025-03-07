import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Link } from '@inertiajs/react';
import { Award, BookOpen, CheckCircle, Heart } from 'lucide-react';

export default function EmptyState({
    icon,
    title,
    description,
    buttonText,
    buttonLink,
}) {
    const IconComponent = () => {
        switch (icon) {
            case 'CheckCircle':
                return <CheckCircle className="h-6 w-6 text-primary" />;
            case 'Award':
                return <Award className="h-6 w-6 text-primary" />;
            case 'Heart':
                return <Heart className="h-6 w-6 text-primary" />;
            case 'BookOpen':
                return <BookOpen className="h-6 w-6 text-primary" />;
            default:
                return <BookOpen className="h-6 w-6 text-primary" />;
        }
    };

    return (
        <Card>
            <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <IconComponent />
                </div>
                <h3 className="mb-2 text-lg font-medium">{title}</h3>
                <p className="mb-4 text-muted-foreground">{description}</p>
                <Button asChild>
                    <Link href={buttonLink}>{buttonText}</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
