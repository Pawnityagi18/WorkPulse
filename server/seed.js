import 'dotenv/config';
import mongoose from 'mongoose';
import Project from './models/Project.js';
import User from './models/User.js';

const sampleProjects = (clientId) => [
  {
    title: 'Full-Stack E-Commerce Platform with Next.js & Stripe',
    description: 'We are looking for an experienced full-stack developer to build a modern, high-performance e-commerce store with product catalog, cart, user reviews, and secure Stripe checkout integration.',
    category: 'Web Development',
    categoryId: 'web-dev',
    categoryName: 'Web Development',
    skills: ['Next.js', 'React', 'Node.js', 'Tailwind CSS', 'Stripe', 'MongoDB'],
    budget: 3500,
    budgetType: 'Fixed',
    urgency: 'Featured',
    status: 'Open',
    duration: '1-3 months',
    deadline: '2026-10-15',
    daysLeft: 25,
    location: 'Remote',
    isRemote: true,
    proposalsCount: 3,
    client: clientId,
    clientName: 'Nexora Retail Global',
    clientCompany: 'Nexora Inc.',
    clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    verifiedClient: true,
    deliverables: [
      'Responsive Next.js Frontend',
      'Secure Stripe payment workflow',
      'Admin inventory management dashboard'
    ]
  },
  {
    title: 'Cross-Platform Fitness & Habit Tracking Mobile App',
    description: 'Seeking a talented Flutter or React Native developer to build a mobile workout companion with activity logging, progress charts, push notifications, and Apple Health / Google Fit sync.',
    category: 'Mobile Development',
    categoryId: 'mobile-dev',
    categoryName: 'Mobile Development',
    skills: ['React Native', 'Flutter', 'Firebase', 'REST API', 'Mobile UI'],
    budget: 4200,
    budgetType: 'Fixed',
    urgency: 'Urgent',
    status: 'Open',
    duration: '1-3 months',
    deadline: '2026-10-05',
    daysLeft: 18,
    location: 'Remote',
    isRemote: true,
    proposalsCount: 5,
    client: clientId,
    clientName: 'FitPulse Labs',
    clientCompany: 'FitPulse LLC',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    verifiedClient: true,
    deliverables: [
      'Cross-platform iOS & Android builds',
      'Local offline storage and cloud sync',
      'Interactive health activity charts'
    ]
  },
  {
    title: 'Modern B2B SaaS Dashboard UI/UX Design System in Figma',
    description: 'Need a senior product designer to craft an intuitive web application dashboard with dark/light mode, reusable component design system, user management workflows, and interactive Figma prototypes.',
    category: 'UI/UX Design',
    categoryId: 'ui-ux',
    categoryName: 'UI/UX Design',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping'],
    budget: 2200,
    budgetType: 'Fixed',
    urgency: 'Hot',
    status: 'Open',
    duration: 'Less than 1 month',
    deadline: '2026-09-30',
    daysLeft: 14,
    location: 'Remote',
    isRemote: true,
    proposalsCount: 2,
    client: clientId,
    clientName: 'CloudScale Analytics',
    clientCompany: 'CloudScale GmbH',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    verifiedClient: true,
    deliverables: [
      'Complete high-fidelity Figma components',
      'Design tokens & responsive layouts',
      'Clickable prototype for client demo'
    ]
  },
  {
    title: 'AI Customer Support Agent with RAG & LangChain',
    description: 'Build an autonomous intelligent support assistant using Gemini API / OpenAI, Pinecone vector database, and Node.js. Should ingest PDF documentation and accurately answer customer queries 24/7.',
    category: 'AI & Machine Learning',
    categoryId: 'ai-ml',
    categoryName: 'AI & Machine Learning',
    skills: ['Python', 'LangChain', 'Node.js', 'Vector DB', 'LLMs', 'API Integration'],
    budget: 5000,
    budgetType: 'Fixed',
    urgency: 'Featured',
    status: 'Open',
    duration: '1-3 months',
    deadline: '2026-10-20',
    daysLeft: 30,
    location: 'Remote',
    isRemote: true,
    proposalsCount: 7,
    client: clientId,
    clientName: 'Aetheris AI Corp',
    clientCompany: 'Aetheris Technologies',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    verifiedClient: true,
    deliverables: [
      'Vector database indexing pipeline',
      'Context-aware conversational API',
      'Admin analytics dashboard for queries'
    ]
  },
  {
    title: 'Cloud DevOps Pipeline & Docker Containerization Migration',
    description: 'We require a DevOps engineer to containerize our Node.js microservices with Docker, configure CI/CD GitHub Actions pipelines, and deploy on AWS ECS with auto-scaling and monitoring.',
    category: 'DevOps & Cloud',
    categoryId: 'devops',
    categoryName: 'DevOps & Cloud',
    skills: ['Docker', 'AWS', 'GitHub Actions', 'CI/CD', 'Kubernetes', 'Linux'],
    budget: 3800,
    budgetType: 'Fixed',
    urgency: 'Urgent',
    status: 'Open',
    duration: '1-3 months',
    deadline: '2026-10-02',
    daysLeft: 12,
    location: 'Remote',
    isRemote: true,
    proposalsCount: 4,
    client: clientId,
    clientName: 'Apex Infrastructure',
    clientCompany: 'Apex Systems',
    clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    verifiedClient: true,
    deliverables: [
      'Optimized Docker multi-stage build files',
      'Automated GitHub Actions CI/CD workflows',
      'CloudWatch monitoring alerts setup'
    ]
  },
  {
    title: 'Interactive Web3 Crypto Wallet & Portfolio Explorer',
    description: 'Looking for a skilled frontend engineer to develop a clean Web3 portfolio dashboard with real-time token tracking, wallet connect integration, and animated chart visualizations using Recharts.',
    category: 'Web Development',
    categoryId: 'web-dev',
    categoryName: 'Web Development',
    skills: ['React', 'TypeScript', 'Web3.js', 'Tailwind CSS', 'Chart.js'],
    budget: 2800,
    budgetType: 'Fixed',
    urgency: 'Hot',
    status: 'Open',
    duration: '1-3 months',
    deadline: '2026-10-10',
    daysLeft: 16,
    location: 'Remote',
    isRemote: true,
    proposalsCount: 6,
    client: clientId,
    clientName: 'CryptoMatrix Tech',
    clientCompany: 'CryptoMatrix Global',
    clientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    verifiedClient: true,
    deliverables: [
      'MetaMask & WalletConnect integration',
      'Live crypto pricing tables & graphs',
      'Clean responsive user dashboard'
    ]
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in .env file!');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // Database me existing user dhoondhna ya valid ObjectId use karna
    let clientId = new mongoose.Types.ObjectId();
    try {
      const existingUser = await User.findOne();
      if (existingUser) {
        clientId = existingUser._id;
        console.log(`👤 Using client user: ${existingUser.name} (${existingUser._id})`);
      }
    } catch (err) {
      console.log('ℹ️ Using generated client ObjectId.');
    }

    const projectsToInsert = sampleProjects(clientId);

    console.log('🌱 Inserting 6 realistic demo projects into database...');
    await Project.insertMany(projectsToInsert);

    console.log('🎉 Database seeded successfully with 6 diverse jobs!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();