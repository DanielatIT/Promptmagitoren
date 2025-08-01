
"use client";

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, Loader2, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';
import { adaptivePromptGeneration } from '@/lib/prompt-generator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


export default function PromptSmithPage() {
    const [promptText, setPromptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitial, setIsInitial] = useState(true);
    const { toast } = useToast();
    
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onSubmit'
    });

    const onGenerate = async (data: FormValues) => {
        setIsLoading(true);
        setIsInitial(false);
        setPromptText('');

        // Create a deep copy to avoid direct mutation of form state
        const cleanedData = JSON.parse(JSON.stringify(data));
        
        // Explicitly clean data based on the disabled flags.
        // This ensures no data from a disabled section is ever sent.
        if (cleanedData.copywritingStyle_disabled) {
            delete cleanedData.copywritingStyle;
        }
        if (cleanedData.tonality_disabled) {
            delete cleanedData.tonality;
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
        if (cleanedData.primaryKeyword_disabled) {
            delete cleanedData.primaryKeyword;
        }
        if (cleanedData.author_disabled) {
            delete cleanedData.author;
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
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Din genererade prompt kommer att visas här.</p>
                </div>
            );
        }
        return (
            <pre className="text-sm whitespace-pre-wrap font-body leading-relaxed">
                {promptText}
            </pre>
        );
    };

    return (
        <div className="container mx-auto p-4 md:py-8">
            <header className="relative text-center mb-8">
                <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">PromptSmithy</h1>
                 <div className="absolute top-0 right-0">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Info className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="end" className="w-80">
                                <div className="text-sm p-2 text-left">
                                    <h3 className="font-bold font-headline mb-2">Version 0.3</h3>
                                    <h4 className="font-semibold text-foreground mb-1 mt-3">Rättighetsförklaring</h4>
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        PromptSmithy är utvecklad av Daniel Wölfing för Industritorget. Alla immateriella rättigheter, inklusive men inte begränsat till upphovsrätt och varumärkesrätt, tillhör Industritorget. Ingen del av denna applikation får reproduceras, distribueras eller användas i kommersiellt eller icke-kommersiellt syfte utan skriftligt medgivande från Industritorget.
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onGenerate)} className="w-full">
                            <ScrollArea className="h-[calc(100vh-14rem)] pr-4 -mr-4">
                                <PromptForm />
                            </ScrollArea>
                            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Generera Innehåll
                            </Button>
                        </form>
                    </FormProvider>
                </div>
                
                <div className="lg:sticky lg:top-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Button onClick={handleCopy} type="button" className="w-full" variant="outline">
                                    <Clipboard className="mr-2 h-4 w-4" /> Copy Text
                                </Button>
                                <ScrollArea className="h-[calc(100vh-25rem)] lg:h-[calc(100vh-18rem)] rounded-md border p-4 bg-muted/20">
                                    {renderContent()}
                                </ScrollArea>
                                 <Button onClick={handleCopy} type="button" className="w-full" variant="outline">
                                    <Clipboard className="mr-2 h-4 w-4" /> Copy Text
                                 </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
