import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
}

export function InfoModal({
  open,
  onOpenChange,
  title,
  content,
}: InfoModalProps) {
   useLockBodyScroll(open); 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 text-sm leading-7 text-muted-foreground">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}