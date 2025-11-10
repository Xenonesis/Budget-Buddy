import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { LandingSections } from "@/components/landing/sections";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background relative overflow-x-hidden">
      <Header />
      <LandingSections />
      <Footer />
    </main>
  );
}
