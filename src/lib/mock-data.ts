export const mockUser = {
  id: '1',
  name: 'Ana Silva',
  email: 'ana.silva@smartclass.com',
  role: 'teacher', // 'teacher', 'student', 'admin'
  avatar: 'https://img.usecurling.com/ppl/medium?gender=female',
}

export const mockStudents = [
  {
    id: '1',
    name: 'João Pedro',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    status: 'active',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
  },
  {
    id: '2',
    name: 'Maria Clara',
    email: 'maria@email.com',
    phone: '(11) 88888-8888',
    status: 'active',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2',
  },
  {
    id: '3',
    name: 'Carlos Eduardo',
    email: 'carlos@email.com',
    phone: '(11) 77777-7777',
    status: 'inactive',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=3',
  },
]

export const mockClasses = [
  {
    id: '1',
    name: 'Inglês Iniciante A1',
    students: 12,
    schedule: 'Seg/Qua 19:00',
    status: 'active',
  },
  {
    id: '2',
    name: 'Espanhol Intermediário B1',
    students: 8,
    schedule: 'Ter/Qui 18:00',
    status: 'active',
  },
  {
    id: '3',
    name: 'Francês Avançado C1',
    students: 5,
    schedule: 'Sáb 10:00',
    status: 'active',
  },
]

export const mockTasks = [
  {
    id: '1',
    title: 'Workbook Unit 5',
    class: 'Inglês Iniciante A1',
    dueDate: '2024-05-20',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Redação: Minhas Férias',
    class: 'Espanhol Intermediário B1',
    dueDate: '2024-05-22',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Exercícios de Gramática',
    class: 'Francês Avançado C1',
    dueDate: '2024-05-18',
    status: 'overdue',
  },
]

export const mockPayments = [
  {
    id: '1',
    student: 'João Pedro',
    description: 'Mensalidade Maio',
    amount: 250.0,
    dueDate: '2024-05-10',
    status: 'paid',
  },
  {
    id: '2',
    student: 'Maria Clara',
    description: 'Mensalidade Maio',
    amount: 250.0,
    dueDate: '2024-05-10',
    status: 'pending',
  },
  {
    id: '3',
    student: 'Carlos Eduardo',
    description: 'Material Didático',
    amount: 150.0,
    dueDate: '2024-05-05',
    status: 'overdue',
  },
]
