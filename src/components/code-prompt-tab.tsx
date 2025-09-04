
"use client";

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { PromptPreview } from './prompt-preview';
import { CodeForm, codeFormSchema, defaultCodeValues, type CodeFormValues } from './code-form';
import { generateCodePrompt } from '@/lib/code-prompt-generator';

export function CodePromptTab() {
    const [promptText, setPromptText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitial, setIsInitial] = useState(true);
    const { toast } = useToast();
    
    const methods = useForm<CodeFormValues>({
        resolver: zodResolver(codeFormSchema),
        defaultValues: defaultCodeValues,
        mode: 'onSubmit'
    });

    const onGenerate = async (data: CodeFormValues) => {
        setIsLoading(true);
        setIsInitial(false);
        setPromptText('');

        try {
            const result = await generateCodePrompt(data);
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
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onGenerate)} className="w-full mt-6">
                <CodeForm />
                <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Magitera kod-prompt
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
    );
}
