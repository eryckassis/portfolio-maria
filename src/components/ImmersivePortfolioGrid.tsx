import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Pane } from "tweakpane";

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

type ExpandedItem = GalleryItem & {
  rect: DOMRect;
};

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
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [expanded, setExpanded] = useState<ExpandedItem | null>(null);
  const [panelVisible, setPanelVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const activeTitle = expanded ? titles[expanded.index] : "";
  const activeWords = useMemo(() => activeTitle.split(" "), [activeTitle]);

  const togglePanel = useCallback(() => {
    setPanelVisible((value) => !value);
    if (paneRef.current) {
      const paneElement = paneRef.current.element;
      paneElement.style.display = paneElement.style.display === "none" ? "" : "none";
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
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      const col = Math.round(current.current.x / 160);
      const row = Math.round(current.current.y / 160);
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
      addButton: (params: { title: string }) => {
        on: (event: "click", callback: () => void) => void;
      };
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "h") {
        togglePanel();
      }
      if (event.key === "Escape") setExpanded(null);
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

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (expanded) return;
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      originX: target.current.x,
      originY: target.current.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || expanded) return;
    const dx = event.clientX - drag.current.startX;
    const dy = event.clientY - drag.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.current.moved = true;
    target.current.x = drag.current.originX + dx;
    target.current.y = drag.current.originY + dy;
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!drag.current.moved && !expanded && pressedItem.current) {
      const { item, element } = pressedItem.current;
      setExpanded({ ...item, rect: element.getBoundingClientRect() });
    }
    drag.current.active = false;
    pressedItem.current = null;
  };

  const markPressedItem = (item: GalleryItem, event: React.PointerEvent<HTMLButtonElement>) => {
    pressedItem.current = { item, element: event.currentTarget };
  };

  return (
    <main className="immersive-portfolio" aria-label="Infinite editorial portfolio gallery">
      <div
        className={`gallery-chrome ${panelVisible ? "gallery-chrome-visible" : "gallery-chrome-hidden"}`}
      >
        <header className="gallery-header" aria-label="Studio information">
          <div className="gallery-nav-section">
            <button
              className="gallery-logo"
              type="button"
              aria-label="Toggle panel"
              onClick={togglePanel}
            >
              <span className="gallery-logo-circle gallery-logo-circle-one" />
              <span className="gallery-logo-circle gallery-logo-circle-two" />
            </button>
          </div>
          <nav className="gallery-values-section" aria-label="Portfolio values">
            <h2>+Menu</h2>
            <a href="mailto:hi@filip.fyi">Clarity</a>
            <a href="mailto:hi@filip.fyi">Simplicity</a>
            <a href="mailto:hi@filip.fyi">Creativity</a>
            <a href="mailto:hi@filip.fyi">Authenticity</a>
            <a href="mailto:hi@filip.fyi">Connect</a>
          </nav>
          <section className="gallery-location-section" aria-label="Location">
            <h2>+Location</h2>
            <p>6357 Selma Ave</p>
            <p>Los Angeles</p>
            <p>CA 90028</p>
          </section>
          <section className="gallery-contact-section" aria-label="Contact">
            <h2>+Get In Touch</h2>
            <p>(310) 456-7890</p>
            <a href="mailto:hi@filip.fyi">hi@filip.fyi</a>
          </section>
          <nav className="gallery-social-section" aria-label="Social links">
            <h2>+Social</h2>
            <a href="https://instagram.com/filipz__">Instagram</a>
            <a href="https://x.com/filipz">X / Twitter</a>
            <a href="https://linkedin.com/in/filipzrnzevic">LinkedIn</a>
          </nav>
        </header>
        <footer className="gallery-footer">
          <p className="gallery-coordinates">34.0522° N, 118.2437° W</p>
          <p className="gallery-hint">
            Press <kbd>H</kbd> to toggle panel
          </p>
          <p className="gallery-info">Est. 2025 • Summer Days</p>
        </footer>
      </div>

      <section
        className="gallery-container"
        data-expanded={expanded ? "true" : undefined}
        aria-label="Draggable image canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={canvasRef} className="gallery-canvas">
          {items.map((item) => (
            <button
              aria-label={`Open ${titles[item.index]}`}
              className="gallery-item"
              data-active-hidden={expanded?.id === item.id ? "true" : undefined}
              key={item.id}
              onClick={(event) => event.preventDefault()}
              onPointerDown={(event) => markPressedItem(item, event)}
              style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
              type="button"
            >
              <span className="gallery-item-image-wrap">
                <img
                  src={images[item.index % images.length]}
                  alt={`${titles[item.index]} artwork`}
                  draggable={false}
                />
              </span>
              <span className="gallery-item-caption">
                <span className="gallery-item-name">{titles[item.index]}</span>
                <span className="gallery-item-number">
                  #{String(item.index + 1).padStart(5, "0")}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div ref={overlayRef} className="gallery-overlay" onClick={closeExpanded} />
      {expanded && (
        <button
          ref={expandedRef}
          className="gallery-expanded-item"
          type="button"
          aria-label="Close expanded artwork"
          onClick={closeExpanded}
        >
          <img
            src={images[expanded.index % images.length]}
            alt={`${titles[expanded.index]} expanded artwork`}
            draggable={false}
          />
        </button>
      )}
      <div className="gallery-project-title" aria-live="polite">
        <p ref={titleRef}>
          {activeWords.map((word) => (
            <span className="gallery-title-word" key={`${activeTitle}-${word}`}>
              {word}
            </span>
          ))}
        </p>
      </div>
      <div className="gallery-vignette" aria-hidden="true" />
    </main>
  );
}
