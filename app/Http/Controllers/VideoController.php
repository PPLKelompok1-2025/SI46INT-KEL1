<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use ProtoneMedia\LaravelFFMpeg\Support\FFMpeg;

class VideoController extends Controller
{
    /**
     * Serve the dynamic HLS playlist
     *
     * @param string $playlist
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function servePlaylist($playlist)
    {
        return FFMpeg::dynamicHLSPlaylist()
            ->fromDisk('encrypted_videos')
            ->open($playlist)
            ->setKeyUrlResolver(function ($key) {
                return route('video.key', ['key' => $key]);
            })
            ->setPlaylistUrlResolver(function ($playlist) {
                return route('video.playlist', ['playlist' => $playlist]);
            })
            ->setMediaUrlResolver(function ($media) {
                $path = "encrypted_videos/{$media}";
                return asset("storage/{$path}");
            });
    }

    /**
     * Serve the encryption key
     *
     * @param string $key
     * @return \Illuminate\Http\Response
     */
    public function serveKey($key)
    {
        $path = Storage::disk('private')->path("keys/{$key}");

        if (!file_exists($path)) {
            return response()->json(['error' => 'Key not found'], 404);
        }

        $contents = file_get_contents($path);
        return Response::make($contents, 200, [
            'Content-Type' => 'application/octet-stream'
        ]);
    }
}
