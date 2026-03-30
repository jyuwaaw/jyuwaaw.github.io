/* Change this file to get your personal Portfolio */

// To change portfolio colors globally go to the  _globalColor.scss file

import splashAnimation from "./assets/lottie/splashAnimation";

const uciSeal = require("./assets/images/uciseal.png");
const harbinSeal = require("./assets/images/harbinseal.png");
const cosemitechLogo = require("./assets/images/cosemitechlogo.jpeg");
const uciEngineeringLogo = require("./assets/images/ucirvineengineering_logo.jpeg");
const flexiBitLogo = require("./assets/images/flexibit-logo.png");

// Splash Screen

const splashScreen = {
  enabled: true,
  animation: splashAnimation,
  duration: 1600
};

// Summary And Greeting Section

const illustration = {
  animated: false
};

const greeting = {
  username: "Benji",
  title: "Benji",
  subTitle:
    "ASIC and Design Verification engineer focused on RTL design, UVM-based verification, accelerator architectures, and repeatable RTL-to-GDS implementation flows. Building technically rigorous digital systems across verification, physical implementation, and automation.",
  resumeLink: "",
  displayGreeting: true
};

// Social Media Links

const socialMediaLinks = {
  github: "https://github.com/your-handle",
  linkedin: "https://www.linkedin.com/in/your-handle",
  gmail: "benji.asic@example.com",
  gitlab: "",
  facebook: "",
  medium: "",
  stackoverflow: "",
  display: true
};

// Skills Section

const skillsSection = {
  title: "What I Build",
  subTitle:
    "RTL, verification, ASIC implementation, and accelerator-focused development for production-style digital systems.",
  skills: [
    "Design and verify synthesizable RTL for controllers, accelerators, and SoC components using Verilog, SystemVerilog, and VHDL.",
    "Develop constrained-random, coverage-driven verification environments with UVM, protocol checkers, scoreboards, and debug automation.",
    "Build repeatable ASIC flows for synthesis, place and route, timing closure, low-power implementation, and FPGA-based prototyping."
  ],

  softwareSkills: [
    {
      skillName: "Verilog",
      fontAwesomeClassname: "fas fa-microchip"
    },
    {
      skillName: "SystemVerilog",
      fontAwesomeClassname: "fas fa-wave-square"
    },
    {
      skillName: "UVM",
      fontAwesomeClassname: "fas fa-vial"
    },
    {
      skillName: "Python",
      fontAwesomeClassname: "fab fa-python"
    },
    {
      skillName: "C++",
      fontAwesomeClassname: "fas fa-code"
    },
    {
      skillName: "Tcl",
      fontAwesomeClassname: "fas fa-terminal"
    },
    {
      skillName: "VCS / Verdi",
      fontAwesomeClassname: "fas fa-bug"
    },
    {
      skillName: "DC / PrimeTime",
      fontAwesomeClassname: "fas fa-project-diagram"
    },
    {
      skillName: "ICC2 / Innovus",
      fontAwesomeClassname: "fas fa-drafting-compass"
    },
    {
      skillName: "Vivado / Vitis HLS",
      fontAwesomeClassname: "fas fa-memory"
    },
    {
      skillName: "Verilator / Yosys",
      fontAwesomeClassname: "fas fa-cogs"
    },
    {
      skillName: "OpenClaw",
      fontAwesomeClassname: "fas fa-robot"
    }
  ],
  display: true
};

// Education Section

const educationInfo = {
  display: true,
  schools: [
    {
      schoolName: "University of California, Irvine",
      logo: uciSeal,
      subHeader:
        "M.S. in Electrical and Computer Engineering, GPA 3.6",
      duration: "Graduated June 2025",
      desc: "Graduate work centered on computer architecture, SoC design, accelerator systems, and semiconductor implementation.",
      descBullets: [
        "Coursework: Computer Architecture, SoC Design, Embedded Systems, Deep Learning Accelerator Design, Advanced Semiconductor, Broadband IC Design, Heterogeneous Integrated Systems",
        "Additional focus: Digital and Analog IC Design, VLSI Design, Low-Power Design, Layout Design, DFT, FPGA"
      ]
    },
    {
      schoolName: "Harbin University of Science and Technology",
      logo: harbinSeal,
      subHeader:
        "B.E. in Integrated Circuit Design and Integrated Systems, GPA 3.8",
      duration: "Graduated June 2023",
      desc: "Undergraduate foundation in circuit design, verification, and implementation for integrated systems.",
      descBullets: [
        "Built depth across RTL development, semiconductor fundamentals, and digital system integration",
        "Prepared for advanced ASIC and accelerator design through lab-driven design and implementation coursework"
      ]
    }
  ]
};

// Your top 3 proficient stacks/tech experience

const techStack = {
  viewSkillBars: false,
  experience: [
    {
      Stack: "RTL Design",
      progressPercentage: "90%"
    },
    {
      Stack: "Verification / UVM",
      progressPercentage: "88%"
    },
    {
      Stack: "ASIC Implementation",
      progressPercentage: "84%"
    },
    {
      Stack: "EDA Automation",
      progressPercentage: "86%"
    }
  ],
  displayCodersrank: false
};

// Work experience section

const workExperiences = {
  display: true,
  experience: [
    {
      role: "Lab Research Assistant / Grader",
      company: "University of California, Irvine",
      companylogo: uciEngineeringLogo,
      date: "Feb 2024 - Jun 2025",
      desc:
        "Supported SoC design labs by migrating coursework from FPGA-oriented implementation to repeatable ASIC-oriented flows.",
      descBullets: [
        "Developed Tcl, Perl, and C-shell automation for synthesis, place and route, and timing analysis to enable consistent RTL-to-GDS lab execution",
        "Designed assignments covering Verilog-based digital design, simulation, synthesis, and timing closure concepts for implementation-focused coursework"
      ]
    },
    {
      role: "Digital IC Engineer Intern",
      company: "Cosemi Tech (Shanghai) Co., Ltd.",
      companylogo: cosemitechLogo,
      date: "Jun 2022 - Dec 2022",
      desc:
        "Designed and verified control RTL for an automotive ABS controller with robust timing, safety, and bring-up hooks.",
      descBullets: [
        "Implemented a 4-channel controller in Verilog including wheel-period capture at >=1 MHz, 2nd-fastest-wheel vehicle reference logic, 1 kHz control loop, and 2 kHz PWM valve drive",
        "Built CDC synchronizers, lost-pulse timeout detection, valve interlock protection, diagnostics counters, and AXI-Lite calibration hooks for FPGA bring-up",
        "Created a SystemVerilog wheel-dynamics testbench to validate controller behavior across sensor and braking scenarios"
      ]
    }
  ]
};

const openSource = {
  showGithubProfile: "false",
  display: false
};

// Some big projects you have worked on

const bigProjects = {
  title: "Selected Projects",
  subtitle:
    "Representative work spanning accelerators, verification infrastructure, and implementation automation.",
  projects: [
    {
      projectName: "FlexiBit Mixed-Precision AI Accelerator",
      projectDesc:
        "Designed a mixed-precision accelerator supporting FP6, FP8, and integer formats with an arbitrary-precision compute unit in Verilog/SystemVerilog. Verified in VCS, synthesized in Design Compiler, and physically implemented in Innovus at 14nm.",
      footerLink: [
        {name: "Verilog / SystemVerilog", url: ""},
        {name: "VCS", url: ""},
        {name: "Design Compiler", url: ""},
        {name: "Innovus", url: ""}
      ]
    },
    {
      projectName: "AXI4 SRAM Controller with UVM Verification",
      projectDesc:
        "Built an AXI4-compliant SRAM controller with burst support up to 256 beats and a complete UVM environment including sequencers, monitors, scoreboards, constrained-random stimulus, and protocol coverage.",
      footerLink: [
        {name: "SystemVerilog", url: ""},
        {name: "UVM", url: ""},
        {name: "AXI4", url: ""},
        {name: "Coverage-Driven Verification", url: ""}
      ]
    },
    {
      projectName: "VeriCopilot",
      projectDesc:
        "Developed an AI-assisted verification workflow that clusters failure signatures from regression logs, waveform metadata, and coverage outputs, then generates concise debug summaries and coverage-gap analysis.",
      footerLink: [
        {name: "Python", url: ""},
        {name: "Regression Triage", url: ""},
        {name: "Coverage Analysis", url: ""},
        {name: "Debug Automation", url: ""}
      ]
    },
    {
      projectName: "SoC MatMul and DNN Accelerator on FPGA",
      projectDesc:
        "Implemented a matrix multiply and DNN accelerator on FPGA using Vitis HLS and C++, delivering 100x runtime acceleration versus a Python baseline while maintaining 98% inference accuracy.",
      footerLink: [
        {name: "Vitis HLS", url: ""},
        {name: "C++", url: ""},
        {name: "FPGA", url: ""},
        {name: "Performance Optimization", url: ""}
      ]
    },
    {
      projectName: "Hybrid Bit-Parallel / Bit-Serial AI Accelerator",
      projectDesc:
        "Proposed a dual-mode processing element supporting dynamic bit-parallel and bit-serial execution for arbitrary mixed-precision AI workloads, achieving near-parallel throughput with up to 30% area reduction and more than 50% EDP improvement at sub-8-bit precision.",
      footerLink: [
        {name: "Architecture", url: ""},
        {name: "Mixed Precision", url: ""},
        {name: "Area / EDP Tradeoffs", url: ""},
        {name: "Accelerator Design", url: ""}
      ]
    },
    {
      projectName: "Low-Power Accelerator Implementation",
      projectDesc:
        "Applied clock gating, power gating, DVFS, and UPF across 3 power domains for a low-power accelerator implementation, then completed place and route in IC Compiler.",
      footerLink: [
        {name: "Low-Power Design", url: ""},
        {name: "UPF", url: ""},
        {name: "IC Compiler", url: ""},
        {name: "Physical Design", url: ""}
      ]
    }
  ],
  display: true
};

const achievementSection = {
  title: "Research Highlights",
  subtitle: "Additional technical depth across accelerator architecture and implementation.",
  achievementsCards: [
    {
      title: "FlexiBit",
      subtitle:
        "Hardware for flexible quantization: a mixed-precision accelerator program spanning arbitrary precision compute, verification in VCS, and 14nm implementation in Design Compiler and Innovus.",
      image: flexiBitLogo,
      imageAlt: "FlexiBit logo",
      imageWide: true,
      footerLink: []
    }
  ],
  display: true
};

const blogSection = {
  title: "Blogs",
  subtitle: "",
  displayMediumBlogs: "false",
  blogs: [],
  display: false
};

const talkSection = {
  title: "TALKS",
  subtitle: "",
  talks: [],
  display: false
};

const podcastSection = {
  title: "Podcast",
  subtitle: "",
  podcast: [],
  display: false
};

const resumeSection = {
  title: "Resume",
  subtitle: "",
  display: false
};

const contactInfo = {
  title: "Contact",
  subtitle:
    "For ASIC, RTL, verification, and accelerator engineering opportunities, use the placeholder contacts below and replace them with personal details as needed.",
  number: "",
  email_address: "benji.asic@example.com"
};

const twitterDetails = {
  userName: "your-handle",
  display: false
};

const isHireable = true;

export {
  illustration,
  greeting,
  socialMediaLinks,
  splashScreen,
  skillsSection,
  educationInfo,
  techStack,
  workExperiences,
  openSource,
  bigProjects,
  achievementSection,
  blogSection,
  talkSection,
  podcastSection,
  contactInfo,
  twitterDetails,
  isHireable,
  resumeSection
};
