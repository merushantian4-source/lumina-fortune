import CalendarClient from "@/app/calendar/calendar-client";
import { getServerProfileBirthdate } from "@/lib/profile/server-birthdate";

export default async function CalendarPage() {
  const serverBirthdate = await getServerProfileBirthdate();
  return <CalendarClient serverBirthdate={serverBirthdate} />;
}
