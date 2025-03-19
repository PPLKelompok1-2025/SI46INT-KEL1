import { Star } from 'lucide-react';

/**
 * Star Rating Component
 *
 * @param {Object} props
 * @param {number} props.rating - The rating value (e.g., 4.5)
 * @param {number} props.max - The maximum rating (default: 5)
 * @param {string} props.size - The size of the stars (default: 'md')
 * @param {string} props.color - The color of the filled stars (default: 'text-yellow-400')
 * @param {string} props.className - Additional class names
 */
export default function StarRating({
    rating,
    max = 5,
    size = 'md',
    color = 'text-yellow-400',
    className = '',
}) {
    // Validate rating and max
    const validRating = Math.max(0, Math.min(rating, max));

    // Determine star size
    const sizeClass =
        {
            sm: 'w-3 h-3',
            md: 'w-4 h-4',
            lg: 'w-5 h-5',
            xl: 'w-6 h-6',
        }[size] || 'w-4 h-4';

    return (
        <div className={`flex items-center ${className}`}>
            {[...Array(max)].map((_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= validRating;
                const isPartiallyFilled =
                    !isFilled &&
                    starValue <= Math.ceil(validRating) &&
                    validRating % 1 !== 0;

                // For simple implementation, we'll just use filled or unfilled stars
                return (
                    <Star
                        key={i}
                        className={`${sizeClass} ${isFilled ? color : 'text-gray-300'} ${isPartiallyFilled ? 'fill-current text-opacity-50' : ''}`}
                        fill={
                            isFilled || isPartiallyFilled
                                ? 'currentColor'
                                : 'none'
                        }
                    />
                );
            })}
        </div>
    );
}
