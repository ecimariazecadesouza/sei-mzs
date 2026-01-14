
export type UserRole = 'admin_ti' | 'admin_dir' | 'coord' | 'prof' | 'sec' | 'guest';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  registrationNumber: string;
  status: 'Cursando' | 'Transferência' | 'Evasão' | 'Outro';
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

export interface FormationType {
  id: string;
  name: string;
}

export interface KnowledgeArea {
  id: string;
  name: string;
  formationTypeId: string;
}

export interface SubArea {
  id: string;
  name: string;
  knowledgeAreaId: string;
}

export interface Subject {
  id: string;
  name: string;
  subAreaId: string;
  periodicity: 'Anual' | 'Semestral';
  semester?: '1' | '2' | 'Ambos';
  year: string;
  code?: string;
  color?: string;
}

export interface Class {
  id: string;
  name: string;
  enrollmentType: string;
  year: string;
  shift: string;
  subjectIds: string[];
}

export interface Assignment {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  term: number;
  value: number;
}

export interface SchoolSettings {
  schoolLogo: string | null;
  systemLogo: string | null;
  schoolName: string;
}

export interface AcademicYearConfig {
  year: string;
  b1End: string;
  b2End: string;
  b3End: string;
  b4End: string;
  recStart: string;
  recEnd: string;
}

export interface SchoolData {
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  assignments: Assignment[];
  grades: Grade[];
  formations: FormationType[];
  knowledgeAreas: KnowledgeArea[];
  subAreas: SubArea[];
  settings: SchoolSettings;
  users: AppUser[];
  academicYears: AcademicYearConfig[];
}
