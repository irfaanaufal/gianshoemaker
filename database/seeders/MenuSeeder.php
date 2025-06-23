<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Role::where('name', 'admin')->first();
        $kurir = Role::where('name', 'kurir')->first();
        $pelanggan = Role::where('name', 'pelanggan')->first();

        $menus = [
            (object)[
                "name" => "Dashboard",
                "url" => "/dashboard",
                "route" => "dashboard.index",
                "icon" => "fa-solid fa-gauge-high",
                "is_active" => true
            ],
            (object)[
                "name" => "User",
                "url" => "/user/list",
                "route" => "user.index",
                "icon" => "fa-solid fa-users",
                "is_active" => true
            ],
            (object)[
                "name" => "Treatment",
                "url" => "/treatment/list",
                "route" => "treatment.index",
                "icon" => "fa-solid fa-box-open",
                "is_active" => true
            ],
            (object)[
                "name" => "Order",
                "url" => "/order/list",
                "route" => "order.index",
                "icon" => "fa-solid fa-cart-shopping",
                "is_active" => true
            ],
            (object)[
                "name" => "Tracking Order",
                "url" => "/tracking/list",
                "route" => "tracking.index",
                "icon" => "fa-solid fa-map-location",
                "is_active" => true
            ],
            (object)[
                "name" => "Menu",
                "url" => "/menu/list",
                "route" => "menu.index",
                "icon" => "fa-solid fa-table-list",
                "is_active" => true
            ],
        ];
        foreach ($menus as $key => $menu) {
            $m = Menu::create([
                'name' => $menu->name,
                'slug' => Str::slug($menu->name),
                'url' => $menu->url,
                'route' => $menu->route,
                'icon' => $menu->icon,
                'is_active' => $menu->is_active
            ]);
            $m->roles()->attach($admin->id);
            if ($m->name == "Dashboard" || $m->name == "Order") {
                $m->roles()->attach($pelanggan->id);
            }
            if ($m->name == "Dashboard" || $m->name == "Tracking Order") {
                $m->roles()->attach($kurir->id);
            }
        }
    }
}
