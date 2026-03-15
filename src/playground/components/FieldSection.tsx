import type { ReactNode } from "react";

interface FieldSectionProps {
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
}

export function FieldSection({
  title,
  description,
  className,
  children,
}: FieldSectionProps) {
  const sectionClassName = className
    ? `controlSection ${className}`
    : "controlSection";

  return (
    <section className={sectionClassName}>
      <h3>{title}</h3>
      <p className="sectionDescription">{description}</p>
      {children}
    </section>
  );
}
