"use client";

import MainNavbar from "./components/MainNavbar";
import { Footer } from "./components/SharedLayout";
import Hero from "../components/home/Hero";
import TrustStrip from "../components/home/TrustStrip";
import ComoFunciona from "../components/home/ComoFunciona";
import Descarga from "../components/home/Descarga";

export default function LandingPage() {
  return (
    <main>
      <MainNavbar />
      <Hero />
      <TrustStrip />
      <ComoFunciona />
      <Descarga />
      <Footer />
    </main>
  );
}
