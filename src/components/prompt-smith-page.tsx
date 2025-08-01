"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';
import { adaptivePromptGeneration } from '@/ai/flows/adaptive-prompt-generation';

function PageContent() {
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
        mode: 'onSubmit'
    });

    const { handleSubmit } = methods;

    const onGenerate = async (data: FormValues) => {
        setIsLoading(true);
        setGeneratedContent('');
        try {
            const result = await adaptivePromptGeneration(data);
            setGeneratedContent(result.prompt);
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
                <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">PromptSmithy</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Ett verktyg skapat av: <a href="http://www.industritorget.se" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Industritorget.se</a>
                </p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div>
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onGenerate)} className="w-full">
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
        </div>
    );
}

export default function PromptSmithPageWrapper() {
    return <PageContent />
}
