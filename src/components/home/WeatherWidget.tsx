"use client";

import React, { useState, useEffect } from "react";
import { CloudSun, MapPin, Search, Navigation, X, Loader2, Cloud, Sun, CloudRain, CloudFog, CloudSnow, CloudLightning } from "lucide-react";
import { getWeather, searchCity, getPincodeDetails, WeatherData, LocationResult } from "@/lib/services/weather";
import { useToast } from "@/components/providers/ToastProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

const STORAGE_KEY = 'user_location_weather';

interface SavedLocation {
    lat: number;
    lon: number;
    name: string;
}

export function WeatherWidget() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [location, setLocation] = useState<SavedLocation | null>(null);
    const [loading, setLoading] = useState(false);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        // Load from storage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            setLocation(parsed);
            fetchWeather(parsed.lat, parsed.lon);
        } else {
            // Suggest location
            setIsEditing(true);
        }
    }, []);

    const fetchWeather = async (lat: number, lon: number) => {
        setLoading(true);
        const data = await getWeather(lat, lon);
        if (data) setWeather(data);
        setLoading(false);
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser", "error");
            return;
        }

        setSearchLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Reverse Geocode (Mockish - or assume name)
                // Just saving coordinates effectively for weather
                // We could call an API to get name but let's just say "My Location" for now or try to fetch it
                // Ideally we'd modify getPincodeDetails or searchCity to support reverse, but let's keep it simple.
                // We'll update state and let user rename or just show "Current Location"

                const newLoc = { lat, lon, name: "Current Location" };
                saveLocation(newLoc);
                setSearchLoading(false);
                setIsEditing(false);
            },
            (error) => {
                console.error("Geo error:", error);
                console.error("Geo error:", error);
                showToast("Failed to get location. Please search manually.", "error"); // Keep toast english or add toast keys later? Leaving as is for error message
                setSearchLoading(false);
                setSearchLoading(false);
            }
        );
    };

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length < 3) {
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);

        // Check if Pincode
        if (/^\d{6}$/.test(val)) {
            const pincodeRes = await getPincodeDetails(val);
            if (pincodeRes) setSearchResults([pincodeRes]);
            else setSearchResults([]);
        } else {
            // City Search
            const cities = await searchCity(val);
            setSearchResults(cities);
        }
        setSearchLoading(false);
    };

    const saveLocation = (loc: LocationResult | SavedLocation) => {
        const lat = 'latitude' in loc ? loc.latitude : loc.lat;
        const lon = 'longitude' in loc ? loc.longitude : loc.lon;
        const toSave = { lat, lon, name: loc.name };

        setLocation(toSave);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        fetchWeather(toSave.lat, toSave.lon);
        setIsEditing(false);
        setQuery("");
        setSearchResults([]);
    };

    const getWeatherIcon = (code: number, isDay: number) => {
        // WMO Codes
        // 0: Clear
        // 1-3: Cloud
        // 45,48: Fog
        // 51-67: Rain
        // 71-77: Snow
        // 95-99: Thunder

        const props = { size: 18, className: isDay ? "text-orange-500" : "text-blue-400" };

        if (code === 0) return <Sun {...props} className="text-orange-500" />;
        if (code <= 3) return <CloudSun {...props} />;
        if (code <= 48) return <CloudFog {...props} className="text-gray-400" />;
        if (code <= 67) return <CloudRain {...props} className="text-blue-500" />;
        if (code <= 77) return <CloudSnow {...props} className="text-cyan-500" />;
        if (code >= 95) return <CloudLightning {...props} className="text-purple-500" />;

        return <Cloud {...props} />;
    };

    const getWeatherLabel = (code: number) => {
        if (code === 0) return t('weather_sunny');
        if (code <= 3) return t('weather_cloudy');
        if (code <= 48) return t('weather_foggy');
        if (code <= 67) return t('weather_rainy');
        if (code <= 77) return t('weather_snow');
        if (code >= 95) return t('weather_stormy');
        return t('weather_unknown');
    };

    // --- Render ---

    if (isEditing) {
        return (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => location ? setIsEditing(false) : null} />
                <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">{t('weather_set_location')}</h3>
                        {location && <button onClick={() => setIsEditing(false)}><X size={20} className="text-gray-400" /></button>}
                    </div>

                    <div className="p-4 space-y-4">
                        <button
                            onClick={handleUseCurrentLocation}
                            className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 font-bold py-3 rounded-xl hover:bg-green-100 transition-colors"
                            disabled={searchLoading}
                        >
                            {searchLoading && query === "" ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                            {t('weather_use_current')}
                        </button>

                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                placeholder={t('weather_search_placeholder')}
                                value={query}
                                onChange={e => handleSearch(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {searchLoading && query.length >= 3 && (
                                <div className="text-center py-4 text-gray-400 text-xs">{t('weather_searching')}</div>
                            )}

                            {searchResults.map((res, idx) => (
                                <button
                                    key={idx}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center justify-between group"
                                    onClick={() => saveLocation(res)}
                                >
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">{res.name}</div>
                                        {res.region && <div className="text-xs text-gray-500">{res.region}</div>}
                                    </div>
                                    <MapPin size={16} className="text-gray-300 group-hover:text-green-500" />
                                </button>
                            ))}

                            {!searchLoading && query.length >= 3 && searchResults.length === 0 && (
                                <div className="text-center py-4 text-gray-400 text-xs">{t('weather_no_results')}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // View Mode (Compact)
    return (
        <div className="px-4 pb-3 flex items-center justify-between" onClick={() => setIsEditing(true)}>
            <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 transition-transform active:scale-95">
                    {weather ? (
                        <>
                            <span className="text-orange-500 font-bold text-xs">{weather.temperature}°C</span>
                            <span className="text-gray-300 text-[10px] mx-0.5">|</span>
                            <div className="flex items-center gap-1">
                                {getWeatherIcon(weather.weatherCode, weather.isDay)}
                                <span className="text-[10px] font-medium text-orange-700 uppercase">{getWeatherLabel(weather.weatherCode)}</span>
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-orange-400 font-medium px-1">{t('weather_loading')}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 cursor-pointer hover:text-green-600 transition-colors">
                <MapPin size={14} className="text-green-600" />
                <span className="text-xs font-bold uppercase tracking-wide max-w-[150px] truncate">
                    {location ? location.name : t('weather_suggest_location')}
                </span>
            </div>
        </div>
    );
}
