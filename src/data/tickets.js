import { nanoid } from 'nanoid';
import { subDays, subHours } from 'date-fns';

const priorities = ['Low', 'Medium', 'High'];
const statuses = ['open', 'in_progress', 'resolved'];
const categories = ['Technical', 'Billing', 'General', 'Feature Request', 'Bug Report'];
const assignees = ['Alice Smith', 'Bob Johnson', 'Carol Davis', 'David Wilson'];

const subjects = [
  'Login issues with CRM Cloud',
  'Cannot access dashboard features', 
  'Billing discrepancy question',
  'Feature request: export functionality',
  'Integration not working properly',
  'Password reset not working',
  'Data sync problems',
  'Report generation failing'
];

const customerNames = [
  'John Smith', 'Mary Johnson', 'Steve Brown', 'Lisa Davis',
  'Mike Wilson', 'Sarah Taylor', 'Tom Anderson', 'Julie Garcia'
];

export const generateTickets = () => {
  const tickets = [];
  
  for (let i = 0; i < 31; i++) {
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 14));
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const customerName = customerNames[i % customerNames.length];
    
    let firstResponseAt = null;
    let resolvedAt = null;
    
    if (status !== 'open') {
      const responseHours = priority === 'High' ? 4 : priority === 'Medium' ? 8 : 24;
      firstResponseAt = subHours(createdAt, -Math.floor(Math.random() * responseHours));
      
      if (status === 'resolved') {
        resolvedAt = subDays(firstResponseAt, -Math.floor(Math.random() * 3 + 1));
      }
    }
    
    tickets.push({
      id: `TCK-${nanoid(8).toUpperCase()}`,
      subject: subjects[i % subjects.length],
      priority,
      createdAtISO: createdAt.toISOString(),
      firstResponseAtISO: firstResponseAt?.toISOString(),
      resolvedAtISO: resolvedAt?.toISOString(),
      assignee: assignees[Math.floor(Math.random() * assignees.length)],
      status,
      csat: status === 'resolved' ? Math.floor(Math.random() * 2) + 4 : undefined,
      customerName,
      customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@company.com`,
      category: categories[Math.floor(Math.random() * categories.length)],
      message: `Issue description for ${subjects[i % subjects.length].toLowerCase()}`
    });
  }
  
  return tickets;
};

export const seedTickets = generateTickets();