/* eslint-disable prettier/prettier */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
if (!CustomEase.get("galleryHop")) {
  CustomEase.create("galleryHop", "0.9, 0, 0.1, 1");
}

interface PageRevealProps {
  onComplete?: () => void;
}

export function PageReveal({ onComplete }: PageRevealProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (!panelRef.current || !nameRef.current) return;

    const letters = panelRef.current.querySelectorAll<HTMLSpanElement>(".reveal-letter");

    const tl = gsap.timeline({ onComplete: () => onCompleteRef.current?.() });

    tl.set(panelRef.current, { clipPath: "inset(0% 0% 0% 0%)" })
      .fromTo(
        nameRef.current,
        { yPercent: 40, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
        },
      )
      .fromTo(
        [subtitleRef.current, taglineRef.current],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: "power2.out" },
        "-=0.3",
      )

      .to({}, { duration: 0.55 })
      // Fade out text
      .to([nameRef.current, subtitleRef.current, taglineRef.current], {
        opacity: 0,
        y: -18,
        duration: 0.45,
        stagger: 0.03,
        ease: "power2.in",
      })
      // Wipe panel upward
      .to(
        panelRef.current,
        {
          clipPath: "inset(100% 0% 0% 0%)",
          duration: 1.05,
          ease: "galleryHop",
        },
        "-=0.05",
      );

    return () => {
      tl.kill();
    };
  }, []);

  const name = "Mari";

  return (
    <div
      ref={panelRef}
      aria-hidden="true"
      className="fixed inset-0 z-99999 bg-[#e8e8e8] flex flex-col items-center justify-center gap-4 pointer-events-none"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none bg-[radial-gradient(#000_0.7px,transparent_0.7px)] bg-size-[3px_3px]" />

      <p
        ref={subtitleRef}
        className="text-[#4A4A4A] text-xs font-dx-burst tracking-[0.35em] opacity-0"
        style={{ fontSize: "clamp(2rem, 18vw, 4rem)" }}
      ></p>

      <div ref={nameRef} className="opacity-0">
        <span
          className="font-estrella-early leading-none text-[#4A4A4A]"
          style={{ fontSize: "clamp(5rem, 35vw, 50rem)" }}
        >
          {name}
        </span>
      </div>

      <p
        ref={taglineRef}
        className="text-[#4A4A4A] text-xs font-dx-burst tracking-[0.25em] opacity-0"
        style={{ fontSize: "clamp(2rem, 18vw, 4rem)" }}
      ></p>
    </div>
  );
}
