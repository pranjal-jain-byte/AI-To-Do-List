'use client';

import { useState } from 'react';
import { useCollection, useMemoFirebase } from '@/firebase';
import type { Note } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle, BrainCircuit, ListTodo, Loader2, CheckSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { summarizeNotes } from '@/ai/flows/summarize-notes';
import { extractTasksFromNotes } from '@/ai/flows/extract-tasks-from-notes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function NotesPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const notesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'notes'), where('ownerId', '==', user.uid));
    }, [firestore, user]);

    const { data: notes, isLoading: isLoadingNotes } = useCollection<Note>(notesQuery);

    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedTasks, setExtractedTasks] = useState<string[] | null>(null);
    const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleSummarize = async () => {
        if (!selectedNote) return;

        setIsSummarizing(true);
        setSummary(null);
        setIsSummaryDialogOpen(true);

        try {
            const result = await summarizeNotes({ noteContent: selectedNote.content });
            setSummary(result.summary);
        } catch (error) {
            console.error("Failed to summarize note:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Could not get summary from AI.",
            });
            setIsSummaryDialogOpen(false);
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleExtractTasks = async () => {
        if (!selectedNote) return;

        setIsExtracting(true);
        setExtractedTasks(null);
        setIsTasksDialogOpen(true);

        try {
            const result = await extractTasksFromNotes({ notes: selectedNote.content });
            setExtractedTasks(result.tasks);
        } catch (error) {
            console.error("Failed to extract tasks:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Could not extract tasks from AI.",
            });
            setIsTasksDialogOpen(false);
        } finally {
            setIsExtracting(false);
        }
    };


    return (
        <div className="h-[calc(100vh-10rem)]">
             <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold font-headline">Notes</h1>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Note
                </Button>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
                <Card className="md:col-span-1 lg:col-span-1 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>All Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-grow">
                        <ScrollArea className="h-full">
                            <div className="p-6 pt-0">
                            {isLoadingNotes && <p>Loading notes...</p>}
                            {notes && notes.map((note) => (
                                <button
                                    key={note.id}
                                    onClick={() => setSelectedNote(note)}
                                    className={cn(
                                        "block w-full text-left p-3 rounded-lg hover:bg-muted",
                                        selectedNote?.id === note.id && "bg-muted"
                                    )}
                                >
                                    <p className="font-semibold truncate">{note.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                    </p>
                                </button>
                            ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
                    {selectedNote ? (
                        <>
                            <CardHeader>
                                <CardTitle>{selectedNote.title}</CardTitle>
                                <CardDescription>
                                    Created on {new Date(selectedNote.createdAt).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ScrollArea className="h-full pr-4">
                                <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap font-code">
                                    {selectedNote.content}
                                </div>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="gap-2">
                                <Button variant="outline" onClick={handleSummarize} disabled={isSummarizing}>
                                    {isSummarizing ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <BrainCircuit className="mr-2 h-4 w-4" />
                                    )}
                                    Summarize with AI
                                </Button>
                                <Button variant="outline" onClick={handleExtractTasks} disabled={isExtracting}>
                                    {isExtracting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <ListTodo className="mr-2 h-4 w-4" />
                                    )}
                                    Extract Tasks
                                </Button>
                            </CardFooter>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mb-4" />
                            <h3 className="text-lg font-semibold">No note selected</h3>
                            <p>Select a note from the list or create a new one.</p>
                        </div>
                    )}
                </Card>
            </div>
            <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>AI Summary</DialogTitle>
                        <DialogDescription>
                            Here is the AI-generated summary of your note: "{selectedNote?.title}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {isSummarizing ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                             summary && (
                                <Alert>
                                    <BrainCircuit className="h-4 w-4" />
                                    <AlertTitle>Summary</AlertTitle>
                                    <AlertDescription>
                                        {summary}
                                    </AlertDescription>
                                </Alert>
                            )
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog open={isTasksDialogOpen} onOpenChange={setIsTasksDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Extracted Tasks</DialogTitle>
                        <DialogDescription>
                            Here are the tasks AI found in your note: "{selectedNote?.title}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {isExtracting ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            extractedTasks && (
                                <div className="space-y-2">
                                    {extractedTasks.length > 0 ? (
                                        extractedTasks.map((task, index) => (
                                            <div key={index} className="flex items-center p-3 rounded-md bg-muted/50">
                                                <CheckSquare className="h-4 w-4 mr-3 text-primary" />
                                                <span className="text-sm">{task}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No tasks were found in this note.</p>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTasksDialogOpen(false)}>Close</Button>
                        <Button>Add to My Tasks</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
