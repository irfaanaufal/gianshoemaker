import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

interface MapProps {
    selectedLocation: { lat: number; lng: number };
    route: any;
    onLocationChange: (lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapProps> = ({ selectedLocation, route, onLocationChange }) => {
    useEffect(() => {
        // Fix untuk ikon leaflet yang tidak muncul
        const icon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = icon; // Mengatur marker untuk leaflet
    }, []);

    const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number) => {
        try {
            const response = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
                params: {
                    api_key: import.meta.env.VITE_OPENROUTESERVICE_API, // Ganti dengan API key Anda
                    start: `${startLng},${startLat}`, // Longitude, Latitude untuk lokasi A
                    end: `${endLng},${endLat}`,     // Longitude, Latitude untuk lokasi B
                }
            });
            const routeData = response.data.features[0].geometry.coordinates;
            const routeCoordinates = routeData.map((coord: any) => [coord[1], coord[0]]);
            onLocationChange(routeCoordinates); // Set rute yang diterima dari API
        } catch (error) {
            console.error('Error fetching route', error);
        }
    };

    return (
        <MapContainer center={[import.meta.env.VITE_FIXED_LAT, import.meta.env.VITE_FIXED_LONG]} zoom={14} style={{ height: '500px', width: '100%', zIndex: 3 }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Marker untuk UPI */}
            <Marker position={[import.meta.env.VITE_FIXED_LAT, import.meta.env.VITE_FIXED_LONG]}>
                <Popup>UPI</Popup>
            </Marker>

            {/* Marker untuk User yang dipilih */}
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <Popup>Lokasi Pengguna</Popup>
            </Marker>

            {/* Rute */}
            {route && <Polyline positions={route} color="blue" />}
        </MapContainer>
    );
};

export default MapComponent;
