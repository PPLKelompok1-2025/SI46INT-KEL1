<?php

namespace App\Providers;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Share Midtrans configuration with frontend
        Inertia::share('config', function () {
            return [
                'midtransClientKey' => Config::get('services.midtrans.client_key'),
                'midtransServerKey' => Config::get('services.midtrans.server_key'),
                'midtransSnapUrl' => Config::get('services.midtrans.snap_url'),
                'isProduction' => Config::get('services.midtrans.is_production', false),
            ];
        });
    }
}
