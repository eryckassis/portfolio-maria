import { createFileRoute } from "@tanstack/react-router";
import { ImmersivePortfolioGrid } from "@/components/ImmersivePortfolioGrid";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Immersive Portfolio Grid" },
      {
        name: "description",
        content: "A draggable GSAP-powered immersive portfolio gallery built with React, TypeScript, Vite, and Tailwind CSS.",
      },
      { property: "og:title", content: "Immersive Portfolio Grid" },
      {
        property: "og:description",
        content: "Explore an infinite editorial image field with animated project reveals and tactile interactions.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <ImmersivePortfolioGrid />;
}
