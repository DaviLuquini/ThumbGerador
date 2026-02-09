
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThumbnailService, ThumbnailHistoryItem } from '../../../../core/services/thumbnail.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Sidebar } from '../components/sidebar/sidebar';
import { Header } from '../components/header/header';

@Component({
  selector: 'app-history',

  imports: [CommonModule, RouterLink, Sidebar, Header],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  private thumbnailService = inject(ThumbnailService);

  // Use a signal for better reactivity, handling the observable automatically
  history = toSignal(this.thumbnailService.getHistory(), { initialValue: [] });

  getFullImageUrl(url: string): string {
    return this.thumbnailService.getFullImageUrl(url);
  }
}
