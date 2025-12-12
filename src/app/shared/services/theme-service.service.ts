import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeServiceService {
  darkMode = signal(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme() {
    const ThemeModeStored = localStorage.getItem('theme');
    const prefersDark: boolean = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const shouldBeDark: boolean =
      ThemeModeStored === 'dark' || (!ThemeModeStored && prefersDark);

    this.setTheme(shouldBeDark);
  }

  setTheme(isDark: boolean) {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    this.darkMode.set(isDark);
  }

  toggleTheme() {
    this.setTheme(!this.darkMode());
  }
}
