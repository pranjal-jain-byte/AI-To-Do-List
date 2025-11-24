'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface AskAiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: string) => Promise<void>;
}

type FormValues = {
  command: string;
};

export function AskAiDialog({ isOpen, onClose, onSubmit }: AskAiDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>();

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data.command);
    reset();
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ask AI
          </DialogTitle>
          <DialogDescription>
            Use natural language to create tasks. Try "Schedule a meeting for 4pm today" or "Add 'buy milk' to my tasks".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="py-4">
            <Input
              {...register('command', { required: true })}
              placeholder="e.g. Remind me to call John tomorrow at 10am"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
