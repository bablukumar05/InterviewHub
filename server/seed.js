const mongoose = require('mongoose');
const Organization = require('./models/Organization');
const User = require('./models/User');
const CandidateProfile = require('./models/CandidateProfile');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Interview = require('./models/Interview');
const Question = require('./models/Question');
const Evaluation = require('./models/Evaluation');
const Offer = require('./models/Offer');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const config = require('./config/env');
const { ROLES } = require('./constants/roles');
const {
  APPLICATION_STATUS,
  INTERVIEW_STATUS,
  INTERVIEW_TYPES,
} = require('./constants/status');

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB...');

    await Organization.deleteMany();
    await User.deleteMany();
    await CandidateProfile.deleteMany();
    await Job.deleteMany();
    await Application.deleteMany();
    await Interview.deleteMany();
    await Question.deleteMany();
    await Evaluation.deleteMany();
    await Offer.deleteMany();
    await Notification.deleteMany();
    await AuditLog.deleteMany();

    await Evaluation.syncIndexes();
    await Question.syncIndexes();

    const org = await Organization.create({
      name: 'CodeCraft Labs',
      slug: 'codecraft-labs',
      email: 'hr@codecraft.in',
      phone: '+91 80 4123 5678',
      logo: 'https://via.placeholder.com/150',
      website: 'https://codecraft.in',
      industry: 'Software',
      companySize: '51-200',
      description: 'Product engineering and web development studio.',
      address: {
        street: 'HSR Layout Sector 2',
        city: 'Bengaluru',
        state: 'KA',
        country: 'India',
        zipCode: '560102',
      },
      status: 'ACTIVE',
    });

    const admin = await User.create({
      name: 'Bablu Kumar',
      email: 'admin@interviewhub.com',
      password: 'password123',
      role: ROLES.ADMIN,
      organizationId: org._id,
      title: 'Operations & Admin Lead',
      department: 'Operations',
      isEmailVerified: true,
      isOnboarded: true,
    });

    org.owner = admin._id;
    await org.save();

    const recruiter = await User.create({
      name: 'Neha Kulkarni',
      email: 'recruiter@interviewhub.com',
      password: 'password123',
      role: ROLES.RECRUITER,
      organizationId: org._id,
      title: 'Tech Recruiter',
      department: 'HR & Hiring',
      isEmailVerified: true,
      isOnboarded: true,
    });

    const interviewer = await User.create({
      name: 'Rohan Mehta',
      email: 'interviewer@interviewhub.com',
      password: 'password123',
      role: ROLES.INTERVIEWER,
      organizationId: org._id,
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      skills: ['React', 'JavaScript', 'TypeScript', 'System Design', 'Node.js'],
      isEmailVerified: true,
      isOnboarded: true,
    });

    const interviewer2 = await User.create({
      name: 'Pooja Nair',
      email: 'pooja.nair@interviewhub.com',
      password: 'password123',
      role: ROLES.INTERVIEWER,
      organizationId: org._id,
      title: 'Backend Team Lead',
      department: 'Engineering',
      skills: ['Node.js', 'MongoDB', 'Redis', 'Express', 'System Design'],
      isEmailVerified: true,
      isOnboarded: true,
    });

    const candidate = await User.create({
      name: 'Aman Verma',
      email: 'candidate@interviewhub.com',
      password: 'password123',
      role: ROLES.CANDIDATE,
      organizationId: org._id,
      title: 'Full Stack Developer',
      department: 'Engineering',
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
      experienceYears: 4,
      resumeUrl: '/uploads/sample_resume.pdf',
      isEmailVerified: true,
      isOnboarded: true,
    });

    const candidate2 = await User.create({
      name: 'Karan Malhotra',
      email: 'karan.malhotra@interviewhub.com',
      password: 'password123',
      role: ROLES.CANDIDATE,
      organizationId: org._id,
      title: 'Backend Node.js Developer',
      department: 'Engineering',
      skills: ['Node.js', 'Redis', 'MongoDB', 'Docker', 'PostgreSQL'],
      experienceYears: 5,
      resumeUrl: '/uploads/sample_resume.pdf',
      isEmailVerified: true,
      isOnboarded: true,
    });

    const candidate3 = await User.create({
      name: 'Sneha Iyer',
      email: 'sneha.iyer@interviewhub.com',
      password: 'password123',
      role: ROLES.CANDIDATE,
      organizationId: org._id,
      title: 'Frontend React Developer',
      department: 'Engineering',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      experienceYears: 3,
      resumeUrl: '/uploads/sample_resume.pdf',
      isEmailVerified: true,
      isOnboarded: true,
    });

    const candidate4 = await User.create({
      name: 'Rahul Deshmukh',
      email: 'rahul.deshmukh@interviewhub.com',
      password: 'password123',
      role: ROLES.CANDIDATE,
      organizationId: org._id,
      title: 'MERN Stack Developer',
      department: 'Engineering',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceYears: 2,
      resumeUrl: '/uploads/sample_resume.pdf',
      isEmailVerified: true,
      isOnboarded: true,
    });

    const candidateProfile = new CandidateProfile({
      userId: candidate._id,
      organizationId: org._id,
      headline: 'Full Stack Developer (4 yrs) working with React, Node.js and MongoDB',
      bio: 'I build web apps with React and Node.js. Mostly worked on dashboard products, REST APIs, and database queries.',
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      dateOfBirth: new Date('1998-08-14'),
      skills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'MongoDB', 'Express.js', 'Redis'],
      education: [
        {
          degree: 'B.E. in Computer Science',
          institution: 'PES University, Bengaluru',
          field: 'Computer Science',
          startYear: 2016,
          endYear: 2020,
        },
      ],
      experience: [
        {
          company: 'NexaPay Tech',
          role: 'Senior Software Engineer',
          startDate: new Date('2022-04-01'),
          endDate: new Date('2025-01-01'),
          current: true,
          description: 'Built internal merchant dashboard in React and handled Node.js billing APIs.',
        },
      ],
      certifications: [
        {
          title: 'AWS Certified Developer Associate',
          issuer: 'Amazon Web Services',
          issueDate: new Date('2023-06-01'),
          credentialUrl: 'https://aws.amazon.com/verification',
        },
      ],
      resumeUrl: '/uploads/sample_resume.pdf',
      portfolioUrl: 'https://amanverma.in',
      githubUrl: 'https://github.com/amanverma-dev',
      linkedinUrl: 'https://linkedin.com/in/amanverma',
      preferredRole: 'Senior Full Stack Developer',
      expectedSalary: 2400000,
      noticePeriodDays: 15,
    });
    candidateProfile.calculateProfileCompletion();
    await candidateProfile.save();
    candidate.candidateProfileId = candidateProfile._id;
    await candidate.save();

    const candidateProfile2 = new CandidateProfile({
      userId: candidate2._id,
      organizationId: org._id,
      headline: 'Backend Developer (Node.js, Redis, MongoDB)',
      bio: 'Focused on backend APIs, background jobs, and database optimization.',
      phone: '+91 98201 11223',
      location: 'Pune, India',
      skills: ['Node.js', 'Redis', 'MongoDB', 'Docker', 'System Design'],
      resumeUrl: '/uploads/sample_resume.pdf',
      preferredRole: 'Lead Backend Developer',
      expectedSalary: 2800000,
      noticePeriodDays: 30,
    });
    candidateProfile2.calculateProfileCompletion();
    await candidateProfile2.save();
    candidate2.candidateProfileId = candidateProfile2._id;
    await candidate2.save();

    const candidateProfile3 = new CandidateProfile({
      userId: candidate3._id,
      organizationId: org._id,
      headline: 'Frontend Developer working with React, TypeScript & Tailwind',
      bio: 'Enjoy building clean UI components, forms, and responsive layouts.',
      phone: '+91 97112 33445',
      location: 'Hyderabad, India',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      resumeUrl: '/uploads/sample_resume.pdf',
      preferredRole: 'Frontend React Developer',
      expectedSalary: 1800000,
      noticePeriodDays: 15,
    });
    candidateProfile3.calculateProfileCompletion();
    await candidateProfile3.save();
    candidate3.candidateProfileId = candidateProfile3._id;
    await candidate3.save();

    const job1 = await Job.create({
      title: 'Senior Full Stack Developer (MERN)',
      department: 'Engineering',
      location: 'Bengaluru / Remote',
      workMode: 'REMOTE',
      employmentType: 'FULL_TIME',
      type: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      salary: 2400000,
      salaryRange: { min: 2000000, max: 2800000, currency: 'INR' },
      description:
        'Looking for a hands-on MERN stack developer to work on our core web platform, build APIs in Node/Express, and maintain React dashboards.',
      responsibilities: [
        'Write clean REST APIs in Node.js and Express',
        'Build and maintain frontend pages in React',
        'Optimize slow MongoDB queries and indexes',
      ],
      requirements: [
        '3+ years working with React and Node.js in production',
        'Good understanding of JavaScript, async code, and REST APIs',
        'Practical experience with MongoDB and Git workflow',
      ],
      skills: ['react', 'node.js', 'mongodb', 'express', 'typescript'],
      openings: 2,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      organizationId: org._id,
      recruiterId: recruiter._id,
      postedBy: recruiter._id,
      interviewRounds: [
        { name: 'Round 1: React & Node Coding', type: 'TECHNICAL', order: 1 },
        { name: 'Round 2: System Design & DB', type: 'SYSTEM_DESIGN', order: 2 },
        { name: 'Round 3: Team & Culture Fit', type: 'BEHAVIORAL', order: 3 },
      ],
      applicantsCount: 3,
    });

    const job2 = await Job.create({
      title: 'Frontend React Developer',
      department: 'Engineering',
      location: 'Pune / Hybrid',
      workMode: 'HYBRID',
      employmentType: 'FULL_TIME',
      type: 'FULL_TIME',
      experienceLevel: 'MID',
      salary: 1800000,
      salaryRange: { min: 1500000, max: 2100000, currency: 'INR' },
      description:
        'Join our frontend team to build clean dashboards, reusable components, and responsive screens using React and Tailwind CSS.',
      responsibilities: [
        'Build reusable UI components in React and Tailwind',
        'Integrate frontend screens with backend REST APIs',
        'Fix UI bugs and improve page load speed',
      ],
      requirements: [
        '2+ years of hands-on experience with React and TypeScript',
        'Good grip on CSS, responsive layouts, and state management',
      ],
      skills: ['react', 'typescript', 'tailwind', 'javascript'],
      openings: 2,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      organizationId: org._id,
      recruiterId: recruiter._id,
      postedBy: recruiter._id,
      interviewRounds: [
        { name: 'Round 1: Frontend Machine Coding', type: 'TECHNICAL', order: 1 },
        { name: 'Round 2: Hiring Manager Discussion', type: 'BEHAVIORAL', order: 2 },
      ],
      applicantsCount: 2,
    });

    const job3 = await Job.create({
      title: 'Backend Engineer (Node.js & MongoDB)',
      department: 'Engineering',
      location: 'Hyderabad / Remote',
      workMode: 'REMOTE',
      employmentType: 'FULL_TIME',
      type: 'FULL_TIME',
      experienceLevel: 'LEAD',
      salary: 3000000,
      salaryRange: { min: 2600000, max: 3400000, currency: 'INR' },
      description:
        'Work on backend services, API performance, Redis caching, and background job queues.',
      responsibilities: [
        'Maintain MongoDB schemas, indexes, and aggregation queries',
        'Build reliable background workers and webhook handlers',
      ],
      requirements: [
        '5+ years backend development experience in Node.js',
        'Solid experience with MongoDB, Redis, and Docker',
      ],
      skills: ['node.js', 'redis', 'mongodb', 'system-design', 'docker'],
      openings: 1,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      organizationId: org._id,
      recruiterId: recruiter._id,
      postedBy: recruiter._id,
      interviewRounds: [
        { name: 'Round 1: Backend & API Design', type: 'SYSTEM_DESIGN', order: 1 },
        { name: 'Round 2: Code Review & Debugging', type: 'TECHNICAL', order: 2 },
      ],
      applicantsCount: 1,
    });

    const questionsData = [
      {
        title: 'How does React decide when to re-render a component?',
        description:
          'Walk through what triggers a re-render in React and how keys help when rendering lists.',
        expectedAnswer:
          'State or prop changes trigger re-renders. Keys help React match list items across renders so DOM nodes are not recreated unnecessarily.',
        evaluationGuidance:
          'Check if the candidate understands state updates, reference equality in props, and why array index as key causes bugs.',
        field: 'Software Engineering',
        role: 'Full Stack Engineer',
        category: 'React & Frontend',
        skills: ['react', 'javascript', 'performance'],
        tags: ['react', 'rendering', 'hooks'],
        difficulty: 'MEDIUM',
        type: 'TECHNICAL',
        visibility: 'ORGANIZATION',
        isActive: true,
        organizationId: org._id,
        createdBy: interviewer._id,
      },
      {
        title: 'How would you build a basic API rate limiter using Redis?',
        description:
          'Suppose we want to limit each user to 100 requests per minute across multiple Node servers. How would you store and check the counter?',
        expectedAnswer:
          'Use Redis INCR with a 60-second EXPIRE key per user/window, or a Lua script so incrementing and setting TTL happen together.',
        evaluationGuidance:
          'Check if they handle race conditions when setting expiry and return HTTP 429 when limit is crossed.',
        field: 'Software Engineering',
        role: 'Backend Engineer',
        category: 'System Design',
        skills: ['node.js', 'redis', 'system-design'],
        tags: ['rate-limiter', 'redis', 'api'],
        difficulty: 'HARD',
        type: 'SYSTEM_DESIGN',
        visibility: 'ORGANIZATION',
        isActive: true,
        organizationId: org._id,
        createdBy: interviewer._id,
      },
      {
        title: 'How do you order fields in a MongoDB compound index?',
        description:
          'If a query filters by organizationId and status, and sorts by scheduledAt, what order should the index fields be in?',
        expectedAnswer:
          'Put equality filters first (organizationId, status), followed by the sort field (scheduledAt) so MongoDB can filter and sort using the index directly.',
        evaluationGuidance:
          'See if they know how to check query plans using explain() and avoid full collection scans.',
        field: 'Software Engineering',
        role: 'Full Stack Engineer',
        category: 'Database & MongoDB',
        skills: ['mongodb', 'database', 'performance'],
        tags: ['mongodb', 'indexing', 'queries'],
        difficulty: 'MEDIUM',
        type: 'TECHNICAL',
        visibility: 'ORGANIZATION',
        isActive: true,
        organizationId: org._id,
        createdBy: interviewer2._id,
      },
      {
        title: 'Difference between process.nextTick, Promises, and setTimeout in Node.js',
        description:
          'In what order do these run inside the Node event loop, and what blocks the main thread?',
        expectedAnswer:
          'nextTick and Promise callbacks run right after the current synchronous code finishes, before timers like setTimeout. Heavy loops block the single thread.',
        evaluationGuidance:
          'Check if they can trace a simple console.log snippet with Promise and setTimeout.',
        field: 'Software Engineering',
        role: 'Backend Engineer',
        category: 'Node.js Runtime',
        skills: ['node.js', 'javascript', 'concurrency'],
        tags: ['event-loop', 'async', 'nodejs'],
        difficulty: 'MEDIUM',
        type: 'TECHNICAL',
        visibility: 'ORGANIZATION',
        isActive: true,
        organizationId: org._id,
        createdBy: interviewer2._id,
      },
      {
        title: 'Write a debounce function in JavaScript for a search box',
        description:
          'Implement a debounce helper that delays API calls until the user stops typing for 300ms.',
        expectedAnswer:
          'Store timeout ID in closure, call clearTimeout on every keypress, and start a new setTimeout.',
        evaluationGuidance:
          'Check if arguments are passed properly and old timers are cleared cleanly.',
        field: 'Software Engineering',
        role: 'Frontend Engineer',
        category: 'Coding & Algorithms',
        skills: ['javascript', 'typescript', 'react'],
        tags: ['debounce', 'closures', 'coding'],
        difficulty: 'EASY',
        type: 'CODING',
        visibility: 'ORGANIZATION',
        isActive: true,
        organizationId: org._id,
        createdBy: interviewer._id,
      },
      {
        title: 'Handling duplicate webhook events on the backend',
        description:
          'Payment gateways sometimes send the same webhook twice. How do you make sure the order is not processed twice?',
        expectedAnswer:
          'Store the unique event ID from the webhook in DB with a unique index and ignore events that were already processed.',
        evaluationGuidance:
          'Look for practical handling of retries, unique constraints, and signature verification.',
        field: 'Software Engineering',
        role: 'Backend Engineer',
        category: 'System Design',
        skills: ['system-design', 'node.js', 'microservices'],
        tags: ['webhooks', 'backend', 'queues'],
        difficulty: 'HARD',
        type: 'SYSTEM_DESIGN',
        visibility: 'ORGANIZATION',
        isActive: true,
        organizationId: org._id,
        createdBy: interviewer2._id,
      },
      {
        title: 'Tell me about a production bug you fixed recently',
        description:
          'How did you find the issue, fix it, and make sure it did not happen again?',
        expectedAnswer:
          'Clear walkthrough of checking logs, reproducing the bug, rolling out the fix, and adding a test case.',
        evaluationGuidance:
          'Look for honest ownership and practical debugging steps.',
        field: 'Software Engineering',
        role: 'Full Stack Engineer',
        category: 'Behavioral & Leadership',
        skills: ['communication', 'leadership', 'debugging'],
        tags: ['debugging', 'behavioral', 'ownership'],
        difficulty: 'MEDIUM',
        type: 'BEHAVIORAL',
        visibility: 'ORGANIZATION',
        isActive: true,
        organizationId: org._id,
        createdBy: interviewer._id,
      },
      {
        title: 'Avoiding old API responses overwriting new state in React',
        description:
          'When a user clicks filters quickly, how do you stop an older slow API call from overwriting the latest result?',
        expectedAnswer:
          'Cancel the previous request using AbortController inside the useEffect cleanup function.',
        evaluationGuidance:
          'Check if they know how to write a useEffect cleanup function.',
        field: 'Software Engineering',
        role: 'Frontend Engineer',
        category: 'React & Frontend',
        skills: ['react', 'javascript', 'async'],
        tags: ['react', 'abortcontroller', 'hooks'],
        difficulty: 'MEDIUM',
        type: 'TECHNICAL',
        visibility: 'ORGANIZATION',
        isActive: true,
        organizationId: org._id,
        createdBy: interviewer._id,
      },
    ];

    const createdQuestions = await Question.insertMany(questionsData);
    const [q1, q2, q3, q4] = createdQuestions;

    const app1 = await Application.create({
      jobId: job1._id,
      job: job1._id,
      candidateId: candidate._id,
      candidate: candidate._id,
      candidateProfile: candidateProfile._id,
      organizationId: org._id,
      resumeUrl: '/uploads/sample_resume.pdf',
      resume: {
        url: '/uploads/sample_resume.pdf',
        originalName: 'Aman_Verma_Resume.pdf',
      },
      coverLetter:
        'Hi team, I have 4 years of hands-on experience with React and Node.js. Sharing my resume for the Senior Full Stack role.',
      experienceYears: 4,
      expectedSalary: 2400000,
      skills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
      status: APPLICATION_STATUS.INTERVIEW,
      currentRound: 2,
      interviewScheduledAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
      recruiterNotes:
        'Good GitHub projects and relevant MERN experience. Cleared Round 1 with positive feedback from Rohan and Pooja.',
      statusHistory: [
        {
          status: APPLICATION_STATUS.APPLIED,
          updatedBy: candidate._id,
          note: 'Applied with resume',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          status: APPLICATION_STATUS.SHORTLISTED,
          updatedBy: recruiter._id,
          note: 'Shortlisted after checking resume and GitHub',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          status: APPLICATION_STATUS.INTERVIEW,
          updatedBy: recruiter._id,
          note: 'Scheduled Round 1 & Round 2 interviews',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    const app2 = await Application.create({
      jobId: job2._id,
      job: job2._id,
      candidateId: candidate._id,
      candidate: candidate._id,
      candidateProfile: candidateProfile._id,
      organizationId: org._id,
      resumeUrl: '/uploads/sample_resume.pdf',
      resume: {
        url: '/uploads/sample_resume.pdf',
        originalName: 'Aman_Verma_Resume.pdf',
      },
      coverLetter:
        'Interested in the Frontend React Developer role. Have built several dashboard apps in React and TypeScript.',
      experienceYears: 4,
      expectedSalary: 1900000,
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      status: APPLICATION_STATUS.OFFER_SENT,
      currentRound: 2,
      offerDetails: {
        position: 'Frontend React Developer',
        salaryPackage: 1950000,
        joiningDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        benefits: 'Health Insurance, MacBook Pro, Flexible Leave Policy',
        offerLetterUrl: 'https://codecraft.in/offers/Aman_Verma_Offer.pdf',
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      statusHistory: [
        {
          status: APPLICATION_STATUS.APPLIED,
          updatedBy: candidate._id,
          note: 'Application submitted',
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
        {
          status: APPLICATION_STATUS.SHORTLISTED,
          updatedBy: recruiter._id,
          note: 'Shortlisted for React coding round',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
        {
          status: APPLICATION_STATUS.INTERVIEW,
          updatedBy: recruiter._id,
          note: 'Cleared technical round',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          status: APPLICATION_STATUS.OFFER_SENT,
          updatedBy: recruiter._id,
          note: 'Sent offer letter',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      ],
    });

    const app3 = await Application.create({
      jobId: job1._id,
      job: job1._id,
      candidateId: candidate2._id,
      candidate: candidate2._id,
      candidateProfile: candidateProfile2._id,
      organizationId: org._id,
      resumeUrl: '/uploads/sample_resume.pdf',
      resume: {
        url: '/uploads/sample_resume.pdf',
        originalName: 'Karan_Malhotra_Resume.pdf',
      },
      coverLetter: '5 years working on Node.js APIs and MongoDB.',
      experienceYears: 5,
      expectedSalary: 2600000,
      skills: ['Node.js', 'Redis', 'MongoDB', 'System Design'],
      status: APPLICATION_STATUS.INTERVIEW,
      currentRound: 1,
      interviewScheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      statusHistory: [
        {
          status: APPLICATION_STATUS.APPLIED,
          updatedBy: candidate2._id,
          note: 'Application submitted',
        },
        {
          status: APPLICATION_STATUS.SHORTLISTED,
          updatedBy: recruiter._id,
          note: 'Good backend experience',
        },
        {
          status: APPLICATION_STATUS.INTERVIEW,
          updatedBy: recruiter._id,
          note: 'Scheduled Round 1 interview',
        },
      ],
    });

    const app4 = await Application.create({
      jobId: job1._id,
      job: job1._id,
      candidateId: candidate3._id,
      candidate: candidate3._id,
      candidateProfile: candidateProfile3._id,
      organizationId: org._id,
      resumeUrl: '/uploads/sample_resume.pdf',
      resume: {
        url: '/uploads/sample_resume.pdf',
        originalName: 'Sneha_Iyer_Resume.pdf',
      },
      coverLetter: 'Frontend developer with 3 years in React and TypeScript.',
      experienceYears: 3,
      expectedSalary: 1800000,
      skills: ['React', 'TypeScript', 'Next.js'],
      status: APPLICATION_STATUS.SHORTLISTED,
      currentRound: 0,
      statusHistory: [
        {
          status: APPLICATION_STATUS.APPLIED,
          updatedBy: candidate3._id,
          note: 'Applied from jobs page',
        },
        {
          status: APPLICATION_STATUS.SHORTLISTED,
          updatedBy: recruiter._id,
          note: 'Shortlisted for Round 1',
        },
      ],
    });

    const app5 = await Application.create({
      jobId: job3._id,
      job: job3._id,
      candidateId: candidate4._id,
      candidate: candidate4._id,
      organizationId: org._id,
      resumeUrl: '/uploads/sample_resume.pdf',
      coverLetter: 'Applying for the Backend Engineer role.',
      experienceYears: 2,
      expectedSalary: 1600000,
      skills: ['JavaScript', 'React', 'Node.js'],
      status: APPLICATION_STATUS.APPLIED,
      currentRound: 0,
    });

    const interview1 = await Interview.create({
      applicationId: app1._id,
      application: app1._id,
      candidateId: candidate._id,
      candidate: candidate._id,
      candidateProfileId: candidateProfile._id,
      interviewerId: interviewer._id,
      interviewer: interviewer._id,
      interviewers: [
        { userId: interviewer._id, role: 'PRIMARY' },
        { userId: interviewer2._id, role: 'PANEL' },
      ],
      recruiterId: recruiter._id,
      scheduledBy: recruiter._id,
      jobId: job1._id,
      organizationId: org._id,
      roundNumber: 1,
      roundName: 'Round 1: React & Node Coding',
      roundType: 'TECHNICAL',
      type: INTERVIEW_TYPES.TECHNICAL,
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      duration: 60,
      durationMinutes: 60,
      meetingType: 'VIDEO',
      meetingUrl: 'https://meet.google.com/ihub-r1-mern',
      meetingLink: 'https://meet.google.com/ihub-r1-mern',
      location: 'Google Meet',
      status: INTERVIEW_STATUS.COMPLETED,
      instructions:
        'Check React hooks, state updates, Express API structure, and MongoDB queries.',
      notes: 'Both interviewers gave a positive thumbs-up.',
    });

    const interview2 = await Interview.create({
      applicationId: app1._id,
      application: app1._id,
      candidateId: candidate._id,
      candidate: candidate._id,
      candidateProfileId: candidateProfile._id,
      interviewerId: interviewer._id,
      interviewer: interviewer._id,
      interviewers: [
        { userId: interviewer._id, role: 'PRIMARY' },
        { userId: interviewer2._id, role: 'PANEL' },
      ],
      recruiterId: recruiter._id,
      scheduledBy: recruiter._id,
      jobId: job1._id,
      organizationId: org._id,
      roundNumber: 2,
      roundName: 'Round 2: System Design & DB',
      roundType: 'SYSTEM_DESIGN',
      type: INTERVIEW_TYPES.SYSTEM_DESIGN,
      scheduledAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
      duration: 60,
      durationMinutes: 60,
      meetingType: 'VIDEO',
      meetingUrl: 'https://meet.google.com/ihub-r2-sysdesign',
      meetingLink: 'https://meet.google.com/ihub-r2-sysdesign',
      location: 'Google Meet',
      status: INTERVIEW_STATUS.CONFIRMED,
      instructions:
        'Discuss API rate limiting, webhook retries, and database schema design.',
    });

    const interview3 = await Interview.create({
      applicationId: app3._id,
      application: app3._id,
      candidateId: candidate2._id,
      candidate: candidate2._id,
      candidateProfileId: candidateProfile2._id,
      interviewerId: interviewer._id,
      interviewer: interviewer._id,
      interviewers: [{ userId: interviewer._id, role: 'PRIMARY' }],
      recruiterId: recruiter._id,
      scheduledBy: recruiter._id,
      jobId: job1._id,
      organizationId: org._id,
      roundNumber: 1,
      roundName: 'Round 1: React & Node Coding',
      roundType: 'TECHNICAL',
      type: INTERVIEW_TYPES.TECHNICAL,
      scheduledAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      duration: 60,
      durationMinutes: 60,
      meetingType: 'VIDEO',
      meetingUrl: 'https://meet.google.com/ihub-karan-r1',
      meetingLink: 'https://meet.google.com/ihub-karan-r1',
      location: 'Google Meet',
      status: INTERVIEW_STATUS.SCHEDULED,
      instructions: 'Focus on Node.js event loop, Redis caching, and REST APIs.',
    });

    await Evaluation.create({
      organizationId: org._id,
      interviewId: interview1._id,
      applicationId: app1._id,
      jobId: job1._id,
      candidateId: candidate._id,
      interviewerId: interviewer._id,
      questionScores: [
        {
          questionId: q1._id,
          questionText: q1.title,
          skill: 'react',
          score: 5,
          maxScore: 5,
          notes: 'Explained re-renders and list keys clearly with practical examples.',
        },
        {
          questionId: q2._id,
          questionText: q2.title,
          skill: 'system-design',
          score: 4.5,
          maxScore: 5,
          notes: 'Wrote clean Redis counter logic and handled TTL edge cases.',
        },
      ],
      skillScores: [
        {
          skill: 'react',
          score: 5,
          maxScore: 5,
          comment: 'Very comfortable with React hooks and component structure.',
        },
        {
          skill: 'node.js',
          score: 4.5,
          maxScore: 5,
          comment: 'Good async error handling in Express.',
        },
        {
          skill: 'system-design',
          score: 4.5,
          maxScore: 5,
          comment: 'Practical understanding of caching and rate limits.',
        },
      ],
      overallScore: 93,
      recommendation: 'STRONG_HIRE',
      strengths:
        'Strong hands-on grip on React and Node.js. Writes clean code without overcomplicating.',
      weaknesses:
        'Needed a small hint on Redis multi-node failover.',
      feedback:
        'Aman did really well in coding and API design. Definitely good to move to Round 2.',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      createdBy: interviewer._id,
      updatedBy: interviewer._id,
    });

    await Evaluation.create({
      organizationId: org._id,
      interviewId: interview1._id,
      applicationId: app1._id,
      jobId: job1._id,
      candidateId: candidate._id,
      interviewerId: interviewer2._id,
      questionScores: [
        {
          questionId: q3._id,
          questionText: q3.title,
          skill: 'mongodb',
          score: 4.5,
          maxScore: 5,
          notes: 'Ordered the compound index fields properly.',
        },
        {
          questionId: q4._id,
          questionText: q4.title,
          skill: 'node.js',
          score: 4,
          maxScore: 5,
          notes: 'Traced the Promise and setTimeout output accurately.',
        },
      ],
      skillScores: [
        {
          skill: 'mongodb',
          score: 4.5,
          maxScore: 5,
          comment: 'Knows how to debug slow queries and add indexes.',
        },
        {
          skill: 'node.js',
          score: 4.5,
          maxScore: 5,
          comment: 'Clear on async flow and event loop.',
        },
      ],
      overallScore: 88,
      recommendation: 'HIRE',
      strengths:
        'Good database fundamentals and practical backend debugging.',
      weaknesses:
        'Less hands-on with worker threads.',
      feedback:
        'Solid backend skills to pair with his React experience.',
      status: 'REVIEWED',
      submittedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      reviewedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      reviewedBy: recruiter._id,
      createdBy: interviewer2._id,
      updatedBy: recruiter._id,
    });

    await Offer.create({
      applicationId: app2._id,
      candidateId: candidate._id,
      jobId: job2._id,
      organizationId: org._id,
      createdBy: recruiter._id,
      position: 'Frontend React Developer',
      title: 'Frontend React Developer',
      salary: 1950000,
      joiningDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      benefits: 'Health Insurance, MacBook Pro, Flexible Leave Policy',
      offerLetterUrl: '/uploads/sample_offer_letter.pdf',
      status: 'SENT',
      sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      notes: 'Standard full-time offer package.',
    });

    await Notification.insertMany([
      {
        userId: candidate._id,
        recipient: candidate._id,
        organizationId: org._id,
        title: 'Round 2 Interview Confirmed',
        message:
          'Your Round 2: System Design & DB interview for Senior Full Stack Developer (MERN) is confirmed.',
        type: 'INTERVIEW_SCHEDULED',
        relatedId: interview2._id,
        isRead: false,
        read: false,
        link: '/candidate/interviews',
      },
      {
        userId: candidate._id,
        recipient: candidate._id,
        organizationId: org._id,
        title: 'Job Offer Received',
        message:
          'CodeCraft Labs has sent you an offer for Frontend React Developer.',
        type: 'OFFER_GENERATED',
        relatedId: app2._id,
        isRead: false,
        read: false,
        link: '/candidate/offers',
      },
      {
        userId: recruiter._id,
        recipient: recruiter._id,
        organizationId: org._id,
        title: 'Interview Feedback Submitted (93%)',
        message:
          'Rohan Mehta submitted Round 1 feedback for Aman Verma.',
        type: 'EVALUATION_SUBMITTED',
        relatedId: interview1._id,
        isRead: false,
        read: false,
        link: `/recruiter/interviews/${interview1._id}`,
      },
      {
        userId: interviewer._id,
        recipient: interviewer._id,
        organizationId: org._id,
        title: 'Interview Assigned: Aman Verma',
        message:
          'You are scheduled to take Round 2: System Design & DB.',
        type: 'INTERVIEW_SCHEDULED',
        relatedId: interview2._id,
        isRead: false,
        read: false,
        link: `/interviewer/interviews/${interview2._id}`,
      },
      {
        userId: admin._id,
        recipient: admin._id,
        organizationId: org._id,
        title: 'Workspace Ready',
        message:
          'All team accounts, job posts, and question bank items are active.',
        type: 'SYSTEM',
        isRead: false,
        read: false,
        link: '/admin/audit-logs',
      },
    ]);

    await AuditLog.insertMany([
      {
        userId: recruiter._id,
        user: recruiter._id,
        organizationId: org._id,
        action: 'CANDIDATE_SHORTLISTED',
        entity: 'APPLICATION',
        entityId: app1._id,
        description:
          'Neha Kulkarni shortlisted Aman Verma for Senior Full Stack Developer (MERN)',
        ipAddress: '192.168.1.14',
      },
      {
        userId: interviewer._id,
        user: interviewer._id,
        organizationId: org._id,
        action: 'EVALUATION_SUBMITTED',
        entity: 'EVALUATION',
        entityId: interview1._id,
        description:
          'Rohan Mehta submitted scorecard (93% • STRONG_HIRE) for Aman Verma',
        ipAddress: '192.168.1.22',
      },
      {
        userId: recruiter._id,
        user: recruiter._id,
        organizationId: org._id,
        action: 'OFFER_EXTENDED',
        entity: 'OFFER',
        entityId: app2._id,
        description:
          'Neha Kulkarni sent offer letter to Aman Verma for Frontend React Developer',
        ipAddress: '192.168.1.14',
      },
      {
        userId: admin._id,
        user: admin._id,
        organizationId: org._id,
        action: 'SYSTEM_SEED',
        entity: 'USER',
        description:
          'Bablu Kumar set up initial team accounts and sample jobs',
        ipAddress: '127.0.0.1',
      },
    ]);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
