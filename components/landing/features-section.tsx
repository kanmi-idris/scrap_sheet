import {
  Brain02Icon,
  EyeIcon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import FeatureCard from "./feature-card";

export function FeaturesSection() {
  const features = [
    {
      icon: Brain02Icon,
      title: "Agentic Loop",
      description:
        "Don't just write. Collaborate. Accept or reject AI suggestions in real-time as you type.",
      delay: 0.1,
    },
    {
      icon: SecurityCheckIcon,
      title: "Local First",
      description:
        "Zero latency. 100% private. Your thoughts, drafts, and edits live on your device.",
      delay: 0.2,
    },
    {
      icon: EyeIcon,
      title: "Focus Mode",
      description:
        "A UI that disappears when you don't need it. Maximal space for minimal distractions.",
      delay: 0.3,
    },
  ];

  return (
    <section
      className="container mx-auto px-6"
      aria-labelledby="features-heading"
    >
      <h2 id="features-heading" className="sr-only">
        Key Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={feature.delay}
          />
        ))}
      </div>
    </section>
  );
}
