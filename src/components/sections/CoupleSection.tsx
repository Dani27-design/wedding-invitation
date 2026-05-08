import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { stagger, fadeUp } from "../../utils/animations";
import { useWeddingContext } from "../../context/WeddingContext";

export const CoupleSection = () => {
  const wedding = useWeddingContext();

  return (
    <section
      id="couple-section"
      className="relative py-[5vh] bg-ivory overflow-hidden"
    >
      <div className="container mx-auto px-6 max-w-5xl h-full grid grid-rows-[1fr_auto] md:grid-rows-none md:grid-cols-2 gap-[1vh] items-center relative">
        <div className="relative w-full h-[50vh] md:h-[70vh]">
          <motion.div
            initial={{ opacity: 0, x: -40, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            className="absolute top-0 left-4 w-[65%] h-[65%] z-10"
          >
            <motion.div
              animate={{
                borderRadius: [
                  "40% 60% 70% 30% / 40% 50% 60% 50%",
                  "50% 50% 30% 70% / 50% 60% 40% 60%",
                  "40% 60% 70% 30% / 40% 50% 60% 50%",
                ],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full overflow-hidden shadow-2xl relative group"
            >
              <img
                src={wedding?.groomPhoto ?? ""}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 65vw, 30vw"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  console.log("Failed to load groom photo, hiding element.");
                }}
                className="w-full h-full object-cover filter saturate-[1.05] contrast-[1.02] hover:scale-105 transition-all duration-1000"
                alt={wedding?.groomNickname ?? ""}
              />
              <div className="absolute inset-0 bg-gold/5 mix-blend-soft-light group-hover:bg-transparent transition-colors" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-gold/20 rounded-[45%_55%_65%_35%] -z-10"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40, y: 40, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 right-4 w-[65%] h-[65%] z-20"
          >
            <motion.div
              animate={{
                borderRadius: [
                  "50% 50% 30% 70% / 50% 60% 40% 60%",
                  "60% 40% 60% 40% / 40% 50% 40% 60%",
                  "50% 50% 30% 70% / 50% 60% 40% 60%",
                ],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full overflow-hidden shadow-2xl relative group bg-sepia"
            >
              <img
                src={wedding?.bridePhoto ?? ""}
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 65vw, 30vw"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  console.log("Failed to load bride photo, hiding element.");
                }}
                className="w-full h-full object-cover filter saturate-[1.05] contrast-[1.02] scale-110 hover:scale-115 transition-all duration-1000"
                alt={wedding?.brideNickname ?? ""}
              />
              <div className="absolute inset-0 bg-gold/5 mix-blend-soft-light group-hover:bg-transparent transition-colors" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 border border-gold/40 rounded-[55%_45%_35%_65%] -z-10"
            />
          </motion.div>
        </div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col gap-[2vh] md:pl-16 text-center md:text-left"
        >
          <motion.div variants={fadeUp}>
            <p className="text-xs uppercase tracking-[0.5em] text-gold mb-2 font-black">
              Pengantin Pria
            </p>
            <h3 className="font-serif mb-2 text-2xl sm:text-3xl md:text-5xl leading-none tracking-tighter">
              {wedding?.groomName}
            </h3>
            <p className="text-xs tracking-widest text-ink/70">
              {wedding?.groomParents}
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex justify-center md:justify-start items-center gap-4"
          >
            {/* <div className="h-px w-12 bg-gold/20" /> */}
            <Heart className="w-5 h-5 text-gold/25" />
            {/* <div className="h-px w-12 bg-gold/20" /> */}
          </motion.div>
          <motion.div variants={fadeUp}>
            <p className="text-xs uppercase tracking-[0.5em] text-gold mb-2 font-black">
              Pengantin Wanita
            </p>
            <h3 className="font-serif mb-2 text-2xl sm:text-3xl md:text-5xl leading-none tracking-tighter">
              {wedding?.brideName}
            </h3>
            <p className="text-xs tracking-widest text-ink/70">
              {wedding?.brideParents}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
