"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Clock, Sunrise, Sunset } from "lucide-react";

interface WeatherData {
    temperature: number;
    condition: string;
    location: string;
}

export function WeatherGreetingWidget() {
    const [greeting, setGreeting] = useState("");
    const [greetingIcon, setGreetingIcon] = useState<React.ReactNode>(null);
    const [currentTime, setCurrentTime] = useState("");

    // Fake weather data
    const weather: WeatherData = {
        temperature: 72,
        condition: "Clear",
        location: "San Francisco",
    };

    useEffect(() => {
        // Set greeting based on time of day
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Good morning");
            setGreetingIcon(<Sunrise className="w-4 h-4 text-neutral-600" />);
        } else if (hour < 18) {
            setGreeting("Good afternoon");
            setGreetingIcon(<Sun className="w-4 h-4 text-neutral-600" />);
        } else {
            setGreeting("Good evening");
            setGreetingIcon(<Sunset className="w-4 h-4 text-neutral-600" />);
        }

        // Update time every second
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }));
        };

        updateTime();
        const timeInterval = setInterval(updateTime, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case "clear":
                return <Sun className="w-4 h-4" />;
            case "rainy":
            case "stormy":
                return <CloudRain className="w-4 h-4" />;
            case "snowy":
                return <CloudSnow className="w-4 h-4" />;
            case "partly cloudy":
                return <Cloud className="w-4 h-4" />;
            default:
                return <Wind className="w-4 h-4" />;
        }
    };

    return (
        <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Greeting Widget */}
            <div className="bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                    {greetingIcon}
                    <p className="text-sm text-neutral-600 font-medium">{greeting}</p>
                </div>
            </div>

            {/* Time Widget */}
            <div className="bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-600" />
                    <p className="text-sm text-neutral-600 font-medium">{currentTime}</p>
                </div>
            </div>

            {/* Weather Widget */}
            <div className="bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-neutral-600">{getWeatherIcon(weather.condition)}</span>
                    <p className="text-sm text-neutral-600 font-medium">
                        {weather.temperature}°F · {weather.condition}
                    </p>
                </div>
            </div>
        </div>
    );
}