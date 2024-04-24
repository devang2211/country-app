export interface Country {
  name: string;
  flag: string;
  no: number;
}

export interface SortField {
  name: "no" | "name";
  label: string;
}
