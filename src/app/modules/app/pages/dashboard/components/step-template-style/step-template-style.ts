import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateId } from '../../../../../../core/models/templa.type';

@Component({
  selector: 'app-dashboard-step-template-style',
  imports: [CommonModule],
  templateUrl: './step-template-style.html',
  styleUrl: './step-template-style.scss',
})
export class DashboardStepTemplateStyle {
  @Input() selectedTemplateId: TemplateId = 'faixa-vermelha';
  @Input() showEnhanceOption = false;
  @Input() enhanceAi = false;

  @Output() templateSelected = new EventEmitter<TemplateId>();
  @Output() enhanceToggled = new EventEmitter<void>();
  @Output() toneChanged = new EventEmitter<string>();
  @Output() promptChanged = new EventEmitter<string>();

  toneOptions = [
    { id: 'entusiasmado', label: 'Entusiasmado / Viral' },
    { id: 'serio', label: 'Sério / Notícia' },
    { id: 'misterioso', label: 'Misterioso / Curiosidade' },
    { id: 'educativo', label: 'Educativo / Clean' },
  ];
  selectedTone = 'entusiasmado';
  promptText = '';

  onSelectTone(toneId: string) {
    this.selectedTone = toneId;
    this.toneChanged.emit(toneId);
  }

  onPromptChange(value: string) {
    this.promptText = value;
    this.promptChanged.emit(value);
  }
}
