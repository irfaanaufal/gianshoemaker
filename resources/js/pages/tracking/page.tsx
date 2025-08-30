import { Head } from "@inertiajs/react";
import { useMediaQuery } from "@/lib/use-media-query";
import { useState, ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Order, OrderDetail, User, UserAddress, BreadcrumbItem } from "@/types";
import { api } from "@/lib/utils";
import { route } from "ziggy-js";
import { toast } from "sonner";
import AppLayout from "@/layouts/app-layout";
import { MapPin, Phone, Clock, Car, Navigation, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import HeadingSmall from "@/components/heading-small";
import { optimizeTSPRoute, compareTSPAlgorithms, generateTSPRouteUrls, Location, RouteResult } from '@/utils/tsp-optimizer';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tracking Order',
        href: '/tracking/list',
    },
];

export default function PageTracking({
    title,
    orders
}: {
    title: string;
    orders: Order[]
}) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [addressCache, setAddressCache] = useState<Record<string, string>>({});
    const [multiRouteUrls, setMultiRouteUrls] = useState<string[]>([]);
    const [showMultiRoute, setShowMultiRoute] = useState(false);
    const [routeOptimization, setRouteOptimization] = useState<'distance' | 'tsp-hybrid' | 'tsp-2opt'>('tsp-hybrid');
    const [tspResults, setTspResults] = useState<{[key: string]: RouteResult} | null>(null);
    const [optimizationStats, setOptimizationStats] = useState<string>('');

    // Function to get address from coordinates using reverse geocoding
    const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
        const cacheKey = `${lat},${lng}`;
        if (addressCache[cacheKey]) {
            return addressCache[cacheKey];
        }

        try {
            const geocoder = new google.maps.Geocoder();
            const response = await geocoder.geocode({
                location: { lat, lng }
            });

            if (response.results && response.results[0]) {
                const address = response.results[0].formatted_address;
                setAddressCache(prev => ({ ...prev, [cacheKey]: address }));
                return address;
            }
            return "Alamat tidak ditemukan";
        } catch (error) {
            console.error("Error getting address:", error);
            return "Error mendapatkan alamat";
        }
    };

    // Google Maps API loading
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });

    const fixedLocation = {
        lat: parseFloat(String(import.meta.env.VITE_FIXED_LAT || "-6.8894467")),
        lng: parseFloat(String(import.meta.env.VITE_FIXED_LONG || "107.6148729"))
    };

    const handleMarkerClick = (data: { lat: number; lng: number }) => {
        const url = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
        window.open(url, "_blank");
    };

    const handleClick = async (status: string, row: Order) => {
        try {
            const response = await api.post(route('order.update', { order: row }), { status: status, _method: "put" });
            if (response.status == 201) {
                toast(response.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            console.log(`Error : `, error);
        }
    };

    const buttonUpdate = (status: string, row: Order): ReactNode | undefined => {
        let nextStatus: string = "";
        if (status == 'siap diambil') {
            nextStatus = "dalam perjalanan (ambil)";
        }
        if (status == 'dalam perjalanan (ambil)') {
            nextStatus = "sudah diambil";
        }
        if (status == "siap dikirim") {
            nextStatus = "dalam perjalanan (antar)"
        }
        if (status == "dalam perjalanan (antar)") {
            nextStatus = "selesai"
        }
        return status == 'selesai' ? <></> :
            <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 px-2 rounded-md" 
                onClick={() => handleClick(nextStatus, row)}
                size="sm"
            >
                UPDATE {nextStatus.toUpperCase()}
            </Button>
    };

    const takeOrder = async (order: Order) => {
        try {
            const response = await api.post(route('order.take', { order: order.id }));
            if (response.status === 201) {
                toast(response.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast("Gagal mengambil orderan");
            }
        } catch (error) {
            console.log(error);
            toast("Terjadi kesalahan saat mengambil orderan");
        }
    };

    const openDirections = (order: Order) => {
        const origin = `${fixedLocation.lat},${fixedLocation.lng}`;
        let destination = '';
        
        // Tentukan destinasi berdasarkan apakah ada custom address atau menggunakan user_address
        if (order.custom_lat && order.custom_long) {
            destination = `${order.custom_lat},${order.custom_long}`;
        } else if (order.user_address) {
            destination = `${order.user_address.lat},${order.user_address.long}`;
        }

        if (destination) {
            const directionsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
            
            // Show info about coordinate-based navigation
            toast("🗺️ Membuka navigasi berdasarkan koordinat GPS. Alamat di Google Maps mungkin sedikit berbeda dari alamat yang tersimpan.", {
                duration: 4000,
            });
            
            window.open(directionsUrl, '_blank');
        } else {
            toast("Koordinat tujuan tidak tersedia");
        }
    };

    // Multi-route functions
    const parseLatLng = (latStr: string, lngStr: string) => {
        const lat = Number(String(latStr).trim());
        const lng = Number(String(lngStr).trim());
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
        return null;
    };

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
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

    // Optimize route using nearest neighbor algorithm
    const optimizeRoute = (deliveries: any[], origin: {lat: number, lng: number}) => {
        if (deliveries.length <= 1) return deliveries;

        const optimized = [];
        const remaining = [...deliveries];
        let current = origin;

        while (remaining.length > 0) {
            // Find nearest unvisited location
            let nearestIndex = 0;
            let nearestDistance = calculateDistance(current.lat, current.lng, remaining[0].lat, remaining[0].lng);

            for (let i = 1; i < remaining.length; i++) {
                const distance = calculateDistance(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = i;
                }
            }

            // Add nearest location to optimized route
            const nearest = remaining.splice(nearestIndex, 1)[0];
            optimized.push({
                ...nearest,
                distanceFromPrevious: nearestDistance
            });
            current = { lat: nearest.lat, lng: nearest.lng };
        }

        return optimized;
    };

    const chunkStops = (stops: any[], waypointLimit: number) => {
        const chunkSize = Math.max(1, Number(waypointLimit)) + 1; // +1 untuk destination
        const chunks = [];
        for (let i = 0; i < stops.length; i += chunkSize) {
            chunks.push(stops.slice(i, i + chunkSize));
        }
        return chunks;
    };

    const buildMapsDirUrl = (origin: {lat: number, lng: number}, chunk: any[], travelmode = "driving") => {
        const base = "https://www.google.com/maps/dir/?api=1";
        const destination = chunk[chunk.length - 1];
        const waypoints = chunk.slice(0, -1);

        const qs = new URLSearchParams({
            origin: `${origin.lat},${origin.lng}`,
            destination: `${destination.lat},${destination.lng}`,
            travelmode,
        });

        if (waypoints.length) {
            const wps = waypoints.map((p: any) => `${p.lat},${p.lng}`).join("|");
            qs.set("waypoints", wps);
        }
        return `${base}&${qs.toString()}`;
    };

    const openMultiRoute = (selectedOrders: Order[], waypointLimit = 9) => {
        if (selectedOrders.length === 0) {
            toast("Tidak ada orderan yang dipilih untuk rute");
            return;
        }

        // Convert orders to Location format for TSP
        const locations: Location[] = selectedOrders.map((order, index) => {
            const lat = order.custom_lat ? parseFloat(order.custom_lat) : parseFloat(order.user_address?.lat || "0");
            const lng = order.custom_long ? parseFloat(order.custom_long) : parseFloat(order.user_address?.long || "0");
            
            return {
                id: `order-${order.id}`,
                lat,
                lng,
                address: order.custom_address || order.user_address?.address || "Alamat tidak tersedia",
                orderId: order.id
            };
        }).filter(location => location.lat !== 0 && location.lng !== 0);

        if (locations.length === 0) {
            toast("Tidak ada koordinat valid dari orderan yang dipilih");
            return;
        }

        const origin: Location = {
            id: 'origin',
            lat: fixedLocation.lat,
            lng: fixedLocation.lng,
            address: 'GIANSHOEMAKER Store'
        };

        let optimizedLocations: Location[] = [];
        let optimizationMessage = "";
        let stats = "";

        // Apply TSP optimization based on user choice
        if (routeOptimization === 'tsp-hybrid') {
            const result = optimizeTSPRoute(locations, origin, 'hybrid');
            optimizedLocations = result.locations;
            stats = `TSP Hybrid: ${result.totalDistance.toFixed(1)} km, optimized in ${result.optimizationTime.toFixed(1)}ms`;
            optimizationMessage = `🎯 Rute dioptimalkan dengan TSP Hybrid Algorithm! Total jarak: ${result.totalDistance.toFixed(1)} km`;
        } else if (routeOptimization === 'tsp-2opt') {
            const result = optimizeTSPRoute(locations, origin, '2-opt');
            optimizedLocations = result.locations;
            stats = `TSP 2-opt: ${result.totalDistance.toFixed(1)} km, optimized in ${result.optimizationTime.toFixed(1)}ms`;
            optimizationMessage = `🎯 Rute dioptimalkan dengan TSP 2-opt Algorithm! Total jarak: ${result.totalDistance.toFixed(1)} km`;
        } else if (routeOptimization === 'distance') {
            // Fallback to nearest neighbor
            const result = optimizeTSPRoute(locations, origin, 'nearest-neighbor');
            optimizedLocations = result.locations;
            stats = `Nearest Neighbor: ${result.totalDistance.toFixed(1)} km, optimized in ${result.optimizationTime.toFixed(1)}ms`;
            optimizationMessage = `🎯 Rute dioptimalkan dengan Nearest Neighbor! Total jarak: ${result.totalDistance.toFixed(1)} km`;
        }

        // Compare with other algorithms for analysis
        if (routeOptimization.startsWith('tsp')) {
            const comparison = compareTSPAlgorithms(locations, origin);
            setTspResults(comparison);
            
            const improvementText = Object.entries(comparison)
                .map(([alg, result]) => `${alg}: ${result.totalDistance.toFixed(1)}km`)
                .join(', ');
            stats += ` | Comparison: ${improvementText}`;
        }

        setOptimizationStats(stats);

        // Generate Google Maps URLs
        const urls = generateTSPRouteUrls(optimizedLocations, origin, waypointLimit);
        setMultiRouteUrls(urls);

        // Open first route immediately
        if (urls.length > 0) {
            window.open(urls[0], "_blank");
                
            toast(`🗺️ Membuka ${urls.length} rute navigasi (round trip - kembali ke toko). ${optimizationMessage}`, {
                duration: 6000,
            });
        }
    };

    const openAllMultiRoutes = () => {
        multiRouteUrls.forEach((url, index) => {
            setTimeout(() => {
                window.open(url, "_blank");
            }, index * 500); // Delay to prevent popup blocker
        });
        toast(`Membuka ${multiRouteUrls.length} rute navigasi...`);
    };

    const copyAllRoutes = async () => {
        if (multiRouteUrls.length === 0) {
            toast("Belum ada rute yang dihasilkan");
            return;
        }

        const text = multiRouteUrls.join("\n");
        try {
            await navigator.clipboard.writeText(text);
            toast("✅ Semua URL rute berhasil disalin ke clipboard");
        } catch (e) {
            // Fallback for older browsers
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            toast("✅ Semua URL rute disalin (fallback)");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'siap diambil': return 'bg-blue-500';
            case 'dalam perjalanan (ambil)': return 'bg-orange-500';
            case 'sudah diambil': return 'bg-green-500';
            case 'siap dikirim': return 'bg-purple-500';
            case 'dalam perjalanan (antar)': return 'bg-yellow-500';
            case 'selesai': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(price);
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="relative flex flex-col md:flex-row lg:flex-row-reverse gap-3 w-full p-4 max-h-[90vh]">
                {/* Map Section */}
                <div className="flex flex-col space-y-3 w-full md:w-[70%] lg:w-[70%]">
                    <div className="flex justify-between items-center">
                        <HeadingSmall title="Peta Lokasi Orderan" description="Lihat semua lokasi orderan dan rute pengiriman" />
                        
                        {/* Mobile Orders Button - Only show on mobile */}
                        {!isDesktop && orders.length > 0 && (
                            <Drawer direction='left'>
                                <DrawerTrigger>
                                    <div className="flex flex-col items-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2 cursor-pointer transition-colors">
                                        <span className="text-xs font-medium">Orderan</span>
                                        <span className="text-sm font-bold mt-0.5">({orders.length})</span>
                                    </div>
                                </DrawerTrigger>
                                <DrawerContent className="h-screen w-full max-w-none flex flex-col">
                                    <DrawerHeader className="pb-4 flex-shrink-0">
                                        <DrawerTitle className="flex items-center justify-between">
                                            <span>Daftar Orderan</span>
                                            {orders.filter(order => order.courier_id).length > 1 && (
                                                <Badge variant="outline" className="text-xs">
                                                    Mode: {routeOptimization === 'distance' ? '🎯 Optimal' : '📋 Berurutan'}
                                                </Badge>
                                            )}
                                        </DrawerTitle>
                                        <DrawerDescription>
                                            Total {orders.length} orderan • {orders.filter(order => order.courier_id).length} diambil
                                        </DrawerDescription>
                                    </DrawerHeader>

                                    {/* Multi Route Controls for Mobile */}
                                    {orders.filter(order => order.courier_id).length > 1 && (
                                        <div className="px-4 mb-4 flex-shrink-0">
                                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                                <CardContent className="p-3">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Navigation className="w-4 h-4 text-blue-600" />
                                                        <div>
                                                            <Label className="text-sm font-semibold text-blue-800">Rute Multi-Tujuan</Label>
                                                            <p className="text-xs text-blue-600">Round trip - kembali ke toko</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Route Optimization Options for Mobile */}
                                                    <div className="space-y-3">
                                                        <div className="flex flex-col gap-2">
                                                            <Label className="text-xs text-gray-600">Metode Optimasi:</Label>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border">
                                                                    <input 
                                                                        type="radio" 
                                                                        name="mobileOptimization"
                                                                        value="tsp-hybrid"
                                                                        checked={routeOptimization === 'tsp-hybrid'}
                                                                        onChange={(e) => setRouteOptimization(e.target.value as any)}
                                                                        className="w-4 h-4 text-blue-600"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <span className="text-sm font-medium">🎯 TSP Hybrid</span>
                                                                        <p className="text-xs text-gray-500">Algoritma TSP terbaik (round trip ke toko)</p>
                                                                    </div>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border">
                                                                    <input 
                                                                        type="radio" 
                                                                        name="mobileOptimization"
                                                                        value="tsp-2opt"
                                                                        checked={routeOptimization === 'tsp-2opt'}
                                                                        onChange={(e) => setRouteOptimization(e.target.value as any)}
                                                                        className="w-4 h-4 text-blue-600"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <span className="text-sm font-medium">⚡ TSP 2-opt</span>
                                                                        <p className="text-xs text-gray-500">Optimasi iteratif (round trip ke toko)</p>
                                                                    </div>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded border">
                                                                    <input 
                                                                        type="radio" 
                                                                        name="mobileOptimization"
                                                                        value="distance"
                                                                        checked={routeOptimization === 'distance'}
                                                                        onChange={(e) => setRouteOptimization(e.target.value as any)}
                                                                        className="w-4 h-4 text-blue-600"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <span className="text-sm font-medium">📍 Nearest Neighbor</span>
                                                                        <p className="text-xs text-gray-500">Rute cepat (round trip ke toko)</p>
                                                                    </div>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* TSP Results Display for Mobile */}
                                                        {tspResults && (
                                                            <div className="bg-white/70 p-2 rounded text-xs">
                                                                <Label className="text-xs font-medium text-gray-700">Perbandingan Algoritma:</Label>
                                                                <div className="mt-1 space-y-1">
                                                                    <div>Nearest Neighbor: {tspResults.nearestNeighbor.totalDistance.toFixed(1)} km</div>
                                                                    <div>TSP 2-opt: {tspResults.twoOpt.totalDistance.toFixed(1)} km</div>
                                                                    <div className="font-medium text-green-700">TSP Hybrid: {tspResults.hybrid.totalDistance.toFixed(1)} km</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {optimizationStats && (
                                                            <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                                                                {optimizationStats}
                                                            </div>
                                                        )}
                                                        
                                                        <Button 
                                                            onClick={() => openMultiRoute(orders.filter(order => order.courier_id), 3)}
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                            size="sm"
                                                        >
                                                            <Navigation className="w-3 h-3 mr-2" />
                                                            {routeOptimization.startsWith('tsp') ? '🎯 Buat Rute TSP Optimal' : '🎯 Buat Rute Optimal'} ({orders.filter(order => order.courier_id).length} lokasi)
                                                        </Button>
                                                        
                                                        {multiRouteUrls.length > 0 && (
                                                            <div className="flex gap-2">
                                                                {/* <Button 
                                                                    onClick={openAllMultiRoutes}
                                                                    variant="outline"
                                                                    className="flex-1 text-xs"
                                                                    size="sm"
                                                                >
                                                                    Buka Semua ({multiRouteUrls.length})
                                                                </Button> */}
                                                                <Button 
                                                                    onClick={copyAllRoutes}
                                                                    variant="outline"
                                                                    className="flex-1 text-xs"
                                                                    size="sm"
                                                                >
                                                                    Copy URLs
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-32">
                                        {orders.map((order, index) => (
                                            <Card key={order.trx} className="border-l-4 border-l-blue-500 overflow-hidden">
                                                <CardHeader className="pb-3">
                                                    <div className="w-full">
                                                        <CardTitle className="text-sm font-semibold truncate">
                                                            Order #{order.trx}
                                                        </CardTitle>
                                                        <p className="text-xs text-gray-600 truncate">
                                                            {order.user?.name || order.custom_user}
                                                        </p>
                                                        <Badge className={`${getStatusColor(order.status)} text-white mt-1 text-xs inline-block`}>
                                                            {order.status.toUpperCase()}
                                                        </Badge>
                                                        <div className="mt-2 space-y-1">
                                                            <p className="text-xs font-medium">{formatPrice(order.grand_total)}</p>
                                                            <p className="text-xs text-gray-500">{order.distance_km} km • {order.service_method}</p>
                                                        </div>
                                                        
                                                        {/* Action Buttons - Horizontal Row */}
                                                        <div className="flex gap-2 mt-3">
                                                            <Button 
                                                                onClick={() => {
                                                                    const lat = order.custom_lat ? +order.custom_lat : +order.user_address.lat;
                                                                    const lng = order.custom_long ? +order.custom_long : +order.user_address.long;
                                                                    setSelectedLocation({ lat, lng });
                                                                }} 
                                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-2 rounded-md"
                                                                size="sm"
                                                            >
                                                                <MapPin className="w-3 h-3 mr-1" />
                                                                Peta
                                                            </Button>
                                                            <DetailOrder order={order} />
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                
                                                <CardFooter className="pt-0 pb-4">
                                                    <div className="w-full space-y-2">
                                                        {!order.courier_id ? (
                                                            <Button 
                                                                onClick={() => takeOrder(order)}
                                                                className="w-full bg-green-500 hover:bg-green-600 text-white text-sm py-2.5"
                                                                size="sm"
                                                            >
                                                                Ambil Orderan
                                                            </Button>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <Button 
                                                                    onClick={() => openDirections(order)}
                                                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2.5"
                                                                    size="sm"
                                                                >
                                                                    <Navigation className="w-4 h-4 mr-2" />
                                                                    Buka Rute
                                                                </Button>
                                                                <div className="w-full">
                                                                    {buttonUpdate(order.status, order)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        )}
                    </div>
                    
                    <div className="w-full rounded-xl h-[30rem]">
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%", borderRadius: "1rem" }}
                            center={selectedLocation || fixedLocation}
                            zoom={13}
                        >
                            {/* Fixed Location Marker */}
                            <Marker
                                position={fixedLocation}
                                icon={{
                                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                    scaledSize: new google.maps.Size(40, 40)
                                }}
                                title="Lokasi Utama (Toko)"
                            />
                            
                            {/* Order Location Markers */}
                            {orders.map((order, index) => {
                                const position = order.custom_lat && order.custom_long 
                                    ? { lat: parseFloat(order.custom_lat), lng: parseFloat(order.custom_long) }
                                    : order.user_address 
                                    ? { lat: parseFloat(order.user_address.lat), lng: parseFloat(order.user_address.long) }
                                    : null;
                                
                                if (!position) return null;
                                
                                return (
                                    <Marker
                                        key={order.id}
                                        position={position}
                                        onClick={() => setSelectedLocation(position)}
                                        icon={{
                                            url: order.courier_id ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                                            scaledSize: new google.maps.Size(32, 32)
                                        }}
                                        title={`Order #${order.trx} - ${order.courier_id ? 'Sudah Diambil' : 'Belum Diambil'}`}
                                    />
                                );
                            })}
                            
                            {selectedLocation &&
                                <Marker
                                    position={selectedLocation}
                                    onClick={() => handleMarkerClick(selectedLocation)}
                                />
                            }
                        </GoogleMap>
                    </div>
                </div>

                {/* Orders List Section */}
                {isDesktop ? (
                    <div className="hidden w-full md:w-[30%] lg:w-[30%] md:flex lg:flex flex-col space-y-3 overflow-y-scroll max-h-[85vh]">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Daftar Orderan</h3>
                            <Badge variant="outline">{orders.length} Orderan</Badge>
                        </div>

                        {/* Multi Route Controls */}
                        {orders.filter(order => order.courier_id).length > 1 && (
                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Navigation className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <Label className="text-sm font-semibold text-blue-800">Rute Multi-Tujuan</Label>
                                            <p className="text-xs text-blue-600">Round trip - kembali ke toko</p>
                                        </div>
                                    </div>
                                    
                                    {/* Route Optimization Options */}
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-xs text-gray-600">Metode Optimasi:</Label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="optimization"
                                                        value="tsp-hybrid"
                                                        checked={routeOptimization === 'tsp-hybrid'}
                                                        onChange={(e) => setRouteOptimization(e.target.value as any)}
                                                        className="w-3 h-3"
                                                    />
                                                    <span className="text-xs">TSP Hybrid</span>
                                                </label>
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="optimization"
                                                        value="tsp-2opt"
                                                        checked={routeOptimization === 'tsp-2opt'}
                                                        onChange={(e) => setRouteOptimization(e.target.value as any)}
                                                        className="w-3 h-3"
                                                    />
                                                    <span className="text-xs">TSP 2-opt</span>
                                                </label>
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="optimization"
                                                        value="distance"
                                                        checked={routeOptimization === 'distance'}
                                                        onChange={(e) => setRouteOptimization(e.target.value as any)}
                                                        className="w-3 h-3"
                                                    />
                                                    <span className="text-xs">Nearest Neighbor</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        {/* TSP Results Display */}
                                        {tspResults && (
                                            <div className="bg-white/70 p-2 rounded text-xs">
                                                <Label className="text-xs font-medium text-gray-700">Perbandingan Algoritma:</Label>
                                                <div className="mt-1 space-y-1">
                                                    <div>Nearest Neighbor: {tspResults.nearestNeighbor.totalDistance.toFixed(1)} km</div>
                                                    <div>TSP 2-opt: {tspResults.twoOpt.totalDistance.toFixed(1)} km</div>
                                                    <div className="font-medium text-green-700">TSP Hybrid: {tspResults.hybrid.totalDistance.toFixed(1)} km</div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {optimizationStats && (
                                            <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                                                {optimizationStats}
                                            </div>
                                        )}
                                        
                                        <Button 
                                            onClick={() => openMultiRoute(orders.filter(order => order.courier_id), 9)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            size="sm"
                                        >
                                            <Navigation className="w-3 h-3 mr-2" />
                                            Buat Rute {routeOptimization.startsWith('tsp') ? 'TSP Optimal' : 'Optimal'} ({orders.filter(order => order.courier_id).length} lokasi)
                                        </Button>
                                        
                                        {multiRouteUrls.length > 0 && (
                                            <div className="flex gap-2">
                                                {/* <Button 
                                                    onClick={openAllMultiRoutes}
                                                    variant="outline"
                                                    className="flex-1 text-xs"
                                                    size="sm"
                                                >
                                                    Buka Semua ({multiRouteUrls.length})
                                                </Button> */}
                                                <Button 
                                                    onClick={copyAllRoutes}
                                                    variant="outline"
                                                    className="flex-1 text-xs"
                                                    size="sm"
                                                >
                                                    Copy URLs
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        
                        {orders.length < 1 && (
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <p className="text-gray-500">Tidak ada orderan tersedia</p>
                                </CardContent>
                            </Card>
                        )}
                        
                        {orders.map((order) => (
                            <Card key={order.trx} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Order #{order.trx}
                                            </CardTitle>
                                            <p className="text-xs text-gray-600">
                                                {order.user?.name || order.custom_user}
                                            </p>
                                            <Badge className={`${getStatusColor(order.status)} text-white mt-1 text-xs`}>
                                                {order.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold">{formatPrice(order.grand_total)}</p>
                                            <p className="text-xs text-gray-500">{order.distance_km} km</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        {/* Phone */}
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-gray-500" />
                                            <span className="text-xs">
                                                {order.user?.phone || order.custom_phone}
                                            </span>
                                        </div>
                                        
                                        {/* Address */}
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div className="text-xs">
                                                <p className="line-clamp-2 font-medium">
                                                    {order.custom_address || order.user_address?.address}
                                                </p>
                                                <p className="text-gray-500 mt-1">
                                                    Koordinat: {order.custom_lat || order.user_address?.lat}, {order.custom_long || order.user_address?.long}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Service Method */}
                                        <div className="flex items-center gap-2">
                                            <Car className="w-3 h-3 text-gray-500" />
                                            <span className="text-xs capitalize">{order.service_method}</span>
                                        </div>
                                    </div>
                                    
                                    <CardAction className="flex gap-2 mt-3">
                                        <Button 
                                            onClick={() => {
                                                const lat = order.custom_lat ? +order.custom_lat : +order.user_address.lat;
                                                const lng = order.custom_long ? +order.custom_long : +order.user_address.long;
                                                setSelectedLocation({ lat, lng });
                                            }} 
                                            className="bg-red-500 hover:bg-red-600 rounded-full p-2"
                                            size="sm"
                                        >
                                            <MapPin className="w-3 h-3" /> peta
                                        </Button>
                                        <DetailOrder order={order} />
                                    </CardAction>
                                </CardContent>
                                
                                <CardFooter className="pt-0">
                                    <div className="w-full space-y-2">
                                        {!order.courier_id ? (
                                            <Button 
                                                onClick={() => takeOrder(order)}
                                                className="w-full bg-green-500 hover:bg-green-600 rounded-full"
                                                size="sm"
                                            >
                                                Ambil Orderan
                                            </Button>
                                        ) : (
                                            <div className="space-y-2">
                                                <Button 
                                                    onClick={() => openDirections(order)}
                                                    className="w-full bg-blue-500 hover:bg-blue-600 rounded-full"
                                                    size="sm"
                                                >
                                                    <Navigation className="w-3 h-3 mr-1" />
                                                    Buka Rute
                                                </Button>
                                                <div className="w-full">
                                                    {buttonUpdate(order.status, order)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col mt-[1rem] overflow-scroll gap-3">
                        {orders.length < 1 && <p className="text-xl">Tidak ada orderan</p>}
                    </div>
                )}
            </div>

        </AppLayout>
    );
}

const DetailOrder = ({
    order
}: {
    order: Order
}) => {
    const fixedLocation = {
        lat: parseFloat(String(import.meta.env.VITE_FIXED_LAT || "-6.8894467")),
        lng: parseFloat(String(import.meta.env.VITE_FIXED_LONG || "107.6148729"))
    };

    const openDirections = (order: Order) => {
        const origin = `${fixedLocation.lat},${fixedLocation.lng}`;
        let destination = '';
        
        if (order.custom_lat && order.custom_long) {
            destination = `${order.custom_lat},${order.custom_long}`;
        } else if (order.user_address) {
            destination = `${order.user_address.lat},${order.user_address.long}`;
        }

        if (destination) {
            const directionsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
            toast("🗺️ Membuka navigasi berdasarkan koordinat GPS. Alamat di Google Maps mungkin sedikit berbeda dari alamat yang tersimpan.", {
                duration: 4000,
            });
            window.open(directionsUrl, '_blank');
        } else {
            toast("Koordinat tujuan tidak tersedia");
        }
    };

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-2 rounded-md" 
                    size="sm"
                >
                    <Eye className="w-3 h-3 mr-1" />
                    Detail
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[90vh] w-full max-w-none">
                <DrawerHeader>
                    <DrawerTitle>Order ID#{order.trx}</DrawerTitle>
                    <DrawerDescription>Tanggal Order : {order?.created_at?.toString().substring(0, 10)}</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col space-y-4 px-4 mb-4 overflow-y-auto">
                    <div>
                        <Label className="text-md">Atas Nama :</Label>
                        <p className="text-md font-bold">{order.user ? order.user.name : order.custom_user}</p>
                    </div>
                    
                    <div>
                        <Label className="text-md">Jenis Pelayanan :</Label>
                        <Badge className={`px-3 py-1 text-md font-bold rounded-full mt-1`}>{order.service_method.toUpperCase()}</Badge>
                    </div>
                    
                    {['antar jemput', 'antar'].includes(order.service_method) && (
                        <div>
                            <Label className="text-md">Alamat Tujuan :</Label>
                            <div className="space-y-2">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <Label className="text-sm text-gray-600">Alamat Tersimpan:</Label>
                                    <p className="text-md font-bold">{order.user_address ? order.user_address.address : order.custom_address}</p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <Label className="text-sm text-blue-600">Koordinat GPS:</Label>
                                    <p className="text-sm text-blue-800">
                                        Lat: {order.user_address ? order.user_address.lat : order.custom_lat}, 
                                        Lng: {order.user_address ? order.user_address.long : order.custom_long}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        * Navigasi menggunakan koordinat GPS ini
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <a href={`https://www.google.com/maps?q=${order.user_address ? order.user_address.lat : order.custom_lat},${order.user_address ? order.user_address.long : order.custom_long}`} target="_blank">
                                    <Button className="rounded-full" size="sm">Lihat di Maps</Button>
                                </a>
                                <Button 
                                    onClick={() => openDirections(order)}
                                    className="rounded-full bg-blue-500 hover:bg-blue-600" 
                                    size="sm"
                                >
                                    <Navigation className="w-3 h-3 mr-1" />
                                    Navigasi
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <Label className="text-md">Status Order :</Label>
                        <Badge className={`px-3 py-1 text-md font-bold rounded-full mt-1`}>{order.status.toUpperCase()}</Badge>
                    </div>
                    
                    <div>
                        <Label className="text-md">Status Pembayaran :</Label>
                        <Badge className={`px-3 py-1 text-md font-bold rounded-full mt-1 ${order.payment_status == 'paid' ? 'bg-green-500' : 'bg-yellow-400'}`}>
                            {order.payment_status.toUpperCase()}
                        </Badge>
                    </div>
                    
                    <div>
                        <Label className="text-md">Total Pembayaran :</Label>
                        <p className="text-lg font-bold text-green-600">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR'
                            }).format(order.grand_total)}
                        </p>
                    </div>
                </div>
                
                <Separator className="mb-[1rem]" />
                
                <div className="flex flex-col space-y-4 px-4 mb-[1rem]">
                    <Label className="text-xl mx-auto">Informasi Lainnya</Label>
                    
                    <div>
                        <Label className="text-md">Nomor Telp :</Label>
                        <p className="text-md">{order.user ? order.user.phone : order.custom_phone}</p>
                    </div>
                    
                    <div>
                        <Label className="text-md">Alamat Email :</Label>
                        <p className="text-md">{order.user ? order.user.email : "tidak ada"}</p>
                    </div>
                    
                    <div>
                        <Label className="text-md">Jarak Pengiriman :</Label>
                        <p className="text-md">{order.distance_km} km</p>
                    </div>
                </div>
                
                <DrawerFooter className="mt-auto">
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full">Tutup</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
