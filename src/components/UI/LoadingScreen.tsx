"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We'll simulate a minimum loading time for the aesthetic, 
    // or wait for the 3D model to load in a real scenario.
    // For now, we fade out after 2 seconds.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-background"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 rounded-full border-2 border-accent shadow-[0_0_30px_rgba(255,89,0,0.6)] flex items-center justify-center"
          >
            <span className="text-accent font-heading font-bold text-xl">DC</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
