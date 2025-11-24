'use client';

import { useParams, useRouter } from 'next/navigation';
import { teams as initialTeams, tasks as initialTasks, getAuthenticatedUser } from '@/lib/data';
import type { Team, Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, List, Clock, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

const priorityVariant = {
  Low: 'secondary',
  Medium: 'outline',
  High: 'default',
  Critical: 'destructive',
} as const;

export default function TeamDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const foundTeam = initialTeams.find((t) => t.id === teamId);
    if (foundTeam) {
      setTeam(foundTeam);
      const teamTasks = initialTasks.filter((task) => task.teamId === teamId);
      setTasks(teamTasks);
    }
  }, [teamId]);

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Team not found.</p>
      </div>
    );
  }
  
  const user = getAuthenticatedUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                {team.name}
            </h1>
            <p className="text-muted-foreground">{team.description}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {team.members.map((member) => (
                <li key={member.id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name} {member.id === user.id && '(You)'}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Team Tasks</CardTitle>
            <CardDescription>Tasks assigned to {team.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
                <ul className="space-y-4">
                    {tasks.map((task) => (
                        <li key={task.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                            <div>
                                <p className="font-semibold">{task.title}</p>
                                <p className="text-sm text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                                {task.status === 'done' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-yellow-500" />}
                            </div>
                        </li>
                    ))}
                </ul>
            ): (
                <div className="text-center py-8 text-muted-foreground">
                    <List className="h-12 w-12 mx-auto mb-4" />
                    <p>No tasks assigned to this team yet.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
