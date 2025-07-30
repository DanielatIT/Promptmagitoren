"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { PromptForm, formSchema as promptFormSchema, defaultValues as promptDefaultValues, type FormValues as PromptFormValues } from './prompt-form';
import { SeoAnalysisForm, formSchema as seoFormSchema, defaultValues as seoDefaultValues, type FormValues as SeoFormValues } from './seo-analysis-form';
import { adaptivePromptGeneration } from '@/ai/flows/adaptive-prompt-generation';
import { seoAnalysis } from '@/ai/flows/seo-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AllFormValues = PromptFormValues | SeoFormValues;

function PageContent() {
    const [activeTab, setActiveTab] = useState('prompt-generator');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const promptMethods = useForm<PromptFormValues>({
        resolver: zodResolver(promptFormSchema),
        defaultValues: promptDefaultValues,
        mode: 'onSubmit'
    });

    const seoMethods = useForm<SeoFormValues>({
        resolver: zodResolver(seoFormSchema),
        defaultValues: seoDefaultValues,
        mode: 'onSubmit'
    });
    
    const methods = activeTab === 'prompt-generator' ? promptMethods : seoMethods;
    const { handleSubmit } = methods;

    const onGenerate = async (data: AllFormValues) => {
        setIsLoading(true);
        setGeneratedContent('');
        try {
            if (activeTab === 'prompt-generator') {
                const result = await adaptivePromptGeneration(data as PromptFormValues);
                setGeneratedContent(result.prompt);
            } else {
                const result = await seoAnalysis(data as SeoFormValues);
                setGeneratedContent(result.analysis);
            }
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
        if (!generatedContent) {
            toast({
                title: "Nothing to copy",
                description: "Please generate content first.",
                variant: "destructive"
            })
            return;
        }
        navigator.clipboard.writeText(generatedContent);
        toast({
            title: "Copied to clipboard!",
            description: "The content is ready to be used.",
        })
    };

    return (
        <div className="container mx-auto p-4 md:py-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">PromptSmith</h1>
                <p className="text-muted-foreground mt-2 text-lg">Your AI-powered content and SEO toolkit</p>
            </header>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="prompt-generator">Prompt Generator</TabsTrigger>
                            <TabsTrigger value="seo-analysis">SEO Analysis</TabsTrigger>
                        </TabsList>
                        <form onSubmit={handleSubmit(onGenerate)} className="w-full">
                            <ScrollArea className="h-[calc(100vh-14rem)] pr-4 -mr-4">
                                <div className="space-y-6">
                                    <TabsContent value="prompt-generator" className="mt-0">
                                        <FormProvider {...promptMethods}>
                                            <PromptForm />
                                        </FormProvider>
                                    </TabsContent>
                                    <TabsContent value="seo-analysis" className="mt-0">
                                        <FormProvider {...seoMethods}>
                                            <SeoAnalysisForm />
                                        </FormProvider>
                                    </TabsContent>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {activeTab === 'prompt-generator' ? 'Förhandsgranska Prompt' : 'Analysera Sökord'}
                                    </Button>
                                </div>
                            </ScrollArea>
                        </form>
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
                                        {isLoading && (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                <Loader2 className="h-8 w-8 animate-spin" />
                                            </div>
                                        )}
                                        {generatedContent && !isLoading ? (
                                            <pre className="text-sm whitespace-pre-wrap font-body leading-relaxed">{generatedContent}</pre>
                                        ) : (
                                            !isLoading &&
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                <p>Your generated content will appear here.</p>
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
            </Tabs>
        </div>
    );
}

export default function PromptSmithPageWrapper() {
    return <PageContent />
}
