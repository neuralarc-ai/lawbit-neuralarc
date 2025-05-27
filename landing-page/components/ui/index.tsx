"use client";
import { motion, useAnimation } from "framer-motion";
import styles from '../LandingNavbar/LandingNavbar.module.sass'

interface BorderBeamProps {
  size?: number;
  colorFrom?: string;
  colorTo?: string;
  duration?: number;
}

export const BorderBeam = ({
  size = 50,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  duration = 6,
}: BorderBeamProps) => {
  const controls = useAnimation();

  return (
    <motion.div
      className={styles["border-beam"]}
      onHoverStart={() => {
        controls.start({
          offsetDistance: ["0%", "100%"],
          transition: {
            repeat: Infinity,
            ease: "linear",
            duration,
          },
        });
      }}
      onHoverEnd={() => {
        controls.stop();
      }}
    >
      <motion.div
        className={styles["border-beam-motion"]}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
        } as React.CSSProperties}
        animate={controls}
        initial={{ offsetDistance: "0%" }}
      />
    </motion.div>
  );
};
