import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';

export default function LessonBasicForm({ data, setData, errors }) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Lesson Title *</Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Enter lesson title"
                />
                {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="slug">URL Slug (optional)</Label>
                <Input
                    id="slug"
                    value={data.slug}
                    onChange={(e) => setData('slug', e.target.value)}
                    placeholder="lesson-url-slug"
                />
                {errors.slug && (
                    <p className="text-sm text-destructive">{errors.slug}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    Leave empty to generate automatically from title
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="section">Section (optional)</Label>
                <Input
                    id="section"
                    value={data.section}
                    onChange={(e) => setData('section', e.target.value)}
                    placeholder="e.g. Introduction, Advanced Topics"
                />
                {errors.section && (
                    <p className="text-sm text-destructive">{errors.section}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">
                    Lesson Description (optional)
                </Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Briefly describe what this lesson covers"
                    rows={3}
                />
                {errors.description && (
                    <p className="text-sm text-destructive">
                        {errors.description}
                    </p>
                )}
            </div>
        </div>
    );
}
