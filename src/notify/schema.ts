import type { PhaseId, ReminderPrefs } from '../types';

/**
 * Future courier payload — collected in the UI now,
 * ready to POST to an email / SMS worker later (Resend + Twilio).
 */
export type CourierDispatch = {
  to: { email?: string; phone?: string };
  phase: PhaseId;
  dateKey: string;
  caseNumber: number;
  fragment: string;
  /** Only included at bedtime, after the case may still be unsolved. */
  reflection?: {
    reference: string;
    text: string;
    body: string;
    walk: string;
  };
};

export function prefsToDispatchTarget(prefs: ReminderPrefs): CourierDispatch['to'] {
  return {
    email: prefs.emailOn ? prefs.email : undefined,
    phone: prefs.smsOn ? prefs.phone : undefined,
  };
}
