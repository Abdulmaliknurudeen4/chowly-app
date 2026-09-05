import { motion, useReducedMotion } from 'framer-motion';
import brandLogo from '../assets/brand-logo.png';

interface SplashScreenProps {
  onDone: () => void;
}

/**
 * Full-screen branded splash. Runs once on initial mount (mounted/unmounted
 * by App based on a ref, so switching role tabs later never re-triggers it).
 * ~3s total: fade+scale in, hold, fade+scale out, then calls onDone.
 */
export default function SplashScreen({ onDone }: SplashScreenProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center bg-bg"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
      onAnimationComplete={() => {
        /* no-op: exit completion is driven by AnimatePresence in App */
      }}
    >
      <motion.img
        src={brandLogo}
        alt="Chowly"
        className="w-64 sm:w-80 select-none"
        draggable={false}
        initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
        animate={
          prefersReducedMotion
            ? { opacity: 1, scale: 1 }
            : {
                opacity: [0, 1, 1, 0],
                scale: [0.96, 1, 1, 1.02],
              }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.2 }
            : {
                duration: 2.7,
                times: [0, 0.28, 0.72, 1],
                ease: [0.16, 1, 0.3, 1],
              }
        }
        onAnimationComplete={onDone}
      />
    </motion.div>
  );
}
