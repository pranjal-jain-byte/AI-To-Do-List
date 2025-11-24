import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = placeholderImages.find(img => img.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Clock className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Chronos AI</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-secondary rounded-full px-3 py-1 text-sm font-medium">
                <Zap className="h-4 w-4 inline-block mr-2 text-primary" />
                AI-Powered Productivity
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter">
                Organize your life, powered by AI.
              </h1>
              <p className="text-lg text-muted-foreground">
                Chronos AI is your intelligent assistant for task management and team collaboration.
                Prioritize your day, summarize your notes, and supercharge your team's workflow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <Card className="overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  {heroImage && (
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      width={1200}
                      height={800}
                      data-ai-hint={heroImage.imageHint}
                      className="object-cover"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Chronos AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
