'use client';

import { useState } from 'react';
import { teams as initialTeams, users } from '@/lib/data';
import type { Team, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TeamDialog } from '@/components/dashboard/team-dialog';
import { useRouter } from 'next/navigation';

function TeamCard({ team }: { team: Team }) {
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
            {team.members.slice(0, 3).map((member) => (
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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveTeam = (teamData: Omit<Team, 'id' | 'members'> & { memberIds: string[] }) => {
    const newTeam: Team = {
        id: `team-${Math.floor(Math.random() * 10000)}`,
        name: teamData.name,
        description: teamData.description,
        members: users.filter(u => teamData.memberIds.includes(u.id))
    };
    setTeams([newTeam, ...teams]);
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      <TeamDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTeam}
        allUsers={users}
      />
    </div>
  );
}
