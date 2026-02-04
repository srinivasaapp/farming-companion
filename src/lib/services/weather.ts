
export interface WeatherData {
    temperature: number;
    weatherCode: number;
    isDay: number;
}

export interface LocationResult {
    name: string;
    region?: string;
    country?: string;
    pincode?: string;
    latitude: number;
    longitude: number;
}

export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`);
        if (!res.ok) throw new Error("Weather API failed");
        const data = await res.json();
        return {
            temperature: data.current.temperature_2m,
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day
        };
    } catch (err) {
        console.error("Weather fetch error:", err);
        return null;
    }
};

export const searchCity = async (query: string): Promise<LocationResult[]> => {
    try {
        if (!query || query.length < 3) return [];
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
        const data = await res.json();

        if (!data.results) return [];

        return data.results.map((item: any) => ({
            name: item.name,
            region: item.admin1, // State/Region
            country: item.country,
            latitude: item.latitude,
            longitude: item.longitude
        }));
    } catch (err) {
        console.error("City search error:", err);
        return [];
    }
};

export const getPincodeDetails = async (pincode: string): Promise<LocationResult | null> => {
    try {
        if (pincode.length !== 6) return null; // India Pincode specific
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();

        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const place = data[0].PostOffice[0];
            // Postal API doesn't give lat/lon, so we search the name + district in Open-Meteo
            const queryName = `${place.Name}, ${place.District}, India`;
            const geoRes = await searchCity(queryName);

            if (geoRes.length > 0) {
                return {
                    ...geoRes[0],
                    name: place.Name + ", " + place.District, // Override display name
                    pincode: pincode
                };
            }

            // Fallback: If specific search fails, try District only
            const districtRes = await searchCity(place.District + ", India");
            if (districtRes.length > 0) {
                return {
                    ...districtRes[0],
                    name: place.Name + " (" + place.District + ")",
                    pincode: pincode
                };
            }
        }
        return null;
    } catch (err) {
        console.error("Pincode fetch error:", err);
        return null;
    }
};
