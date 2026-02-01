import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { TemplateId } from '../../../../core/models/templa.type';
import { TemplateConfig } from '../../../../core/models/template-config';
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
  promptText = '';

  selectTemplate(id: TemplateId) {
    this.selectedTemplateId = id;
    if (!this.templateConfig.features.showEnhanceOption) this.enhanceAi = false;
    if (!this.templateConfig.features.showPromptInput) this.promptText = '';
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

  onPromptChanged(value: string) {
    this.promptText = value;
  }

  get showEnhanceOption(): boolean {
    return this.templateConfig.features.showEnhanceOption;
  }

  get showTitleStep(): boolean {
    return this.templateConfig.features.showTitleStep;
  }

  get templateConfig(): TemplateConfig {
    return TemplateConfig.get(this.selectedTemplateId);
  }
}
