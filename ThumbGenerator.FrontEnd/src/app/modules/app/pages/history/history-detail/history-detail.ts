import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ThumbnailService, ThumbnailHistoryItem } from '../../../../../core/services/thumbnail.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-history-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history-detail.html',
  styleUrl: './history-detail.scss',
})
export class HistoryDetail {
  private route = inject(ActivatedRoute);
  private thumbnailService = inject(ThumbnailService);
  public authService = inject(AuthService);

  // Use input signal for route params (Angular 18+ feature if enabled, otherwise use route.params)
  // For safety with Angular 20+, we'll use the standard route param observable pattern wrapped in a signal
  thumbnail = toSignal(
    this.route.params.pipe(
      switchMap(params => this.thumbnailService.getById(params['id']))
    )
  );

  getFullImageUrl(url: string | undefined): string {
    if (!url) return '';
    return this.thumbnailService.getFullImageUrl(url);
  }
}
