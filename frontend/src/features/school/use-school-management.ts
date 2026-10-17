import { useMemo, useState } from "react";
import { initialClasses, initialStudents } from "./data";
import type { Evaluations, EvaluationStatuses, Rating, SchoolClass, Student } from "./types";

export const useSchoolManagement = () => {
  const [classes, setClasses] = useState(initialClasses);
  const [students, setStudents] = useState(initialStudents);
  const [evaluations, setEvaluations] = useState<Evaluations>({});
  const [evaluationStatuses, setEvaluationStatuses] = useState<EvaluationStatuses>({});
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [month, setMonth] = useState("2026-07");

  const filteredStudents = useMemo(() => students.filter((student) =>
    (classFilter === "all" || student.classId === Number(classFilter)) &&
    student.name.toLowerCase().includes(query.toLowerCase())
  ), [students, classFilter, query]);

  const saveClass = (value: SchoolClass) => setClasses((items) =>
    items.some((item) => item.id === value.id) ? items.map((item) => item.id === value.id ? value : item) : [...items, value]
  );

  const deleteClass = (item: SchoolClass) => setClasses((items) => items.filter((current) => current.id !== item.id));

  const saveStudent = (value: Student) => setStudents((items) =>
    items.some((item) => item.id === value.id) ? items.map((item) => item.id === value.id ? value : item) : [...items, value]
  );

  const deleteStudent = (item: Student) => setStudents((items) => items.filter((current) => current.id !== item.id));

  const updateRating = (studentId: number, index: number, patch: Partial<Rating>) => {
    const key = `${studentId}-${month}`;
    if (evaluationStatuses[key] === "locked") return;
    setEvaluations((all) => ({ ...all, [key]: { ...(all[key] || {}), [index]: { result: all[key]?.[index]?.result || "", intervention: all[key]?.[index]?.intervention || "", ...patch } } }));
  };

  const updateEvaluationStatus = (studentId: number, status: "updated" | "locked") => setEvaluationStatuses((all) => ({ ...all, [`${studentId}-${month}`]: status }));

  return { classes, students, evaluations, evaluationStatuses, query, setQuery, classFilter, setClassFilter, month, setMonth, filteredStudents, saveClass, deleteClass, saveStudent, deleteStudent, updateRating, updateEvaluationStatus };
};
