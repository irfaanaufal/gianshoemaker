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
                "description" => "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium in doloremque recusandae fugit iusto soluta repellat? Vitae quod odio eligendi debitis ducimus illum fugiat sapiente animi aperiam suscipit, pariatur dicta eaque laborum mollitia officia consequuntur, tempore saepe omnis ea facere. Rem quod minus nobis perferendis laboriosam deleniti nihil voluptates expedita!",
                "picture" => "/assets/galery-14.jpg"
            ],
            (object)[
                "name" => "Extra Treatment",
                "price" => 100000,
                "description" => "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium in doloremque recusandae fugit iusto soluta repellat? Vitae quod odio eligendi debitis ducimus illum fugiat sapiente animi aperiam suscipit, pariatur dicta eaque laborum mollitia officia consequuntur, tempore saepe omnis ea facere. Rem quod minus nobis perferendis laboriosam deleniti nihil voluptates expedita!",
                "picture" => "/assets/galery-13.jpg"
            ],
            (object)[
                "name" => "Express Treatment",
                "price" => 65000,
                "description" => "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium in doloremque recusandae fugit iusto soluta repellat? Vitae quod odio eligendi debitis ducimus illum fugiat sapiente animi aperiam suscipit, pariatur dicta eaque laborum mollitia officia consequuntur, tempore saepe omnis ea facere. Rem quod minus nobis perferendis laboriosam deleniti nihil voluptates expedita!",
                "picture" => "/assets/galery-12.jpg"
            ],
            (object)[
                "name" => "Unyellowing",
                "price" => 75000,
                "description" => "Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium in doloremque recusandae fugit iusto soluta repellat? Vitae quod odio eligendi debitis ducimus illum fugiat sapiente animi aperiam suscipit, pariatur dicta eaque laborum mollitia officia consequuntur, tempore saepe omnis ea facere. Rem quod minus nobis perferendis laboriosam deleniti nihil voluptates expedita!",
                "picture" => "/assets/galery-9.jpg"
            ],
        ];
        foreach ($treatments as $key => $treatment) {
            Treatment::create([
                'name' => $treatment->name,
                'slug' => Str::slug($treatment->name),
                'price' => $treatment->price,
                'description' => $treatment->description,
                'picture' => $treatment->picture
            ]);
        }
    }
}
