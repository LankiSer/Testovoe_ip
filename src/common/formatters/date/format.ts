export class DateFormatUtility {
  static index(value: string | null | undefined): string {
    if (!value) return "—";
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }
}
