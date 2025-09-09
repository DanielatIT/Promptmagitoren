"use client";

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';
import { adaptivePromptGeneration } from '@/lib/prompt-generator';
import { PromptPreview } from './prompt-preview';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from './ui/tooltip';

export default function PromptomagitorenPage() {
    const [promptText, setPromptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitial, setIsInitial] = useState(true);
    const { toast } = useToast();

    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onSubmit'
    });
    
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const onGenerate = async (data: FormValues) => {
        setIsLoading(true);
        setIsInitial(false);
        setPromptText('');

        const cleanedData = JSON.parse(JSON.stringify(data));

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
        if (cleanedData.websiteUrl_disabled) {
            delete cleanedData.websiteUrl;
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

    return (
        <div className="container mx-auto p-4 md:p-8 lg:p-12">
            <header className="relative text-center mb-8">
                <div className="flex justify-center items-center gap-4">
                    <Wand2 className="h-8 w-8 text-primary" />
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
                                    <h3 className="font-bold font-headline mb-2">Version 0.5</h3>
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
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onGenerate)} className="w-full mt-6">
                        <PromptForm />
                        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            Magitera prompt
                            {!isLoading && <Wand2 className="h-4 w-4" />}
                        </Button>
                    </form>
                    <PromptPreview
                        promptText={promptText}
                        setPromptText={setPromptText}
                        isLoading={isLoading}
                        isInitial={isInitial}
                    />
                </FormProvider>
            </div>
        </div>
    );
}
