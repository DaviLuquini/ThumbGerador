import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    isDark = signal<boolean>(true);

    constructor() {
        // Check initial preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            this.isDark.set(savedTheme === 'dark');
        } else {
            this.isDark.set(prefersDark);
        }

        // Apply effect to update DOM
        effect(() => {
            const isDark = this.isDark();
            const html = document.documentElement;

            if (isDark) {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    toggle() {
        this.isDark.update(v => !v);
    }
}
