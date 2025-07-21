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
                    "reason": "
                    (!!!REMINDER : UNTUK ISI KONTENNYA HARAP DIBUAT DIDALAM TAG HTML YANG PAS AGAR MERENDER OUTPUTNNYA OTOMATIS MERENDER DENGAN TAG HTML PADA FRONTENDNYA!!!)
                    (BERIKAN CLASSNAME 'text-xl' UNTUK HEADING 1, LALU UNTUK TAG BARIS BARU MENJADI <br/>, UNTUK SETIAP AKHIR LIST PADA PERHITUNGAN SKALA PERSENAN HARAP DIBERI TAG BARIS BARU BUKAN DI HEADING!)
                    ANALISIS KHUSUS UNTUK GAMBAR SEPATU. JIKA GAMBAR YANG DIUNGGAH BUKAN GAMBAR SEPATU, JANGAN MELAKUKAN ANALISIS LAIN. CUKUP BERIKAN JAWABAN:
                    'Saya Tida Melihat Sepatu Pada Gambar Tersebut'.
                    JIKA GAMBAR YANG DI UPLOAD ADALAH SEPATU SELANJUTNYA Lakukan analisis apakah sepatu ini baru atau kotor. JIKA BARU BERIKAN JAWABAN:
                    'Sepatu Ini Baru Tidak Terdeteksi Kekotoran' DAN TIDAK USAH MELANJUTKAN ANALISIS.
                    JIKA KOTOR LANJUT ANALISISNYA DENGAN ATURAN BERIKUT:
                    berikan garis pemisah untuk setiap section
                    Section 1 (TULISAN BOLD atau h1)
                    1. Tingkat Kekotoran Sepatu (Skala 10%-100%): (HASIL ANALISIS DALAM BENTUK PERSENTASE. TULISAN BOLD. jika hasil analisis sepatu bersih berikan persentase 0% jangan 10%)
                    Section 2 (TULISAN BOLD atau h1)
                    1. Detail Analisis Per Bagian Sepatu;
                    2. Upper (Bagian Atas): (TULISAN BOLD atau h1);
                    3. Midsole (Bagian Tengah): (TULISAN BOLD atau h1);
                    4. Outsole (Bagian Bawah): (TULISAN BOLD atau h1);
                    Jika Kotor Lakukan analisis tingkat kekotoran sepatu berdasarkan gambar yang diberikan. Detailkan dengan aturan berikut:
                    Tingkat Kekotoran Sepatu (Skala 10%-100%).
                    <strong>10%</strong>:
                    - Sedikit debu atau noda kecil yang hampir tidak terlihat.
                    - Kotoran hanya terdapat di area tertentu, seperti ujung outsole.
                    <strong>20%</strong>:
                    - Debu ringan lebih terlihat di permukaan upper dan outsole.
                    - Terdapat noda tipis seperti bekas sentuhan tangan atau percikan air.
                    <strong>30%</strong>:
                    - Debu lebih menyebar di seluruh permukaan, terutama upper.
                    - Noda ringan seperti bercak air atau minyak kecil mulai terlihat jelas.
                    <strong>40%</strong>:
                    - sedikit Lumpur kering mulai terlihat di outsole dan sebagian kecil midsole.
                    - Noda makanan atau minyak menempel pada beberapa bagian.
                    - Warna material sedikit kusam.
                    <strong>50%</strong>:
                    - banyak Lumpur kering lebih luas di outsole dan midsole.
                    - Noda mulai meresap ke material, terutama pada bahan kain atau suede.
                    - Perubahan warna pada beberapa area lebih jelas.
                    <strong>60%</strong>:
                    - Noda minyak atau makanan yang meresap lebih dominan.
                    - Lumpur kering tersebar di banyak bagian outsole dan midsole.
                    - Warna material semakin pudar atau berubah.
                    <strong>70%</strong>:
                    - Lumpur atau noda makanan menutupi sebagian besar outsole dan upper.
                    - Minyak yang meresap sulit dihilangkan dengan pembersihan ringan.
                    - Warna material terlihat sangat kusam.
                    <strong>80%</strong>:
                    - Lumpur basah atau kotoran tebal menutupi banyak bagian sepatu.
                    - Noda oli atau makanan terlihat menyebar merata.
                    - Perubahan warna material sangat signifikan.
                    <strong>90%</strong>:
                    - Lumpur tebal menutupi hampir seluruh sepatu.
                    - Noda oli meresap dalam dan warna asli sepatu sulit dikenali.
                    - Material terlihat sangat rusak atau tertutup kotoran berat.
                    <strong>100%</strong>:
                    - Sepatu sepenuhnya tertutup kotoran berat seperti lumpur basah dan oli.
                    - Tidak ada bagian material yang terlihat bersih.
                    - Warna asli sepatu tidak dapat dikenali sama sekali.
                    Detail Analisis Per Bagian Sepatu
                    <strong>Upper (Bagian Atas):</strong>
                    - Jelaskan tingkat kekotorannya dalam persentase.
                    - Sebutkan jenis noda apa yang terlihat (misal: debu, lumpur, oli, dll.).
                    - Berikan detail area spesifik yang terkena noda (misal: upper kanan warna biru terkena lumpur coklat).
                    <strong>Midsole (Bagian Tengah):</strong>
                    - Jelaskan tingkat kekotorannya dalam persentase.
                    - Sebutkan jenis noda apa yang terlihat (misal: kusam, bercak minyak, atau lumpur).
                    - Jika midsole awalnya berwarna putih tetapi sudah menguning akibat pemakaian lama, berikan keterangan khusus.
                    <strong>Outsole (Bagian Bawah):</strong>
                    - Jelaskan tingkat kekotorannya dalam persentase.
                    - Sebutkan jenis noda apa yang terlihat (misal: lumpur, tanah basah, atau bekas aspal).
                    - Jika outsole tidak terlihat dalam gambar, beri keterangan (outsole tidak terlihat pada gambar)."
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
                'picture' => $treatment->picture
            ] : null,
            'reason' => $result['reason'],
        ], 201);
    }

    public function recommend(Request $request)
    {
        $imageBase64 = $request->input('image');

        $response = Http::withToken(env("OPEN_AI_API"))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => 'Apa rekomendasi treatment dari gambar ini?'],
                            ['type' => 'image_url', 'image_url' => [
                                'url' => $imageBase64
                            ]],
                        ],
                    ],
                ],
                'max_tokens' => 1000,
            ]);

        return response()->json($response->json());
    }
}
