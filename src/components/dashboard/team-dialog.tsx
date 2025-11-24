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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Team, User } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
  memberIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one member.",
  }),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Team, 'id' | 'members'> & { memberIds: string[] }) => void;
  allUsers: User[];
}

export function TeamDialog({ isOpen, onClose, onSave, allUsers }: TeamDialogProps) {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
      memberIds: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: '',
        description: '',
        memberIds: [],
      });
    }
  }, [form, isOpen]);

  const onSubmit = (data: TeamFormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Project Phoenix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is this team about?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="memberIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Members</FormLabel>
                    <FormDescription>
                      Select the members for this team.
                    </FormDescription>
                  </div>
                   <ScrollArea className="h-40">
                  {allUsers.map((user) => (
                    <FormField
                      key={user.id}
                      control={form.control}
                      name="memberIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={user.id}
                            className="flex flex-row items-start space-x-3 space-y-0 p-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), user.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== user.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {user.name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Team</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
