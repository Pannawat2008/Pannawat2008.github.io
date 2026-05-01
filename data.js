// ============================================================
//  DATA.JS — Edit this file to update your portfolio content
//  No HTML knowledge needed. Just change the text/links below.
// ============================================================

const PORTFOLIO = {

  // ── YOUR IDENTITY ──────────────────────────────────────────
  name: "Pannawat Moonjaroen",
  nickname: "Euro",
  title: "Electronic Designer · Semiconductor Engineer · Software Engineer",
  tagline: "Crafting elegant solutions at the intersection of hardware and software.",
  status: "Available for opportunities",   // shown as badge in hero
  photo: "assets\images\Profile.jpg",      // put "assets/images/profile.jpg" when ready
  email: "pannawatmoonjaroen.com",
  github: "https://github.com/Pannawat2008",
  linkedin: "https://linkedin.com/",
  instagram: "https://www.instagram.com/setyorxeuro?igsh=MTJkN3RlbG1sano1aA==",      // put your Instagram profile URL here

  // ── ABOUT ──────────────────────────────────────────────────
  about: [
    "I'm Pannawat Moonjaroen, a passionate student working at the convergence of electronic design, semiconductor technology, and software development. I believe engineering is functional and beautiful.",
    "My journey spans from designing electronic circuits and interested in working with semiconductor components, to writing clean and efficient software. I enjoy solving complex problems that require deep understanding across multiple disciplines.",
    "When I'm not doing school work, I'm exploring the latest advancements in AI and how software can push the limits of hardware."
  ],

  // ── SKILLS ─────────────────────────────────────────────────
  // icon: any emoji | category: heading | tags: list of skills
  skills: [
    {
      icon: "⚡",
      category: "Electronic Design",
      tags: ["PCB Design", "Circuit Analysis", "Altium Designer", "KiCad", "SPICE Simulation", "Signal Integrity"]
    },
    {
      icon: "🔬",
      category: "Semiconductor",
      tags: ["VLSI Design", "CMOS", "Verilog", "VHDL", "FPGA", "Microcontrollers"]
    },
    {
      icon: "💻",
      category: "Software Engineering",
      tags: ["Python", "C / C++", "Embedded C", "Git", "Linux", "RTOS"]
    },
    {
      icon: "🛠",
      category: "Embedded Systems",
      tags: ["Arduino", "Raspberry Pi", "STM32", "I2C / SPI / UART", "IoT"]
    },
    {
      icon: "📐",
      category: "Design & Simulation",
      tags: ["LTspice", "MATLAB", "Cadence", "AutoCAD"]
    },
    {
      icon: "🌐",
      category: "Web & Tools",
      tags: ["HTML / CSS", "JavaScript", "GitHub", "VS Code", "Docker"]
    }
  ],

  // ── PROJECTS ───────────────────────────────────────────────
  // thumb: emoji shown on card | link: URL to project or "#"
  projects: [
    {
      thumb: "⚙️",
      type: "Electronic Design",
      title: "Custom PCB Motor Controller",
      desc: "Designed a 4-layer PCB for brushless DC motor control with integrated gate drivers, current sensing, and thermal protection circuits.",
      link: "#"
    },
    {
      thumb: "🔲",
      type: "Semiconductor · FPGA",
      title: "RISC-V Soft Core Implementation",
      desc: "Implemented a minimal RISC-V processor core in Verilog, synthesized and tested on an FPGA development board.",
      link: "#"
    },
    {
      thumb: "📡",
      type: "Embedded · IoT",
      title: "Wireless Sensor Network",
      desc: "Built a low-power IoT sensor network using STM32 microcontrollers, LoRa communication modules, and a Python dashboard for live monitoring.",
      link: "#"
    },
    {
      thumb: "🧠",
      type: "Software · Simulation",
      title: "SPICE Amplifier Optimizer",
      desc: "Python tool that automates SPICE simulation sweeps to find optimal component values for amplifier circuits based on performance targets.",
      link: "#"
    }
  ],

  // ── BLOG POSTS ─────────────────────────────────────────────
  blog: [
    {
      date: "May 2025",
      title: "Understanding MOSFET Gate Drive Requirements",
      excerpt: "A practical guide to calculating gate charge, rise time, and choosing the right gate driver IC for your power electronics design.",
      tag: "Electronic Design",
      link: "#"
    },
    {
      date: "April 2025",
      title: "Getting Started with FPGA Development",
      excerpt: "My experience setting up an FPGA workflow from scratch — toolchains, simulation, and synthesis without spending a fortune on software licenses.",
      tag: "FPGA · Semiconductor",
      link: "#"
    },
    {
      date: "March 2025",
      title: "Why Embedded Engineers Should Learn Python",
      excerpt: "How Python scripting transformed my hardware testing workflow — from automating SPICE runs to parsing oscilloscope data in seconds.",
      tag: "Software · Embedded",
      link: "#"
    }
  ]

};
