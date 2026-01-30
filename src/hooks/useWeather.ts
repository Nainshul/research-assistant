import { useState, useEffect } from 'react';

export interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    isRaining: boolean;
    conditionCode: number;
}

export const useWeather = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Fetch from Open-Meteo (Free, No Key)
                    const response = await fetch(
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,showers,weather_code,wind_speed_10m`
                    );

                    if (!response.ok) throw new Error('Failed to fetch weather data');

                    const data = await response.json();
                    const current = data.current;

                    // WMO Weather interpretation codes (0-3: Clear/Cloudy, 51-67: Drizzle/Rain, 80-82: Showers, 95-99: Thunderstorm)
                    const code = current.weather_code;
                    const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);

                    setWeather({
                        temperature: current.temperature_2m,
                        humidity: current.relative_humidity_2m,
                        windSpeed: current.wind_speed_10m,
                        isRaining,
                        conditionCode: code
                    });
                    setError(null);
                } catch (err) {
                    console.error('Weather fetch error:', err);
                    setError('Failed to load local weather');
                } finally {
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Location access denied. Weather data unavailable.');
                setIsLoading(false);
            }
        );
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    return { weather, isLoading, error, refetch: fetchWeather };
};
