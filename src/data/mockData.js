// Initial categories with clean 0 counts (No fake numbers)
export const INITIAL_CATEGORIES = [
  { id: 'web-dev', name: 'Web Development', icon: 'Code', count: 0, topSkill: 'React, Node.js' },
  { id: 'ui-ux', name: 'UI/UX & Product Design', icon: 'Palette', count: 0, topSkill: 'Figma, Tailwind' },
  { id: 'mobile-app', name: 'Mobile App Development', icon: 'Smartphone', count: 0, topSkill: 'Flutter, React Native' },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: 'Cpu', count: 0, topSkill: 'Python, PyTorch' },
  { id: 'content-writing', name: 'Content & Copywriting', icon: 'FileText', count: 0, topSkill: 'SEO, Technical' },
  { id: 'digital-marketing', name: 'Digital Marketing', icon: 'TrendingUp', count: 0, topSkill: 'PPC, Growth' },
  { id: 'cloud-devops', name: 'Cloud & DevOps', icon: 'Server', count: 0, topSkill: 'AWS, Docker, K8s' },
];

export const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Full-Stack Next.js E-Commerce Platform with Stripe & Dashboard',
    category: 'web-dev',
    categoryName: 'Web Development',
    budgetType: 'Fixed',
    budget: 3500,
    minBudget: 2500,
    maxBudget: 4000,
    deadline: '2026-08-25',
    daysLeft: 19,
    proposalsCount: 14,
    status: 'Open',
    urgency: 'Featured',
    client: {
      name: 'Nexus Tech Labs',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      rating: 4.95,
      totalSpent: 48000,
      location: 'San Francisco, CA',
      verified: true
    },
    skills: ['React.js', 'Next.js', 'Node.js', 'Stripe API', 'Tailwind CSS', 'PostgreSQL'],
    description: 'We are seeking an experienced Full-Stack Engineer to build a high-performance e-commerce platform. The project includes custom product customization tools, multi-currency Stripe checkout, real-time inventory sync, and a clean admin analytics dashboard.',
    deliverables: [
      'Responsive Next.js Frontend with dark/light mode',
      'Secure Node.js/Express API with JWT Auth',
      'Stripe Payment Gateway integration with webhooks',
      'Admin analytics dashboard with revenue charts'
    ],
    postedDate: '2 hours ago'
  },
  {
    id: 'proj-2',
    title: 'SaaS Mobile App UI/UX Redesign & Interactive Figma Prototype',
    category: 'ui-ux',
    categoryName: 'UI/UX & Product Design',
    budgetType: 'Fixed',
    budget: 1800,
    minBudget: 1500,
    maxBudget: 2200,
    deadline: '2026-08-18',
    daysLeft: 12,
    proposalsCount: 8,
    status: 'Open',
    urgency: 'Urgent',
    client: {
      name: 'FlowSpace Inc.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 4.88,
      totalSpent: 22500,
      location: 'Austin, TX',
      verified: true
    },
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Mobile App Design', 'Prototyping'],
    description: 'Looking for a visionary Senior UI/UX Designer to completely revamp our task management mobile app. Needs a modern, glassmorphic aesthetic inspired by premium iOS apps, slick micro-animations, and a comprehensive Figma design system.',
    deliverables: [
      'Complete Mobile App Design (40+ screen flows)',
      'Interactive Figma Prototype with transitions',
      'Design Token & UI Components Library',
      'Design handoff specifications for developers'
    ],
    postedDate: '5 hours ago'
  },
  {
    id: 'proj-3',
    title: 'AI Customer Support Bot with LangChain & OpenAI API Integration',
    category: 'ai-ml',
    categoryName: 'AI & Machine Learning',
    budgetType: 'Fixed',
    budget: 4200,
    minBudget: 3500,
    maxBudget: 5000,
    deadline: '2026-09-01',
    daysLeft: 26,
    proposalsCount: 19,
    status: 'Open',
    urgency: 'Hot',
    client: {
      name: 'OmniAssist AI',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      totalSpent: 65000,
      location: 'London, UK',
      verified: true
    },
    skills: ['Python', 'LangChain', 'OpenAI API', 'Vector DB', 'FastAPI', 'React'],
    description: 'Build an enterprise RAG (Retrieval-Augmented Generation) customer service chatbot capable of querying internal PDF manuals, customer tickets, and knowledge bases using Pinecone vector database and GPT-4 model fine-tuning.',
    deliverables: [
      'FastAPI Backend pipeline with document chunking & embeddings',
      'Vector DB integration (Pinecone/ChromaDB)',
      'Embeddable React Chat Widget UI',
      'Admin portal for uploading PDF knowledge bases'
    ],
    postedDate: '1 day ago'
  },
  {
    id: 'proj-4',
    title: 'Cross-Platform Fitness Tracker App in Flutter & Dart',
    category: 'mobile-app',
    categoryName: 'Mobile App Development',
    budgetType: 'Hourly',
    budget: 65,
    minBudget: 50,
    maxBudget: 80,
    deadline: '2026-08-30',
    daysLeft: 24,
    proposalsCount: 11,
    status: 'Open',
    urgency: 'Featured',
    client: {
      name: 'PulseFitness Co.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 4.92,
      totalSpent: 31000,
      location: 'Toronto, Canada',
      verified: true
    },
    skills: ['Flutter', 'Dart', 'Firebase', 'REST API', 'HealthKit API', 'State Management'],
    description: 'We require an expert Flutter developer to finish building our cross-platform workout tracking app for iOS and Android. Key work includes Bluetooth wearable integration, workout logging, dynamic progress graphs, and social leaderboards.',
    deliverables: [
      'Flutter iOS & Android app build',
      'Firebase Auth & Firestore database synchronization',
      'Apple HealthKit & Google Fit API data sync',
      'Real-time timer & workout log UI'
    ],
    postedDate: '2 days ago'
  },
  {
    id: 'proj-5',
    title: 'Technical Whitepaper & SEO Content Campaign for Web3 Protocol',
    category: 'content-writing',
    categoryName: 'Content & Copywriting',
    budgetType: 'Fixed',
    budget: 1200,
    minBudget: 900,
    maxBudget: 1400,
    deadline: '2026-08-20',
    daysLeft: 14,
    proposalsCount: 6,
    status: 'Open',
    urgency: 'Standard',
    client: {
      name: 'Aetheria Protocol',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      rating: 4.85,
      totalSpent: 14000,
      location: 'Berlin, Germany',
      verified: true
    },
    skills: ['Technical Writing', 'SEO Copywriting', 'Web3', 'Blockchain', 'Research'],
    description: 'Looking for a senior technical writer with deep domain knowledge in decentralized infrastructure. You will author a 15-page technical whitepaper, 4 high-ranking SEO articles, and landing page copy.',
    deliverables: [
      '15-page PDF Whitepaper with diagrams',
      '4 x 1,500-word SEO optimized articles',
      'Landing page hero text & value propositions'
    ],
    postedDate: '3 days ago'
  },
  {
    id: 'proj-6',
    title: 'Kubernetes Cluster Migration & Terraform Infrastructure CI/CD',
    category: 'cloud-devops',
    categoryName: 'Cloud & DevOps',
    budgetType: 'Fixed',
    budget: 2800,
    minBudget: 2200,
    maxBudget: 3200,
    deadline: '2026-08-28',
    daysLeft: 22,
    proposalsCount: 9,
    status: 'Open',
    urgency: 'Urgent',
    client: {
      name: 'CloudScale Dynamics',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      rating: 4.98,
      totalSpent: 52000,
      location: 'Seattle, WA',
      verified: true
    },
    skills: ['Kubernetes', 'Terraform', 'AWS EKS', 'GitHub Actions', 'Docker'],
    description: 'Migrate legacy Docker Swarm workloads to Amazon EKS using modular Terraform code. Implement automated zero-downtime deployment pipelines with GitHub Actions and Prometheus/Grafana monitoring.',
    deliverables: [
      'Terraform IaC scripts for AWS EKS provisioning',
      'Helm chart deployment configurations',
      'GitHub Actions CI/CD workflow pipeline',
      'Monitoring setup with Grafana dashboards'
    ],
    postedDate: '3 days ago'
  }
];

export const INITIAL_FREELANCERS = [
  {
    id: 'free-1',
    name: 'Elena Rostova',
    title: 'Principal Full-Stack Architect & React Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    location: 'Prague, Czechia',
    hourlyRate: 75,
    rating: 4.98,
    reviewsCount: 64,
    successRate: 99,
    totalEarned: 145000,
    verified: true,
    online: true,
    expertise: 'Expert',
    category: 'web-dev',
    skills: ['React.js', 'TypeScript', 'Node.js', 'GraphQL', 'Next.js', 'AWS'],
    bio: '10+ years crafting scalable web platforms for Series-A startups and enterprise clients. Specialist in high-traffic React apps, microservices, and state-of-the-art UI architectures.',
    portfolio: [
      { title: 'Fintech Analytics Platform', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=80' },
      { title: 'SaaS Workflow Automation UI', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=80' }
    ],
    reviews: [
      { clientName: 'Nexus Tech Labs', rating: 5, comment: 'Elena delivered our complex React platform ahead of schedule with flawless code quality.', date: 'July 2026' }
    ]
  },
  {
    id: 'free-2',
    name: 'Marcus Vance',
    title: 'Senior Product Designer (UI/UX) & Design Systems',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    hourlyRate: 90,
    rating: 5.0,
    reviewsCount: 48,
    successRate: 100,
    totalEarned: 180000,
    verified: true,
    online: true,
    expertise: 'Expert',
    category: 'ui-ux',
    skills: ['Figma', 'Product Design', 'Design Systems', 'UX Research', 'Prototyping'],
    bio: 'Former Lead Designer at Tech unicorn. I help companies convert complex user flows into beautiful, high-converting digital products that users love.',
    portfolio: [
      { title: 'Crypto Wallet Mobile UI', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80' },
      { title: 'HealthTech Dashboard System', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80' }
    ],
    reviews: [
      { clientName: 'FlowSpace Inc.', rating: 5, comment: 'Marcus has world-class UI design instincts. Transformed our entire mobile app experience.', date: 'June 2026' }
    ]
  },
  {
    id: 'free-3',
    name: 'Aisha Patel',
    title: 'AI/ML Engineer & LLM Integration Expert',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    location: 'Bengaluru, India',
    hourlyRate: 65,
    rating: 4.92,
    reviewsCount: 39,
    successRate: 97,
    totalEarned: 92000,
    verified: true,
    online: false,
    expertise: 'Intermediate',
    category: 'ai-ml',
    skills: ['Python', 'PyTorch', 'LangChain', 'OpenAI API', 'FastAPI', 'Vector DB'],
    bio: 'Specialized in building custom AI agents, fine-tuning open-source LLMs (Llama 3, Mistral), and implementing production-grade RAG search engines.',
    portfolio: [
      { title: 'AI Legal Research Engine', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80' }
    ],
    reviews: [
      { clientName: 'OmniAssist AI', rating: 5, comment: 'Outstanding understanding of vector databases and LangChain pipelines.', date: 'May 2026' }
    ]
  },
  {
    id: 'free-4',
    name: 'David Chen',
    title: 'Senior Flutter & Native Mobile Lead',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    location: 'Singapore',
    hourlyRate: 70,
    rating: 4.89,
    reviewsCount: 52,
    successRate: 98,
    totalEarned: 110000,
    verified: true,
    online: true,
    expertise: 'Expert',
    category: 'mobile-app',
    skills: ['Flutter', 'Dart', 'Swift', 'Kotlin', 'Firebase', 'State Management'],
    bio: '7+ years building iOS & Android apps with Flutter. Published over 20 apps on App Store and Google Play with 1M+ combined downloads.',
    portfolio: [
      { title: 'Food Delivery Native App', image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=500&auto=format&fit=crop&q=80' }
    ],
    reviews: [
      { clientName: 'PulseFitness Co.', rating: 4.9, comment: 'Fast developer with great attention to smooth 60fps mobile animations.', date: 'July 2026' }
    ]
  }
];

export const INITIAL_PROPOSALS = [
  {
    id: 'prop-101',
    projectId: 'proj-1',
    projectTitle: 'Full-Stack Next.js E-Commerce Platform with Stripe & Dashboard',
    freelancerId: 'free-1',
    freelancerName: 'Elena Rostova',
    freelancerTitle: 'Principal Full-Stack Architect',
    freelancerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    bidAmount: 3400,
    platformFee: 170,
    netAmount: 3230,
    estimatedDays: 14,
    coverLetter: 'Hi! I have built 8+ enterprise Next.js e-commerce platforms with multi-currency Stripe integrations. I can deliver a clean, high-speed solution with full test coverage and smooth dashboard analytics within 14 days.',
    status: 'Pending',
    submittedDate: '1 hour ago'
  },
  {
    id: 'prop-102',
    projectId: 'proj-2',
    projectTitle: 'SaaS Mobile App UI/UX Redesign & Interactive Figma Prototype',
    freelancerId: 'free-2',
    freelancerName: 'Marcus Vance',
    freelancerTitle: 'Senior Product Designer',
    freelancerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    bidAmount: 1800,
    platformFee: 90,
    netAmount: 1710,
    estimatedDays: 10,
    coverLetter: 'I checked your mobile app requirements. I will build a state-of-the-art Figma design system with glassmorphism UI elements, dark mode tokens, and smooth interactive prototype flows.',
    status: 'Accepted',
    submittedDate: '4 hours ago'
  }
];

export const PLATFORM_STATS = {
  activeProjects: '15,420+',
  verifiedFreelancers: '28,500+',
  totalPaidOut: '$4.2M+',
  jobSuccessRate: '99.4%'
};