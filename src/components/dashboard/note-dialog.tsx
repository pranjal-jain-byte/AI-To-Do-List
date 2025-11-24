'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Note } from '@/lib/types';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Note, 'id' | 'ownerId' | 'createdAt'> & { id?: string }) => void;
  note: Partial<Note> | null;
}

export function NoteDialog({ isOpen, onClose, onSave, note }: NoteDialogProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (note) {
        form.reset({
          title: note.title || '',
          content: note.content || '',
        });
      } else {
        form.reset({
          title: '',
          content: '',
        });
      }
    }
  }, [note, form, isOpen]);

  const onSubmit = (data: NoteFormValues) => {
    const dataToSave: any = { ...data };
    if (note?.id) {
      dataToSave.id = note.id;
    }
    onSave(dataToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{note?.id ? 'Edit Note' : 'Add Note'}</DialogTitle>
          <DialogDescription>
            {note?.id ? 'Update the details of your note.' : 'Create a new note. You can summarize it with AI later.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Meeting Recap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your notes here..." {...field} className="min-h-[200px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Note</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
