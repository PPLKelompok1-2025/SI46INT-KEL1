import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Input } from '@/Components/ui/input';
import { useClickAway } from '@/hooks/useClickAway';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function SearchComponent({ trigger }) {
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    useClickAway(searchRef, () => {
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    });

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (searchQuery.trim().length > 1) {
            setIsSearching(true);
            searchTimeout.current = setTimeout(() => {
                fetchSearchResults(searchQuery);
            }, 300);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchQuery]);

    const fetchSearchResults = async (query) => {
        try {
            setIsSearching(true);
            const response = await axios.get(route('quick-search'), {
                params: { query },
            });

            const { courses, categories, instructors } = response.data;

            const allResults = [...courses, ...categories, ...instructors];

            setSearchResults(allResults);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchButtonClick = () => {
        setShowSearch(!showSearch);
        if (!showSearch) {
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.focus();
            }, 100);
        }
    };

    const navigateToResult = (url) => {
        router.visit(url);
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const renderSearchResult = (result) => {
        switch (result.type) {
            case 'course':
                return (
                    <div
                        key={`course-${result.id}`}
                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => navigateToResult(result.url)}
                    >
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                            {result.thumbnail && (
                                <img
                                    src={result.thumbnail}
                                    alt={result.title}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-gray-900 dark:text-white">
                                {result.title}
                            </p>
                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                By {result.instructor}
                            </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            Course
                        </span>
                    </div>
                );

            case 'category':
                return (
                    <div
                        key={`category-${result.id}`}
                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => navigateToResult(result.url)}
                    >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-gray-900 dark:text-white">
                                {result.title}
                            </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            Category
                        </span>
                    </div>
                );

            case 'instructor':
                return (
                    <div
                        key={`instructor-${result.id}`}
                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => navigateToResult(result.url)}
                    >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage
                                src={result.avatar}
                                alt={result.title}
                            />
                            <AvatarFallback>
                                {result.title
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-gray-900 dark:text-white">
                                {result.title}
                            </p>
                            {result.subtitle && (
                                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                    {result.subtitle}
                                </p>
                            )}
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            Instructor
                        </span>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="relative" ref={searchRef}>
            <div onClick={handleSearchButtonClick}>{trigger}</div>

            {showSearch && (
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-900">
                    <div className="border-b p-3 dark:border-gray-700">
                        <div className="relative">
                            <Input
                                id="search-input"
                                type="text"
                                placeholder="Search courses, categories..."
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </div>

                    {searchResults.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto p-2">
                            {searchResults.map((result) =>
                                renderSearchResult(result),
                            )}
                        </div>
                    ) : searchQuery.trim().length > 1 && !isSearching ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No results found
                        </div>
                    ) : searchQuery.trim().length > 1 && isSearching ? (
                        <div className="flex items-center justify-center p-4 text-center text-gray-500 dark:text-gray-400">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
