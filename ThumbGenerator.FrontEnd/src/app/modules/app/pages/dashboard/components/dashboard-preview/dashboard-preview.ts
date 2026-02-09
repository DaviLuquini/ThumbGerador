import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';
import { TemplateId } from '../../../../../../core/models/templa.type';

type Rect = { x: number; y: number; width: number; height: number };

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fileToObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

function coverFit(imgW: number, imgH: number, rectW: number, rectH: number) {
  const scale = Math.max(rectW / imgW, rectH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  const x = (rectW - w) / 2;
  const y = (rectH - h) / 2;
  return { x, y, width: w, height: h };
}

function fitFontSize(params: {
  text: string;
  maxWidth: number;
  maxHeight: number;
  fontFamily: string;
  fontWeight: number;
  strokeWidth: number;
  startSize?: number;
  minSize?: number;
}) {
  const { text, maxWidth, maxHeight, fontFamily, fontWeight, strokeWidth } = params;
  const startSize = params.startSize ?? 140;
  const minSize = params.minSize ?? 36;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  let size = startSize;

  while (size >= minSize) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    const w = ctx.measureText(text).width + strokeWidth * 2;
    const h = size * 1.1;

    if (w <= maxWidth && h <= maxHeight) return size;
    size -= 2;
  }
  return minSize;
}

@Component({
  selector: 'app-dashboard-preview',
  imports: [CommonModule],
  templateUrl: './dashboard-preview.html',
  styleUrl: './dashboard-preview.scss',
})
export class DashboardPreview implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('stageHost', { static: true }) stageHost!: ElementRef<HTMLDivElement>;

  @Input() videoFile: File | null = null;
  @Input() personFile: File | null = null;
  @Input() title = '';
  @Input() selectedTemplateId: TemplateId = 'faixa-vermelha';
  @Input() enhanceAi = false;
  @Input() isVertical = true;

  // Dimensões base para vertical (9:16)
  W = 1080;
  H = 1920;

  TOP: Rect = { x: 0, y: 0, width: this.W, height: 1080 };
  BANNER: Rect = { x: 0, y: 420, width: this.W, height: 1280 };
  BOTTOM: Rect = { x: 0, y: 1100, width: this.W, height: 820 };

  private updateDimensions() {
    if (this.isVertical) {
      // 9:16
      this.W = 1080;
      this.H = 1920;
      this.TOP = { x: 0, y: 0, width: this.W, height: 1080 };
      this.BANNER = { x: 0, y: 420, width: this.W, height: 1280 };
      this.BOTTOM = { x: 0, y: 1100, width: this.W, height: 820 };
    } else {
      // 16:9
      this.W = 1920;
      this.H = 1080;
      this.TOP = { x: 0, y: 0, width: 960, height: this.H };
      this.BANNER = { x: 320, y: 0, width: 1280, height: this.H };
      this.BOTTOM = { x: 960, y: 0, width: 960, height: this.H };
    }
  }

  private stage?: Konva.Stage;
  private layer?: Konva.Layer;

  private bgRect?: Konva.Rect;
  private templateKonvaImg?: Konva.Image;
  private bannerImg?: Konva.Image;

  private videoGroup?: Konva.Group;
  private personGroup?: Konva.Group;
  private videoKonvaImg?: Konva.Image;
  private personKonvaImg?: Konva.Image;
  private titleText?: Konva.Text;
  private placeholderText?: Konva.Text;

  private videoObjectURL?: string;
  private personObjectURL?: string;

  async ngAfterViewInit() {
    this.initStage();
    this.renderStaticLayout();
    await this.applyTemplateAssets();
    this.updateTitle();
    await this.updateVideoImage();
    await this.updatePersonImage();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!this.stage) return;

    if (changes['isVertical']) {
      this.updateDimensions();
      this.initStage();
      // createStage (called by initStage via setTimeout) will handle all rendering
      return;
    }

    if (changes['selectedTemplateId']) {
      await this.applyTemplateAssets();
    }

    if (changes['title']) {
      this.updateTitle();
    }

    if (changes['videoFile']) {
      await this.updateVideoImage();
    }

    if (changes['personFile']) {
      await this.updatePersonImage();
    }
  }

  ngOnDestroy() {
    if (this.videoObjectURL) URL.revokeObjectURL(this.videoObjectURL);
    if (this.personObjectURL) URL.revokeObjectURL(this.personObjectURL);
    this.stage?.destroy();
  }

  private initStage() {
    // Destroy existing stage if any
    if (this.stage) {
      this.stage.destroy();
      this.stage = undefined;
      this.layer = undefined;
    }

    // Clear any previous inline styles
    this.stageHost.nativeElement.style.height = '';
    this.stageHost.nativeElement.style.width = '';

    // Use setTimeout to ensure CSS has applied the new aspect ratio
    setTimeout(() => {
      this.createStage();
    }, 0);
  }

  private createStage() {
    const containerWidth = this.stageHost.nativeElement.clientWidth || 300;

    // Calculate height based on aspect ratio (don't rely on CSS-computed height)
    const aspectRatio = this.isVertical ? (16 / 9) : (9 / 16);
    const containerHeight = containerWidth * aspectRatio;

    const scale = containerWidth / this.W;

    this.stageHost.nativeElement.style.height = `${containerHeight}px`;

    this.stage = new Konva.Stage({
      container: this.stageHost.nativeElement,
      width: containerWidth,
      height: containerHeight,
    });

    this.stage.scale({ x: scale, y: scale });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    // Re-render after stage is created
    this.renderStaticLayout();
    this.applyTemplateAssets();
    this.updateTitle();
    this.updateVideoImage();
    this.updatePersonImage();
  }

  private renderStaticLayout() {
    if (!this.layer) return;

    this.bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.W,
      height: this.H,
      fill: '#000',
      listening: false,
    });

    this.videoGroup = new Konva.Group({
      x: this.TOP.x,
      y: this.TOP.y,
      clip: { x: 0, y: 0, width: this.TOP.width, height: this.TOP.height },
      listening: false,
    });

    this.personGroup = new Konva.Group({
      x: this.BOTTOM.x,
      y: this.BOTTOM.y,
      clip: { x: 0, y: 0, width: this.BOTTOM.width, height: this.BOTTOM.height },
      listening: false,
    });

    this.titleText = new Konva.Text({
      x: this.BANNER.x + 40,
      y: this.BANNER.y + 20,
      width: this.BANNER.width - 80,
      height: this.BANNER.height - 40,
      text: '',
      fontFamily: 'Space Grotesk',
      fontStyle: '700',
      fontSize: 110,
      align: 'center',
      verticalAlign: 'middle',
      fill: '#fff',
      stroke: '#000',
      strokeWidth: 4,
      lineJoin: 'round',
      draggable: false,
    });

    this.placeholderText = new Konva.Text({
      x: 0,
      y: 0,
      width: this.W,
      height: this.H,
      text: 'Preview será gerado aqui',
      fontFamily: 'Space Grotesk',
      fontStyle: '600',
      fontSize: 48,
      align: 'center',
      verticalAlign: 'middle',
      fill: '#ffffff',
      listening: false,
    });

    this.rebuildLayer();
  }

  private async applyTemplateAssets() {
    if (!this.layer) return;

    if (this.templateKonvaImg) {
      this.templateKonvaImg.destroy();
      this.templateKonvaImg = undefined;
    }
    if (this.bannerImg) {
      this.bannerImg.destroy();
      this.bannerImg = undefined;
    }

    if (this.selectedTemplateId === 'faixa-vermelha') {
      try {
        const bannerImg = await loadHtmlImage('assets/images/faixa-vermelha.png');
        this.bannerImg = new Konva.Image({
          x: this.BANNER.x,
          y: this.BANNER.y,
          width: this.BANNER.width,
          height: this.BANNER.height,
          image: bannerImg,
          draggable: false,
        });
      } catch (err) {
        console.warn('Banner image failed to load:', err);
      }
    }

    this.rebuildLayer();
  }

  private rebuildLayer() {
    if (!this.layer || !this.bgRect || !this.videoGroup || !this.personGroup || !this.titleText) return;

    this.layer.removeChildren();
    this.layer.add(this.bgRect);
    if (this.isPromptTemplate) {
      if (this.placeholderText) this.layer.add(this.placeholderText);
      this.layer.batchDraw();
      return;
    }

    this.layer.add(this.videoGroup);
    this.layer.add(this.personGroup);
    if (this.bannerImg) this.layer.add(this.bannerImg);
    this.layer.add(this.titleText);
    this.layer.batchDraw();
  }

  private get isPromptTemplate(): boolean {
    return this.selectedTemplateId === 'prompt';
  }

  private updateTitle() {
    if (!this.titleText) return;

    const value = (this.title || 'SEU TÍTULO AQUI').toUpperCase();
    const fontSize = fitFontSize({
      text: value,
      maxWidth: this.BANNER.width - 80,
      maxHeight: this.BANNER.height - 40,
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      strokeWidth: 6,
      startSize: 140,
      minSize: 36,
    });

    this.titleText.text(value);
    this.titleText.fontSize(fontSize);
    this.layer?.batchDraw();
  }

  private async updateVideoImage() {
    if (!this.videoGroup) return;

    if (!this.videoFile) {
      if (this.videoKonvaImg) {
        this.videoKonvaImg.destroy();
        this.videoKonvaImg = undefined;
        this.layer?.batchDraw();
      }
      return;
    }

    if (this.videoObjectURL) URL.revokeObjectURL(this.videoObjectURL);
    this.videoObjectURL = fileToObjectURL(this.videoFile);

    const img = await loadHtmlImage(this.videoObjectURL);
    this.setImageInGroup('video', img, this.videoGroup, this.TOP);
  }

  private async updatePersonImage() {
    if (!this.personGroup) return;

    if (!this.personFile) {
      if (this.personKonvaImg) {
        this.personKonvaImg.destroy();
        this.personKonvaImg = undefined;
        this.layer?.batchDraw();
      }
      return;
    }

    if (this.personObjectURL) URL.revokeObjectURL(this.personObjectURL);
    this.personObjectURL = fileToObjectURL(this.personFile);

    const img = await loadHtmlImage(this.personObjectURL);
    this.setImageInGroup('person', img, this.personGroup, this.BOTTOM);
  }

  private setImageInGroup(kind: 'video' | 'person', img: HTMLImageElement, group: Konva.Group, rect: Rect) {
    if (kind === 'video' && this.videoKonvaImg) {
      this.videoKonvaImg.destroy();
      this.videoKonvaImg = undefined;
    }
    if (kind === 'person' && this.personKonvaImg) {
      this.personKonvaImg.destroy();
      this.personKonvaImg = undefined;
    }

    const t = coverFit(img.width, img.height, rect.width, rect.height);

    const kImg = new Konva.Image({
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      image: img,
      draggable: false,
    });

    group.add(kImg);

    if (kind === 'video') this.videoKonvaImg = kImg;
    else this.personKonvaImg = kImg;

    this.layer?.batchDraw();
  }
}
