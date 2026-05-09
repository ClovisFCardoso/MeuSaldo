export type TxType = "income" | "expense";

export type Category =
  | "Alimentação"
  | "Transporte"
  | "Moradia"
  | "Saúde"
  | "Educação"
  | "Salário"
  | "Freelance"
  | "Lazer"
  | "Investimentos"
  | "Assinaturas";

export const CATEGORIES: Category[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Salário",
  "Freelance",
  "Lazer",
  "Investimentos",
  "Assinaturas",
];

export interface Transaction {
  id: string;
  description: string;
  category: Category;
  type: TxType;
  amount: number;
  date: string; // ISO
  note?: string;
}
