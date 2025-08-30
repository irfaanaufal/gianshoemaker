# TSP (Traveling Salesman Problem) Implementation for GIANSHOEMAKER

## 🎯 Apa itu TSP?

**Traveling Salesman Problem (TSP)** adalah masalah optimasi klasik yang bertujuan menemukan rute terpendek yang mengunjungi semua lokasi tepat satu kali. Dalam konteks tracking order GIANSHOEMAKER, TSP membantu kurir menemukan rute optimal untuk mengantarkan sepatu ke semua pelanggan.

## 🚀 Keuntungan TSP untuk Tracking Order

### 1. **Penghematan Jarak & Waktu**
- Rute yang dioptimalkan TSP bisa menghemat hingga 20-40% jarak tempuh
- Waktu pengiriman lebih cepat dan efisien
- Kurir bisa melayani lebih banyak order dalam sehari

### 2. **Pengurangan Biaya Operasional**
- Hemat bahan bakar kendaraan kurir
- Mengurangi wear & tear kendaraan
- Optimasi jam kerja kurir

### 3. **Peningkatan Customer Experience**
- Estimasi waktu pengiriman lebih akurat
- Pengiriman lebih cepat dan teratur
- Tracking real-time yang lebih reliable

## 🛠 Algoritma TSP yang Diimplementasikan

### 1. **TSP Hybrid (Recommended)**
```typescript
// Kombinasi Nearest Neighbor + 2-opt improvement
const result = optimizeTSPRoute(locations, origin, 'hybrid');
```
- **Kelebihan**: Balance antara kecepatan dan kualitas
- **Penggunaan**: Untuk 3-50 lokasi pengiriman
- **Kompleksitas**: O(n²) untuk NN + O(n²) untuk 2-opt

### 2. **TSP 2-opt Pure**
```typescript
// Optimasi iteratif murni
const result = optimizeTSPRoute(locations, origin, '2-opt');
```
- **Kelebihan**: Hasil optimal yang sangat baik
- **Penggunaan**: Untuk dataset kecil (<20 lokasi)
- **Kompleksitas**: O(n²) per iterasi

### 3. **Nearest Neighbor (Fallback)**
```typescript
// Greedy algorithm - cepat tapi tidak selalu optimal
const result = optimizeTSPRoute(locations, origin, 'nearest-neighbor');
```
- **Kelebihan**: Sangat cepat
- **Penggunaan**: Untuk dataset besar (>50 lokasi)
- **Kompleksitas**: O(n²)

## 📊 Contoh Perbandingan Hasil

```
Skenario: 8 Order di Bandung
┌─────────────────┬──────────────┬─────────────────┬──────────────┐
│ Algoritma       │ Total Jarak  │ Waktu Optimasi  │ Efisiensi    │
├─────────────────┼──────────────┼─────────────────┼──────────────┤
│ Urutan Original │ 24.5 km      │ -               │ Baseline     │
│ Nearest Neighbor│ 18.2 km      │ 2.1 ms          │ 26% hemat    │
│ TSP 2-opt       │ 16.8 km      │ 15.3 ms         │ 31% hemat    │
│ TSP Hybrid      │ 16.9 km      │ 8.7 ms          │ 31% hemat    │
└─────────────────┴──────────────┴─────────────────┴──────────────┘
```

## 🎮 Cara Menggunakan di Interface

### Desktop Version
1. Buka halaman tracking order
2. Pastikan ada lebih dari 1 order yang sudah diambil kurir
3. Di panel "Rute Multi-Tujuan", pilih algoritma:
   - **TSP Hybrid**: Untuk hasil terbaik (recommended)
   - **TSP 2-opt**: Untuk optimasi maksimal
   - **Nearest Neighbor**: Untuk kecepatan
   - **Urutan Order**: Tanpa optimasi
4. Klik "Buat Rute TSP Optimal"

### Mobile Version
1. Tap icon daftar order di pojok kiri bawah
2. Scroll ke bagian "Rute Multi-Tujuan"
3. Pilih algoritma optimasi dengan radio button
4. Tap "🎯 Buat Rute TSP Optimal"

## 🔧 Technical Implementation

### File Structure
```
resources/js/
├── utils/
│   └── tsp-optimizer.ts         # TSP algorithms implementation
└── pages/tracking/
    └── page.tsx                 # Main tracking interface with TSP integration
```

### Key Functions

#### 1. TSP Optimizer
```typescript
export const optimizeTSPRoute = (
    locations: Location[], 
    origin: Location,
    algorithm: 'nearest-neighbor' | '2-opt' | 'hybrid' = 'hybrid'
): RouteResult
```

#### 2. Algorithm Comparison
```typescript
export const compareTSPAlgorithms = (
    locations: Location[], 
    origin: Location
): {
    nearestNeighbor: RouteResult;
    twoOpt: RouteResult;
    hybrid: RouteResult;
}
```

#### 3. Google Maps Integration
```typescript
export const generateTSPRouteUrls = (
    optimizedRoute: Location[],
    origin: Location,
    waypointLimit: number = 9
): string[]
```

## 📈 Performance Metrics

### Real-time Statistics
- **Total Distance**: Jarak total rute yang dioptimasi
- **Optimization Time**: Waktu yang dibutuhkan untuk optimasi
- **Algorithm Comparison**: Perbandingan hasil antar algoritma

### UI Display
```typescript
// Stats display in interface
const [optimizationStats, setOptimizationStats] = useState<string>('');
const [tspResults, setTspResults] = useState<{[key: string]: RouteResult} | null>(null);
```

## 🎯 Best Practices

### 1. **Pemilihan Algoritma**
- **3-10 lokasi**: TSP Hybrid
- **10-20 lokasi**: TSP 2-opt
- **20+ lokasi**: Nearest Neighbor
- **Data testing**: Bandingkan semua algoritma

### 2. **Persiapan Data**
- Pastikan koordinat GPS akurat
- Validasi alamat sebelum optimasi
- Filter order dengan koordinat valid

### 3. **Monitoring Performance**
- Track efisiensi rute secara berkala
- Analisis feedback kurir
- Adjust algoritma based on hasil

## 🔮 Future Enhancements

### 1. **Advanced Algorithms**
- Genetic Algorithm untuk dataset besar
- Simulated Annealing untuk fine-tuning
- Machine Learning untuk prediksi traffic

### 2. **Real-time Optimization**
- Dynamic route adjustment
- Traffic-aware routing
- Time window constraints

### 3. **Analytics & Reporting**
- Route efficiency dashboard
- Historical optimization data
- Courier performance metrics

## 💡 Tips untuk Kurir

1. **Gunakan TSP Hybrid** sebagai default untuk hasil optimal
2. **Update lokasi real-time** untuk accuracy
3. **Bandingkan algoritma** saat testing rute baru
4. **Feedback** jika ada rute yang tidak praktis

---

**Implementasi TSP ini secara signifikan meningkatkan efisiensi operasional GIANSHOEMAKER dengan mengoptimalkan rute pengiriman sepatu ke pelanggan!** 🎯👟
