/**
 * TSP (Traveling Salesman Problem) Optimizer
 * Menggunakan 2-opt algorithm untuk optimasi rute pengiriman
 */

export interface Location {
    id: string;
    lat: number;
    lng: number;
    address?: string;
    orderId?: number;
}

export interface RouteResult {
    locations: Location[];
    totalDistance: number;
    optimizationTime: number;
}

/**
 * Calculate distance between two points using Haversine formula
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculate total distance for a given route
 */
const calculateTotalDistance = (route: Location[], origin: Location): number => {
    if (route.length === 0) return 0;
    
    let totalDistance = 0;
    let currentLocation = origin;
    
    // Distance from origin to first location
    totalDistance += calculateDistance(
        currentLocation.lat, currentLocation.lng,
        route[0].lat, route[0].lng
    );
    
    // Distance between consecutive locations
    for (let i = 0; i < route.length - 1; i++) {
        totalDistance += calculateDistance(
            route[i].lat, route[i].lng,
            route[i + 1].lat, route[i + 1].lng
        );
    }
    
    // Distance from last location back to origin (if needed)
    totalDistance += calculateDistance(
        route[route.length - 1].lat, route[route.length - 1].lng,
        origin.lat, origin.lng
    );
    
    return totalDistance;
};

/**
 * 2-opt improvement algorithm
 * Iteratively improves the route by swapping edges
 */
const twoOptImprovement = (route: Location[], origin: Location): Location[] => {
    const improved = [...route];
    let bestDistance = calculateTotalDistance(improved, origin);
    let isImproved = true;
    
    while (isImproved) {
        isImproved = false;
        
        for (let i = 1; i < route.length - 1; i++) {
            for (let j = i + 1; j < route.length; j++) {
                // Create new route by reversing the segment between i and j
                const newRoute = [...improved];
                const segment = newRoute.slice(i, j + 1).reverse();
                newRoute.splice(i, j - i + 1, ...segment);
                
                const newDistance = calculateTotalDistance(newRoute, origin);
                
                if (newDistance < bestDistance) {
                    improved.splice(0, improved.length, ...newRoute);
                    bestDistance = newDistance;
                    isImproved = true;
                }
            }
        }
    }
    
    return improved;
};

/**
 * Nearest Neighbor Algorithm as initial solution
 */
const nearestNeighborTSP = (locations: Location[], origin: Location): Location[] => {
    if (locations.length <= 1) return locations;
    
    const route: Location[] = [];
    const remaining = [...locations];
    let current = origin;
    
    while (remaining.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = calculateDistance(
            current.lat, current.lng,
            remaining[0].lat, remaining[0].lng
        );
        
        for (let i = 1; i < remaining.length; i++) {
            const distance = calculateDistance(
                current.lat, current.lng,
                remaining[i].lat, remaining[i].lng
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }
        
        const nearest = remaining.splice(nearestIndex, 1)[0];
        route.push(nearest);
        current = nearest;
    }
    
    return route;
};

/**
 * Main TSP Optimizer using 2-opt algorithm
 */
export const optimizeTSPRoute = (
    locations: Location[], 
    origin: Location,
    algorithm: 'nearest-neighbor' | '2-opt' | 'hybrid' = 'hybrid'
): RouteResult => {
    const startTime = performance.now();
    
    if (locations.length === 0) {
        return {
            locations: [],
            totalDistance: 0,
            optimizationTime: performance.now() - startTime
        };
    }
    
    if (locations.length === 1) {
        return {
            locations: [...locations],
            totalDistance: calculateTotalDistance(locations, origin),
            optimizationTime: performance.now() - startTime
        };
    }
    
    let optimizedRoute: Location[];
    
    switch (algorithm) {
        case 'nearest-neighbor':
            optimizedRoute = nearestNeighborTSP(locations, origin);
            break;
            
        case '2-opt':
            // Start with original order and apply 2-opt
            optimizedRoute = twoOptImprovement([...locations], origin);
            break;
            
        case 'hybrid':
        default:
            // Start with nearest neighbor, then improve with 2-opt
            const initialRoute = nearestNeighborTSP(locations, origin);
            optimizedRoute = twoOptImprovement(initialRoute, origin);
            break;
    }
    
    const totalDistance = calculateTotalDistance(optimizedRoute, origin);
    const optimizationTime = performance.now() - startTime;
    
    return {
        locations: optimizedRoute,
        totalDistance,
        optimizationTime
    };
};

/**
 * Compare different TSP algorithms
 */
export const compareTSPAlgorithms = (
    locations: Location[], 
    origin: Location
): {
    nearestNeighbor: RouteResult;
    twoOpt: RouteResult;
    hybrid: RouteResult;
} => {
    return {
        nearestNeighbor: optimizeTSPRoute(locations, origin, 'nearest-neighbor'),
        twoOpt: optimizeTSPRoute(locations, origin, '2-opt'),
        hybrid: optimizeTSPRoute(locations, origin, 'hybrid')
    };
};

/**
 * Generate Google Maps URLs for TSP optimized route
 * Ensures the last route returns to origin (round trip)
 */
export const generateTSPRouteUrls = (
    optimizedRoute: Location[],
    origin: Location,
    waypointLimit: number = 9
): string[] => {
    if (optimizedRoute.length === 0) return [];
    
    const urls: string[] = [];
    
    // Split route into chunks based on Google Maps waypoint limit
    for (let i = 0; i < optimizedRoute.length; i += waypointLimit) {
        const chunk = optimizedRoute.slice(i, i + waypointLimit);
        const isLastChunk = i + waypointLimit >= optimizedRoute.length;
        
        let destination: Location;
        let waypoints: Location[];
        
        if (isLastChunk) {
            // For the last chunk, return to origin
            destination = origin;
            waypoints = chunk; // All locations in this chunk become waypoints
        } else {
            // For other chunks, destination is the last location in chunk
            destination = chunk[chunk.length - 1];
            waypoints = chunk.slice(0, -1);
        }
        
        const params = new URLSearchParams({
            origin: i === 0 ? `${origin.lat},${origin.lng}` : `${optimizedRoute[i - 1].lat},${optimizedRoute[i - 1].lng}`,
            destination: `${destination.lat},${destination.lng}`,
            travelmode: 'driving'
        });
        
        if (waypoints.length > 0) {
            const waypointStr = waypoints
                .map(wp => `${wp.lat},${wp.lng}`)
                .join('|');
            params.append('waypoints', waypointStr);
        }
        
        urls.push(`https://www.google.com/maps/dir/?api=1&${params.toString()}`);
    }
    
    return urls;
};
