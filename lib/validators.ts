import { z } from 'zod';
import type { Specialty, Sex, DepthCategory } from '@/types/cases';

// Registration schema
export const registerSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  tc_kimlik_no: z.string().length(11, 'TC Kimlik numarası 11 haneli olmalıdır').regex(/^\d+$/, 'TC Kimlik numarası sadece rakam içermelidir'),
  full_name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
  specialty: z.enum(['Plastik Cerrahi', 'KBB', 'Dermatoloji', 'CMF', 'Diğer'] as const),
  institution_name: z.string().min(2, 'Kurum adı en az 2 karakter olmalıdır'),
  institution_email: z.string().email('Geçerli bir kurumsal e-posta adresi giriniz'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Geçerli bir telefon numarası giriniz'),
  kvkk_consent: z.boolean().refine(val => val === true, 'KVKK/GDPR onayı zorunludur'),
  health_professional_declaration: z.boolean().refine(val => val === true, 'Sağlık profesyoneli beyanı zorunludur'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Create case schema
export const createCaseSchema = z.object({
  case_code: z.string().min(1, 'Olgu kodu gereklidir'),
  age: z.number().int().positive().optional(),
  sex: z.enum(['M', 'F', 'Other'] as const).optional(),
  region: z.string().min(1, 'Lezyon bölgesi gereklidir'),
  width_mm: z.number().positive().optional(),
  height_mm: z.number().positive().optional(),
  depth: z.enum(['skin', 'skin+subcutis', 'muscle', 'mucosa'] as const).optional(),
  previous_surgery: z.boolean().optional(),
  previous_radiotherapy: z.boolean().optional(),
  pathology_suspected: z.string().optional(),
  critical_structures: z.array(z.string()).optional(),
  high_aesthetic_zone: z.boolean().optional(),
  case_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD format
  case_time: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:MM format
  case_duration_minutes: z.number().int().positive().optional(),
  patient_special_condition: z.string().optional(),
  operation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // Operasyon tarihi (YYYY-MM-DD)
  followup_days: z.number().int().positive().optional(), // Kontrol süresi (gün)
  pathology_result_available: z.boolean().optional(),
  pathology_result_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pathology_result: z.string().optional(),
  preop_photo_url: z.string().url().optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;

