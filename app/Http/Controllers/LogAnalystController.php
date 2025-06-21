<?php

namespace App\Http\Controllers;

use App\Models\LogAnalyst;
use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LogAnalystController extends Controller
{
    public function testApiKey()
    {
        try {
            $response = Http::withToken(env("OPEN_AI_API"))
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o',
                    'messages' => [
                        ['role' => 'user', 'content' => 'Halo, apakah kamu bisa menjawab?']
                    ]
                ]);

            // Memeriksa status respon
            if ($response->successful()) {
                $data = $response->json();
                $content = $data['choices'][0]['message']['content'] ?? 'No response content';

                // Logika berhasil
                echo "✅ API key berhasil digunakan!\n";
                echo "Respon dari ChatGPT:\n";
                echo $content;
            } else {
                // Tangani error status selain 401
                echo "⚠️ Terjadi error lain: " . $response->body();
            }
        } catch (\Exception $error) {
            // Tangani error yang terjadi
            if ($error->getCode() == 401) {
                echo "❌ API key salah atau tidak valid.";
            } else {
                echo "⚠️ Terjadi error lain: " . $error->getMessage();
            }
        }
    }

    public function analyzeTest(Request $request)
    {
        // Validasi input gambar
        $request->validate(['image' => 'required|image|max:4096']);

        // Ambil file yang diupload
        $file = $request->file('image');
        $path = $file->store('shoes', 'public');

        // Ambil mime_type dari file yang diupload
        $mimeType = $file->getMimeType();

        // Encode gambar ke base64
        $imageData = base64_encode(file_get_contents(storage_path("app/public/$path")));

        // Format prompt yang dikirim ke OpenAI API
        $prompt = <<<PROMPT
                Kamu adalah pakar perawatan sepatu.
                Tugasmu adalah:
                1. Menganalisis kondisi sepatu dari gambar yang diberikan.
                2. Menentukan tingkat kekotoran sepatu (low, medium, high).
                3. Balas dalam format teks biasa dengan memberikan feedback tentang tingkat kekotoran sepatu.
                PROMPT;

        // Kirim request ke OpenAI API
        $response = Http::withToken(env("OPEN_AI_API"))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a shoe cleaning expert AI assistant.'],
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => $prompt],
                            ['type' => 'image_url', 'image_url' => ['url' => 'data:' . $mimeType . ';base64,' . $imageData]],
                        ],
                    ],
                ],
                'max_tokens' => 1000,
            ]);

        // Ambil hasil response dari OpenAI
        $json = $response->json();

        // Periksa jika respons OpenAI tidak sesuai
        if (!isset($json['choices'][0]['message']['content'])) {
            return response()->json([
                'error' => 'OpenAI API Error',
                'details' => $json,
            ], 500);
        }

        $responseGPT = $json['choices'][0]['message']['content'] ?? 'No response content';

        // Mengembalikan feedback ke frontend dalam format teks biasa
        return response()->json([
            'feedback' => $responseGPT
        ], 201);
    }

    public function analyze(Request $request)
    {
        $request->validate(['image' => 'required|image|max:4096']);

        // Ambil file dan path-nya
        $file = $request->file('image');
        $path = $file->store('shoes', 'public');

        // Ambil mime_type dari file yang diupload
        $mimeType = $file->getMimeType();

        // Encode gambar ke base64
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

        // Format prompt yang dikirim ke OpenAI API
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
                - Balas dalam format JSON berikut:
                {
                    "dirtiness_level": "low|medium|high",
                    "is_yellowing": true|false,
                    "treatment": {
                        "name": "treatment_name",
                        "slug": "treatment_slug",
                        "description": "treatment_description",
                        "price": "treatment_price"
                    },
                    "reason": "penjelasan mengapa treatment tersebut dipilih"
                }
                PROMPT;

        // Kirim request ke OpenAI API
        $response = Http::withToken(env("OPEN_AI_API"))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a shoe cleaning expert AI assistant.'],
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => $prompt],
                            ['type' => 'image_url', 'image_url' => ['url' => 'data:' . $mimeType . ';base64,' . $imageData]],
                            ['type' => 'text', 'text' => 'List of treatments: ' . json_encode($treatments)],
                        ],
                    ],
                ],
                'max_tokens' => 1000,
            ]);

        // Ambil hasil response dari OpenAI
        $json = $response->json();

        // Periksa jika respons OpenAI tidak sesuai
        if (!isset($json['choices'][0]['message']['content'])) {
            return response()->json([
                'error' => 'OpenAI API Error',
                'details' => $json,
            ], 500);
        }

        $content = $json['choices'][0]['message']['content'] ?? 'No response content';
        // $result = json_decode($content, true);
        // Hapus backtick di awal dan akhir string (3 backticks) dan kata "json"
        $cleanedContent = trim(str_replace('json', '', $content), "`");

        // Lakukan json_decode setelah menghapus backtick dan kata "json"
        $result = json_decode($cleanedContent, true);

        // Pastikan data yang diterima memiliki format yang benar
        if (!isset($result['dirtiness_level'], $result['is_yellowing'], $result['treatment'], $result['reason'])) {
            return response()->json([
                'error' => 'Invalid response format from OpenAI',
                'details' => $result,
            ], 500);
        }

        // Mencari treatment berdasarkan slug yang diberikan oleh AI
        $treatment = Treatment::where('slug', $result['treatment']['slug'])->first();

        // Menyusun respons sesuai format yang diminta
        return response()->json([
            'dirtiness_level' => $result['dirtiness_level'],
            'is_yellowing' => $result['is_yellowing'],
            'treatment' => $treatment ? [
                'name' => $treatment->name,
                'slug' => $treatment->slug,
                'description' => $treatment->description,
                'price' => $treatment->price,
            ] : null,
            'reason' => $result['reason'],
        ], 201);
    }
}
