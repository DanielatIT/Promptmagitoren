
"use client";

import { useToast } from "@/hooks/use-toast";
import { Bot, Clipboard, ArrowDown, Loader2 } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface PromptPreviewProps {
    promptText: string;
    setPromptText: (text: string) => void;
    isLoading: boolean;
    isInitial: boolean;
}

export function PromptPreview({ promptText, setPromptText, isLoading, isInitial }: PromptPreviewProps) {
    const { toast } = useToast();
    const previewRef = useRef<HTMLDivElement>(null);

    const handleCopy = () => {
        if (!promptText || isLoading) {
            toast({
                title: "Inget att kopiera",
                description: "Vänligen generera en prompt först.",
                variant: "destructive"
            });
            return;
        }

        navigator.clipboard.writeText(promptText);
        toast({
            title: "Kopierad till urklipp!",
            description: "Prompten är redo att användas.",
        });
    };

    const scrollToPreview = () => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            );
        }
        if (isInitial) {
            return (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4">
                    <p>Din genererade prompt kommer att visas här.</p>
                </div>
            );
        }
        return (
             <Textarea
                className="w-full h-96 resize-none border-0 focus-visible:ring-0 bg-transparent p-4"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Din genererade prompt kommer att visas här."
            />
        );
    };

    return (
        <>
            <div className="w-full mt-8" ref={previewRef}>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Förhandsgranskning</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <ScrollArea className="h-96 rounded-md border bg-muted/20">
                                {renderContent()}
                            </ScrollArea>
                            <div className="flex gap-4">
                                <Button onClick={handleCopy} type="button" className="w-full" variant="destructive">
                                    <Clipboard className="mr-2 h-4 w-4" /> Kopiera prompten
                                </Button>
                                <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" className="w-full">
                                    <Button type="button" className="w-full bg-green-600 hover:bg-green-700 text-white">
                                        <Bot className="mr-2 h-4 w-4" /> Öppna ChatGPT
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={scrollToPreview}
                            variant="outline"
                            size="icon"
                            className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
                        >
                            <ArrowDown className="h-6 w-6" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Till förhandsgranskning</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </>
    );
}
