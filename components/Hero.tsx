"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Hero() {
  return (
    <section className="relative w-full overflow-visible">
      {/* 1. Giant YOU KNOW ME Title across the very top of the page */}
      <div className="w-full pt-3 pb-2 sm:pt-5 md:pt-6 md:pb-3">
        <h1 className="w-full text-center font-display text-[clamp(4.2rem,17.2vw,16.5rem)] leading-[0.82] tracking-[-0.02em] text-white uppercase select-none">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              YOU KNOW ME
            </motion.span>
          </span>
        </h1>
      </div>

      {/* 2. Navbar at the exact bottom of the name YOU KNOW ME, sticky on scroll */}
      <Navbar />

      {/* 3. Hero Bio Section (Niladri quote on the right + centered red accent divider, matching 2nd image) */}
      <div className="mx-auto w-full max-w-[1320px] px-6 pt-16 pb-14 md:px-8 md:pt-28 md:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -30px 0px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="ml-auto max-w-[500px] text-left text-[14px] leading-[1.8] text-[#ccc] md:text-[15px]"
        >
          &ldquo;I&apos;m Niladri Day, a passionate tech creator building
          innovative electronics, custom 3D prototypes, and futuristic
          engineering projects. I share creative ideas, experiments, and
          technology-driven solutions through thoughtful design and hands-on
          innovation.&rdquo;
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 36 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="mx-auto mt-12 md:mt-16 h-[3px] bg-accent"
        />
      </div>
    </section>
  );
}
