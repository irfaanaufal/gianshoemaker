<?php

namespace Database\Seeders;

use App\Models\ShoeType as ModelsShoeType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ShoeTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $shoe_types = ["Sneakers", "Boots", "Running Shoes", "Slip On"];
        foreach ($shoe_types as $key => $st) {
            ModelsShoeType::create([
                "name" => $st,
                "slug" => Str::slug($st)
            ]);
        }
    }
}
