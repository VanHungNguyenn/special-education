"use client";

import { useState } from "react";
import { criteria, resultOptions } from "@/features/school/data";
import type { Evaluations, EvaluationStatus, Rating, SchoolClass, Student } from "@/features/school/types";
import { ConfirmDialog } from "./confirm-dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Lock, Pencil } from "lucide-react";
import { MonthPicker } from "@/components/common/month-picker";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = { student: Student; classes: SchoolClass[]; month: string; status: EvaluationStatus; evaluations: Evaluations; onMonthChange: (value: string) => void; onRatingChange: (index: number, patch: Partial<Rating>) => void; onSave: () => void; onLock: () => void; onBack: () => void; onEdit: () => void };

const statusMeta: Record<EvaluationStatus,{label:string,className:string}> = {
  draft: { label: "Bản nháp", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  updated: { label: "Đã cập nhật", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  locked: { label: "Đã khóa", className: "bg-brand-50 text-brand-700 ring-brand-200" },
};

export const StudentProfile = ({ student, classes, month, status, evaluations, onMonthChange, onRatingChange, onSave, onLock, onBack, onEdit }: Props) => {
  const [lockOpen,setLockOpen] = useState(false); const key = `${student.id}-${month}`; const locked = status === "locked"; const meta = statusMeta[status];
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
    <Button variant="ghost" onClick={onBack} className="mb-6 -ml-3 font-bold text-brand-600 hover:text-brand-700"><ChevronLeft/>Danh sách học sinh</Button>
    <div className="flex flex-wrap items-start gap-4 border-b border-slate-200 pb-6"><span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-100 text-xl font-extrabold text-brand-600 sm:size-16 sm:text-2xl">{student.name.split(" ").at(-1)?.[0]}</span><div className="min-w-0 flex-1 basis-55"><h2 className="wrap-break-word text-2xl font-bold sm:text-3xl">{student.name}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{classes.find((item) => item.id === student.classId)?.name} · {student.gender} · Sinh ngày {new Date(student.birthDate).toLocaleDateString("vi-VN")}</p></div><Button size="lg" className="w-full sm:w-auto" variant="outline" onClick={onEdit}><Pencil/>Sửa thông tin</Button></div>
    <div className="grid gap-8 pt-7 lg:grid-cols-[320px_1fr]"><BasicInfo student={student}/><div>
      <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row"><div><div className="flex items-center gap-3"><h3 className="text-xl font-bold">Đánh giá theo tháng</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${meta.className}`}>{meta.label}</span></div><p className="mt-1 text-sm text-slate-500">Nhập nội dung can thiệp và kết quả theo mẫu GDCN.</p></div><MonthPicker value={month} onChange={onMonthChange}/></div>
      <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200"><div className="hidden grid-cols-[minmax(150px,0.8fr)_minmax(260px,1.5fr)_220px] bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid"><span>Tiêu chí</span><span>Nội dung can thiệp</span><span>Kết quả</span></div>{criteria.map((criterion,index)=>{const rating=evaluations[key]?.[index]||{result:"",intervention:""};return <div className="grid min-w-0 grid-cols-1 gap-3 border-t border-slate-100 p-4 md:grid-cols-[minmax(150px,0.8fr)_minmax(260px,1.5fr)_220px] md:items-center" key={criterion.name}><div className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{criterion.group}</span><strong className="mt-1 block wrap-break-word text-sm text-slate-700">{criterion.name}</strong></div><div className="min-w-0"><span className="mb-1 block text-xs font-bold text-slate-400 md:hidden">Nội dung can thiệp</span><Textarea disabled={locked} className="min-h-20 resize-y" value={rating.intervention} onChange={(event)=>onRatingChange(index,{intervention:event.target.value})} placeholder="Nhập nội dung can thiệp…"/></div><div className="min-w-0"><span className="mb-1 block text-xs font-bold text-slate-400 md:hidden">Kết quả</span><Select disabled={locked} value={rating.result||undefined} onValueChange={(value)=>onRatingChange(index,{result:value as Rating["result"]})}><SelectTrigger className="w-full max-w-full data-[size=default]:h-11"><SelectValue placeholder="Chọn kết quả"/></SelectTrigger><SelectContent>{resultOptions.map((option)=><SelectItem value={option.value} key={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div></div>})}</div>
      <div className="mt-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-slate-500">Quy ước: <b>+</b> hoàn thành · <b>+/-</b> cần trợ giúp · <b>-</b> chưa hoàn thành</p><div className="grid gap-2 sm:flex">{!locked&&<><Button size="lg" className="w-full sm:w-auto" variant="outline" onClick={onSave}>Cập nhật đánh giá</Button><Button size="lg" className="w-full sm:w-auto" onClick={()=>setLockOpen(true)}><Lock/>Khóa đánh giá</Button></>}{locked&&<span className="flex items-center justify-center gap-2 rounded-md bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700"><Lock className="size-4"/>Phiếu đã hoàn thành</span>}</div></div>
    </div></div>
    <ConfirmDialog open={lockOpen} title="Khóa phiếu đánh giá?" description={`Phiếu đánh giá tháng ${month.split("-")[1]}/${month.split("-")[0]} của ${student.name} sẽ chuyển sang trạng thái hoàn thành và không thể chỉnh sửa.`} confirmLabel="Khóa và hoàn thành" destructive={false} onConfirm={()=>{onLock();setLockOpen(false)}} onOpenChange={setLockOpen}/>
  </section>;
};

const BasicInfo = ({ student }: { student: Student }) => <div className="border-slate-200 lg:border-r lg:pr-7"><h3 className="text-xl font-bold">Thông tin cơ bản</h3><dl className="mt-3">{[["Phụ huynh",student.guardian],["Điện thoại",student.phone],["Địa chỉ",student.address],["Ghi chú",student.note||"Chưa có ghi chú"]].map(([label,value])=><div className="border-b border-slate-100 py-4" key={label}><dt className="mb-1 text-xs uppercase tracking-wide text-slate-400">{label}</dt><dd className="text-sm leading-6 text-slate-700">{value}</dd></div>)}</dl></div>;
