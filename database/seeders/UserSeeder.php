<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = ["admin", "kurir", "pelanggan"];
        $users = [
            (object)[
                "name" => "Admin Gianshoemaker",
                "email" => "gianhendarpan13@gmail.com",
                "email_verified_at" => now(),
                "phone" => "081916367301",
                "avatar" => "/profiles/default-avatar.jpg",
                "role" => "admin"
            ],
            (object)[
                "name" => "Kurir Ciko",
                "email" => "ciko@gmail.com",
                "email_verified_at" => now(),
                "phone" => "081916367302",
                "avatar" => "/profiles/default-avatar.jpg",
                "role" => "kurir"
            ],
            (object)[
                "name" => "Kurir Peter",
                "email" => "peter@gmail.com",
                "email_verified_at" => now(),
                "phone" => "081916367303",
                "avatar" => "/profiles/default-avatar.jpg",
                "role" => "kurir"
            ],
            (object)[
                "name" => "Irfaan",
                "email" => "irfaan@gmail.com",
                "email_verified_at" => now(),
                "phone" => "081916367304",
                "avatar" => "/profiles/default-avatar.jpg",
                "role" => "pelanggan"
            ],
            (object)[
                "name" => "Naufal",
                "email" => "naufal@gmail.com",
                "email_verified_at" => now(),
                "phone" => "081916367305",
                "avatar" => "/profiles/default-avatar.jpg",
                "role" => "pelanggan"
            ],
        ];
        foreach ($roles as $role) {
            Role::create([
                "name" => $role
            ]);
        }
        foreach ($users as $key => $user) {
            $new_user = User::create([
                "name" => $user->name,
                "email" => $user->email,
                "email_verified_at" => $user->email_verified_at ?? null,
                "phone" => $user->phone,
                "password" => Hash::make("password"),
                "avatar" => $user->avatar,
                "is_active" => true
            ]);
            $new_user->assignRole($user->role);
        }
    }
}
