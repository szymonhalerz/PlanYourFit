const { z } = require('zod');

const email = z.string().trim().email('Podaj poprawny adres e-mail.').max(190);
const password = z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków.').max(128);

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Imię jest wymagane.').max(80),
  email,
  password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hasła nie są takie same.', path: ['confirmPassword'],
});

const loginSchema = z.object({ email, password: z.string().min(1, 'Hasło jest wymagane.') });

const detailsSchema = z.object({
  courtType: z.enum(['outdoor', 'indoor']).optional(),
  selectedPlaceId: z.string().max(190).nullable().optional(),
  targetDistanceKm: z.coerce.number().positive().max(100).optional(),
  actualDistanceKm: z.coerce.number().positive().max(150).optional(),
  paceMinPerKm: z.coerce.number().min(2).max(20).optional(),
  estimatedDurationMinutes: z.coerce.number().positive().max(1440).optional(),
  routeGeojson: z.any().optional(),
  weather: z.any().optional(),
  recommendation: z.any().optional(),
}).optional().default({});

const activitySchema = z.object({
  activityType: z.enum(['basketball', 'running', 'swimming']),
  title: z.string().trim().min(2, 'Nazwa aktywności jest wymagana.').max(120),
  activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Niepoprawna data.'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Niepoprawna godzina.'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Niepoprawna godzina.'),
  locationLat: z.coerce.number().min(-90).max(90).nullable().optional(),
  locationLng: z.coerce.number().min(-180).max(180).nullable().optional(),
  locationAddress: z.string().trim().min(2, 'Lokalizacja jest wymagana.').max(255),
  postalCode: z.string().trim().regex(/^\d{2}-\d{3}$/, 'Podaj kod pocztowy w formacie 00-000.'),
  note: z.string().max(1000).optional().default(''),
  searchRadiusKm: z.coerce.number().min(1).max(50).optional().default(25),
  repeatWeekly: z.boolean().optional().default(false),
  repeatCount: z.coerce.number().int().min(1).max(12).optional().default(1),
  details: detailsSchema,
}).refine((data) => data.endTime > data.startTime, {
  message: 'Godzina zakończenia musi być późniejsza niż rozpoczęcia.', path: ['endTime'],
}).refine((data) => data.activityType !== 'running' || data.details.targetDistanceKm, {
  message: 'Podaj planowany dystans.', path: ['details', 'targetDistanceKm'],
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  defaultLocation: z.string().trim().max(255).optional().default(''),
  defaultPostalCode: z.string().trim().refine((value) => !value || /^\d{2}-\d{3}$/.test(value), 'Podaj kod pocztowy w formacie 00-000.').optional().default(''),
  defaultLocationLat: z.coerce.number().min(-90).max(90).nullable().optional(),
  defaultLocationLng: z.coerce.number().min(-180).max(180).nullable().optional(),
  preferredRadiusKm: z.coerce.number().min(1).max(50).default(25),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
}).refine((data) => !data.defaultLocation || data.defaultPostalCode, {
  message: 'Podaj kod pocztowy dla domyślnej lokalizacji.', path: ['defaultPostalCode'],
});

const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: password });
const activityGoalSchema = z.object({ monthlyActivityGoal: z.coerce.number().int().min(1).max(100) });
const activityStatusSchema = z.object({ status: z.enum(['completed', 'cancelled']) });

module.exports = { registerSchema, loginSchema, activitySchema, profileSchema, changePasswordSchema, activityGoalSchema, activityStatusSchema };
