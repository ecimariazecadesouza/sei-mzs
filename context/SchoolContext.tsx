
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import api from '../lib/api';
import {
  SchoolData, Student, Teacher, Subject, Class,
  Assignment, Grade, FormationType, KnowledgeArea, SubArea, SchoolSettings, AppUser, UserRole, AcademicYearConfig
} from '../types';
import { can, ResourceType } from '../lib/permissions';

const DEFAULT_SCHOOL_LOGO = 'https://i.postimg.cc/1tVz9RY5/Logo-da-Escola-v5-ECIT.png';
const DEFAULT_SYSTEM_LOGO = 'https://i.postimg.cc/Dwznvy86/SEI-V02.png';

export const formatImageUrl = (url: string | null): string => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  return url;
};

const toCamel = (obj: any) => {
  if (!obj) return obj;
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/([-_][a-z])/g, group =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

const toSnake = (obj: any) => {
  if (!obj) return obj;
  const newObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

const TABLE_MAP: Record<string, string> = {
  students: 'students',
  teachers: 'teachers',
  subjects: 'subjects',
  classes: 'classes',
  assignments: 'assignments',
  grades: 'grades',
  formations: 'formations',
  knowledgeAreas: 'knowledge-areas',
  subAreas: 'sub-areas',
  settings: 'settings',
  users: 'users',
  academicYears: 'academic-years'
};

export interface SchoolContextType {
  data: SchoolData;
  loading: boolean;
  dbError: string | null;
  needsSetup: boolean;
  currentUser: AppUser | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  fetchData: () => Promise<void>;
  addStudent: (s: any) => Promise<void>;
  updateStudent: (id: string, s: any) => Promise<void>;
  addTeacher: (t: any) => Promise<void>;
  updateTeacher: (id: string, t: any) => Promise<void>;
  addSubject: (s: any) => Promise<void>;
  updateSubject: (id: string, s: any) => Promise<void>;
  addClass: (c: any) => Promise<void>;
  updateClass: (id: string, c: any) => Promise<void>;
  addFormation: (f: any) => Promise<void>;
  updateFormation: (id: string, f: any) => Promise<void>;
  addKnowledgeArea: (a: any) => Promise<void>;
  updateKnowledgeArea: (id: string, a: any) => Promise<void>;
  addSubArea: (s: any) => Promise<void>;
  updateSubArea: (id: string, s: Partial<SubArea>) => Promise<void>;
  assignTeacher: (a: any) => Promise<void>;
  updateGrade: (g: any) => Promise<void>;
  bulkUpdateGrades: (grades: any[]) => Promise<void>;
  deleteItem: (type: keyof SchoolData, id: string) => Promise<void>;
  updateSettings: (s: Partial<SchoolSettings>) => Promise<void>;
  updateAcademicYearConfig: (config: AcademicYearConfig) => Promise<void>;
  addUser: (u: Omit<AppUser, 'id'>) => Promise<void>;
  createFirstAdmin: (u: { name: string, email: string, password?: string }) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  isSettingPassword: boolean;
  setIsSettingPassword: (v: boolean) => void;
  refreshData: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const [needsSetup, setNeedsSetup] = useState(false);
  const [data, setData] = useState<SchoolData>({
    students: [], teachers: [], subjects: [], classes: [],
    assignments: [], grades: [], formations: [], knowledgeAreas: [], subAreas: [],
    users: [],
    academicYears: [],
    settings: {
      schoolLogo: localStorage.getItem('sei_school_logo') || DEFAULT_SCHOOL_LOGO,
      systemLogo: localStorage.getItem('sei_system_logo') || DEFAULT_SYSTEM_LOGO,
      schoolName: localStorage.getItem('sei_school_name') || 'Sistema Escolar Integrado - SEI'
    }
  });

  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setDbError(null);

    try {
      // First, check if setup is needed
      const { data: setupRes } = await api.get('/auth/setup-status');
      setNeedsSetup(setupRes.needsSetup);

      const newData: any = { ...data };
      const tables = Object.entries(TABLE_MAP);

      const results = await Promise.allSettled(
        tables.map(async ([stateKey, tableName]) => {
          // Skip ALL generic tables if setup is needed to avoid 401 errors
          if (setupRes.needsSetup) {
            return { stateKey, data: [] };
          }
          const { data: resData } = await api.get(`/${tableName}`);
          return { stateKey, data: resData };
        })
      );

      results.forEach((result: any, index) => {
        const [stateKey] = tables[index];
        if (result.status === 'fulfilled') {
          const { data: resData } = result.value;
          const items = (resData || []);

          setData(prev => {
            const updated = { ...prev };
            if (stateKey === 'settings' && items.length > 0) {
              updated.settings = items[0];
            } else {
              (updated as any)[stateKey] = items;
            }
            return updated;
          });
        }
      });
      setData(newData);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setDbError('CONNECTION_ERROR');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res: any) => {
          setCurrentUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setCurrentUser(null);
        });
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      if (password) {
        // Login via API
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('sei_session', JSON.stringify(data.user)); // Keep for compatibility if needed
        setCurrentUser(data.user);
        return true;
      }
    } catch (error: any) {
      console.error("Login Error:", error.response?.data?.error || error.message);
      throw error;
    }
    return false;
  };

  const updatePassword = async (password: string) => {
    await api.post('/auth/update-password', { password });
  };

  const requestPasswordReset = async (email: string) => {
    await api.post('/auth/reset-password', { email });
    // Note: This endpoint needs to be implemented in backend
  };

  const updateProfile = async (name: string) => {
    if (!currentUser) return;
    const formattedName = name.trim().toUpperCase();
    await api.put(`/users/${currentUser.id}`, { name: formattedName });

    const updatedUser = { ...currentUser, name: formattedName };
    setCurrentUser(updatedUser);
    localStorage.setItem('sei_session', JSON.stringify(updatedUser));

    // Atualiza também na lista local
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === currentUser.id ? updatedUser : u)
    }));
  };

  const createFirstAdmin = async (u: { name: string, email: string, password?: string }) => {
    try {
      const { data: res } = await api.post('/auth/setup-admin', u);
      if (res) {
        const { user, token } = res;
        localStorage.setItem('token', token);
        // Important: Update state first
        setCurrentUser(user);
        setData(prev => ({ ...prev, users: [user] }));

        // Notify success
        window.alert('Cadastro realizado com sucesso! Bem-vindo ao SEI.');

        // Then fetch full data
        await fetchData();

        // Force redirection
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error("createFirstAdmin Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    localStorage.removeItem('sei_session');
    localStorage.removeItem('token');
    // await supabase.auth.signOut();
  };

  const updateSettings = async (s: Partial<SchoolSettings>) => {
    if (!currentUser || !can(currentUser.role, 'update', 'settings')) {
      alert('Acesso Negado: Apenas Administradores de TI podem alterar as configurações.');
      return;
    }
    const newSettings = { ...data.settings, ...s };
    setData(prev => ({ ...prev, settings: newSettings }));
    try {
      await api.put('/settings/1', newSettings);
    } catch (e) { }
  };

  const updateAcademicYearConfig = async (config: AcademicYearConfig) => {
    // Função para validar se a data é razoável (evita anos como 42026)
    const validateDate = (dateStr: string | null) => {
      if (!dateStr) return null;
      const year = parseInt(dateStr.split('-')[0]);
      if (year < 2000 || year > 2100) return null;
      return dateStr;
    };

    const sanitizedConfig = {
      year: config.year,
      b1End: validateDate(config.b1End),
      b2End: validateDate(config.b2End),
      b3End: validateDate(config.b3End),
      b4End: validateDate(config.b4End),
      recStart: validateDate(config.recStart),
      recEnd: validateDate(config.recEnd),
    };

    if (!currentUser || !can(currentUser.role, 'update', 'academic_years')) {
      alert('Acesso Negado: Apenas Administradores de TI podem alterar o calendário.');
      return;
    }

    console.log("Saving sanitized config:", sanitizedConfig);

    await api.post('/academic-years', sanitizedConfig); // API should handle upsert

    // if (error) block removed as API throws on error


    setData(prev => {
      const exists = prev.academicYears.find(y => y.year === config.year);
      if (exists) {
        return {
          ...prev,
          academicYears: prev.academicYears.map(y => y.year === config.year ? sanitizedConfig : y)
        } as SchoolData;
      }
      return {
        ...prev,
        academicYears: [...prev.academicYears, sanitizedConfig]
      } as SchoolData;
    });
  };

  const genericAdd = async (tableKey: keyof SchoolData, item: any) => {
    if (!currentUser || !can(currentUser.role, 'create', tableKey as ResourceType)) {
      alert('Acesso Negado: Você não tem permissão para realizar esta ação.');
      return;
    }
    const { data: res } = await api.post(`/${TABLE_MAP[tableKey]}`, item);
    if (res) setData(prev => ({ ...prev, [tableKey]: [...(prev[tableKey] as any[]), res] }));
  };

  const genericUpdate = async (tableKey: keyof SchoolData, id: string, item: any) => {
    if (!currentUser || !can(currentUser.role, 'update', tableKey as ResourceType)) {
      alert('Acesso Negado: Você não tem permissão para realizar esta ação.');
      return;
    }
    await api.put(`/${TABLE_MAP[tableKey]}/${id}`, item);
    setData(prev => ({
      ...prev,
      [tableKey]: (prev[tableKey] as any[]).map(i => i.id === id ? { ...i, ...item } : i)
    }));
  };

  const addStudent = (s: any) => genericAdd('students', { ...s, registrationNumber: `RA${new Date().getFullYear()}${Math.floor(Math.random() * 1000000)}` });
  const updateStudent = (id: string, s: any) => genericUpdate('students', id, s);
  const addTeacher = (t: any) => genericAdd('teachers', t);
  const updateTeacher = (id: string, t: any) => genericUpdate('teachers', id, t);
  const addSubject = (s: any) => genericAdd('subjects', s);
  const updateSubject = (id: string, s: any) => genericUpdate('subjects', id, s);
  const addClass = (c: any) => genericAdd('classes', c);
  const updateClass = (id: string, c: any) => genericUpdate('classes', id, c);
  const addFormation = (f: any) => genericAdd('formations', f);
  const updateFormation = (id: string, f: any) => genericUpdate('formations', id, f);
  const addKnowledgeArea = (a: any) => genericAdd('knowledgeAreas', a);
  const updateKnowledgeArea = (id: string, a: any) => genericUpdate('knowledgeAreas', id, a);
  const addSubArea = (s: any) => genericAdd('subAreas', s);
  const updateSubArea = (id: string, s: Partial<SubArea>) => genericUpdate('subAreas', id, s);
  const assignTeacher = (a: any) => genericAdd('assignments', a);
  const addUser = async (u: any) => {
    if (!currentUser || !can(currentUser.role, 'create', 'users')) {
      alert('Acesso Negado: Você não tem permissão para realizar esta ação.');
      return;
    }
    try {
      const { data: res } = await api.post('/auth/register', u);
      if (res) setData(prev => ({ ...prev, users: [...prev.users, res.user] }));
    } catch (err: any) {
      console.error("Register Error:", err);
      alert("Erro ao cadastrar usuário: " + (err.response?.data?.error || err.message));
      throw err;
    }
  };

  const updateGrade = async (g: any) => {
    if (!currentUser || !can(currentUser.role, 'update', 'grades')) {
      alert('Acesso Negado: Você não tem permissão para alterar notas.');
      return;
    }
    await api.post('/grades', g); // Upsert logic in backend
    await fetchData();
  };

  const bulkUpdateGrades = async (grades: any[]) => {
    if (!currentUser || !can(currentUser.role, 'update', 'grades')) {
      alert('Acesso Negado: Você não tem permissão para alterar notas.');
      return;
    }
    await api.post('/grades/bulk', { grades });
    await fetchData();
  };

  const deleteItem = async (type: keyof SchoolData, id: string) => {
    if (!currentUser || !can(currentUser.role, 'delete', type as ResourceType)) {
      alert('Acesso Negado: Você não tem permissão para excluir este registro.');
      return;
    }
    await api.delete(`/${TABLE_MAP[type]}/${id}`);
    setData(prev => ({ ...prev, [type]: (prev[type] as any[]).filter(i => i.id !== id) }));
  };

  const value = useMemo(() => ({
    data, loading, dbError, needsSetup,
    currentUser, login, logout,
    updateProfile, fetchData,
    addStudent, updateStudent, addTeacher, updateTeacher,
    addSubject, updateSubject, addClass, updateClass,
    addFormation, updateFormation, addKnowledgeArea, updateKnowledgeArea,
    addSubArea, updateSubArea, assignTeacher, updateGrade, bulkUpdateGrades,
    deleteItem, updateSettings, updateAcademicYearConfig, addUser, createFirstAdmin,
    updatePassword, requestPasswordReset, isSettingPassword, setIsSettingPassword,
    refreshData: fetchData
  }), [data, loading, dbError, currentUser, isSettingPassword]);

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (context === undefined) throw new Error('useSchool deve ser usado dentro de um SchoolProvider');
  return context;
};
