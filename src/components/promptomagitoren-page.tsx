
"use client";

import React, { useState, useEffect } from 'react';
import { useForm as useHookForm, FormProvider as HookFormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Info, Code, Image as ImageIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';
import { adaptivePromptGeneration } from '@/lib/prompt-generator';
import { PromptPreview } from './prompt-preview';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function PromptomagitorenPage() {
    const [promptText, setPromptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitial, setIsInitial] = useState(true);
    const { toast } = useToast();

    const methods = useHookForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onSubmit'
    });
    
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (methods.formState.isDirty) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [methods.formState.isDirty]);

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
        if (cleanedData.rules_disabled) {
            delete cleanedData.rules;
        }
        if (cleanedData.links_disabled) {
            delete cleanedData.links;
        }
        if (cleanedData.primaryKeywords_disabled) {
            delete cleanedData.primaryKeywords;
        }
        if (cleanedData.structure_disabled) {
            delete cleanedData.structure;
        }
        if (!cleanedData.performSerpAnalysis) {
            delete cleanedData.serpKeyword;
        }


        try {
            const result = await adaptivePromptGeneration(cleanedData);
            setPromptText(result.prompt);
            methods.reset(data);
        } catch (error) {
            console.error(error);
            toast({
                title: "Fel vid generering",
                description: "Ett fel uppstod när prompten skulle genereras. Kontrollera dina fält och försök igen.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 lg:p-12">
            <header className="relative text-center mb-12">
                <div className="flex justify-center items-center gap-4">
                    <Wand2 className="h-8 w-8 text-primary" />
                    <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">Promptmagitören</h1>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Info className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" align="end" className="w-80">
                            <div className="text-sm p-2 text-left">
                                <h3 className="font-bold font-headline mb-2">Version 1.6</h3>
                                <p className="text-red-600 text-xs italic mb-2">Notering version: Ändrat struktur och länk layout och output.</p>
                                <h4 className="font-semibold text-foreground mb-1 mt-3">Rättighetsförklaring</h4>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Promptmagitören är utvecklad av Daniel Wölfing för Industritorget. Alla immateriella rättigheter, inklusive men inte begränsat till upphovsrätt och varumärkesrätt, tillhör Industritorget. Ingen del av denna applikation får reproduceras, distribueras eller användas i kommersiellt eller icke-kommersiellt syfte utan skriftligt medgivande från Industritorget.
                                </p>
                                <p className="text-muted-foreground text-xs mt-2">
                                    Vid frågor eller behov av kontakt hänvisar vi till vår support: support@industritorget.se.
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/30 p-1.5 rounded-xl border border-border/50 shadow-inner">
                        <TabsTrigger 
                            value="text" 
                            className="flex items-center gap-2 py-3 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg"
                        >
                            <Wand2 className="h-4 w-4" />
                            <span className="font-bold">Text</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="kod" 
                            className="flex items-center gap-2 py-3 transition-all data-[state=active]:bg-red-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg"
                        >
                            <Code className="h-4 w-4" />
                            <span className="font-bold">Kod</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="bild" 
                            className="flex items-center gap-2 py-3 transition-all data-[state=active]:bg-green-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg"
                        >
                            <ImageIcon className="h-4 w-4" />
                            <span className="font-bold">Bild</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="mt-0 outline-none">
                        <HookFormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onGenerate)} className="w-full">
                                <PromptForm />
                                <Button type="submit" className="w-full mt-6 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5 mr-2" />}
                                    Magitera prompt
                                    {!isLoading && <Wand2 className="h-5 w-5 ml-2" />}
                                </Button>
                            </form>
                            <PromptPreview
                                promptText={promptText}
                                setPromptText={setPromptText}
                                isLoading={isLoading}
                                isInitial={isInitial}
                            />
                        </HookFormProvider>
                    </TabsContent>

                    <TabsContent value="kod" className="mt-0 outline-none">
                        <Card className="border-2 border-dashed border-red-200 bg-red-50/20">
                            <CardContent className="flex items-center justify-center p-16">
                                <div className="text-center space-y-4">
                                    <div className="bg-red-100 p-4 rounded-full inline-block">
                                        <Code className="h-12 w-12 text-red-800" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-red-900">Kodmagitören</h3>
                                    <p className="text-red-800/70 font-medium">Denna modul är under konstruktion...</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bild" className="mt-0 outline-none">
                        <Card className="border-2 border-dashed border-green-200 bg-green-50/20">
                            <CardContent className="flex items-center justify-center p-16">
                                <div className="text-center space-y-4">
                                    <div className="bg-green-100 p-4 rounded-full inline-block">
                                        <ImageIcon className="h-12 w-12 text-green-800" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-900">Bildmagitören</h3>
                                    <p className="text-green-800/70 font-medium">Denna modul är under konstruktion...</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
