import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
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
