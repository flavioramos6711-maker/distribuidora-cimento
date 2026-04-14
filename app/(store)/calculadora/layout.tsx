import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calculadora de materiais",
  description:
    "Estimativas de tijolos, cimento, madeira, áreas, volumes e traços de concreto para sua obra.",
}

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return children
}
