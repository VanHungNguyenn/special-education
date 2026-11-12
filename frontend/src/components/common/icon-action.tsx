import type { MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Icon-only edit/delete button used on class cards and student rows.
export const IconAction = ({ label, icon: IconComponent, danger, onClick }: { label: string; icon: LucideIcon; danger?: boolean; onClick: (event: MouseEvent) => void }) => <Button variant="ghost" size="icon" aria-label={label} onClick={onClick} className={`text-slate-500 ${danger ? "hover:bg-coral-50 hover:text-coral-600" : "hover:text-brand-600"}`}><IconComponent/></Button>;
