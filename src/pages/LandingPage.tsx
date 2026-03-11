import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import HeroSection from "@/components/landing/HeroSection";
import FeelsLikeSection from "@/components/landing/FeelsLikeSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import VisionSection from "@/components/landing/VisionSection";
import WaitlistSection from "@/components/landing/WaitlistSection";
import FooterSection from "@/components/landing/FooterSection";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (user) return null; // will redirect

  return (
    <div className="min-h-screen scroll-smooth">
      <HeroSection />
      <FeelsLikeSection />
      <SocialProofSection />
      <VisionSection />
      <WaitlistSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
