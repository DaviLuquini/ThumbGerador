import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  themeService = inject(ThemeService);

  @Input() title: string = '';
  @Input() subtitle: string = '';

  @Output() menuToggled = new EventEmitter<void>();

  toggleTheme() {
    this.themeService.toggle();
  }
}
