export type TabId = "classes" | "students" | "reports";
export type ModalId = "class" | "student" | null;

export type SchoolClass = {
  id: number;
  name: string;
  teacher: string;
  note: string;
};

export type Student = {
  id: number;
  classId: number;
  name: string;
  birthDate: string;
  gender: string;
  guardian: string;
  phone: string;
  address: string;
  note: string;
};

export type EvaluationStatus = "draft" | "updated" | "locked";
export type Rating = { result: "" | "+" | "+/-" | "-"; intervention: string };
export type Evaluations = Record<string, Record<number, Rating>>;
export type EvaluationStatuses = Record<string, EvaluationStatus>;
