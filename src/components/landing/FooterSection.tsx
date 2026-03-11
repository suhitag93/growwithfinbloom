import { Link } from "react-router-dom";
import FinBloomIcon from "@/components/FinBloomIcon";

const FooterSection = () => (
  <footer className="py-12 px-4 border-t border-border/50">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2">
        <FinBloomIcon size="sm" />
        <span className="font-display text-sm font-semibold text-foreground">finBloom</span>
      </div>

      <nav className="flex items-center gap-6 text-sm text-muted-foreground">
        <Link to="/survey" className="hover:text-foreground transition-colors">
          Survey
        </Link>
        <span className="cursor-default">Privacy</span>
        <span className="cursor-default">Contact</span>
      </nav>

      <p className="text-xs text-muted-foreground">
        © 2026 finBloom. Grow your financial confidence.
      </p>
    </div>
  </footer>
);

export default FooterSection;
