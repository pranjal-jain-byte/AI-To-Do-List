'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

// Define the interface for the SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AskAiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: string) => Promise<void>;
}

type FormValues = {
  command: string;
};

export function AskAiDialog({ isOpen, onClose, onSubmit }: AskAiDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>();
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setValue('command', transcript);
      };

      recognition.onerror = (event: any) => {
        let description = `Could not recognize speech: ${event.error}`;
        if (event.error === 'network') {
          description = 'Network error during speech recognition. Please check your internet connection and try again.';
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          description = 'Microphone access was denied. Please allow microphone access in your browser settings.';
        }
        
        toast({
            variant: "destructive",
            title: "Voice Error",
            description: description,
        });
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
        setIsSpeechSupported(false);
    }
  }, [setValue, toast]);


  const handleListen = () => {
    if (!isSpeechSupported) {
        toast({
            variant: "destructive",
            title: "Not Supported",
            description: "Your browser does not support speech recognition."
        });
        return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
         console.error("Error starting speech recognition:", error);
         setIsListening(false);
      }
    }
  };


  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    await onSubmit(data.command);
    reset();
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isListening) {
        recognitionRef.current?.stop();
      }
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ask AI
          </DialogTitle>
          <DialogDescription>
            Type or use your voice to create tasks. Try "Schedule a meeting for 4pm today".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="py-4">
            <div className="relative">
                <Input
                {...register('command', { required: true })}
                placeholder="e.g. Remind me to call John tomorrow at 10am"
                disabled={isSubmitting}
                className="pr-12"
                />
                {isSpeechSupported && (
                    <Button 
                        type="button" 
                        size="icon" 
                        variant={isListening ? "destructive" : "outline"}
                        onClick={handleListen}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        disabled={isSubmitting}
                    >
                        {isListening ? <MicOff /> : <Mic />}
                    </Button>
                )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
