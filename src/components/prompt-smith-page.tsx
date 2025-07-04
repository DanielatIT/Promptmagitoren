"use client";

import { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateInitialPrompt } from '@/lib/prompt-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';

function PageContent() {
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const { toast } = useToast();
    const { handleSubmit } = useFormContext<FormValues>();

    const onGenerate = (data: FormValues) => {
        const result = generateInitialPrompt(data);
        setGeneratedPrompt(result.prompt);
    };

    const handleCopy = () => {
        if (!generatedPrompt) {
            toast({
                title: "Nothing to copy",
                description: "Please generate a prompt first.",
                variant: "destructive"
            })
            return;
        }
        navigator.clipboard.writeText(generatedPrompt);
        toast({
            title: "Copied to clipboard!",
            description: "The prompt is ready to be used.",
        })
    };

    return (
        <div className="container mx-auto p-4 md:py-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">PromptSmith</h1>
                <p className="text-muted-foreground mt-2 text-lg">Craft the perfect AI prompt for your needs</p>
            </header>
            <form onSubmit={handleSubmit(onGenerate)} className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                        <ScrollArea className="h-[calc(100vh-12rem)] pr-4 -mr-4">
                            <PromptForm />
                        </ScrollArea>
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
                                        {generatedPrompt ? (
                                            <pre className="text-sm whitespace-pre-wrap font-body leading-relaxed">{generatedPrompt}</pre>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                <p>Your generated prompt will appear here once you click "Förhandsgranska".</p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                     <Button onClick={handleCopy} type="button" className="w-full" variant="outline">
                                        <Clipboard className="mr-2 h-4 w-4" /> Copy Text
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function PromptSmithPage() {
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onSubmit'
    });

    return (
        <FormProvider {...methods}>
            <PageContent />
        </FormProvider>
    );
}
