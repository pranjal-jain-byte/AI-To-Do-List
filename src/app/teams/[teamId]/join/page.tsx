'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, FirebaseClientProvider } from '@/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Team } from '@/lib/types';

function JoinTeamLogic() {
    const router = useRouter();
    const params = useParams();
    const teamId = params.teamId as string;
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    useEffect(() => {
        // Wait until user loading is finished
        if (isUserLoading) {
            return;
        }

        // If no user, redirect to login
        if (!user) {
            router.push(`/start?redirect=/teams/${teamId}/join`);
            return;
        }

        // If user and teamId are available, attempt to join
        if (user && teamId) {
            const teamRef = doc(firestore, 'teams', teamId);

            const joinTeam = async () => {
                try {
                    const teamSnap = await getDoc(teamRef);

                    if (!teamSnap.exists()) {
                        toast({
                            variant: 'destructive',
                            title: 'Team not found',
                            description: 'The team you are trying to join does not exist.',
                        });
                        router.push('/dashboard/teams');
                        return;
                    }

                    const teamData = teamSnap.data() as Team;

                    // Check if user is already a member
                    if (teamData.members.includes(user.uid)) {
                         toast({
                            title: 'Already a member',
                            description: `You are already a member of ${teamData.name}.`,
                        });
                    } else {
                        // Add user to the members array
                        await updateDoc(teamRef, {
                            members: arrayUnion(user.uid),
                        });
                        toast({
                            title: 'Welcome to the team!',
                            description: `You have successfully joined ${teamData.name}.`,
                        });
                    }

                    // Redirect to the team page
                    router.push(`/dashboard/teams/${teamId}`);

                } catch (error) {
                    console.error("Failed to join team:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Uh oh! Something went wrong.',
                        description: 'Could not join the team. Please try again.',
                    });
                    router.push('/dashboard/teams');
                }
            };

            joinTeam();
        }
    }, [user, isUserLoading, teamId, firestore, router, toast]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Joining team...</p>
        </div>
    );
}


export default function JoinTeamPage() {
    return (
        <FirebaseClientProvider>
            <JoinTeamLogic />
        </FirebaseClientProvider>
    );
}
