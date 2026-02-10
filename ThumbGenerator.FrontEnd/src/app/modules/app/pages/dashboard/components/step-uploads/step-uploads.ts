import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-step-uploads',
  imports: [CommonModule],
  templateUrl: './step-uploads.html',
  styleUrl: './step-uploads.scss',
})
export class DashboardStepUploads implements OnDestroy {
  @Input() isVertical = true;
  @Output() videoFileSelected = new EventEmitter<File | null>();
  @Output() personFileSelected = new EventEmitter<File | null>();
  @Output() orientationToggled = new EventEmitter<void>();

  isDraggingVideo = false;
  isDraggingPerson = false;

  firstImageUrl: string | null = null;
  secondImageUrl: string | null = null;

  ngOnDestroy() {
    if (this.firstImageUrl) URL.revokeObjectURL(this.firstImageUrl);
    if (this.secondImageUrl) URL.revokeObjectURL(this.secondImageUrl);
  }

  openFilePicker(input: HTMLInputElement) {
    // Permite selecionar o mesmo arquivo novamente e ainda disparar change.
    input.value = '';
    input.click();
  }

  onPickVideo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.handleVideoFile(file);
  }

  onPickPerson(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.handlePersonFile(file);
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
      this.handleVideoFile(file);
    } else {
      this.isDraggingPerson = false;
      this.handlePersonFile(file);
    }
  }

  private handleVideoFile(file: File | null) {
    if (this.firstImageUrl) URL.revokeObjectURL(this.firstImageUrl);
    this.firstImageUrl = file ? URL.createObjectURL(file) : null;
    this.videoFileSelected.emit(file);
  }

  private handlePersonFile(file: File | null) {
    if (this.secondImageUrl) URL.revokeObjectURL(this.secondImageUrl);
    this.secondImageUrl = file ? URL.createObjectURL(file) : null;
    this.personFileSelected.emit(file);
  }
}
