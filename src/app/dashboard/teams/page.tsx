import { teams } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function TeamCard({ team }: { team: (typeof teams)[0] }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary"/>
                {team.name}
            </CardTitle>
            <Button variant="outline" size="sm">View</Button>
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">Teams & Projects</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
}
