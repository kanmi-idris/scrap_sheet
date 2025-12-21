"use client";
import { Button } from "@/components/ui/button";
import { GITHUB_URL } from "@/lib/constants";
import { ArrowRight01Icon, Github01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { HeroVisual } from "./hero-visual";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeInUp = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  return (
    <section
      className="container mx-auto px-6 text-center"
      aria-labelledby="hero-heading"
    >
      {/* Beta Badge */}
      <motion.div
        {...fadeInUp}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-neutral-400 mb-8"
        role="status"
        aria-label="Current version: 1.0 Public Beta"
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
          aria-hidden="true"
        />
        v1.0 Public Beta
      </motion.div>

      <motion.h1
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, delay: 0.1 }}
        id="hero-heading"
        className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]"
        aria-label="Scrap Sheet: The first writing tool that thinks with you."
      >
        The first writing tool that <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-neutral-200 to-neutral-500 italic font-serif">
          thinks
        </span>{" "}
        with you.
      </motion.h1>

      <motion.p
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, delay: 0.2 }}
        className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        aria-label="From chaos to clarity. Scrap sheet is the agentic workspace where ideas become structured thought."
      >
        From chaos to clarity. Scrap_sheet is the agentic workspace where ideas
        become structured thought.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        {...fadeInUp}
        transition={{ ...fadeInUp.transition, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
      >
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full h-12 px-8 rounded-full bg-white text-black hover:bg-neutral-200 text-base font-medium shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Start writing for free"
          >
            Start Writing
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="w-4 h-4 ml-2"
              strokeWidth={2.5}
            />
          </Button>
        </Link>
        <Link href={GITHUB_URL} target="_blank" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full h-12 px-8 rounded-full border-white/10 bg-white/5 hover:bg-white/8 text-white text-base focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Star Scrap Sheet on GitHub"
          >
            <HugeiconsIcon
              icon={Github01Icon}
              className="w-5 h-5 mr-2"
              strokeWidth={2}
            />
            Star on GitHub
          </Button>
        </Link>
      </motion.div>

      {/* Visual Illustration */}
      <div className="mb-32" aria-hidden="true">
        <HeroVisual />
      </div>
    </section>
  );
}
