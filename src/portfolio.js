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
  username: "Benji Huang",
  title: "Benji Huang",
  subTitle:
    "ASIC and Design Verification engineer focused on RTL design, UVM-based verification, accelerator architectures, and repeatable RTL-to-GDS implementation flows. Building technically rigorous digital systems across verification, physical implementation, and automation.",
  resumeLink: "",
  displayGreeting: true
};

// Social Media Links

const socialMediaLinks = {
  github: "https://github.com/jyuwaaw",
  linkedin: "https://www.linkedin.com/in/yuhua-benji/",
  gmail: "yuhuah2@uci.edu",
  googleScholar:
    "https://scholar.google.com/citations?user=5VKP9mIAAAAJ&hl=en",
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
        "Coursework: Computer Architecture, SoC Design, Embedded Systems, DL Accelerator Design, Advanced Semiconductor, Broadband IC Design, Heterogeneous Integrated Systems",
        "Additional focus: Digital and Analog IC Design, VLSI Design, Low-Power Design, Layout Design, DFT, FPGA"
      ],
      courseAssistantRoles: [
        {
          course: "EECS 70A Network Analysis",
          techStack: ["Circuit Analysis", "MATLAB", "Signals", "Linear Systems"]
        },
        {
          course: "EECS 145 Electrical Engineering Analysis",
          techStack: ["Circuit Theory", "Problem Solving", "Mathematical Modeling"]
        },
        {
          course: "EECS 31 Introduction to Digital Systems",
          techStack: ["Verilog", "FSM", "Digital Logic", "Simulation"]
        }
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
      ],
      courseAssistantRoles: [
        {
          course: "Advanced Digital IC Design",
          techStack: ["RTL Design", "Verilog", "Timing", "Synthesis"]
        },
        {
          course: "Digital IC Verification",
          techStack: ["SystemVerilog", "Testbench", "Assertions", "Verification"]
        }
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
      projectName: "AXI SRAM Controller with UVM Verification",
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
    },
    {
      projectName: "SRAM Controller Design and Verification on APB / AHB",
      projectDesc:
        "Designed an SRAM controller attached to APB and AHB buses, completed RTL design and foundational testbench validation, and built a simple UVM environment for controller verification. Strengthened hands-on SystemVerilog and C development through the project lifecycle.",
      footerLink: [
        {name: "SystemVerilog", url: ""},
        {name: "UVM", url: ""},
        {name: "APB / AHB", url: ""},
        {name: "RTL Verification", url: ""}
      ]
    },
    {
      projectName: "Appliance Analysis and Identification Device",
      projectDesc:
        "Built for the NUEDC contest: designed the full electrical loop, used a current transformer to sense appliance parameters, sent data to an STM32 MCU for processing and control, and developed an Android upper-computer app for monitoring and simple device control. Also structured the Keil5 codebase and divided implementation work across teammates.",
      footerLink: [
        {name: "STM32", url: ""},
        {name: "Keil5", url: ""},
        {name: "Embedded Systems", url: ""},
        {name: "Android", url: ""}
      ]
    },
    {
      projectName: "BCI Silent Speech Interface",
      projectDesc:
        "Explored silent-speech detection using EEG signals. Verified motivation with Cyton Board eye-blink detection, then used an OpenBCI Cyton board and targeted electrode placement to capture EEG activity for speech-pattern recognition experiments.",
      footerLink: [
        {name: "OpenBCI Cyton", url: ""},
        {name: "EEG", url: ""},
        {name: "Signal Acquisition", url: ""},
        {name: "BCI", url: ""}
      ]
    },
    {
      projectName: "10 Gbps Transimpedance Amplifier in 45nm CMOS",
      projectDesc:
        "Designed a 10 Gbps TIA in 45nm CMOS and achieved a clear crossing eye diagram with integrated input-referred noise from 1 kHz to 10 GHz. Final performance included 564.3 Ω gain, 5.292 GHz bandwidth, 12.2 pA/√Hz input-referred noise, and 2.56 mW DC power.",
      footerLink: [
        {name: "45nm CMOS", url: ""},
        {name: "Broadband IC Design", url: ""},
        {name: "Analog", url: ""},
        {name: "10 Gbps", url: ""}
      ]
    },
    {
      projectName: "Design and Layout of 256-bit SRAM",
      projectDesc:
        "Designed and laid out a 256-bit SRAM using 6T CMOS SRAM cells built from cross-coupled inverters and access transistors for low-power and stable operation. The resulting 16×16 SRAM block occupied approximately 14,700.89 μm².",
      footerLink: [
        {name: "6T SRAM", url: ""},
        {name: "Layout Design", url: ""},
        {name: "Memory Design", url: ""},
        {name: "VLSI", url: ""}
      ]
    },
    {
      projectName: "NRG",
      projectDesc:
        "Additional project work published on GitHub. Repository available for review.",
      footerLink: [
        {name: "GitHub Repo", url: "https://github.com/jyuwaaw/NRG"}
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

const garageSection = {
  title: "Garage",
  subtitle:
    "Outside chips, I work on cars, hands-on mechanical problem solving, and the HMLS Auto Service LLC project.",
  intro:
    "This page is where I'll put my mechanic work, car projects, and the business side of HMLS Auto Service LLC.",
  highlights: [
    "Hands-on work on cars and mechanical troubleshooting",
    "Building HMLS Auto Service",
    "Combining technical discipline from engineering with real-world shop work"
  ],
  display: true
};

const blogSection = {
  title: "Blog",
  subtitle: "Thoughts on ASIC design, verification, and accelerator architecture.",
  displayMediumBlogs: "false",
  blogs: [
    // Add your posts here. Each entry supports:
    //   title: "Post Title"          (required)
    //   date: "March 2026"           (optional)
    //   description: "..."           (optional)
    //   url: "https://..."           (optional — makes the title/card clickable)
    //   tags: ["UVM", "RTL"]        (optional)
    //
    // Example:
    // {
    //   title: "Building a UVM Scoreboard from Scratch",
    //   date: "March 2026",
    //   description: "A walkthrough of how I structure UVM scoreboards for AXI-based memory controllers, including tips for coverage closure.",
    //   url: "",
    //   tags: ["UVM", "SystemVerilog", "Verification"]
    // }
  ],
  display: true
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
  email_address: "jyuwaaw@gmail.com"
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
  garageSection,
  blogSection,
  talkSection,
  podcastSection,
  contactInfo,
  twitterDetails,
  isHireable,
  resumeSection
};
