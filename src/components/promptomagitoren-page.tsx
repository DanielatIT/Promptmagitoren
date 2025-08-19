
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, Loader2, Info, Download, Wand2, Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';
import { adaptivePromptGeneration } from '@/lib/prompt-generator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Textarea } from './ui/textarea';

export default function PromptomagitorenPage() {
    const [promptText, setPromptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitial, setIsInitial] = useState(true);
    const { toast } = useToast();
    const previewRef = useRef<HTMLDivElement>(null);

    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onSubmit'
    });

    const onGenerate = async (data: FormValues) => {
        setIsLoading(true);
        setIsInitial(false);
        setPromptText('');

        const cleanedData = JSON.parse(JSON.stringify(data));
        
        if (cleanedData.copywritingStyle_disabled || cleanedData.aiRole !== 'Copywriter') {
            delete cleanedData.copywritingStyle;
        }
        if (cleanedData.tonality_disabled) {
            delete cleanedData.tonality;
            delete cleanedData.tonalityCustom;
        }
        if (cleanedData.textLength_disabled) {
            delete cleanedData.textLength;
        }
        if (cleanedData.lists_disabled) {
            delete cleanedData.numberOfLists;
            delete cleanedData.excludeLists;
        }
        if (cleanedData.rules_disabled) {
            delete cleanedData.rules;
        }
        if (cleanedData.links_disabled) {
            delete cleanedData.links;
        }
        if (cleanedData.primaryKeywords_disabled) {
             delete cleanedData.primaryKeywords;
        }
        if (cleanedData.author_disabled) {
            delete cleanedData.author;
        }
        if (cleanedData.structure_disabled) {
            delete cleanedData.structure;
        }

        try {
            const result = await adaptivePromptGeneration(cleanedData);
            setPromptText(result.prompt);
        } catch (error) {
            console.error(error);
            toast({
                title: "Error generating content",
                description: "An error occurred while generating the content. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                className="w-full h-full resize-none border-0 focus-visible:ring-0 bg-transparent p-4"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Din genererade prompt kommer att visas här."
            />
        );
    };

    return (
        <FormProvider {...methods}>
            <div className="container mx-auto p-4 md:p-8 lg:p-12">
                <header className="relative text-center mb-8">
                     <div className="flex justify-center items-center gap-2">
                        <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">Promptmagitören</h1>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Info className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="end" className="w-80">
                                    <div className="text-sm p-2 text-left">
                                        <h3 className="font-bold font-headline mb-2">Version 0.4</h3>
                                        <h4 className="font-semibold text-foreground mb-1 mt-3">Rättighetsförklaring</h4>
                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            Promptmagitören är utvecklad av Daniel Wölfing för Industritorget. Alla immateriella rättigheter, inklusive men inte begränsat till upphovsrätt och varumärkesrätt, tillhör Industritorget. Ingen del av denna applikation får reproduceras, distribueras eller användas i kommersiellt eller icke-kommersiellt syfte utan skriftligt medgivande från Industritorget.
                                        </p>
                                        <p className="text-muted-foreground text-xs mt-2">
                                            Vid frågor eller behov av kontakt hänvisar vi till vår support: support@industritorget.se.
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                     </div>
                </header>
                
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={methods.handleSubmit(onGenerate)} className="w-full">
                        <PromptForm />
                        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            Magitera prompt
                            {!isLoading && <Wand2 className="h-4 w-4" />}
                        </Button>
                    </form>
                    
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
                </div>
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
                            <Download className="h-6 w-6" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Till förhandsgranskning</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </FormProvider>
    );
}
