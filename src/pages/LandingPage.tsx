import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import HeroSection from "@/components/landing/HeroSection";
import XPShowcaseSection from "@/components/landing/XPShowcaseSection";
import GrowthJourneySection from "@/components/landing/GrowthJourneySection";
import BadgesPreviewSection from "@/components/landing/BadgesPreviewSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";
import WaitlistBanner from "@/components/WaitlistBanner";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen">
      <HeroSection />
      <div className="container mx-auto px-4 -mt-8 mb-8">
        <WaitlistBanner source="landing" />
      </div>
      <XPShowcaseSection />
      <GrowthJourneySection />
      <BadgesPreviewSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
