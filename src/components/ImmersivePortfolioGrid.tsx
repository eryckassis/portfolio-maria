import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Pane } from "tweakpane";
import { cn } from "@/lib/utils";
import { PageReveal } from "./PageReveal";

gsap.registerPlugin(CustomEase);
CustomEase.create("galleryHop", "0.9, 0, 0.1, 1");

const titles = [
  "Chromatic Loopscape",
  "Solar Bloom",
  "Neon Handscape",
  "Echo Discs",
  "Void Gaze",
  "Gravity Sync",
  "Heat Core",
  "Fractal Mirage",
  "Nova Pulse",
  "Sonic Horizon",
  "Dream Circuit",
  "Lunar Mesh",
  "Radiant Dusk",
  "Pixel Drift",
  "Vortex Bloom",
  "Shadow Static",
  "Crimson Phase",
  "Retro Cascade",
  "Photon Fold",
  "Zenith Flow",
];

const images = [
  "https://res.cloudinary.com/dflsuby2u/image/upload/v1777347965/tattoo_yv5qlm.jpg",
  "https://res.cloudinary.com/dflsuby2u/image/upload/v1777347965/tattoooo_i7szsj.jpg",
  "https://res.cloudinary.com/dflsuby2u/image/upload/v1777347965/tato_k98cee.jpg",
  "https://res.cloudinary.com/dflsuby2u/image/upload/v1777347965/tattt_nzcfed.jpg",
  "https://res.cloudinary.com/dflsuby2u/image/upload/v1777347965/tiro_tqak4n.jpg",
  "https://res.cloudinary.com/dflsuby2u/image/upload/v1777348234/atafasf_w8yqo9.jpg",
  "https://res.cloudinary.com/dflsuby2u/image/upload/v1777348235/ave_sm1vzr.jpg",
];

type GalleryItem = {
  id: string;
  col: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
};

type ExpandedItem = GalleryItem & { rect: DOMRect };

type PaneFolder = {
  addBinding: (
    target: GallerySettings,
    key: keyof GallerySettings,
    options: { min: number; max: number; step: number },
  ) => { on: (event: "change", callback: () => void) => void };
};

const columns = 4;
const defaultSettings = {
  baseWidth: 400,
  smallHeight: 330,
  largeHeight: 500,
  itemGap: 65,
  hoverScale: 1.05,
  expandedScale: 0.4,
  dragEase: 0.075,
  bufferZone: 3,
  overlayOpacity: 0.9,
  overlayEaseDuration: 0.8,
  zoomDuration: 0.6,
};

type GallerySettings = typeof defaultSettings;

function getCellWidth(settings: GallerySettings) {
  return settings.baseWidth + settings.itemGap;
}

function getCellHeight(settings: GallerySettings) {
  return Math.max(settings.smallHeight, settings.largeHeight) + settings.itemGap;
}

function getItemSize(row: number, col: number, settings: GallerySettings) {
  return Math.abs((row * columns + col) % 2) === 0
    ? { width: settings.baseWidth, height: settings.smallHeight }
    : { width: settings.baseWidth, height: settings.largeHeight };
}

function getVisibleItems(
  currentX: number,
  currentY: number,
  settings: GallerySettings = defaultSettings,
): GalleryItem[] {
  if (typeof window === "undefined") return [];
  const cellWidth = getCellWidth(settings);
  const cellHeight = getCellHeight(settings);
  const buffer = settings.bufferZone;
  const viewWidth = window.innerWidth * (1 + buffer);
  const viewHeight = window.innerHeight * (1 + buffer);
  const startCol = Math.floor((-currentX - viewWidth / 2) / cellWidth);
  const endCol = Math.ceil((-currentX + viewWidth * 1.5) / cellWidth);
  const startRow = Math.floor((-currentY - viewHeight / 2) / cellHeight);
  const endRow = Math.ceil((-currentY + viewHeight * 1.5) / cellHeight);
  const nextItems: GalleryItem[] = [];

  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      const size = getItemSize(row, col, settings);
      const index = Math.abs((row * columns + col) % titles.length);
      nextItems.push({
        id: `${col},${row}`,
        col,
        row,
        x: col * cellWidth,
        y: row * cellHeight,
        width: size.width,
        height: size.height,
        index,
      });
    }
  }
  return nextItems;
}

// Atualização em tempo real — float com 2 casas decimais
function formatCoordF(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2);
}

export function ImmersivePortfolioGrid() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const expandedRef = useRef<HTMLButtonElement | null>(null);
  const titleRef = useRef<HTMLParagraphElement | null>(null);
  const paneRef = useRef<Pane | null>(null);
  const settingsRef = useRef<GallerySettings>({ ...defaultSettings });
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const pressedItem = useRef<{ item: GalleryItem; element: HTMLButtonElement } | null>(null);

  const coordElsCache = useRef<{ el: HTMLElement; col: number; row: number }[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [expanded, setExpanded] = useState<ExpandedItem | null>(null);
  const [panelVisible, setPanelVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [revealDone, setRevealDone] = useState(false);

  const activeTitle = expanded ? titles[expanded.index] : "";
  const activeWords = useMemo(() => activeTitle.split(" "), [activeTitle]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    coordElsCache.current = Array.from(
      canvasRef.current.querySelectorAll<HTMLElement>(".item-coord"),
    ).map((el) => ({
      el,
      col: Number(el.dataset.col),
      row: Number(el.dataset.row),
    }));
  }, [items]);

  const togglePanel = useCallback(() => {
    setPanelVisible((v) => !v);
    if (paneRef.current) {
      const el = paneRef.current.element;
      el.style.display = el.style.display === "none" ? "" : "none";
    }
  }, []);

  useEffect(() => {
    setItems(getVisibleItems(0, 0, settingsRef.current));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    let frame = 0;
    let lastKey = "";
    const tick = () => {
      const settings = settingsRef.current;
      current.current.x += (target.current.x - current.current.x) * settings.dragEase;
      current.current.y += (target.current.y - current.current.y) * settings.dragEase;

      const cellW = getCellWidth(settings);
      const cellH = getCellHeight(settings);
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;

        const cx = current.current.x;
        const cy = current.current.y;
        coordElsCache.current.forEach(({ el, col, row }) => {
          el.textContent = `[${formatCoordF(col + cx / cellW)}, ${formatCoordF(row + cy / cellH)}]`;
        });
      }

      const col = Math.round(current.current.x / cellW);
      const row = Math.round(current.current.y / cellH);
      const key = `${col}:${row}:${window.innerWidth}:${window.innerHeight}:${settings.baseWidth}:${settings.smallHeight}:${settings.largeHeight}:${settings.itemGap}:${settings.bufferZone}`;
      if (key !== lastKey) {
        lastKey = key;
        setItems(getVisibleItems(current.current.x, current.current.y, settings));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const pane = new Pane({ title: "Gallery Settings", expanded: false });
    const paneControls = pane as unknown as {
      addFolder: (params: { title: string; expanded?: boolean }) => PaneFolder;
      addButton: (params: { title: string }) => { on: (event: "click", cb: () => void) => void };
    };
    paneRef.current = pane;

    pane.element.classList.add("gallery-pane");
    const settings = settingsRef.current;
    const refresh = () =>
      setItems(getVisibleItems(current.current.x, current.current.y, settingsRef.current));

    const sizeFolder = paneControls.addFolder({ title: "Item Sizes", expanded: false });
    sizeFolder
      .addBinding(settings, "baseWidth", { min: 100, max: 600, step: 10 })
      .on("change", refresh);
    sizeFolder
      .addBinding(settings, "smallHeight", { min: 100, max: 400, step: 10 })
      .on("change", refresh);
    sizeFolder
      .addBinding(settings, "largeHeight", { min: 100, max: 600, step: 10 })
      .on("change", refresh);

    const layoutFolder = paneControls.addFolder({ title: "Layout", expanded: false });
    layoutFolder
      .addBinding(settings, "itemGap", { min: 0, max: 100, step: 5 })
      .on("change", refresh);
    layoutFolder
      .addBinding(settings, "bufferZone", { min: 1, max: 5, step: 0.5 })
      .on("change", refresh);

    const animationFolder = paneControls.addFolder({ title: "Animation", expanded: false });
    animationFolder
      .addBinding(settings, "hoverScale", { min: 1, max: 1.5, step: 0.05 })
      .on("change", () => {
        document.documentElement.style.setProperty(
          "--gallery-hover-scale",
          String(settings.hoverScale),
        );
      });
    animationFolder.addBinding(settings, "expandedScale", { min: 0.2, max: 0.8, step: 0.05 });
    animationFolder.addBinding(settings, "dragEase", { min: 0.01, max: 0.2, step: 0.01 });
    animationFolder.addBinding(settings, "zoomDuration", { min: 0.2, max: 1.5, step: 0.1 });

    const overlayFolder = paneControls.addFolder({ title: "Overlay Animation", expanded: false });
    overlayFolder.addBinding(settings, "overlayOpacity", { min: 0, max: 1, step: 0.05 });
    overlayFolder.addBinding(settings, "overlayEaseDuration", { min: 0.2, max: 2, step: 0.1 });

    paneControls.addButton({ title: "Reset View" }).on("click", () => {
      target.current.x = 0;
      target.current.y = 0;
    });

    return () => {
      pane.dispose();
      paneRef.current = null;
    };
  }, [isMounted]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "h") togglePanel();
      if (e.key === "Escape") setExpanded(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePanel]);

  useEffect(() => {
    if (!overlayRef.current) return;
    const settings = settingsRef.current;
    gsap.to(overlayRef.current, {
      opacity: expanded ? settings.overlayOpacity : 0,
      duration: settings.overlayEaseDuration,
      ease: "power2.inOut",
      pointerEvents: expanded ? "auto" : "none",
    });
  }, [expanded]);

  useEffect(() => {
    if (!expanded || !expandedRef.current) return;
    const settings = settingsRef.current;
    const targetWidth = Math.min(window.innerWidth * settings.expandedScale, 760);
    const targetHeight = targetWidth * (expanded.height / expanded.width);
    const x = expanded.rect.left + expanded.width / 2 - window.innerWidth / 2;
    const y = expanded.rect.top + expanded.height / 2 - window.innerHeight / 2;
    gsap.fromTo(
      expandedRef.current,
      { width: expanded.width, height: expanded.height, x, y },
      {
        width: targetWidth,
        height: targetHeight,
        x: 0,
        y: 0,
        duration: settings.zoomDuration,
        ease: "galleryHop",
      },
    );
    gsap.fromTo(
      ".gallery-title-word",
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.08, delay: 0.35, ease: "power3.out" },
    );
  }, [expanded]);

  const closeExpanded = useCallback(() => {
    if (!expanded || !expandedRef.current) {
      setExpanded(null);
      return;
    }
    const settings = settingsRef.current;
    const x = expanded.rect.left + expanded.width / 2 - window.innerWidth / 2;
    const y = expanded.rect.top + expanded.height / 2 - window.innerHeight / 2;
    gsap.to(".gallery-title-word", { yPercent: -110, opacity: 0, duration: 0.55, stagger: 0.04 });
    gsap.to(expandedRef.current, {
      width: expanded.width,
      height: expanded.height,
      x,
      y,
      duration: settings.zoomDuration,
      ease: "galleryHop",
      onComplete: () => setExpanded(null),
    });
  }, [expanded]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (expanded) return;
    drag.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originX: target.current.x,
      originY: target.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || expanded) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.current.moved = true;
    target.current.x = drag.current.originX + dx;
    target.current.y = drag.current.originY + dy;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (!drag.current.moved && !expanded && pressedItem.current) {
      const { item, element } = pressedItem.current;
      setExpanded({ ...item, rect: element.getBoundingClientRect() });
    }
    drag.current.active = false;
    pressedItem.current = null;
  };

  const markPressedItem = (item: GalleryItem, e: React.PointerEvent<HTMLButtonElement>) => {
    pressedItem.current = { item, element: e.currentTarget };
  };

  return (
    <main
      className="immersive-portfolio relative min-h-screen overflow-hidden bg-gallery-ink text-gallery-text select-none"
      aria-label="Infinite editorial portfolio gallery"
    >
      {!revealDone && <PageReveal onComplete={() => setRevealDone(true)} />}
      <div
        className={cn(
          "absolute inset-0 z-[10002] pointer-events-none",
          "transition-[opacity,transform] duration-[350ms] ease-[ease] motion-reduce:transition-none",
          panelVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        )}
      >
        <header
          className="absolute left-0 top-0 w-screen grid grid-cols-12 gap-x-4 p-6 pointer-events-none max-[820px]:grid-cols-6 max-[820px]:p-4"
          aria-label="Studio information"
        >
          <div className="col-start-1 col-span-3 max-[820px]:col-span-2">
            <button
              className="relative w-12 h-6 border-0 bg-transparent cursor-pointer pointer-events-auto group focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-4"
              type="button"
              aria-label="Toggle panel"
              onClick={togglePanel}
            >
              <span className="absolute top-1/2 left-0 -translate-y-1/2 w-[1.4rem] h-[1.4rem] rounded-full bg-gallery-text transition-transform duration-300 ease-[ease] group-hover:-translate-x-2 motion-reduce:transition-none" />
              <span className="absolute top-1/2 left-[0.8rem] -translate-y-1/2 w-[1.4rem] h-[1.4rem] rounded-full bg-gallery-text mix-blend-exclusion transition-transform duration-300 ease-[ease] group-hover:translate-x-2 motion-reduce:transition-none" />
            </button>
          </div>

          <nav className="col-start-5 col-span-2 max-[820px]:hidden" aria-label="Portfolio values">
            <h2 className=" gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] mb-4">
              +Menu
            </h2>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline"
              href="mailto:hi@filip.fyi"
            >
              Clarity
            </a>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline"
              href="mailto:hi@filip.fyi"
            >
              Simplicity
            </a>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline"
              href="mailto:hi@filip.fyi"
            >
              Creativity
            </a>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline"
              href="mailto:hi@filip.fyi"
            >
              Authenticity
            </a>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline"
              href="mailto:hi@filip.fyi"
            >
              Connect
            </a>
          </nav>

          <section className="col-start-7 col-span-2 max-[820px]:hidden" aria-label="Location">
            <h2 className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] mb-4">
              +Endereço
            </h2>
            <p className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25]">
              Poços de Caldas -MG
            </p>
            <p className="block text-gallery-text text-sm font-[650] leading-[1.25]">
              Minas Gerais
            </p>
            <p className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25]">
              Poços de Caldas 90028
            </p>
          </section>

          <section
            className="col-start-9 col-span-2 max-[820px]:col-start-4 max-[820px]:col-span-3 max-[820px]:text-right"
            aria-label="Contact"
          >
            <h2 className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] mb-4">
              +Marque seu Horario
            </h2>
            <p className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25]">
              (+55) 35 8705-7922
            </p>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline max-[820px]:ml-auto"
              href="mailto:hi@filip.fyi"
            >
              @mari
            </a>
          </section>

          <nav
            className="col-start-11 col-span-2 text-right max-[820px]:hidden"
            aria-label="Social links"
          >
            <h2 className="block text-gallery-text text-sm font-[650] leading-[1.25] mb-4">
              +Social
            </h2>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline ml-auto"
              href="https://instagram.com/mari_tattooart_"
            >
              Instagram
            </a>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline ml-auto"
              href="#"
            >
              X / Twitter
            </a>
            <a
              className="gallery-nav-link block text-gallery-text text-sm font-[650] leading-[1.25] no-underline ml-auto"
              href="#"
            >
              LinkedIn
            </a>
          </nav>
        </header>

        <footer className="absolute left-0 bottom-0 w-screen grid grid-cols-12 gap-x-4 p-6 pointer-events-none items-end max-[820px]:grid-cols-6 max-[820px]:p-4">
          <p className="col-start-1 col-span-3 font-mono block text-gallery-text text-sm font-[650] leading-[1.25]">
            34.0522° N, 118.2437° W
          </p>
          <p className="col-start-5 col-span-4 text-center block text-gallery-text text-sm font-[650] leading-[1.25] max-[820px]:col-start-4 max-[820px]:col-span-3 max-[820px]:text-right">
            Press{" "}
            <kbd className="inline-flex min-w-[1.25rem] h-[1.25rem] items-center justify-center border border-gallery-text rounded-[0.1875rem] font-mono text-xs">
              H
            </kbd>{" "}
            to toggle panel
          </p>
          <p className="col-start-9 col-span-4 text-right block text-gallery-text text-sm font-[650] leading-[1.25] max-[820px]:hidden">
            Est. 2026 • Tatuadora Profissional
          </p>
        </footer>
      </div>

      <section
        className="gallery-container relative w-screen h-screen overflow-hidden cursor-grab touch-none active:cursor-grabbing data-[expanded=true]:cursor-auto"
        data-expanded={expanded ? "true" : undefined}
        aria-label="Draggable image canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={canvasRef} className="absolute top-0 left-0 will-change-transform">
          {items.map((item) => (
            <button
              aria-label={`Open ${titles[item.index]}`}
              className="gallery-item absolute overflow-hidden p-0 border-0 rounded-none bg-gallery-surface cursor-pointer transition-[opacity,filter] duration-500 ease-[ease] data-[active-hidden=true]:opacity-0 group focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-4 motion-reduce:transition-none"
              data-active-hidden={expanded?.id === item.id ? "true" : undefined}
              key={item.id}
              onClick={(e) => e.preventDefault()}
              onPointerDown={(e) => markPressedItem(item, e)}
              style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
              type="button"
            >
              <span className="gallery-item-image-wrap relative block w-full h-full overflow-hidden">
                <img
                  src={images[item.index % images.length]}
                  alt={`${titles[item.index]} artwork`}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none transition-[transform,filter] duration-[320ms] ease-[ease] group-hover:scale-[var(--gallery-hover-scale)] group-hover:contrast-[1.08] group-hover:saturate-[1.08] group-focus-visible:scale-[var(--gallery-hover-scale)] group-focus-visible:contrast-[1.08] group-focus-visible:saturate-[1.08] motion-reduce:transition-none"
                />
              </span>

              <span className="absolute left-0 bottom-0 z-[2] grid gap-[0.125rem] w-full p-[0.625rem] text-left">
                <span className="text-gallery-text text-xs font-[650] leading-[1.15] uppercase">
                  {titles[item.index]}
                </span>
                <span
                  className="item-coord text-gallery-dim font-mono text-[0.625rem] leading-[1.2]"
                  data-col={item.col}
                  data-row={item.row}
                />
              </span>
            </button>
          ))}
        </div>
      </section>

      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999] bg-gallery-overlay opacity-0 pointer-events-none"
        onClick={closeExpanded}
      />

      {expanded && (
        <button
          ref={expandedRef}
          className="fixed top-1/2 left-1/2 z-[10000] overflow-hidden p-0 border-0 bg-gallery-surface cursor-pointer -translate-x-1/2 -translate-y-1/2 shadow-[0_0_80px_var(--gallery-glow)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-4 max-[820px]:max-w-[82vw]"
          type="button"
          aria-label="Close expanded artwork"
          onClick={closeExpanded}
        >
          <img
            src={images[expanded.index % images.length]}
            alt={`${titles[expanded.index]} expanded artwork`}
            draggable={false}
            className="w-full h-full object-cover pointer-events-none"
          />
        </button>
      )}

      <div
        className="fixed top-1/2 left-1/2 z-[10001] w-[min(92vw,70rem)] -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center"
        aria-live="polite"
      >
        <p ref={titleRef} className="flex justify-center gap-2 overflow-hidden text-gallery-text">
          {activeWords.map((word) => (
            <span
              className="gallery-title-word inline-block text-[clamp(1.65rem,4vw,3rem)] font-[750] leading-none uppercase will-change-[transform,opacity]"
              key={`${activeTitle}-${word}`}
            >
              {word}
            </span>
          ))}
        </p>
      </div>

      <div
        className="fixed inset-0 z-[9998] pointer-events-none shadow-[inset_0_0_180px_var(--gallery-ink),inset_0_0_420px_var(--gallery-ink)]"
        aria-hidden="true"
      />
    </main>
  );
}
