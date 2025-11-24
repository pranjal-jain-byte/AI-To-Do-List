'use client';

import { useState } from 'react';
import { notes } from '@/lib/data';
import type { Note } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle, BrainCircuit, ListTodo } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function NotesPage() {
    const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);

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
                            {notes.map((note) => (
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
                                <Button variant="outline">
                                    <BrainCircuit className="mr-2 h-4 w-4" />
                                    Summarize with AI
                                </Button>
                                <Button variant="outline">
                                    <ListTodo className="mr-2 h-4 w-4" />
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
        </div>
    );
}
