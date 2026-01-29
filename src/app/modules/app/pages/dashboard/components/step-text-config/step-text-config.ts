import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-step-text-config',
  imports: [CommonModule],
  templateUrl: './step-text-config.html',
  styleUrl: './step-text-config.scss',
})
export class DashboardStepTextConfig {
  @Input() title = '';
  @Output() titleChanged = new EventEmitter<string>();

  onTitleChange(value: string) {
    this.titleChanged.emit(value);
  }
}
