import { motion } from "framer-motion";

const VisionSection = () => (
  <section className="py-24 px-4 bg-gradient-sage">
    <div className="container mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-foreground text-center max-w-3xl mx-auto leading-snug"
      >
        Most finance apps tell you what's wrong with your money.{" "}
        <span className="opacity-90 italic">finBloom shows you what's possible.</span>
      </motion.p>
    </div>
  </section>
);

export default VisionSection;
