// Fungsi untuk menghitung jarak antara dua titik koordinat (latitude, longitude)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Jarak dalam km
    return distance;
};

// Fungsi untuk menghitung harga ongkir berdasarkan jarak dan jumlah pasangan sepatu
const calculateShippingPrice = (distance: number, numPairs: number) => {
    let price = 0;

    if (distance < 3) {
        if (numPairs <= 2) {
            price = 5000;
        } else if (numPairs >= 3 && numPairs <= 4) {
            price = 0;
        } else if (numPairs > 5) {
            price = 0;
        }
    } else if (distance < 4) {
        if (numPairs <= 2) {
            price = 10000;
        } else if (numPairs >= 3 && numPairs <= 4) {
            price = 0;
        } else if (numPairs > 5) {
            price = 0;
        }
    } else if (distance < 5) {
        if (numPairs <= 2) {
            price = 20000;
        } else if (numPairs >= 3 && numPairs <= 4) {
            price = 10000;
        } else if (numPairs > 5) {
            price = 0;
        }
    } else if (distance < 7) {
        if (numPairs <= 2) {
            price = 30000;
        } else if (numPairs >= 3 && numPairs <= 4) {
            price = 20000;
        } else if (numPairs > 5) {
            price = 10000;
        }
    } else if (distance < 9) {
        if (numPairs <= 2) {
            price = 40000;
        } else if (numPairs >= 3 && numPairs <= 4) {
            price = 30000;
        } else if (numPairs > 5) {
            price = 20000;
        }
    } else if (distance >= 10) {
        if (numPairs <= 2) {
            price = 50000;
        } else if (numPairs >= 3 && numPairs <= 4) {
            price = 40000;
        } else if (numPairs > 5) {
            price = 30000;
        }
    }

    return price;
};
export { calculateDistance, calculateShippingPrice };
