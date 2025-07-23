<?php

namespace Database\Seeders;

use App\Models\Treatment;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TreatmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $treatments = [
            (object)[
                "name" => "Standar Treatment",
                "price" => 50000,
                "description" => "Perawatan pembersihan sepatu secara detail dan menyeluruh pada seluruh bagian.",
                "picture" => "/assets/galery-14.jpg",
                "analyze" => 0.5,
                "is_yellow" => false
            ],
            (object)[
                "name" => "Extra Treatment",
                "price" => 100000,
                "description" => "Perawatan yang pengerjaannya ditujukan untuk sepatu dengan material-material khusus.",
                "picture" => "/assets/galery-13.jpg",
                "analyze" => 0.8,
                "is_yellow" => false
            ],
            (object)[
                "name" => "Express Treatment",
                "price" => 65000,
                "description" => "Express Treatment merupakan pencucian instan pada bagian upper dan midsole yang bisa diambil besoknya.",
                "picture" => "/assets/galery-12.jpg",
                "analyze" => 0.3,
                "is_yellow" => false
            ],
            (object)[
                "name" => "Unyellowing Treatment",
                "price" =>  75000,
                "description" => "Perawatan yang dikhususkan untuk midsole sepatu yang telah menguning.",
                "picture" => "/assets/galery-9.jpg",
                "analyze" => 0.5,
                "is_yellow" => true
            ],
        ];
        foreach ($treatments as $treatment) {
            Treatment::create([
                'name' => $treatment->name,
                'price' => $treatment->price,
                'description' => $treatment->description,
                'picture' => $treatment->picture,
                "analyze" => $treatment->analyze,
                "is_yellow" => $treatment->is_yellow
            ]);
        }
    }
}
