"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { supabase, type Testimonial } from "@/lib/supabase";

const fallbackTestimonials: Pick<Testimonial, "id" | "name" | "text" | "image_url">[] = [
  { id: "fallback-1", name: "Arjun Mehta", text: "THE CURRICULUM IS BRUTALLY HONEST. I WENT FROM A HOBBYIST TO A PROFESSIONAL EDITOR IN WEEKS.", image_url: null },
  { id: "fallback-2", name: "Sara Khan", text: "CREATORSLAB ISN'T A SCHOOL, IT'S A HIGH-PRESSURE PRODUCTION ENVIRONMENT THAT BUILDS REAL SKILLS.", image_url: null },
  { id: "fallback-3", name: "Kevin Paul", text: "THE FOCUS ON VISUAL STORYTELLING CHANGED HOW I VIEW EVERY FRAME THROUGH THE LENS.", image_url: null },
  { id: "fallback-4", name: "Riya Sharma", text: "FINALLY, A PLACE THAT VALUES CREATIVE EXECUTION OVER THEORETICAL NONSENSE. HIGHLY RECOMMENDED.", image_url: null },
  { id: "fallback-5", name: "Leo Das", text: "THE MENTORSHIP HERE IS UNMATCHED. YOU LEARN THE BUSINESS SIDE OF CREATIVITY, NOT JUST THE TOOLS.", image_url: null },
  { id: "fallback-6", name: "Mona Singh", text: "BEYOND STUDIO IS THE PERFECT DESCRIPTION. IT'S A COMPLETE ECOSYSTEM FOR MODERN CREATIVES.", image_url: null },
];

export default function Home() {
  const containerRef = useRef(null);
  const testimonialSectionRef = useRef<HTMLElement | null>(null);
  const testimonialViewportRef = useRef<HTMLDivElement | null>(null);
  const testimonialTrackRef = useRef<HTMLDivElement | null>(null);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [isDesktop, setIsDesktop] = useState(false);
  const [testimonialMaxTranslate, setTestimonialMaxTranslate] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: testimonialScrollProgress } = useScroll({
    target: testimonialSectionRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const rotateGrid = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const yTranslate = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const testimonialX = useTransform(testimonialScrollProgress, [0, 1], [0, -testimonialMaxTranslate]);
  const hasHorizontalTestimonials = testimonialMaxTranslate > 0;

  const capabilities = [
    { id: "01", title: "Post-Production", desc: "Video Editing, Sound Design, and professional workflows in Premiere & Resolve.", img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000" },
    { id: "02", title: "Cinematography", desc: "Camera handling, framing, and cinematic movement for high-end production.", img: "https://images.unsplash.com/photo-1492691523567-627440467f22?q=80&w=1000" },
    { id: "03", title: "Visual Branding", desc: "Graphic design, Photoshop mastery, and building cohesive brand identities.", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000" },
    { id: "04", title: "Direction", desc: "Script writing, storytelling structures, and leading creative execution.", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000" },
  ];

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const updateDesktopState = () => {
      setIsDesktop(desktopQuery.matches);
    };

    updateDesktopState();
    desktopQuery.addEventListener("change", updateDesktopState);

    return () => desktopQuery.removeEventListener("change", updateDesktopState);
  }, []);

  useEffect(() => {
    const loadTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, name, text, image_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!error && data?.length) {
        setTestimonials(data);
      }
    };

    loadTestimonials();
  }, []);

  useEffect(() => {
    const viewport = testimonialViewportRef.current;
    const track = testimonialTrackRef.current;

    if (!viewport || !track) {
      return;
    }

    let frameId = 0;
    const measureTrack = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        setTestimonialMaxTranslate(Math.max(track.scrollWidth - viewport.clientWidth, 0));
      });
    };

    measureTrack();
    window.addEventListener("resize", measureTrack);

    const resizeObserver = new ResizeObserver(measureTrack);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measureTrack);
      resizeObserver.disconnect();
    };
  }, [isDesktop, testimonials]);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#f4f4f4] text-[#800000] font-mono selection:bg-[#800000] selection:text-white">
      
      {/* 1. NAVIGATION / PROGRESS */}
      <div className="fixed top-0 left-0 z-[100] w-full bg-[#f4f4f4]/80 backdrop-blur-md border-b border-[#800000]/20">
        <div className="flex items-center justify-between px-6 py-6 md:px-10">
          <div className="flex items-center gap-6">
            <img src="/logos.png" alt="" className="w-auto h-10" />
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Talent Development Division</p>
              <p className="text-lg font-black uppercase tracking-tighter">CreatorsLab by Lyf Ads</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] opacity-60 uppercase tracking-widest">Training_Ecosystem</p>
            <p className="text-sm font-bold uppercase">Bengaluru / IN</p>
          </div>
        </div>
        <motion.div style={{ scaleX }} className="h-[4px] bg-[#800000] origin-left" />
      </div>

      {/* 2. BACKGROUND DISTORTION */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <motion.div 
          style={{ rotate: rotateGrid }}
          className="absolute inset-[-100%] grid grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)]"
        >
          {[...Array(225)].map((_, i) => (
            <div key={i} className="border-[1px] border-[#800000]" />
          ))}
        </motion.div>
      </div>

      {/* 3. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 pt-32">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-9">
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-[14vw] sm:text-[11vw] font-black leading-[0.85] tracking-tighter uppercase"
            >
              Beyond<br />
              <span className="text-transparent" style={{ WebkitTextStroke: "1px #800000" }}>Studio</span>
            </motion.h1>
          </div>
          <div className="col-span-12 lg:col-span-3 border-l-2 border-[#800000] pl-6 py-2">
            <p className="text-xs md:text-sm uppercase leading-relaxed font-bold">
              [ Mission Statement ]<br />
              Transforming passionate individuals into industry-ready professionals through an immersive media training ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTRO TEXT SECTION */}
      <section className="px-6 md:px-10 py-24 bg-[#800000] text-[#f4f4f4]">
        <div className="max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-bold uppercase mb-8">The Professional Blueprint</h2>
          <p className="text-lg md:text-xl leading-relaxed opacity-90">
            We don’t just teach how tools work—we teach how to think, create, and execute. 
            From the fundamentals of visual storytelling to advanced production techniques, 
            our approach is immersive, practical, and performance-driven.
          </p>
        </div>
      </section>

      {/* 5. CAPABILITIES GRID */}
      <section className="px-6 py-24 md:px-10 md:py-40">
        <div className="grid grid-cols-1 gap-y-16 md:grid-cols-2 md:gap-x-20 md:gap-y-32">
          {capabilities.map((item, index) => (
            <motion.div 
              key={index}
              style={{ y: isDesktop && index % 2 !== 0 ? yTranslate : 0 }}
              className="group relative"
            >
              <div className="aspect-[4/3] overflow-hidden bg-zinc-200">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                />
              </div>
              <div className="mt-8 border-t border-[#800000]/20 pt-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-4xl font-black uppercase">{item.title}</h3>
                  <span className="text-xs font-bold border border-[#800000] px-2 py-1">{item.id}</span>
                </div>
                <p className="mt-4 text-sm max-w-xs uppercase font-bold opacity-70">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      

      {/* 5.5 TESTIMONIALS SECTION */}
      <section
        ref={testimonialSectionRef}
        className="relative border-t border-[#800000]/10 bg-[#f4f4f4]"
        style={{ height: hasHorizontalTestimonials ? `calc(100vh + ${testimonialMaxTranslate}px)` : undefined }}
      >
        <div className="sticky top-0 flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 md:px-10 md:py-20">
          <div className="mb-8 flex justify-between md:mb-10">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
              Voices of <span className="text-transparent" style={{ WebkitTextStroke: "1px #800000" }}>The Lab</span>
            </h2>
          </div>

          <div ref={testimonialViewportRef} className="overflow-hidden">
            <motion.div
              ref={testimonialTrackRef}
              style={{ x: testimonialX }}
              className="flex gap-8"
            >
              {testimonials.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx < 3 ? idx * 0.1 : 0 }}
                  className="group relative flex min-h-[360px] w-[calc(100vw-3rem)] flex-none flex-col justify-between overflow-hidden border border-[#800000] p-8 transition-all duration-500 hover:bg-[#800000] hover:text-[#f4f4f4] md:w-[calc((100vw-9rem)/3)]"
                >
                  {/* Decorative corner element */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-b border-l border-[#800000] group-hover:border-[#f4f4f4]" />
                  
                  <div className="relative z-10">
                    {item.image_url && (
                      <div className="mb-6 aspect-[16/9] overflow-hidden border border-[#800000]/40 bg-[#800000]/5 transition-colors group-hover:border-[#f4f4f4]/60">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <span className="text-4xl font-black opacity-20 group-hover:opacity-100 transition-opacity">&quot;</span>
                    <p className="text-lg font-bold leading-tight uppercase mt-2">
                      {item.text}
                    </p>
                  </div>

                  <div className="mt-12">
                    <p className="text-xl font-black uppercase tracking-tighter">{item.name}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {hasHorizontalTestimonials && (
            <div className="mt-8 h-1 w-full bg-[#800000]/10">
              <motion.div
                style={{ scaleX: testimonialScrollProgress }}
                className="h-full origin-left bg-[#800000]"
              />
            </div>
          )}
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-[#1a1a1a] text-[#f4f4f4] px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-6">
            <h4 className="text-[8vw] font-black leading-none uppercase tracking-tighter mb-10">
              Build <br />The Future.
            </h4>
            <p className="max-w-md text-sm opacity-50 uppercase font-bold">
              CreatorsLab by Lyf Ads. <br />
              All individuals are equipped to step into production houses, agencies, or build their own personal brand.
            </p>
          </div>

          <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
            <p className="text-[10px] uppercase tracking-widest opacity-30">Connect</p>
            {['Instagram', 'LinkedIn', 'YouTube', 'X'].map((link) => (
              <a key={link} href="#" className="text-xl font-bold uppercase hover:line-through transition-all">
                {link}
              </a>
            ))}
          </div>

          <div className="col-span-12 md:col-span-3 flex flex-col gap-4">
            <p className="text-[10px] uppercase tracking-widest opacity-30">Location</p>
            <p className="text-lg uppercase font-bold">
              Bengaluru HQ<br />
              Karnataka, India
            </p>
            <div className="mt-10 h-10 w-10 border border-[#f4f4f4] flex items-center justify-center">
              ↑
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">
          <p>© 2024 CreatorsLab by Lyf Ads</p>
          <p>System_v3.0_Production_Ready</p>
        </div>
      </footer>

    </div>
  );
}
