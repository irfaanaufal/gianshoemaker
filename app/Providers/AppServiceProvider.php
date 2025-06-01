<?php

namespace App\Providers;

use App\Http\Services\MidtransService;
use App\Models\Menu;
use App\Models\UserAddress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Mendaftarkan MidtransService ke dalam container
        $this->app->singleton(MidtransService::class, function ($app) {
            return new MidtransService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('menus', function () {
            $user = Auth::user();
            if (!$user) return [];
            $roleId = $user->roles->pluck('id');
            return Menu::whereHas('roles', function ($query) use ($roleId) {
                $query->whereIn('roles.id', $roleId);
            })->get();
        });

        Inertia::share('user_address', function() {
            $user = Auth::user();
            if (!$user) return [];
            return UserAddress::where('user_id', $user->id)->get(); // Misalkan user_address memiliki kolom 'user_id'
        });
    }
}
