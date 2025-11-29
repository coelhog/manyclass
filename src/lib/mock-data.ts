import {
  User,
  Student,
  ClassGroup,
  Task,
  TaskSubmission,
  Payment,
  Subscription,
} from '@/types'

export const mockUser: User = {
  id: '1',
  name: 'Ana Silva',
  email: 'ana.silva@smartclass.com',
  role: 'teacher',
  avatar: 'https://img.usecurling.com/ppl/medium?gender=female',
  plan_id: 'premium',
}

export const mockStudentUser: User = {
  id: '2',
  name: 'João Pedro',
  email: 'joao@email.com',
  role: 'student',
  avatar: 'https://img.usecurling.com/ppl/medium?gender=male&seed=1',
}

export const mockAdminUser: User = {
  id: 'admin1',
  name: 'Administrador',
  email: 'admin@smartclass.com',
  role: 'admin',
  avatar: 'https://img.usecurling.com/i?q=shield&color=blue',
}

export const mockSubscriptions: Subscription[] = [
  {
    id: 'sub1',
    studentId: '2', // João Pedro
    plan: 'student_monthly',
    status: 'active',
    startDate: '2024-01-01',
    nextBillingDate: '2024-06-01',
    amount: 350.0,
  },
  {
    id: 'sub2',
    studentId: '3', // Carlos Eduardo
    plan: 'student_monthly',
    status: 'past_due',
    startDate: '2023-11-01',
    nextBillingDate: '2024-05-01',
    amount: 350.0,
  },
]

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'João Pedro',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    status: 'active',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    level: 'B1',
    joinedAt: '2024-01-15',
    subscriptionId: 'sub1',
  },
  {
    id: '2',
    name: 'Maria Clara',
    email: 'maria@email.com',
    phone: '(11) 88888-8888',
    status: 'active',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
    level: 'A2',
    joinedAt: '2024-02-10',
  },
  {
    id: '3',
    name: 'Carlos Eduardo',
    email: 'carlos@email.com',
    phone: '(11) 77777-7777',
    status: 'inactive',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
    level: 'C1',
    joinedAt: '2023-11-05',
    subscriptionId: 'sub2',
  },
]

export const mockClasses: ClassGroup[] = [
  {
    id: '1',
    name: 'Inglês Iniciante A1',
    schedule: 'Seg/Qua 19:00',
    status: 'active',
    studentIds: ['1', '2'],
    billingModel: 'per_student',
    price: 350.0,
    category: 'group',
  },
  {
    id: '2',
    name: 'Espanhol Intermediário B1',
    schedule: 'Ter/Qui 18:00',
    status: 'active',
    studentIds: ['2'],
    billingModel: 'per_student',
    price: 350.0,
    category: 'individual',
  },
  {
    id: '3',
    name: 'Francês Avançado C1',
    schedule: 'Sáb 10:00',
    status: 'active',
    studentIds: ['3'],
    billingModel: 'per_class',
    price: 1200.0,
    category: 'class',
  },
]

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Workbook Unit 5',
    description: 'Complete os exercícios da página 45.',
    type: 'text',
    classId: '1',
    dueDate: '2024-05-20T23:59:00Z',
    status: 'open',
  },
  {
    id: '2',
    title: 'Redação: Minhas Férias',
    description: 'Escreva um texto de 200 palavras sobre suas últimas férias.',
    type: 'file-upload',
    classId: '2',
    dueDate: '2024-05-22T23:59:00Z',
    status: 'open',
  },
  {
    id: '3',
    title: 'Quiz de Gramática',
    description: 'Selecione a alternativa correta.',
    type: 'multiple-choice',
    classId: '1',
    dueDate: '2024-05-18T23:59:00Z',
    status: 'closed',
    options: [
      { id: 'opt1', text: 'I have been' },
      { id: 'opt2', text: 'I has been' },
      { id: 'opt3', text: 'I am been' },
    ],
  },
]

export const mockSubmissions: TaskSubmission[] = [
  {
    id: 'sub1',
    taskId: '1',
    studentId: '1',
    content: 'Respostas dos exercícios...',
    submittedAt: '2024-05-19T14:30:00Z',
    status: 'pending',
  },
  {
    id: 'sub2',
    taskId: '3',
    studentId: '1',
    selectedOptionId: 'opt1',
    submittedAt: '2024-05-18T10:00:00Z',
    grade: 10,
    status: 'graded',
  },
]

export const mockPayments: Payment[] = [
  {
    id: '1',
    student: 'João Pedro',
    description: 'Mensalidade Maio',
    amount: 350.0,
    dueDate: '2024-05-10T00:00:00Z',
    status: 'paid',
  },
  {
    id: '2',
    student: 'Maria Clara',
    description: 'Mensalidade Maio',
    amount: 350.0,
    dueDate: '2024-05-10T00:00:00Z',
    status: 'pending',
  },
  {
    id: '3',
    student: 'Carlos Eduardo',
    description: 'Material Didático',
    amount: 150.0,
    dueDate: '2024-04-15T00:00:00Z',
    status: 'overdue',
  },
]
