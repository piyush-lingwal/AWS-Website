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
      linkedin: "#",
      email: "#"
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
      linkedin: "https://www.linkedin.com/in/piyush-lingwal-5a8874382/",
      email: "piyush.202304205@tulas.edu.in"
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

    socials: { github: "https://github.com/piyush-lingwal", linkedin: "https://www.linkedin.com/in/piyush-lingwal-5a8874382/" }
  },
  {
    id: "node-design",
    label: "Design Lead",
    role: "UI/UX & Design Lead",
    department: "Design Wing",
    iconName: "Palette",
    color: "#EC4899",
    position: { x: 80, y: 68 },
    leadName: "TBA",
    leadAvatar: "/members/boy2.png",
    leadBio: "Designing high-fidelity UI interfaces, social graphics, and brand identity guidelines.",
    responsibilities: [
      "✔ Brand Identity & Logos",
      "✔ Hackathon UI & Banners",
      "✔ Social Media Design Assets",
      "✔ Design System Governance",
      "✔ Posters & Event Merch"
    ],

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
    leadName: "TBA",
    leadAvatar: "/members/boy2.png",
    leadBio: "Fostering inter-college collaborations, corporate sponsorships, and mentor connections.",
    responsibilities: [
      "✔ Corporate Partnerships & Sponsorships",
      "✔ Cross-Campus Tech Networks",
      "✔ AWS User Group Alignment",
      "✔ Student Onboarding & Orientation",
      "✔ Mentor Connections"
    ],

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
    leadName: "TBA",
    leadAvatar: "/members/boy2.png",
    leadBio: "Managing end-to-end event execution, speaker onboarding, and hackathon logistics.",
    responsibilities: [
      "✔ 48-Hour Cloud Hackathons",
      "✔ AWS Jam & Bootcamp Sessions",
      "✔ Keynotes & Panel Discussions",
      "✔ Logistics & Venues",
      "✔ Student Swag & Rewards"
    ],

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
    leadName: "TBA",
    leadAvatar: "/members/boy2.png",
    leadBio: "Directing video coverage, podcasting, photography, and storytelling across channels.",
    responsibilities: [
      "✔ Event Photography & Aftermovies",
      "✔ Social Media Strategy & Growth",
      "✔ Student Builder Spotlights",
      "✔ Livestreams & Teasers",
      "✔ Documentation & Articles"
    ],

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
    members: []
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
        socials: { github: "https://github.com/piyush-lingwal", linkedin: "https://www.linkedin.com/in/piyush-lingwal-5a8874382/" }
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
    members: []
  },
  {
    id: "dept-media",
    name: "Media & Content Wing",
    icon: "Video",
    tagline: "Event coverage, photography & aftermovies.",
    description: "Capturing event moments, aftermovies, livestreams, and social media.",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    members: []
  }
];
