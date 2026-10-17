import { buttonVariants } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Props = { open: boolean; title: string; description: string; confirmLabel?: string; destructive?: boolean; onConfirm?: () => void; onOpenChange: (open: boolean) => void };

export const ConfirmDialog = ({ open, title, description, confirmLabel = "Xóa", destructive = true, onConfirm, onOpenChange }: Props) => <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction className={buttonVariants({ variant: destructive ? "destructive" : "default" })} onClick={onConfirm}>{confirmLabel}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;

