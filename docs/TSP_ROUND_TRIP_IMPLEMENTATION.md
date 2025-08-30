# TSP Round Trip Implementation

## Overview
Implementasi TSP (Traveling Salesman Problem) dengan round trip yang memastikan kurir kembali ke lokasi toko setelah mengantarkan semua pesanan.

## Features Implemented

### 1. Round Trip Route Generation
- ✅ Semua algoritma TSP menghasilkan rute yang kembali ke toko
- ✅ Perhitungan jarak total sudah termasuk perjalanan kembali
- ✅ Google Maps URLs otomatis mengarahkan kembali ke origin pada rute terakhir

### 2. Algorithm Options
1. **TSP Hybrid (Default)** - Kombinasi Nearest Neighbor + 2-opt optimization
2. **TSP 2-opt** - Optimasi iteratif murni  
3. **Nearest Neighbor** - Algoritma cepat berdasarkan jarak terdekat

### 3. UI Improvements
- ✅ Label "(Round Trip)" ditambahkan pada semua pilihan
- ✅ Keterangan "Round trip - kembali ke toko" di header
- ✅ Toast notification menyebutkan round trip
- ✅ Konsisten di desktop dan mobile version

## Technical Implementation

### TSP Optimizer (`tsp-optimizer.ts`)
```typescript
// Modified generateTSPRouteUrls function
export const generateTSPRouteUrls = (
    optimizedRoute: Location[],
    origin: Location,
    waypointLimit: number = 9
): string[] => {
    // Logic ensures last chunk returns to origin
    if (isLastChunk) {
        destination = origin; // Return to origin
        waypoints = chunk; // All locations become waypoints
    }
}
```

### Distance Calculation
- `calculateTotalDistance()` sudah menghitung jarak kembali ke origin
- Total distance = Origin → Locations → Origin

### Google Maps Integration
- Rute terakhir selalu berakhir di lokasi toko
- Multi-chunk routes properly connected
- Waypoint limits respected (max 9 per route)

## Benefits

1. **Efficient Delivery Planning**
   - Kurir tidak perlu planning manual untuk kembali ke toko
   - Rute optimal dengan total jarak minimum

2. **Complete Journey Tracking**
   - Total jarak akurat termasuk perjalanan pulang
   - Estimasi waktu dan bahan bakar lebih presisi

3. **Business Logic Compliance**
   - Sesuai dengan SOP pengiriman (kurir harus kembali ke toko)
   - Mendukung shift kerja yang terstruktur

## Usage Example

```typescript
// Automatic round trip route generation
const result = optimizeTSPRoute(locations, origin, 'hybrid');
// result.totalDistance includes return journey to origin

const urls = generateTSPRouteUrls(result.locations, origin, 9);
// Last URL in array will navigate back to origin
```

## Testing Scenarios

### Single Route (≤9 locations)
- Origin → Location 1 → Location 2 → ... → Location N → Origin

### Multiple Routes (>9 locations)  
- Route 1: Origin → Loc 1-9 → Loc 9
- Route 2: Loc 9 → Loc 10-18 → Loc 18  
- Route 3: Loc 18 → Loc 19-N → Origin (back to store)

## Future Enhancements
- [ ] Time window constraints
- [ ] Vehicle capacity constraints  
- [ ] Multiple vehicle routing
- [ ] Real-time traffic integration
