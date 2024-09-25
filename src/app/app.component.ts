import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Weather } from "./weather/weather.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Weather],
  template: '<app-weather></app-weather>'
})
export class AppComponent {}
