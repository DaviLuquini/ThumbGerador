import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-step-uploads',
  imports: [CommonModule],
  templateUrl: './step-uploads.html',
  styleUrl: './step-uploads.scss',
})
export class DashboardStepUploads {
  @Output() videoFileSelected = new EventEmitter<File | null>();
  @Output() personFileSelected = new EventEmitter<File | null>();

  onPickVideo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.videoFileSelected.emit(input.files?.[0] ?? null);
  }

  onPickPerson(event: Event) {
    const input = event.target as HTMLInputElement;
    this.personFileSelected.emit(input.files?.[0] ?? null);
  }
}
