import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Plus, Trash } from 'lucide-react';

export default function ListItemField({
    label,
    items,
    onChange,
    placeholder,
    addButtonText = 'Add Item',
}) {
    const addItem = () => {
        onChange([...items, '']);
    };

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const updateItem = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <Input
                        value={item}
                        onChange={(e) => updateItem(index, e.target.value)}
                        placeholder={placeholder}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="mt-2"
            >
                <Plus className="mr-2 h-4 w-4" /> {addButtonText}
            </Button>
        </div>
    );
}
