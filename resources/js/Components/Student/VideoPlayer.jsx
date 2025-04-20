import { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({ lesson, autoPlay = false }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const hlsRef = useRef(null);

    useEffect(() => {
        // Clean up on unmount
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (!lesson?.video_path || !videoRef.current) return;

        setIsLoading(true);
        setError(null);

        // Check if HLS.js is already loaded
        const initializePlayer = () => {
            const videoElement = videoRef.current;
            if (!videoElement) return;

            const streamUrl =
                route('student.lessons.videos.stream', lesson.id) +
                '?playlist=true';

            if (window.Hls.isSupported()) {
                const hls = new window.Hls({
                    xhrSetup: function (xhr) {
                        // Add CSRF token to prevent unauthorized access
                        xhr.setRequestHeader(
                            'X-CSRF-TOKEN',
                            document.querySelector('meta[name="csrf-token"]')
                                .content,
                        );
                    },
                });

                hlsRef.current = hls;

                hls.loadSource(streamUrl);
                hls.attachMedia(videoElement);

                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                    if (autoPlay) {
                        videoElement
                            .play()
                            .then(() => setIsPlaying(true))
                            .catch((err) =>
                                console.error('Error autoplay:', err),
                            );
                    }
                });

                hls.on(window.Hls.Events.ERROR, (event, data) => {
                    console.error('HLS error:', data);
                    if (data.fatal) {
                        setIsLoading(false);

                        switch (data.type) {
                            case window.Hls.ErrorTypes.NETWORK_ERROR:
                                console.error('Network error');
                                setError(
                                    'Network error. Please check your connection and try again.',
                                );
                                hls.startLoad();
                                break;
                            case window.Hls.ErrorTypes.MEDIA_ERROR:
                                console.error('Media error');
                                setError('Media error. Trying to recover...');
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error('Unrecoverable error');
                                setError(
                                    'Error playing video. Please try again later.',
                                );
                                hls.destroy();
                                break;
                        }
                    }
                });
            } else if (
                videoElement.canPlayType('application/vnd.apple.mpegurl')
            ) {
                // Native HLS support (Safari)
                videoElement.src = streamUrl;
                videoElement.addEventListener('loadedmetadata', () => {
                    setIsLoading(false);
                    if (autoPlay) {
                        videoElement
                            .play()
                            .then(() => setIsPlaying(true))
                            .catch((err) =>
                                console.error('Error autoplay:', err),
                            );
                    }
                });

                videoElement.addEventListener('error', () => {
                    setIsLoading(false);
                    setError('Error playing video. Please try again later.');
                });
            } else {
                setIsLoading(false);
                setError('Your browser does not support HLS video playback.');
            }
        };

        if (!window.Hls) {
            // Load HLS.js script
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.async = true;
            script.onload = initializePlayer;
            document.body.appendChild(script);
        } else {
            initializePlayer();
        }
    }, [lesson?.video_path, autoPlay]);

    const handlePlay = () => {
        setIsPlaying(true);
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    if (!lesson?.video_path) {
        return (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                <p className="text-center text-muted-foreground">
                    No video available
                </p>
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                    <div className="text-center text-white">
                        <p className="mb-2 text-sm text-red-400">Error</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            <video
                ref={videoRef}
                className="h-full w-full"
                controls
                playsInline
                onPlay={handlePlay}
                onPause={handlePause}
            ></video>
        </div>
    );
}
