"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const TECHNOLOGIES = [
  {
    name: "S3",
    description: "Storage",
    src: "/assets/AWS services icons/Storage/Simple-Storage-Service.png",
  },
  {
    name: "Lambda",
    description: "Serverless",
    src: "/assets/AWS services icons/Compute/Lambda.png",
  },
  {
    name: "CloudFront",
    description: "CDN",
    src: "/assets/AWS services icons/Networking-Content-Delivery/CloudFront.png",
  },
  {
    name: "IAM",
    description: "Security",
    src: "/assets/AWS services icons/Security-Identity-Compliance/Identity-and-Access-Management.png",
  },
  {
    name: "DynamoDB",
    description: "NoSQL",
    src: "/assets/AWS services icons/Database/DynamoDB.png",
  },
  {
    name: "EC2",
    description: "Compute",
    src: "/assets/AWS services icons/Compute/EC2.png",
  },
  {
    name: "API Gateway",
    description: "APIs",
    src: "/assets/AWS services icons/App-Integration/API-Gateway.png",
  },
  {
    name: "ECS",
    description: "Containers",
    src: "/assets/AWS services icons/Containers/Elastic-Container-Service.png",
  },
  {
    name: "EKS",
    description: "Kubernetes",
    src: "/assets/AWS services icons/Containers/Elastic-Kubernetes-Service.png",
  },
  {
    name: "Amplify",
    description: "Full-Stack",
    src: "/assets/AWS services icons/Front-End-Web-Mobile/Amplify.png",
  },
  {
    name: "SageMaker",
    description: "AI/ML",
    src: "/assets/AWS services icons/Machine-Learning/SageMaker.png",
  },
  {
    name: "CloudWatch",
    description: "Monitoring",
    src: "/assets/AWS services icons/Management-Governance/CloudWatch.png",
  },
];

export function AboutTechnologies() {
  return (
    <section
      id="about-technologies"
      className="h-screen min-h-[660px] max-h-screen relative overflow-hidden bg-[#0B0A09] flex flex-col justify-center select-none"
    >
      {/* ── BACKGROUND AMBIENT GLOWS ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[360px] -translate-x-1/2 rounded-full bg-[#FF9900]/10 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 -right-16 w-[400px] h-[400px] rounded-full bg-[#FF9900]/8 blur-[140px]"
      />

      {/* ── MAIN CONTENT CONTAINER (Fits normal laptop height) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 h-full flex flex-col justify-center py-4 lg:py-6">
        {/* ── LEFT-ALIGNED HEADER (Consistent with previous sections) ── */}
        <div className="flex flex-col mb-4 sm:mb-6 lg:mb-7">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <motion.span
              initial={{ width: 0 }}
              whileInView={{ width: 26 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
              className="h-[2px] bg-[#FF9900] inline-block rounded-full"
            />
            <span className="text-[#FF9900] text-xs sm:text-sm font-bold tracking-[0.22em] uppercase">
              TECH STACK
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[40px] xl:text-[44px] leading-[1.08] tracking-tight text-white mt-1"
          >
            <span>Technologies we </span>
            <span className="text-[#FF9900]">explore.</span>
          </motion.h2>
        </div>

        {/* ── 12 TECH CARDS (Compact width, 6 Columns x 2 Rows) ── */}
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 lg:gap-4 items-stretch">
            {TECHNOLOGIES.map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1 + idx * 0.035 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex flex-col items-center justify-center text-center p-3.5 sm:p-4 rounded-2xl bg-[#120F0C]/85 backdrop-blur-md border border-[#26201A] hover:border-[#FF9900]/50 hover:bg-[#1A1612]/95 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.35)] hover:shadow-[0_0_30px_rgba(255,153,0,0.14)] select-none cursor-default w-full max-w-[160px] mx-auto"
              >
                {/* Top inner subtle gradient on hover */}
                <div className="absolute inset-x-0 top-0 h-10 rounded-t-2xl bg-gradient-to-b from-[#FF9900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Service Icon */}
                <div className="relative z-10 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center mb-2 sm:mb-2.5 group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={tech.src}
                    alt={tech.name}
                    width={44}
                    height={44}
                    className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  />
                </div>

                {/* Service Name */}
                <h3 className="relative z-10 font-display font-bold text-white text-[14.5px] sm:text-[15.5px] tracking-tight group-hover:text-[#FFB84D] transition-colors leading-snug">
                  {tech.name}
                </h3>

                {/* Category */}
                <p className="relative z-10 text-white/50 text-[11px] sm:text-[11.5px] font-normal tracking-wide mt-0.5">
                  {tech.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── BOTTOM-RIGHT TILTED BADGE ("Try them all!" shifted right) ── */}
          <div className="mt-5 sm:mt-6 lg:mt-7 flex justify-end translate-x-6 sm:translate-x-12 lg:translate-x-20 xl:translate-x-24">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9, rotate: -5 }}
              whileInView={{
                opacity: 1,
                y: [-2, 2, -2],
                scale: 1,
                rotate: -5,
              }}
              viewport={{ once: true }}
              transition={{
                opacity: { duration: 0.6, delay: 0.35 },
                scale: { duration: 0.6, delay: 0.35 },
                rotate: { duration: 0.6, delay: 0.35 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              whileHover={{
                scale: 1.06,
                rotate: -3,
                boxShadow: "0 0 35px rgba(255, 153, 0, 0.55)",
                borderColor: "#FFB84D",
                transition: { duration: 0.2 },
              }}
              className="relative group cursor-pointer px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-[#120F0C]/90 backdrop-blur-md border-[2px] border-[#FF9900] shadow-[0_0_25px_rgba(255,153,0,0.35)] flex items-center justify-center transition-all select-none mr-1 sm:mr-3 lg:mr-0"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF9900]/12 via-transparent to-[#FF9900]/8 opacity-80 pointer-events-none" />
              <span className="relative z-10 font-bold text-sm sm:text-base md:text-[17px] text-white tracking-tight whitespace-nowrap">
                Try them all!
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
