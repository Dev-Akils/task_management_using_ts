// utils/date.ts
import { parseISO, format, differenceInCalendarDays, addDays } from "date-fns";

export const iso = (d: Date) => format(d, "yyyy-MM-dd");
export const daysBetween = (aIso: string, bIso: string) => differenceInCalendarDays(parseISO(bIso), parseISO(aIso));
export const addDaysIso = (isoStr: string, n: number) => iso(addDays(parseISO(isoStr), n));
