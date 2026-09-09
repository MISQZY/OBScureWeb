'use client';

import * as React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChangelogDialogProps {
  version: string;
  notes?: string[];
  buttonText: string;
  titleText?: string;
  emptyText?: string;
}

export function ChangelogDialog({ version, notes, buttonText, titleText = 'Changelog', emptyText = 'No release notes provided.' }: ChangelogDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-md" />}>
        <FileText className="w-4 h-4" />
        {buttonText}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-background/95 backdrop-blur-lg border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 border-b border-border/50 pb-4">
            <FileText className="w-6 h-6 text-primary" />
            {titleText} {version}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] w-full rounded-md mt-4 pr-4">
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                          prose-headings:text-foreground prose-a:text-primary 
                          prose-strong:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded">
            {notes && notes.length > 0 ? (
              <ul className="list-disc pl-5 m-0 space-y-1">
                {notes.map((note, idx) => (
                  <li key={idx} className="text-muted-foreground">{note}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">{emptyText}</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}