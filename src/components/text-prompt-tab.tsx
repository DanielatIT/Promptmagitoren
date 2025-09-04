
"use client";

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';
import { adaptivePromptGeneration } from '@/lib/prompt-generator';
import { PromptPreview } from './prompt-preview';

export function TextPromptTab() {
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
    );
}
