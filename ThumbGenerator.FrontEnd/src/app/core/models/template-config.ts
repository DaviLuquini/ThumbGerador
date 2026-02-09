import { TemplateId } from './templa.type';

export type TemplateFeature = {
  step2Title: string;
  showTitleStep: boolean;
  showEnhanceOption: boolean;
  showPromptInput: boolean;
};

export class TemplateConfig {
  constructor(
    public readonly id: TemplateId,
    public readonly label: string,
    public readonly features: TemplateFeature,
  ) { }

  static readonly all: Record<TemplateId, TemplateConfig> = {
    'faixa-vermelha': new TemplateConfig('faixa-vermelha', 'Template Faixa Vermelha', {
      step2Title: 'Estilo do Template',
      showTitleStep: true,
      showEnhanceOption: true,
      showPromptInput: false,
    }),
    prompt: new TemplateConfig('prompt', 'Do zero (Prompt)', {
      step2Title: 'Gerar com Prompt',
      showTitleStep: false,
      showEnhanceOption: false,
      showPromptInput: true,
    }),
    'youtube-classico': new TemplateConfig('youtube-classico', 'YouTube Clássico', {
      step2Title: 'Estilo do Template',
      showTitleStep: true,
      showEnhanceOption: true,
      showPromptInput: false,
    }),
    gaming: new TemplateConfig('gaming', 'Gaming', {
      step2Title: 'Estilo do Template',
      showTitleStep: true,
      showEnhanceOption: true,
      showPromptInput: false,
    }),
  };

  static get(id: TemplateId): TemplateConfig {
    return TemplateConfig.all[id];
  }
}
