'use client';

import { useState } from 'react';
import type { Team, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TeamDialog } from '@/components/dashboard/team-dialog';
import { useRouter } from 'next/navigation';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';

function TeamCard({ team, members }: { team: Team, members: User[] }) {
  const router = useRouter();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary"/>
                {team.name}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/teams/${team.id}`)}>View</Button>
        </div>
        <CardDescription>{team.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2 overflow-hidden">
            <TooltipProvider delayDuration={0}>
            {members.slice(0, 3).map((member) => (
                <Tooltip key={member.id}>
                    <TooltipTrigger>
                        <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{member.name}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
            </TooltipProvider>
          </div>
          {team.members.length > 3 && (
            <span className="text-sm font-medium text-muted-foreground">
              +{team.members.length - 3} more
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamsList() {
    const { user } = useUser();
    const firestore = useFirestore();

    const teamsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'teams'), where('members', 'array-contains', user.uid));
    }, [firestore, user]);

    const { data: teams, isLoading } = useCollection<Team>(teamsQuery);
    const [teamMembers, setTeamMembers] = useState<{[teamId: string]: User[]}>({});

    useState(() => {
        if (teams) {
            teams.forEach(team => {
                const memberPromises = team.members.map(memberId => getDoc(doc(firestore, 'users', memberId)));
                Promise.all(memberPromises).then(memberDocs => {
                    const members = memberDocs.map(doc => doc.data() as User);
                    setTeamMembers(prev => ({ ...prev, [team.id]: members }));
                });
            });
        }
    });

    if (isLoading) {
        return <p>Loading teams...</p>
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams && teams.map((team) => (
                <TeamCard key={team.id} team={team} members={teamMembers[team.id] || []} />
            ))}
        </div>
    )
}

export default function TeamsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const handleSaveTeam = (teamData: Omit<Team, 'id' | 'members' | 'createdAt'>) => {
    if (!user) return;
    const newTeam = {
        name: teamData.name,
        description: teamData.description,
        members: [user.uid],
        createdAt: serverTimestamp()
    };
    addDoc(collection(firestore, 'teams'), newTeam);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">Teams & Projects</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      <TeamsList />

      <TeamDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTeam}
      />
    </div>
  );
}
