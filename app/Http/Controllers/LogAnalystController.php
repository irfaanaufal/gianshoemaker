<?php

namespace App\Http\Controllers;

use App\Models\LogAnalyst;
use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LogAnalystController extends Controller
{
    public function analyze(Request $request)
    {
        $request->validate(['image' => 'required|image|max:4096']);
        $path = $request->file('image')->store('shoes', 'public');
        $imageData = base64_encode(file_get_contents(storage_path("app/public/$path")));

        // Ambil semua treatment dari database
        $treatments = Treatment::all()->map(function ($t) {
            return [
                'name' => $t->name,
                'slug' => $t->slug,
                'description' => $t->description,
                'price' => $t->price,
                'analyze' => $t->analyze,
                'is_yellow' => $t->is_yellow,
            ];
        });

        $prompt = <<<PROMPT
                    Kamu adalah pakar perawatan sepatu.
                    Tugasmu adalah:
                    1. Menganalisis kondisi sepatu dari gambar yang diberikan.
                    2. Menentukan tingkat kekotoran sepatu (low, medium, high).
                    3. Menentukan apakah sepatu terlihat kekuningan (yellowing).
                    4. Memilih **1 treatment** terbaik dari daftar berikut berdasarkan analisis.
                    **Catatan penting:**
                    - Jika sepatu terlihat kekuningan, pilih hanya treatment yang memiliki `is_yellow = true`.
                    - Jika tidak kekuningan, pilih treatment dengan `is_yellow = false`.
                    - Pertimbangkan juga nilai `analyze` dan kecocokan `description`.
                    - Balas dalam format JSON berikut:
                    {
                        "dirtiness_level": "low|medium|high",
                        "is_yellowing": true|false,
                        "recommended_treatment_slug": "slug_treatment_yang_dipilih",
                        "reason": "penjelasan mengapa treatment tersebut dipilih"
                    }
                    PROMPT;

        $response = Http::withToken(env("OPEN_AI_API"))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a shoe cleaning expert AI assistant.'],
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => $prompt],
                            ['type' => 'image_url', 'image_url' => ['url' => 'data:image/jpeg;base64,' . $imageData]],
                            ['type' => 'text', 'text' => 'List of treatments: ' . json_encode($treatments)],
                        ],
                    ],
                ],
                'max_tokens' => 1000,
            ]);
        // return response()->json($response, 500);
        // dd($response->json());
        $json = $response->json();

        if (!isset($json['choices'][0]['message']['content'])) {
            return response()->json([
                'error' => 'OpenAI API Error',
                'details' => $json,
            ], 500);
        }

        $content = $json['choices'][0]['message']['content'];
        $result = json_decode($content, true);

        $treatment = Treatment::where('slug', $result['recommended_treatment_slug'])->first();

        return response()->json([
            'dirtiness_level' => $result['dirtiness_level'],
            'is_yellowing' => $result['is_yellowing'],
            'treatment' => $treatment,
            'reason' => $result['reason'],
        ], 201);
    }
}
