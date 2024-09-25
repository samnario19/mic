import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon'; // Add this import
import { HttpClient } from '@angular/common/http'; // Add this import

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ], // Add MatIconModule to imports
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
})
export class Weather {
  // ... existing properties ...
  dateTime: string = 'Tuesday, 16:00PM'; // Added dateTime property
  isToday: boolean = true; // Added property to track the current view
  isCelsius: boolean = true; // Added property to track temperature unit
  baseTemperatureCelsius: number = 25; // Added base temperature property
  countries: any[] = []; // Added property to store search results
  searchQuery: string = ''; // Added property to hold the search query

  constructor(private http: HttpClient) {
    this.getCurrentLocation(); // Fetch weather data on component initialization
  }

  toggleView() {
    this.isToday = !this.isToday; // Toggle between today and week views
  }

  toggleTemperature() {
    this.isCelsius = !this.isCelsius; // Toggle between Celsius and Fahrenheit
  }

  getLastSevenHours() {
    const hours = [];
    const currentHour = new Date();
    const fixedTemperature = this.baseTemperatureCelsius; // Use the base temperature from current location
    // Assuming you have a method to fetch historical data or hourly forecast
    const historicalData = this.fetchHistoricalWeatherData(); // Fetch historical weather data

    for (let i = 6; i >= 0; i--) {
      const hour = new Date(currentHour.getTime() - i * 60 * 60 * 1000);
      const temperature = this.isCelsius
        ? `${historicalData[i].temp_c}ºC` // Use actual temperature from historical data
        : `${this.convertToFahrenheit(historicalData[i].temp_c)}ºF`;
      
      const image = this.getImageForTemperature(historicalData[i].temp_c); // Use actual temperature

      hours.push({
        time: hour.toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
        temperature: temperature,
        image: image,
      });
    }
    return hours;
  }

  // Add this method to fetch historical weather data
  fetchHistoricalWeatherData() {
    // Implement API call to fetch historical weather data
    // This is a placeholder; you need to replace it with actual API logic
    return [
        { temp_c: this.baseTemperatureCelsius }, // Example data
        { temp_c: this.baseTemperatureCelsius - 1 },
        { temp_c: this.baseTemperatureCelsius - 2 },
        { temp_c: this.baseTemperatureCelsius + 1 },
        { temp_c: this.baseTemperatureCelsius + 2 },
        { temp_c: this.baseTemperatureCelsius - 1 },
        { temp_c: this.baseTemperatureCelsius + 1 },
    ];
  }

  convertToFahrenheit(celsius: number): number {
    return parseFloat(((celsius * 9/5) + 32).toFixed(1)); // Convert Celsius to Fahrenheit with 1 decimal
  }

  // Update week days to use shortcuts with unique temperatures
  getWeekDays() {
    const days: { name: string; temperature: number; image?: string }[] = [
      { name: 'Mon', temperature: this.baseTemperatureCelsius }, // Use base temperature
      { name: 'Tue', temperature: this.baseTemperatureCelsius },
      { name: 'Wed', temperature: this.baseTemperatureCelsius },
      { name: 'Thu', temperature: this.baseTemperatureCelsius },
      { name: 'Fri', temperature: this.baseTemperatureCelsius },
      { name: 'Sat', temperature: this.baseTemperatureCelsius },
      { name: 'Sun', temperature: this.baseTemperatureCelsius }
    ];

    days.forEach(day => {
      day.image = this.getImageForTemperature(day.temperature);
      console.log(`Day: ${day.name}, Temperature: ${day.temperature}, Image: ${day.image}`);
    });

    return days;
  }

  getImageForTemperature(temperature: number): string {
    if (temperature >= 10 && temperature < 20) {
      return 'rainy.png'; // 20-30 degrees
    } else if (temperature >= 20 && temperature < 30) {
      return 'windy.png'; // 30-40 degrees
    } else if (temperature >= 0 && temperature <= 100) {
      return 'sun.png'; // 50-100 degrees
    }
    return 'default.png'; // Fallback image for other ranges
  }

  getTemperature(temperature: number): string {
    const temp = this.isCelsius 
      ? parseFloat(temperature.toFixed(1)) // Round Celsius to 1 decimal place
      : this.convertToFahrenheit(temperature); // Convert only if not Celsius
    return `${temp} ${this.isCelsius ? 'ºC' : 'ºF'}`; // Return temperature with unit
  }

  // Update searchCountry to fetch weather data after searching
  searchCountry(query: string) {
    const apiKey = 'cf186624c2fb4e49852130220242509';
    const url = `http://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`;
    
    this.http.get<any[]>(url).subscribe(data => {
      this.countries = data; // Store the results
      if (data.length > 0) {
        this.fetchWeatherByLocation(data[0].lat, data[0].lon); // Fetch weather for the first result
      }
    });
  }

  // Add this method to handle search on icon click
  onSearch() {
    this.searchCountry(this.searchQuery); // Call searchCountry with the current query
  }

  // Add this method to get the current location
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        this.fetchWeatherByLocation(latitude, longitude); // Fetch weather using coordinates
      }, (error) => {
        console.error("Error obtaining location: ", error); // Handle error
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  // Add this method to fetch weather data by location
  fetchWeatherByLocation(lat: number, lon: number) {
    const apiKey = 'cf186624c2fb4e49852130220242509';
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;
    
    this.http.get<any>(url).subscribe(data => {
      this.countries = [data.location]; // Store the location data
      this.baseTemperatureCelsius = data.current.temp_c; // Update base temperature
      this.dateTime = new Date(data.location.localtime).toLocaleString(); // Update dateTime
    });
  }
}
