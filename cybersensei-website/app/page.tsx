import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Platforms } from "@/components/sections/Platforms";
import { Features } from "@/components/sections/Features";
import { Screens } from "@/components/sections/Screens";
import { Security } from "@/components/sections/Security";
import { UseCases } from "@/components/sections/UseCases";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Platforms />
      <Features />
      <Screens />
      <Security />
      <UseCases />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

