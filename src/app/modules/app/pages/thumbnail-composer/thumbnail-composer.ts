import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from "@angular/core";
import Konva from "konva";

type Rect = { x: number; y: number; width: number; height: number };

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function fileToObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

// cover fit (tipo CSS background-size: cover)
function coverFit(imgW: number, imgH: number, rectW: number, rectH: number) {
  const scale = Math.max(rectW / imgW, rectH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  const x = (rectW - w) / 2;
  const y = (rectH - h) / 2;
  return { x, y, width: w, height: h };
}

// auto-fit do texto pra caber no banner
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

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
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
  selector: "app-thumbnail-composer",
  templateUrl: "./thumbnail-composer.html",
  styleUrls: ["./thumbnail-composer.scss"],
})
export class ThumbnailComposer implements AfterViewInit, OnDestroy {
  @ViewChild("stageHost", { static: true }) stageHost!: ElementRef<HTMLDivElement>;

  // ===== Config do template  =====
  readonly W = 1080;
  readonly H = 1920;

  // Ajuste de áreas conforme seu template
  readonly TOP: Rect = { x: 0, y: 0, width: this.W, height: 1080 };
  readonly BANNER: Rect = { x: 0, y: 420, width: this.W, height: 1280 };
  readonly BOTTOM: Rect = { x: 0, y: 1100, width: this.W, height: 820 };

  // Template overlay (PNG idealmente com transparência)
  readonly TEMPLATE_URL = "assets/images/thumbnail-template.png";

  // Preview responsivo (tamanho na tela)
  previewWidth = 360;

  title = "SEU TÍTULO AQUI";

  private stage?: Konva.Stage;
  private layer?: Konva.Layer;

  private templateKonvaImg?: Konva.Image;

  private videoGroup?: Konva.Group;
  private personGroup?: Konva.Group;

  private videoKonvaImg?: Konva.Image;
  private personKonvaImg?: Konva.Image;

  private bannerImg?: Konva.Image; // imagem do banner
  private titleText?: Konva.Text;

  private videoObjectURL?: string;
  private personObjectURL?: string;

  async ngAfterViewInit() {
    this.initStage();
    await this.loadTemplate();
    this.renderStaticLayout();
    this.redraw();
  }

  ngOnDestroy() {
    if (this.videoObjectURL) URL.revokeObjectURL(this.videoObjectURL);
    if (this.personObjectURL) URL.revokeObjectURL(this.personObjectURL);
    this.stage?.destroy();
  }

  private initStage() {
    const scale = this.previewWidth / this.W;
    const previewHeight = this.H * scale;

    this.stage = new Konva.Stage({
      container: this.stageHost.nativeElement,
      width: this.previewWidth,
      height: previewHeight,
    });

    // Escala interna para que possamos usar as coordenadas de 1080x1920
    this.stage.scale({ x: scale, y: scale });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  private async loadTemplate() {
    // Carrega template
    try {
      const img = await loadHtmlImage(this.TEMPLATE_URL);
      this.templateKonvaImg = new Konva.Image({
        x: 0,
        y: 0,
        width: this.W,
        height: this.H,
        image: img,
        listening: false,
      });
    } catch (err) {
      console.warn('Template image failed to load:', this.TEMPLATE_URL, err);
    }

    // Carrega banner (faixa vermelha)
    try {
      const bannerImg = await loadHtmlImage("assets/images/faixa-vermelha.png");
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

  private renderStaticLayout() {
    if (!this.layer) return;

    // fundo (opcional)
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.W,
      height: this.H,
      fill: "#000",
      listening: false,
    });

    // Groups com clip para recortar conteúdo dentro das áreas
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

    // Banner vermelho - imagem PNG
    // A imagem do banner será carregada no loadTemplate

    // Texto
    this.titleText = new Konva.Text({
      x: this.BANNER.x + 40,
      y: this.BANNER.y + 20,
      width: this.BANNER.width - 40,
      height: this.BANNER.height - 20,
      text: this.title.toUpperCase(),
      fontFamily: "Space Grotesk",
      fontStyle: "700", // Bold para thumbnail
      fontSize: 110,
      align: "center",
      verticalAlign: "middle",
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 4,
      lineJoin: "round",
      draggable: false,
    });

    // ORDEM CORRETA das camadas:
    // 1. Background preto
    // 2. Template (se tiver transparência, senão será o fundo)
    // 3. Áreas de imagem (video e person)
    // 4. Banner (imagem)
    // 5. Texto do título
    this.layer.add(bg);
    if (this.templateKonvaImg) this.layer.add(this.templateKonvaImg);
    this.layer.add(this.videoGroup);
    this.layer.add(this.personGroup);
    if (this.bannerImg) this.layer.add(this.bannerImg);
    this.layer.add(this.titleText);
  }

  async onPickVideo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.videoGroup) return;

    if (this.videoObjectURL) URL.revokeObjectURL(this.videoObjectURL);
    this.videoObjectURL = fileToObjectURL(file);

    const img = await loadHtmlImage(this.videoObjectURL);
    this.setImageInGroup("video", img, this.videoGroup, this.TOP);
  }

  async onPickPerson(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.personGroup) return;

    if (this.personObjectURL) URL.revokeObjectURL(this.personObjectURL);
    this.personObjectURL = fileToObjectURL(file);

    const img = await loadHtmlImage(this.personObjectURL);
    this.setImageInGroup("person", img, this.personGroup, this.BOTTOM);
  }

  onTitleChange(value: string) {
    this.title = value ?? "";
    if (!this.titleText) return;

    const text = this.title.toUpperCase();
    const fontSize = fitFontSize({
      text,
      maxWidth: this.BANNER.width - 80,
      maxHeight: this.BANNER.height - 40,
      fontFamily: "Space Grotesk",
      fontWeight: 700,
      strokeWidth: 6,
      startSize: 140,
      minSize: 36,
    });

    this.titleText.text(text);
    this.titleText.fontSize(fontSize);
    this.redraw();
  }

  exportPNG() {
    if (!this.stage) return;

    // Export com pixelRatio: 3 para transformar 360x640 em 1080x1920
    const pixelRatio = this.W / this.previewWidth;
    const dataURL = this.stage.toDataURL({ pixelRatio });

    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "thumbnail.png";
    a.click();
  }

  private setImageInGroup(kind: "video" | "person", img: HTMLImageElement, group: Konva.Group, rect: Rect) {
    // remove imagem anterior
    if (kind === "video" && this.videoKonvaImg) {
      this.videoKonvaImg.destroy();
      this.videoKonvaImg = undefined;
    }
    if (kind === "person" && this.personKonvaImg) {
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

    if (kind === "video") this.videoKonvaImg = kImg;
    else this.personKonvaImg = kImg;

    this.redraw();
  }

  private redraw() {
    this.layer?.batchDraw();
  }
}
