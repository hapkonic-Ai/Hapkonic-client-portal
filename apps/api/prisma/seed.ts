import { PrismaClient, Role, ProjectStatus, MilestoneStatus, TaskStatus, DocumentCategory, InvoiceStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Clean slate ────────────────────────────────────────────────────────────
  await prisma.adminLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.progressReaction.deleteMany()
  await prisma.progressComment.deleteMany()
  await prisma.progressUpdate.deleteMany()
  await prisma.paymentReminder.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.document.deleteMany()
  await prisma.task.deleteMany()
  await prisma.milestoneComment.deleteMany()
  await prisma.milestone.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.client.deleteMany()

  console.log('  ✓ Cleared existing data')

  // ── Admin users ────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@12345', 12)
  const managerHash = await bcrypt.hash('Manager@12345', 12)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hapkonic.com',
      name: 'Harsh Raj',
      role: Role.admin,
      passwordHash: adminHash,
      forcePasswordReset: false,
    },
  })

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@hapkonic.com',
      name: 'Priya Sharma',
      role: Role.manager,
      passwordHash: managerHash,
      forcePasswordReset: false,
    },
  })

  console.log('  ✓ Created admin & manager users')

  // ── Clients ────────────────────────────────────────────────────────────────
  const clientA = await prisma.client.create({
    data: {
      companyName: 'TechVentures Pvt Ltd',
      industry: 'SaaS',
      contactName: 'Arjun Mehta',
      contactEmail: 'arjun@techventures.in',
      contactPhone: '+91 98765 43210',
      website: 'https://techventures.in',
    },
  })

  const clientB = await prisma.client.create({
    data: {
      companyName: 'RetailEdge Solutions',
      industry: 'E-Commerce',
      contactName: 'Sneha Patel',
      contactEmail: 'sneha@retailedge.com',
      contactPhone: '+91 87654 32109',
      website: 'https://retailedge.com',
    },
  })

  const clientC = await prisma.client.create({
    data: {
      companyName: 'HealthFirst Digital',
      industry: 'HealthTech',
      contactName: 'Dr. Rajesh Kumar',
      contactEmail: 'rajesh@healthfirst.io',
      contactPhone: '+91 76543 21098',
      website: 'https://healthfirst.io',
    },
  })

  console.log('  ✓ Created 3 clients')

  // ── Client users ───────────────────────────────────────────────────────────
  const clientHash = await bcrypt.hash('Client@12345', 12)

  const clientUserA = await prisma.user.create({
    data: {
      email: 'arjun@techventures.in',
      name: 'Arjun Mehta',
      role: Role.client,
      clientId: clientA.id,
      passwordHash: clientHash,
      forcePasswordReset: true,
    },
  })

  const clientUserB = await prisma.user.create({
    data: {
      email: 'sneha@retailedge.com',
      name: 'Sneha Patel',
      role: Role.client,
      clientId: clientB.id,
      passwordHash: clientHash,
      forcePasswordReset: true,
    },
  })

  await prisma.user.create({
    data: {
      email: 'rajesh@healthfirst.io',
      name: 'Dr. Rajesh Kumar',
      role: Role.client,
      clientId: clientC.id,
      passwordHash: clientHash,
      forcePasswordReset: true,
    },
  })

  console.log('  ✓ Created client users')

  // ── Projects ───────────────────────────────────────────────────────────────
  const projectA1 = await prisma.project.create({
    data: {
      name: 'SaaS Platform MVP',
      description: 'Full-stack SaaS platform with subscription billing, dashboard, and API.',
      clientId: clientA.id,
      status: ProjectStatus.in_progress,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-06-30'),
      overallPct: 45,
      designPct: 80,
      devPct: 40,
      testingPct: 10,
      deployPct: 0,
    },
  })

  const projectA2 = await prisma.project.create({
    data: {
      name: 'Mobile App — React Native',
      description: 'Companion mobile app for iOS and Android platforms.',
      clientId: clientA.id,
      status: ProjectStatus.planning,
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-12-31'),
      overallPct: 0,
      designPct: 0,
      devPct: 0,
      testingPct: 0,
      deployPct: 0,
    },
  })

  const projectB1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Redesign',
      description: 'Full redesign and rebuild of RetailEdge storefront with Headless Commerce.',
      clientId: clientB.id,
      status: ProjectStatus.in_progress,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-08-31'),
      overallPct: 30,
      designPct: 70,
      devPct: 20,
      testingPct: 0,
      deployPct: 0,
    },
  })

  const projectC1 = await prisma.project.create({
    data: {
      name: 'Patient Portal',
      description: 'Secure patient portal for appointment booking, records, and teleconsult.',
      clientId: clientC.id,
      status: ProjectStatus.completed,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-12-31'),
      overallPct: 100,
      designPct: 100,
      devPct: 100,
      testingPct: 100,
      deployPct: 100,
    },
  })

  console.log('  ✓ Created 4 projects')

  // ── Milestones ─────────────────────────────────────────────────────────────
  const ms1 = await prisma.milestone.create({
    data: {
      projectId: projectA1.id,
      title: 'UI/UX Design Complete',
      description: 'All wireframes, mockups, and design system finalized.',
      status: MilestoneStatus.completed,
      dueDate: new Date('2025-02-28'),
      completedAt: new Date('2025-02-25'),
      order: 1,
    },
  })

  const ms2 = await prisma.milestone.create({
    data: {
      projectId: projectA1.id,
      title: 'Backend API v1',
      description: 'Core REST API with auth, billing, and data endpoints.',
      status: MilestoneStatus.in_progress,
      dueDate: new Date('2025-04-30'),
      order: 2,
    },
  })

  const ms3 = await prisma.milestone.create({
    data: {
      projectId: projectA1.id,
      title: 'Frontend Integration',
      description: 'Connect React frontend to backend APIs.',
      status: MilestoneStatus.upcoming,
      dueDate: new Date('2025-06-15'),
      order: 3,
    },
  })

  const ms4 = await prisma.milestone.create({
    data: {
      projectId: projectB1.id,
      title: 'Design System & Prototypes',
      description: 'New design tokens, component library, high-fidelity prototypes.',
      status: MilestoneStatus.completed,
      dueDate: new Date('2025-03-15'),
      completedAt: new Date('2025-03-12'),
      order: 1,
    },
  })

  await prisma.milestone.create({
    data: {
      projectId: projectB1.id,
      title: 'Product Catalog & Search',
      description: 'Headless product catalog with Algolia-powered search.',
      status: MilestoneStatus.in_progress,
      dueDate: new Date('2025-05-31'),
      order: 2,
    },
  })

  console.log('  ✓ Created milestones')

  // ── Milestone comments ─────────────────────────────────────────────────────
  const rootComment = await prisma.milestoneComment.create({
    data: {
      milestoneId: ms1.id,
      userId: clientUserA.id,
      body: 'The designs look great! Could we tweak the dashboard color scheme slightly?',
    },
  })

  await prisma.milestoneComment.create({
    data: {
      milestoneId: ms1.id,
      userId: managerUser.id,
      body: 'Absolutely, we can adjust the primary palette. Will share updated screens tomorrow.',
      parentId: rootComment.id,
    },
  })

  await prisma.milestoneComment.create({
    data: {
      milestoneId: ms2.id,
      userId: adminUser.id,
      body: 'Auth endpoints are complete. Working on billing integration with Stripe now.',
    },
  })

  console.log('  ✓ Created milestone comments')

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const tasksData = [
    { projectId: projectA1.id, milestoneId: ms1.id, title: 'Design dashboard wireframes', status: TaskStatus.done, assigneeId: managerUser.id, dueDate: new Date('2025-02-10') },
    { projectId: projectA1.id, milestoneId: ms1.id, title: 'Create component library in Figma', status: TaskStatus.done, assigneeId: managerUser.id, dueDate: new Date('2025-02-20') },
    { projectId: projectA1.id, milestoneId: ms2.id, title: 'Set up Express + Prisma boilerplate', status: TaskStatus.done, assigneeId: adminUser.id, dueDate: new Date('2025-03-05') },
    { projectId: projectA1.id, milestoneId: ms2.id, title: 'Implement JWT authentication', status: TaskStatus.done, assigneeId: adminUser.id, dueDate: new Date('2025-03-15') },
    { projectId: projectA1.id, milestoneId: ms2.id, title: 'Build billing endpoints (Stripe)', status: TaskStatus.in_progress, assigneeId: adminUser.id, dueDate: new Date('2025-04-20') },
    { projectId: projectA1.id, milestoneId: ms3.id, title: 'Integrate auth flow in React', status: TaskStatus.todo, assigneeId: managerUser.id, dueDate: new Date('2025-05-15') },
    { projectId: projectA1.id, milestoneId: ms3.id, title: 'Build dashboard charts (Recharts)', status: TaskStatus.todo, assigneeId: managerUser.id, dueDate: new Date('2025-06-01') },
    { projectId: projectB1.id, milestoneId: ms4.id, title: 'Define brand tokens (colors, typography)', status: TaskStatus.done, assigneeId: managerUser.id, dueDate: new Date('2025-03-01') },
    { projectId: projectB1.id, milestoneId: ms4.id, title: 'Build Storybook component library', status: TaskStatus.done, assigneeId: managerUser.id, dueDate: new Date('2025-03-10') },
  ]

  for (const task of tasksData) {
    await prisma.task.create({ data: task })
  }

  console.log('  ✓ Created tasks')

  // ── Documents ──────────────────────────────────────────────────────────────
  const docsData = [
    {
      projectId: projectA1.id,
      clientId: clientA.id,
      name: 'SaaS Platform — Project Brief.pdf',
      url: 'https://utfs.io/f/demo-brief.pdf',
      category: DocumentCategory.contract,
      size: 245760,
      mimeType: 'application/pdf',
      uploadedById: adminUser.id,
    },
    {
      projectId: projectA1.id,
      clientId: clientA.id,
      name: 'UI Design — Dashboard v2.figma',
      url: 'https://utfs.io/f/demo-design.fig',
      category: DocumentCategory.design_asset,
      size: 8388608,
      mimeType: 'application/figma',
      uploadedById: managerUser.id,
    },
    {
      projectId: projectA1.id,
      clientId: clientA.id,
      name: 'API Documentation v1.pdf',
      url: 'https://utfs.io/f/demo-apidocs.pdf',
      category: DocumentCategory.technical_spec,
      size: 512000,
      mimeType: 'application/pdf',
      uploadedById: adminUser.id,
    },
    {
      projectId: projectB1.id,
      clientId: clientB.id,
      name: 'E-Commerce Redesign Proposal.pdf',
      url: 'https://utfs.io/f/demo-proposal-b.pdf',
      category: DocumentCategory.proposal,
      size: 307200,
      mimeType: 'application/pdf',
      uploadedById: adminUser.id,
    },
    {
      projectId: projectC1.id,
      clientId: clientC.id,
      name: 'Patient Portal — Completion Report.pdf',
      url: 'https://utfs.io/f/demo-completion.pdf',
      category: DocumentCategory.report,
      size: 409600,
      mimeType: 'application/pdf',
      uploadedById: adminUser.id,
    },
  ]

  for (const doc of docsData) {
    await prisma.document.create({ data: doc })
  }

  console.log('  ✓ Created documents')

  // ── Meetings ───────────────────────────────────────────────────────────────
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  await prisma.meeting.createMany({
    data: [
      {
        projectId: projectA1.id,
        title: 'Sprint 5 Review',
        startTime: new Date(nextWeek.setHours(10, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(11, 0, 0, 0)),
        meetLink: 'https://meet.google.com/demo-sprint5',
        type: 'review',
        agenda: '1. Review sprint 5 deliverables\n2. Demo billing integration\n3. Plan sprint 6',
        createdById: adminUser.id,
      },
      {
        projectId: projectA1.id,
        title: 'Kickoff — Mobile App Phase',
        startTime: new Date(nextMonth.setHours(14, 0, 0, 0)),
        endTime: new Date(nextMonth.setHours(15, 30, 0, 0)),
        meetLink: 'https://meet.google.com/demo-kickoff',
        type: 'kickoff',
        agenda: '1. Mobile app scope review\n2. Technology stack confirmation\n3. Timeline and milestones',
        createdById: adminUser.id,
      },
      {
        projectId: projectB1.id,
        title: 'Weekly Standup',
        startTime: new Date(nextWeek.setHours(9, 0, 0, 0)),
        endTime: new Date(nextWeek.setHours(9, 30, 0, 0)),
        meetLink: 'https://meet.google.com/demo-standup-b',
        type: 'standup',
        createdById: managerUser.id,
      },
    ],
  })

  console.log('  ✓ Created meetings')

  // ── Invoices ───────────────────────────────────────────────────────────────
  const invoicesData = [
    {
      projectId: projectA1.id,
      clientId: clientA.id,
      invoiceNumber: 'INV-2025-001',
      amount: 250000,
      currency: 'INR',
      status: InvoiceStatus.paid,
      dueDate: new Date('2025-02-15'),
      paidAt: new Date('2025-02-10'),
      description: 'Phase 1: Design & Prototyping',
      notes: 'Payment received via NEFT',
    },
    {
      projectId: projectA1.id,
      clientId: clientA.id,
      invoiceNumber: 'INV-2025-002',
      amount: 350000,
      currency: 'INR',
      status: InvoiceStatus.paid,
      dueDate: new Date('2025-04-01'),
      paidAt: new Date('2025-03-28'),
      description: 'Phase 2: Backend API Development',
      notes: 'Payment received via UPI',
    },
    {
      projectId: projectA1.id,
      clientId: clientA.id,
      invoiceNumber: 'INV-2025-003',
      amount: 400000,
      currency: 'INR',
      status: InvoiceStatus.pending,
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      description: 'Phase 3: Frontend Integration',
    },
    {
      projectId: projectB1.id,
      clientId: clientB.id,
      invoiceNumber: 'INV-2025-004',
      amount: 180000,
      currency: 'INR',
      status: InvoiceStatus.paid,
      dueDate: new Date('2025-03-01'),
      paidAt: new Date('2025-02-28'),
      description: 'Milestone 1: Design System',
    },
    {
      projectId: projectB1.id,
      clientId: clientB.id,
      invoiceNumber: 'INV-2025-005',
      amount: 220000,
      currency: 'INR',
      status: InvoiceStatus.overdue,
      dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      description: 'Milestone 2: Product Catalog',
    },
    {
      projectId: projectC1.id,
      clientId: clientC.id,
      invoiceNumber: 'INV-2024-008',
      amount: 500000,
      currency: 'INR',
      status: InvoiceStatus.paid,
      dueDate: new Date('2025-01-15'),
      paidAt: new Date('2025-01-10'),
      description: 'Final payment — Patient Portal delivery',
    },
  ]

  for (const inv of invoicesData) {
    await prisma.invoice.create({ data: inv })
  }

  console.log('  ✓ Created invoices')

  // ── Progress Updates ───────────────────────────────────────────────────────
  const update1 = await prisma.progressUpdate.create({
    data: {
      projectId: projectA1.id,
      userId: adminUser.id,
      body: '## Week 12 Update\n\nGreat progress this week! The backend API is shaping up nicely.\n\n**Completed:**\n- JWT authentication fully implemented\n- User management endpoints live\n- Database migrations complete\n\n**Next week:**\n- Stripe billing integration\n- File upload endpoints',
      overallPct: 45,
      designPct: 80,
      devPct: 40,
      testingPct: 10,
      deployPct: 0,
      attachments: [{ url: 'https://utfs.io/f/demo-screenshot.png', label: 'API test results' }],
    },
  })

  await prisma.progressUpdate.create({
    data: {
      projectId: projectA1.id,
      userId: adminUser.id,
      body: '## Week 10 Update\n\nDesign phase wrapped up ahead of schedule. Handoff to dev team complete.\n\n**Completed:**\n- All screens designed and approved\n- Component library published\n- Design tokens documented',
      overallPct: 30,
      designPct: 80,
      devPct: 15,
      testingPct: 0,
      deployPct: 0,
      attachments: [],
    },
  })

  await prisma.progressUpdate.create({
    data: {
      projectId: projectB1.id,
      userId: managerUser.id,
      body: '## Week 8 Update\n\nHeadless commerce architecture finalized. Vendor selected.\n\n**Completed:**\n- Shopify Hydrogen vs custom headless evaluation done\n- Algolia search integration scoped\n- Component library in Storybook at 60%',
      overallPct: 30,
      designPct: 70,
      devPct: 20,
      testingPct: 0,
      deployPct: 0,
      attachments: [],
    },
  })

  // Progress comment
  await prisma.progressComment.create({
    data: {
      progressUpdateId: update1.id,
      userId: clientUserA.id,
      body: 'Looking good! When can we expect the billing integration demo?',
    },
  })

  // Progress reaction
  await prisma.progressReaction.create({
    data: {
      progressUpdateId: update1.id,
      userId: clientUserA.id,
      emoji: '👍',
    },
  })

  console.log('  ✓ Created progress updates, comments & reactions')

  // ── Notifications ──────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: clientUserA.id,
        type: 'progress_update',
        title: 'New progress update on SaaS Platform MVP',
        body: 'Week 12 update has been posted. Backend API is at 40%.',
        entityId: update1.id,
        entityType: 'ProgressUpdate',
        isRead: false,
      },
      {
        userId: clientUserA.id,
        type: 'meeting_reminder',
        title: 'Upcoming meeting: Sprint 5 Review',
        body: 'Your Sprint 5 Review meeting is scheduled for next week.',
        entityType: 'Meeting',
        isRead: false,
      },
      {
        userId: clientUserB.id,
        type: 'invoice_due',
        title: 'Invoice INV-2025-005 is overdue',
        body: 'Invoice for ₹2,20,000 is 10 days overdue.',
        entityType: 'Invoice',
        isRead: false,
      },
    ],
  })

  console.log('  ✓ Created notifications')

  // ── Admin Logs ─────────────────────────────────────────────────────────────
  await prisma.adminLog.createMany({
    data: [
      { userId: adminUser.id, action: 'CREATE_CLIENT', entityType: 'Client', entityId: clientA.id, meta: { companyName: 'TechVentures Pvt Ltd' } },
      { userId: adminUser.id, action: 'CREATE_PROJECT', entityType: 'Project', entityId: projectA1.id, meta: { name: 'SaaS Platform MVP' } },
      { userId: managerUser.id, action: 'UPLOAD_DOCUMENT', entityType: 'Document', meta: { name: 'UI Design — Dashboard v2.figma' } },
      { userId: adminUser.id, action: 'CREATE_INVOICE', entityType: 'Invoice', entityId: invoicesData[0].invoiceNumber, meta: { amount: 250000 } },
      { userId: adminUser.id, action: 'MARK_INVOICE_PAID', entityType: 'Invoice', meta: { invoiceNumber: 'INV-2025-001' } },
    ],
  })

  console.log('  ✓ Created admin logs')

  console.log('')
  console.log('✅ Seeding complete!')
  console.log('')
  console.log('  Demo credentials:')
  console.log('  Admin:   admin@hapkonic.com    / Admin@12345')
  console.log('  Manager: manager@hapkonic.com  / Manager@12345')
  console.log('  Client:  arjun@techventures.in / Client@12345')
  console.log('  Client:  sneha@retailedge.com  / Client@12345')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
