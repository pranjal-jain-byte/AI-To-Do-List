'use client';

import { useParams, useRouter } from 'next/navigation';
import type { Team, Task, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, List, Clock, CheckCircle2, UserPlus, LogOut, Copy, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, updateDoc, arrayRemove } from 'firebase/firestore';

const priorityVariant = {
  Low: 'secondary',
  Medium: 'outline',
  High: 'default',
  Critical: 'destructive',
} as const;

function MemberList({ memberIds }: { memberIds: string[] }) {
    const firestore = useFirestore();
    const { user: currentUser } = useUser();

    // Although we are fetching multiple users, we can't use a single `useCollection` with a `where('id', 'in', ...)`
    // query because the number of members might exceed Firestore's limit of 30 disjunctions.
    // Instead, we fetch each member's document individually using `useDoc`.
    const memberDocs = memberIds.map(id => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const userDocRef = useMemoFirebase(() => doc(firestore, 'users', id), [firestore, id]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useDoc<User>(userDocRef);
    });

    const isLoading = memberDocs.some(doc => doc.isLoading);
    const members = memberDocs.map(doc => doc.data).filter((m): m is User => !!m);

    if (isLoading) {
        return (
             <div className="space-y-4">
                {[...Array(memberIds.length || 2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading member...</span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <ul className="space-y-4">
        {members.map((member) => (
            <li key={member.id} className="flex items-center gap-4">
            <Avatar>
                <AvatarImage src={member.avatarUrl} />
                <AvatarFallback>{member.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-medium">{member.name} {member.id === currentUser?.uid && '(You)'}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
            </li>
        ))}
        </ul>
    );
}

export default function TeamDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const teamDocRef = useMemoFirebase(() => {
    if (!teamId) return null;
    return doc(firestore, 'teams', teamId);
  }, [firestore, teamId]);
  const { data: team, isLoading: isLoadingTeam } = useDoc<Team>(teamDocRef);

  const tasksQuery = useMemoFirebase(() => {
    if (!teamId) return null;
    return query(collection(firestore, 'tasks'), where('teamId', '==', teamId));
  }, [firestore, teamId]);
  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);
  
  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/teams/${teamId}/join`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Invite link copied!',
      description: 'You can now share the link with your team.',
    });
  };
  
  const handleLeaveTeam = async () => {
    if (!user || !team) return;
    const teamRef = doc(firestore, 'teams', team.id);
    await updateDoc(teamRef, {
        members: arrayRemove(user.uid)
    });
    toast({
        title: "You have left the team.",
        description: `You are no longer a member of ${team?.name}.`,
    });
    router.push('/dashboard/teams');
  }

  if (isLoadingTeam) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading team...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Team not found.</p>
      </div>
    );
  }
  
  const isMember = team.members.some(memberId => memberId === user?.uid);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        {isMember && (
            <Button variant="destructive" onClick={handleLeaveTeam}>
                <LogOut className="mr-2 h-4 w-4" />
                Leave Team
            </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
                {team.members && <MemberList memberIds={team.members} />}
            </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Invite Members
                </CardTitle>
                 <CardDescription>Share this link with people you want to invite.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    readOnly 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/teams/${teamId}/join`} 
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>


        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Team Tasks</CardTitle>
            <CardDescription>Tasks assigned to {team.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTasks && <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {!isLoadingTasks && tasks && tasks.length > 0 ? (
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
