import { z } from 'zod'

const stringDate = z.preprocess((val) => {
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
}, z.date()).meta({ type: "date" })

// Query/filter schemas
export const appointmentFiltersSchema = z.object({
  datetime: z.object({
    between: z.tuple([stringDate, stringDate]).meta({ label: "Between", type: "between" }).optional(),
    gt: stringDate.meta({ label: "After" }).optional(),
    lt: stringDate.meta({ label: "Before" }).optional(),
  }).meta({ label: "Date" }).optional(),
  clients: z.object({
    eq: z.uuid().meta({ label: "Is"}).optional(),
    in: z.array(z.uuid()).meta({ label: "One of", type: "select", options: ["one", "two"] })
  }).meta({ label: "Clients" }).optional()
})

// Type exports
export type AppointmentFilters = z.infer<typeof appointmentFiltersSchema>
