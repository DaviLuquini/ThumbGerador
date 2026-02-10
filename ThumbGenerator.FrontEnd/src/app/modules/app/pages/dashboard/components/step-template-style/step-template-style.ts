import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateId } from '../../../../../../core/models/templa.type';
import { TemplateConfig } from '../../../../../../core/models/template-config';

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
  @Input() promptText = '';

  get templateConfig(): TemplateConfig {
    return TemplateConfig.get(this.selectedTemplateId);
  }

  @Output() templateSelected = new EventEmitter<TemplateId>();
  @Output() enhanceToggled = new EventEmitter<void>();
  @Output() toneChanged = new EventEmitter<string>();
  @Output() promptChanged = new EventEmitter<string>();

  toneOptions: { id: string; label: string; image: string }[] = [
    {
      id: 'entusiasmado',
      label: 'Entusiasmado / Viral',
      image:
        'assets/images/templates-faixa-vermelha-tons/template-faixa-vermelha-viral.jpg',
    },
    {
      id: 'serio',
      label: 'Sério / Notícia',
      image:
        'assets/images/templates-faixa-vermelha-tons/template-faixa-vermelha-serio.jpg',
    },
    {
      id: 'curiosidade',
      label: 'Misterioso / Curiosidade',
      image:
        'assets/images/templates-faixa-vermelha-tons/template-faixa-vermelha-curiosidade.jpg',
    },
    {
      id: 'gordinho',
      label: 'Gordinho / Engraçado',
      image:
        'assets/images/templates-faixa-vermelha-tons/template-faixa-vermelha-gordinho.jpg',
    },
  ];
  selectedTone = 'entusiasmado';
  onSelectTone(toneId: string) {
    this.selectedTone = toneId;
    this.toneChanged.emit(toneId);
  }

  onPromptChange(value: string) {
    this.promptText = value;
    this.promptChanged.emit(value);
  }

  @Input() isVertical = true;
  toggleOrientation() {
    this.isVertical = !this.isVertical;
  }
}
