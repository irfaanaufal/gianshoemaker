<?php

namespace Database\Seeders;

use App\Models\UserAddress;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserAddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $addresses = [
            (object)[
                "user_id" => 1,
                "label" => "Kampus",
                "address" => "Jl. Dr. Setiabudi No.229, Isola, Kec. Sukasari, Kota Bandung, Jawa Barat 40154",
                "lat" => -6.86103259308638,
                "long" => 107.59203908092793
            ],
            (object)[
                "user_id" => 1,
                "label" => "Rumah",
                "address" => "Jl. Budi Luhur I No.11B, RT.07/RW.05, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153",
                "lat" => -6.872720079676569,
                "long" => 107.59310866988409
            ],
            (object)[
                "user_id" => 3,
                "label" => "Kampus",
                "address" => "Jl. Dr. Setiabudi No.229, Isola, Kec. Sukasari, Kota Bandung, Jawa Barat 40154",
                "lat" => -6.86103259308638,
                "long" => 107.59203908092793
            ],
            (object)[
                "user_id" => 3,
                "label" => "Rumah",
                "address" => "Jl. Budi Luhur I No.11B, RT.07/RW.05, Gegerkalong, Kec. Sukasari, Kota Bandung, Jawa Barat 40153",
                "lat" => -6.872720079676569,
                "long" => 107.59310866988409
            ],
        ];
        foreach ($addresses as $key => $addrs) {
            UserAddress::create([
                "user_id" => $addrs->user_id,
                "label" => $addrs->label,
                "address" => $addrs->address,
                "lat" => $addrs->lat,
                "long" => $addrs->long
            ]);
        }
    }
}
