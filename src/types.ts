export interface TimelineEntry {
  id: number;
  time: Date | string;
  category: string;
}

export interface DayData {
  date: string;
  categories: string[];
  data: TimelineEntry[];
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
