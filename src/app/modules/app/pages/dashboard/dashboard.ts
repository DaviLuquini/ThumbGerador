import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { TemplateId } from '../../../../core/models/templa.type';
import { DashboardStepUploads } from './components/step-uploads/step-uploads';
import { DashboardStepTextConfig } from './components/step-text-config/step-text-config';
import { DashboardStepTemplateStyle } from './components/step-template-style/step-template-style';
import { DashboardPreview } from './components/dashboard-preview/dashboard-preview';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    DashboardStepTextConfig,
    DashboardStepTemplateStyle,
    DashboardStepUploads,
    DashboardPreview,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  themeService = inject(ThemeService);
  selectedTemplateId: TemplateId = 'faixa-vermelha';
  enhanceAi = false;
  videoFile: File | null = null;
  personFile: File | null = null;
  title = '';

  private readonly lowCostTemplateIds = new Set<TemplateId>(['faixa-vermelha']);

  selectTemplate(id: TemplateId) {
    this.selectedTemplateId = id;
    if (!this.isLowCostTemplate) this.enhanceAi = false;
  }

  toggleEnhanceAi() {
    this.enhanceAi = !this.enhanceAi;
  }

  onVideoFileSelected(file: File | null) {
    this.videoFile = file;
  }

  onPersonFileSelected(file: File | null) {
    this.personFile = file;
  }

  onTitleChanged(value: string) {
    this.title = value;
  }

  get isLowCostTemplate(): boolean {
    return this.lowCostTemplateIds.has(this.selectedTemplateId);
  }

  get showEnhanceOption(): boolean {
    return this.isLowCostTemplate;
  }
}
