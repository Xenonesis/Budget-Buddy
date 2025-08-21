import { HeroSection } from "@/components/ui/hero-section-dark"

export default function HeroDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        title="Welcome to Budget Buddy"
        subtitle={{
          regular: "Take control of your finances with ",
          gradient: "our intuitive budgeting tool",
        }}
        description="Track your expenses, set budgets, and achieve your financial goals with our easy-to-use platform designed for everyone."
        ctaText="Get Started"
        ctaHref="/signup"
        bottomImage={{
          light: "/dashboard.png",
          dark: "/dashboard.png",
        }}
        gridOptions={{
          angle: 65,
          opacity: 0.4,
          cellSize: 50,
          lightLineColor: "#4a4a4a",
          darkLineColor: "#2a2a2a",
        }}
      />
    </div>
  )
}