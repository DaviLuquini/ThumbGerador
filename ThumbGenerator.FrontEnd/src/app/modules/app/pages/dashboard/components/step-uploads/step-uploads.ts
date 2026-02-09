import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-step-uploads',
  imports: [CommonModule],
  templateUrl: './step-uploads.html',
  styleUrl: './step-uploads.scss',
})
export class DashboardStepUploads {
  @Input() isVertical = true;
  @Output() videoFileSelected = new EventEmitter<File | null>();
  @Output() personFileSelected = new EventEmitter<File | null>();
  @Output() orientationToggled = new EventEmitter<void>();

  isDraggingVideo = false;
  isDraggingPerson = false;

  openFilePicker(input: HTMLInputElement) {
    // Permite selecionar o mesmo arquivo novamente e ainda disparar change.
    input.value = '';
    input.click();
  }

  onPickVideo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.videoFileSelected.emit(input.files?.[0] ?? null);
  }

  onPickPerson(event: Event) {
    const input = event.target as HTMLInputElement;
    this.personFileSelected.emit(input.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragEnter(kind: 'video' | 'person', event: DragEvent) {
    event.preventDefault();
    if (kind === 'video') this.isDraggingVideo = true;
    else this.isDraggingPerson = true;
  }

  onDragLeave(kind: 'video' | 'person', event: DragEvent) {
    event.preventDefault();
    if (kind === 'video') this.isDraggingVideo = false;
    else this.isDraggingPerson = false;
  }

  onDrop(kind: 'video' | 'person', event: DragEvent) {
    event.preventDefault();

    const file = event.dataTransfer?.files?.[0] ?? null;
    if (kind === 'video') {
      this.isDraggingVideo = false;
      this.videoFileSelected.emit(file);
    } else {
      this.isDraggingPerson = false;
      this.personFileSelected.emit(file);
    }
  }
}
