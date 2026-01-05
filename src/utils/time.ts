export function calculateAccessEndTime(hours: number): Date {
  const now = new Date();
  const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return endTime;
}

export function calculateHoursBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return diff / (1000 * 60 * 60);
}

export function isAccessExpired(endTime: Date): boolean {
  return new Date() > endTime;
}

export function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
}

export function getUnixTimestamp(date?: Date): number {
  return Math.floor((date || new Date()).getTime() / 1000);
}