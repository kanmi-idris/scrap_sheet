"use client";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  delay: number;
}

export default function FeatureCard({
  icon,
  title,
  description,
  delay,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="p-8 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors"
      role="article"
      aria-labelledby="features-card-title"
      aria-describedby="features-card-description"
    >
      <div
        className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 text-white"
        aria-hidden="true"
      >
        <HugeiconsIcon icon={icon} className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <h3
        id="features-card-title"
        className="text-xl font-medium text-white mb-3"
      >
        {title}
      </h3>
      <p
        id="features-card-description"
        className="text-neutral-400 leading-relaxed"
      >
        {description}
      </p>
    </motion.div>
  );
}
