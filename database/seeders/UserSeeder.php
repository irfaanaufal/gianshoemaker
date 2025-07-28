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
                "email" => "admin@gianshoemaker.id",
                "phone" => "08585858585",
                "avatar" => "/profiles/default-avatar.jpg",
                "role" => "admin"
            ],
            (object)[
                "name" => "Kurir Gianshoemaker",
                "email" => "kurir@gianshoemaker.id",
                "phone" => "0823208374",
                "avatar" => "/profiles/default-avatar.jpg",
                "role" => "kurir"
            ],
            (object)[
                "name" => "Kurtubi",
                "email" => "kurtubi@gianshoemaker.id",
                "phone" => "08352873",
                "avatar" => "/profiles/default-avatar.jpg",
                "role" => "pelanggan"
            ],
            (object)[
                "name" => "Juliana",
                "email" => "juliana@gianshoemaker.id",
                "phone" => "08352834",
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
                "phone" => $user->phone,
                "password" => Hash::make("password"),
                "avatar" => $user->avatar,
                "is_active" => true
            ]);
            $new_user->assignRole($user->role);
        }
    }
}
