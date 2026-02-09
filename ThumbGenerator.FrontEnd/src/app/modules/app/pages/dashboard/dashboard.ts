import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThumbnailService } from '../../../../core/services/thumbnail.service';
import { CommonModule } from '@angular/common';
import { TemplateId } from '../../../../core/models/templa.type';
import { TemplateConfig } from '../../../../core/models/template-config';
import { DashboardStepUploads } from './components/step-uploads/step-uploads';
import { DashboardStepTextConfig } from './components/step-text-config/step-text-config';
import { DashboardStepTemplateStyle } from './components/step-template-style/step-template-style';
import { DashboardPreview } from './components/dashboard-preview/dashboard-preview';
import { Sidebar } from '../components/sidebar/sidebar';
import { Header } from '../components/header/header';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    DashboardStepTextConfig,
    DashboardStepTemplateStyle,
    DashboardStepUploads,
    DashboardPreview,
    Sidebar,
    Header,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private thumbnailService = inject(ThumbnailService);

  selectedTemplateId: TemplateId = 'faixa-vermelha';
  enhanceAi = false;
  isVertical = true;
  videoFile: File | null = null;
  personFile: File | null = null;
  title = '';
  promptText = '';

  toggleOrientation() {
    this.isVertical = !this.isVertical;
    // Reset to first template of new orientation
    if (this.isVertical) {
      this.selectedTemplateId = 'faixa-vermelha';
    } else {
      this.selectedTemplateId = 'youtube-classico';
    }
    // Reset enhance and prompt
    this.enhanceAi = false;
    this.promptText = '';
  }

  isGenerating = signal(false);
  generatedImageUrl = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

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

  get canGenerate(): boolean {
    if (this.selectedTemplateId === 'prompt') {
      return !!this.promptText.trim();
    }
    return !!(this.videoFile || this.personFile);
  }

  generateThumbnail(): void {
    if (!this.canGenerate || this.isGenerating()) return;

    this.isGenerating.set(true);
    this.errorMessage.set(null);
    this.generatedImageUrl.set(null);

    this.thumbnailService.generate({
      templateId: this.selectedTemplateId,
      videoImage: this.videoFile ?? undefined,
      personImage: this.personFile ?? undefined,
      title: this.title || undefined,
      prompt: this.promptText || undefined,
      enhanceWithAi: this.enhanceAi
    }).subscribe({
      next: (response) => {
        this.isGenerating.set(false);
        this.generatedImageUrl.set(
          this.thumbnailService.getFullImageUrl(response.imageUrl)
        );
      },
      error: (err) => {
        this.isGenerating.set(false);
        if (err.status === 402) {
          this.errorMessage.set('Créditos insuficientes. Adquira mais créditos para continuar.');
        } else {
          this.errorMessage.set(err.error?.error || 'Erro ao gerar thumbnail. Tente novamente.');
        }
      }
    });
  }
}
