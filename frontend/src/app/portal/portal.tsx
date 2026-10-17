"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/school/app-shell";
import { ClassOverview } from "@/components/school/class-overview";
import { ConfirmDialog } from "@/components/school/confirm-dialog";
import { EntityModal } from "@/components/school/entity-modal";
import { ReportView } from "@/components/school/report-view";
import { StudentList } from "@/components/school/student-list";
import { StudentProfile } from "@/components/school/student-profile";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSchoolManagement } from "@/features/school/use-school-management";
import type { ModalId, SchoolClass, Student, TabId } from "@/features/school/types";

const titles: Record<TabId, string> = { classes: "Lớp học", students: "Học sinh", reports: "Báo cáo" };
type PendingDelete = { kind: "class"; item: SchoolClass } | { kind: "student"; item: Student };

const Portal = () => {
  const school = useSchoolManagement();
  const [tab, setTab] = useState<TabId>("classes");
  const [modal, setModal] = useState<ModalId>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const selectedStudent = school.students.find((item) => item.id === selectedStudentId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get("tab") as TabId | null;
    const requestedStudent = Number(params.get("student"));
    if (requestedTab && ["classes", "students", "reports"].includes(requestedTab)) setTab(requestedTab);
    if (requestedStudent) { setTab("students"); setSelectedStudentId(requestedStudent); }
  }, []);

  const changeTab = (nextTab: TabId) => { setTab(nextTab); setSelectedStudentId(null); };
  const openClassModal = (item: SchoolClass | null = null) => { setEditingClass(item); setModal("class"); };
  const openStudentModal = (item: Student | null = null) => { setEditingStudent(item); setModal("student"); };
  const closeModal = () => { setModal(null); setEditingClass(null); setEditingStudent(null); };
  const openClass = (id: number) => { school.setClassFilter(String(id)); setTab("students"); };
  const requestDeleteClass = (item: SchoolClass) => {
    if (school.students.some((student) => student.classId === item.id)) { setNotice(`Không thể xóa ${item.name} vì lớp vẫn còn học sinh. Hãy chuyển hoặc xóa học sinh trước.`); return; }
    setPendingDelete({ kind: "class", item });
  };
  const requestDeleteStudent = (item: Student) => setPendingDelete({ kind: "student", item });
  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "class") school.deleteClass(pendingDelete.item);
    else { school.deleteStudent(pendingDelete.item); if (selectedStudentId === pendingDelete.item.id) setSelectedStudentId(null); }
    setPendingDelete(null);
  };

  const action = tab !== "reports" ? <Button size="lg" onClick={() => tab === "classes" ? openClassModal() : openStudentModal()}><Plus/><span className="hidden sm:inline">Thêm {tab === "classes" ? "lớp" : "học sinh"}</span></Button> : undefined;

  return <AppShell tab={tab} onTabChange={changeTab}>
    <PageHeader title={titles[tab]} action={action}/>
    {tab === "classes" && <ClassOverview classes={school.classes} students={school.students} onEdit={openClassModal} onDelete={requestDeleteClass} onOpen={openClass}/>} 
    {tab === "students" && !selectedStudent && <StudentList classes={school.classes} students={school.filteredStudents} query={school.query} classFilter={school.classFilter} onQueryChange={school.setQuery} onFilterChange={school.setClassFilter} onOpen={setSelectedStudentId} onEdit={openStudentModal} onDelete={requestDeleteStudent}/>} 
    {tab === "students" && selectedStudent && <StudentProfile student={selectedStudent} classes={school.classes} month={school.month} status={school.evaluationStatuses[`${selectedStudent.id}-${school.month}`] || "draft"} evaluations={school.evaluations} onMonthChange={school.setMonth} onRatingChange={(index, patch) => school.updateRating(selectedStudent.id, index, patch)} onSave={() => school.updateEvaluationStatus(selectedStudent.id, "updated")} onLock={() => school.updateEvaluationStatus(selectedStudent.id, "locked")} onBack={() => setSelectedStudentId(null)} onEdit={() => openStudentModal(selectedStudent)}/>} 
    {tab === "reports" && <ReportView classes={school.classes} students={school.students} evaluations={school.evaluations} statuses={school.evaluationStatuses} classFilter={school.classFilter} month={school.month} onClassChange={school.setClassFilter} onMonthChange={school.setMonth}/>} 
    {modal && <EntityModal type={modal} classes={school.classes} editingClass={editingClass} editingStudent={editingStudent} onClose={closeModal} onSaveClass={school.saveClass} onSaveStudent={school.saveStudent}/>} 
    <ConfirmDialog open={Boolean(pendingDelete)} title={pendingDelete?.kind === "class" ? "Xóa lớp học?" : "Xóa hồ sơ học sinh?"} description={pendingDelete ? `Dữ liệu của “${pendingDelete.item.name}” sẽ bị xóa. Thao tác này không thể hoàn tác.` : ""} onConfirm={confirmDelete} onOpenChange={(open) => { if (!open) setPendingDelete(null); }}/>
    <ConfirmDialog open={Boolean(notice)} title="Chưa thể xóa lớp" description={notice || ""} confirmLabel="Đã hiểu" destructive={false} onConfirm={() => setNotice(null)} onOpenChange={(open) => { if (!open) setNotice(null); }}/>
  </AppShell>;
};

export default Portal;
