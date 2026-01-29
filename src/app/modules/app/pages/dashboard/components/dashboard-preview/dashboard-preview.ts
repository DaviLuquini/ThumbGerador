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

  readonly W = 1080;
  readonly H = 1920;

  readonly TOP: Rect = { x: 0, y: 0, width: this.W, height: 1080 };
  readonly BANNER: Rect = { x: 0, y: 420, width: this.W, height: 1280 };
  readonly BOTTOM: Rect = { x: 0, y: 1100, width: this.W, height: 820 };

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
    const width = this.stageHost.nativeElement.clientWidth || 320;
    const scale = width / this.W;
    const previewHeight = this.H * scale;

    this.stageHost.nativeElement.style.height = `${previewHeight}px`;

    this.stage = new Konva.Stage({
      container: this.stageHost.nativeElement,
      width,
      height: previewHeight,
    });

    this.stage.scale({ x: scale, y: scale });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
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
        const img = await loadHtmlImage('assets/images/template-faixa-vermelha.png');
        this.templateKonvaImg = new Konva.Image({
          x: 0,
          y: 0,
          width: this.W,
          height: this.H,
          image: img,
          listening: false,
        });
      } catch (err) {
        console.warn('Template image failed to load:', err);
      }

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
    if (this.templateKonvaImg) this.layer.add(this.templateKonvaImg);
    this.layer.add(this.videoGroup);
    this.layer.add(this.personGroup);
    if (this.bannerImg) this.layer.add(this.bannerImg);
    this.layer.add(this.titleText);
    this.layer.batchDraw();
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
