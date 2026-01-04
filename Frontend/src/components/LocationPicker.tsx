import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPickerProps {
  value: string;
  onChange: (location: string) => void;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition }: {
  position: LatLng | null;
  setPosition: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

// Component to recenter map
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

const LocationPicker = ({ value, onChange }: LocationPickerProps) => {
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [manualLocation, setManualLocation] = useState(value);
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationAddress, setLocationAddress] = useState('');

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      if (data.display_name) {
        return data.display_name;
      }
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Search for location by name
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = new LatLng(parseFloat(lat), parseFloat(lon));
        setMarkerPosition(newPos);
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setLocationAddress(display_name);
        onChange(display_name);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = new LatLng(latitude, longitude);
        setMarkerPosition(newPos);
        setMapCenter([latitude, longitude]);

        const address = await reverseGeocode(latitude, longitude);
        setLocationAddress(address);
        onChange(address);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please enable location access or enter manually.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle marker position change (from map click)
  const handleMarkerChange = async (pos: LatLng) => {
    setMarkerPosition(pos);
    const address = await reverseGeocode(pos.lat, pos.lng);
    setLocationAddress(address);
    onChange(address);
  };

  // Handle manual input change
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setManualLocation(newValue);
    onChange(newValue);
  };

  // Sync manual location with value prop
  useEffect(() => {
    if (activeTab === 'manual') {
      setManualLocation(value);
    }
  }, [value, activeTab]);

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Location
      </Label>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Enter Manually</TabsTrigger>
          <TabsTrigger value="map">Select on Map</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-3">
          <Input
            placeholder="Enter the location address (e.g., 123 Main Street, City)"
            value={manualLocation}
            onChange={handleManualChange}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the complete address where the issue is located
          </p>
        </TabsContent>

        <TabsContent value="map" className="mt-3 space-y-3">
          {/* Search and Current Location */}
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchLocation}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">My Location</span>
            </Button>
          </div>

          {/* Map Container */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[300px] w-full">
                <MapContainer
                  center={mapCenter}
                  zoom={5}
                  className="h-full w-full z-0"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker
                    position={markerPosition}
                    setPosition={handleMarkerChange}
                  />
                  <RecenterMap center={mapCenter} />
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Click on the map to select a location, use search, or click "My Location" to use your current position
          </p>

          {/* Selected Location Display */}
          {locationAddress && (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-1">Selected Location:</p>
              <p className="text-sm font-medium">{locationAddress}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationPicker;
