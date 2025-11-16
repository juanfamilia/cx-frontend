/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

// 🚨 DEBUG CRÍTICO - Ver qué environment se carga
console.log('🚨🚨🚨 MAIN.TS - Environment:', environment);
console.log('🚨🚨🚨 MAIN.TS - API URL:', environment.apiUrl);

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));

