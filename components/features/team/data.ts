export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  handle?: string;
  status?: string;
  bio?: string;
  quote?: string;
  specializations: string[];
  responsibilities?: string[];
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
    portfolio?: string;
  };
}

export interface LeadershipMember extends TeamMember {
  titleBadge: string;
  highlightQuote: string;
  impactMetric: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  role: string;
  department: string;
  iconName: string;
  color: string;
  position: { x: number; y: number }; // percentage coords (0-100)
  responsibilities: string[];
  leadName: string;
  leadAvatar: string;
  leadBio: string;
  skills: string[];
  socials: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

export interface DepartmentInfo {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  color: string;
  members: TeamMember[];
}

export const LEADERSHIP_TEAM: LeadershipMember[] = [
  {
    id: "faculty-coordinator",
    name: "Abhishek Rawat",
    role: "Faculty Coordinator",
    department: "Advisory & Governance",
    avatar: "/members/boy2.png",
    titleBadge: "Faculty Coordinator",
    bio: "Providing institutional direction, academic governance, and strategic mentorship to empower student builders in cloud innovation.",
    highlightQuote: "Technology grows best when students build together with vision, grit, and hands-on experimentation.",
    impactMetric: "Guiding 300+ Student Builders",
    specializations: ["Cloud Architecture", "Distributed Systems", "Academic Mentorship", "AI Research"],
    responsibilities: [
      "Institutional direction & community governance",
      "AWS Academy & University alignment",
      "Strategic industry collaborations",
      "Research & innovation guidance"
    ],
    socials: {
      linkedin: "https://linkedin.com/",
      email: "faculty@tulas.edu.in"
    }
  },
  {
    id: "piyush-lingwal",
    name: "Piyush Lingwal",
    role: "Builder Group Leader",
    department: "Engineering & AI",
    avatar: "/members/piyushlingwal.png",
    handle: "piyush-lingwal",
    status: "Building AI",
    titleBadge: "Builder Group Leader",
    bio: "Leading community vision, technical bootcamps, and open-source cloud initiatives across all student builder wings.",
    highlightQuote: "Fostering technical depth, open-source building, and peer-to-peer cloud education.",
    impactMetric: "40+ Events & Workshops",
    specializations: ["Full Stack Development", "Generative AI", "AWS Serverless", "Docker"],
    responsibilities: [
      "Leading technical curriculum & bootcamps",
      "Mentoring student dev teams",
      "Supervising AWS certification paths",
      "Managing open-source contributions"
    ],
    socials: {
      github: "https://github.com/piyush-lingwal/",
      linkedin: "https://linkedin.com/",
      email: "piyush.lingwal@aws-sbg.org"
    }
  }
];

export const NETWORK_NODES: NetworkNode[] = [
  {
    id: "node-tech",
    label: "Tech Lead",
    role: "Technology Lead",
    department: "Technology Wing",
    iconName: "Code2",
    color: "#A855F7",
    position: { x: 50, y: 16 },
    leadName: "Piyush Rawat",
    leadAvatar: "/members/piyushrawat.png",
    leadBio: "Architecting web platforms, automation pipelines, and student cloud applications.",
    responsibilities: [
      "✔ Website Platform & Dev Infrastructure",
      "✔ GitHub Organization & CI/CD",
      "✔ AWS Infrastructure & Serverless",
      "✔ Technical Workshops & Live Demos",
      "✔ Cloud Projects & Open Source"
    ],
    skills: ["Next.js", "React", "TypeScript", "AWS Lambda", "Git"],
    socials: { github: "https://github.com/Piyush-codez0", linkedin: "https://linkedin.com" }
  },
  {
    id: "node-cloud",
    label: "Cloud Lead",
    role: "Cloud Architecture Lead",
    department: "Cloud Wing",
    iconName: "Cloud",
    color: "#FF9900",
    position: { x: 80, y: 32 },
    leadName: "Piyush Lingwal",
    leadAvatar: "/members/piyushlingwal.png",
    leadBio: "Curating hands-on AWS Jam sessions, certification roadmaps, and dev environments.",
    responsibilities: [
      "✔ AWS Labs & Workshop Environments",
      "✔ Cloud Certification Guidance",
      "✔ IAM & Security Best Practices",
      "✔ AWS Educate & Student Credits",
      "✔ Serverless Architectures"
    ],
    skills: ["AWS EC2", "S3", "DynamoDB", "CloudFormation", "Docker"],
    socials: { github: "https://github.com/piyush-lingwal", linkedin: "https://linkedin.com" }
  },
  {
    id: "node-design",
    label: "Design Lead",
    role: "UI/UX & Design Lead",
    department: "Design Wing",
    iconName: "Palette",
    color: "#EC4899",
    position: { x: 80, y: 68 },
    leadName: "Riya Verma",
    leadAvatar: "/members/gauravshukla.png",
    leadBio: "Designing high-fidelity UI interfaces, social graphics, and brand identity guidelines.",
    responsibilities: [
      "✔ Brand Identity & Logos",
      "✔ Hackathon UI & Banners",
      "✔ Social Media Design Assets",
      "✔ Design System Governance",
      "✔ Posters & Event Merch"
    ],
    skills: ["Figma", "Design Systems", "Tailwind CSS", "Spline", "Illustrator"],
    socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
  },
  {
    id: "node-outreach",
    label: "Outreach Lead",
    role: "Community Outreach Lead",
    department: "Outreach Wing",
    iconName: "Megaphone",
    color: "#F59E0B",
    position: { x: 50, y: 84 },
    leadName: "Karan Singh",
    leadAvatar: "/members/piyushlingwal.png",
    leadBio: "Fostering inter-college collaborations, corporate sponsorships, and mentor connections.",
    responsibilities: [
      "✔ Corporate Partnerships & Sponsorships",
      "✔ Cross-Campus Tech Networks",
      "✔ AWS User Group Alignment",
      "✔ Student Onboarding & Orientation",
      "✔ Mentor Connections"
    ],
    skills: ["Strategic Partnerships", "Negotiation", "Public Relations", "Outreach"],
    socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
  },
  {
    id: "node-events",
    label: "Events Lead",
    role: "Events & Operations Lead",
    department: "Events Wing",
    iconName: "Calendar",
    color: "#3B82F6",
    position: { x: 20, y: 68 },
    leadName: "Aarav Sharma",
    leadAvatar: "/members/piyushrawat.png",
    leadBio: "Managing end-to-end event execution, speaker onboarding, and hackathon logistics.",
    responsibilities: [
      "✔ 48-Hour Cloud Hackathons",
      "✔ AWS Jam & Bootcamp Sessions",
      "✔ Keynotes & Panel Discussions",
      "✔ Logistics & Venues",
      "✔ Student Swag & Rewards"
    ],
    skills: ["Event Operations", "Logistics", "Community Management", "Public Speaking"],
    socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
  },
  {
    id: "node-media",
    label: "Media Lead",
    role: "Media & Content Lead",
    department: "Media Wing",
    iconName: "Video",
    color: "#10B981",
    position: { x: 20, y: 32 },
    leadName: "Gaurav Shukla",
    leadAvatar: "/members/gauravshukla.png",
    leadBio: "Directing video coverage, podcasting, photography, and storytelling across channels.",
    responsibilities: [
      "✔ Event Photography & Aftermovies",
      "✔ Social Media Strategy & Growth",
      "✔ Student Builder Spotlights",
      "✔ Livestreams & Teasers",
      "✔ Documentation & Articles"
    ],
    skills: ["Premiere Pro", "After Effects", "Photography", "Copywriting"],
    socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
  }
];

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: "dept-tech",
    name: "Technology Wing",
    icon: "Code2",
    tagline: "Websites, bots & cloud dev infrastructure.",
    description: "Building official web platforms, open-source repos, and bot tools.",
    color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
    members: [
      {
        id: "m-tech-1",
        name: "Piyush Rawat",
        role: "Tech Lead",
        department: "Technology Wing",
        avatar: "/members/piyushrawat.png",
        handle: "Piyush-codez0",
        specializations: ["Next.js", "TypeScript", "AWS Lambda", "Tailwind CSS", "Docker"],
        socials: { github: "https://github.com/Piyush-codez0", linkedin: "https://linkedin.com", email: "piyush@aws-sbg.org" }
      },
      {
        id: "m-tech-2",
        name: "Aman Gupta",
        role: "Full Stack Engineer",
        department: "Technology Wing",
        avatar: "/members/piyushlingwal.png",
        handle: "aman-dev",
        specializations: ["React", "Framer Motion", "Tailwind", "Three.js"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-tech-3",
        name: "Neha Joshi",
        role: "Backend & Cloud Engineer",
        department: "Technology Wing",
        avatar: "/members/gauravshukla.png",
        handle: "neha-cloud",
        specializations: ["Node.js", "PostgreSQL", "AWS S3", "GraphQL"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-tech-4",
        name: "Rohan Verma",
        role: "DevOps & Automation Engineer",
        department: "Technology Wing",
        avatar: "/members/piyushrawat.png",
        handle: "rohan-devops",
        specializations: ["Docker", "GitHub Actions", "CI/CD", "AWS EC2"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-tech-5",
        name: "Kavya Nair",
        role: "Open Source & AI Developer",
        department: "Technology Wing",
        avatar: "/members/piyushlingwal.png",
        handle: "kavya-ai",
        specializations: ["Python", "PyTorch", "LangChain", "OpenAI API"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      }
    ]
  },
  {
    id: "dept-design",
    name: "Design Wing",
    icon: "Palette",
    tagline: "UI/UX, brand identity & social media kits.",
    description: "Crafting UI design systems, hackathon branding, and event swag.",
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    members: [
      {
        id: "m-des-1",
        name: "Riya Verma",
        role: "Design Lead",
        department: "Design Wing",
        avatar: "/members/gauravshukla.png",
        handle: "riya-ui",
        specializations: ["Figma", "Design Systems", "Framer", "3D Art"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-des-2",
        name: "Siddharth Rao",
        role: "Visual & Brand Designer",
        department: "Design Wing",
        avatar: "/members/piyushrawat.png",
        handle: "sid-graphics",
        specializations: ["Illustrator", "Photoshop", "Typography", "Posters"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-des-3",
        name: "Anushka Sharma",
        role: "UI/UX Researcher",
        department: "Design Wing",
        avatar: "/members/piyushlingwal.png",
        handle: "anushka-ux",
        specializations: ["User Research", "Wireframing", "Prototyping", "Figma"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-des-4",
        name: "Varun Kapoor",
        role: "Motion & 3D Designer",
        department: "Design Wing",
        avatar: "/members/gauravshukla.png",
        handle: "varun-3d",
        specializations: ["Spline", "After Effects", "Blender", "3D Icons"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-des-5",
        name: "Meera Patel",
        role: "Graphic & Event Media Designer",
        department: "Design Wing",
        avatar: "/members/piyushrawat.png",
        handle: "meera-design",
        specializations: ["Posters", "Banners", "Canva", "Social Kits"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      }
    ]
  },
  {
    id: "dept-cloud",
    name: "Cloud Wing",
    icon: "Cloud",
    tagline: "AWS labs, serverless & certification roadmaps.",
    description: "Guiding students through hands-on cloud labs and AWS certifications.",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    members: [
      {
        id: "m-cld-1",
        name: "Piyush Lingwal",
        role: "Cloud Lead",
        department: "Cloud Wing",
        avatar: "/members/piyushlingwal.png",
        handle: "piyush-lingwal",
        specializations: ["AWS Architecture", "Kubernetes", "Terraform", "Serverless"],
        socials: { github: "https://github.com/piyush-lingwal", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-cld-2",
        name: "Ananya Mehta",
        role: "Cloud Security Specialist",
        department: "Cloud Wing",
        avatar: "/members/gauravshukla.png",
        handle: "ananya-cloudsec",
        specializations: ["AWS IAM", "VPC Security", "CloudTrail", "Compliance"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-cld-3",
        name: "Aditya Kumar",
        role: "Serverless Architect",
        department: "Cloud Wing",
        avatar: "/members/piyushrawat.png",
        handle: "aditya-serverless",
        specializations: ["AWS Lambda", "API Gateway", "DynamoDB", "EventBridge"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-cld-4",
        name: "Sneha Roy",
        role: "AWS Infrastructure Engineer",
        department: "Cloud Wing",
        avatar: "/members/piyushlingwal.png",
        handle: "sneha-infra",
        specializations: ["CloudFormation", "Terraform", "S3", "Route53"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-cld-5",
        name: "Harsh Vardhan",
        role: "Kubernetes & Container Specialist",
        department: "Cloud Wing",
        avatar: "/members/gauravshukla.png",
        handle: "harsh-k8s",
        specializations: ["Docker", "AWS EKS", "Helm", "Microservices"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      }
    ]
  },
  {
    id: "dept-events",
    name: "Events & Operations Wing",
    icon: "Calendar",
    tagline: "Hackathons, AWS Jams & tech meetups.",
    description: "Executing 48-hour hackathons, AWS Jam sessions, and keynotes.",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    members: [
      {
        id: "m-evt-1",
        name: "Aarav Sharma",
        role: "Event Lead",
        department: "Events & Operations Wing",
        avatar: "/members/piyushrawat.png",
        handle: "aarav-events",
        specializations: ["Logistics", "Hackathon Ops", "Speaker Relations"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-evt-2",
        name: "Vikram Malhotra",
        role: "Logistics Lead",
        department: "Events & Operations Wing",
        avatar: "/members/piyushlingwal.png",
        handle: "vikram-ops",
        specializations: ["Venue Mgmt", "Budgeting", "Hospitality"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-evt-3",
        name: "Shreya Saxena",
        role: "Student Coordinator",
        department: "Events & Operations Wing",
        avatar: "/members/gauravshukla.png",
        handle: "shreya-coord",
        specializations: ["Registration", "Volunteer Ops", "Publicity"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-evt-4",
        name: "Kabir Das",
        role: "Speaker & Mentor Liaison",
        department: "Events & Operations Wing",
        avatar: "/members/piyushrawat.png",
        handle: "kabir-speaker",
        specializations: ["Keynote Outreach", "Panel Hosting", "Schedules"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-evt-5",
        name: "Isha Bhatia",
        role: "Hackathon & Jam Manager",
        department: "Events & Operations Wing",
        avatar: "/members/piyushlingwal.png",
        handle: "isha-hackathon",
        specializations: ["Judging Rules", "AWS Jam Labs", "Swag Rewards"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      }
    ]
  },
  {
    id: "dept-media",
    name: "Media & Content Wing",
    icon: "Video",
    tagline: "Event coverage, photography & aftermovies.",
    description: "Capturing event moments, aftermovies, livestreams, and social media.",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    members: [
      {
        id: "m-med-1",
        name: "Gaurav Shukla",
        role: "Media Lead",
        department: "Media & Content Wing",
        avatar: "/members/gauravshukla.png",
        handle: "gauravshukla",
        specializations: ["Video Production", "Motion Graphics", "Photography"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-med-2",
        name: "Pooja Trivedi",
        role: "Content Strategist & Writer",
        department: "Media & Content Wing",
        avatar: "/members/piyushrawat.png",
        handle: "pooja-writes",
        specializations: ["Technical Writing", "Newsletters", "Social Media"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-med-3",
        name: "Yash Nambiar",
        role: "Video Producer & Aftermovies",
        department: "Media & Content Wing",
        avatar: "/members/piyushlingwal.png",
        handle: "yash-edits",
        specializations: ["Premiere Pro", "DaVinci Resolve", "Teasers"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-med-4",
        name: "Diya Sen",
        role: "Social Media Manager",
        department: "Media & Content Wing",
        avatar: "/members/gauravshukla.png",
        handle: "diya-socials",
        specializations: ["Instagram", "LinkedIn Strategy", "Analytics"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      },
      {
        id: "m-med-5",
        name: "Tushar Agarwal",
        role: "Photographer & Livestream Lead",
        department: "Media & Content Wing",
        avatar: "/members/piyushrawat.png",
        handle: "tushar-lens",
        specializations: ["OBS Studio", "Event Photography", "YouTube Live"],
        socials: { github: "https://github.com", linkedin: "https://linkedin.com" }
      }
    ]
  }
];
