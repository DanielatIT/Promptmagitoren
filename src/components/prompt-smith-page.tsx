"use client";

import { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateInitialPrompt, type GenerateInitialPromptInput } from '@/lib/prompt-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';

const taskTypeMap = {
    'Artikel': 'Skriv en artikel för en av våra bloggar där du inte nämner kundens namn eller företag utan utgår från att vi bara vill ge läsaren ett värde',
    'Seo onpage text': 'Skriv en SEO-optimerad on-page-text för en webbsida. Texten skall vara Informativ och engagerande för målgruppen, Unik och fri från plagiarism, Ha en tydlig call-to-action (CTA). Optimera för läsbarhet med korta stycken och enkla meningar. I slutet av texten skriv en meta-titel (max 60 tecken) och en meta-beskrivning (max 160 tecken) som är lockande och innehåller huvudnyckelordet.',
    'Korrekturläsning': 'Korrekturläs följande text noggrant med fullt fokus på svensk grammatik och språkriktighet. Gå igenom texten för att identifiera och korrigera alla typer av fel. Detta inkluderar bland annat stavfel (även sär- och sammanskrivningar), grammatikfel som felaktig böjning av ord, otydlig satskonstruktion, ordföljd och tempusfel. Se också över interpunktionen och justera användningen av kommatecken, punkter, semikolon, kolon, tankstreck och bindestreck.\n\nVar uppmärksam på syftningsfel, så att pronomen och adverb otvetydigt syftar på rätt ord eller fras. Granska meningsbyggnaden för att försäkra att formuleringarna är klara och koncisa, och att det inte förekommer onödigt långa meningar eller anakoluter. Kontrollera även att det inte finns några inkonsekvenser i texten, exempelvis gällande stavning av namn, användning av siffror, förkortningar eller inkonsekvent terminologi. Fokusera även på språkriktighet och stil, vilket innefattar ordval, textens flyt och att tonen är anpassad till syftet. Slutligen, sök efter typografiska fel som dubbla mellanslag, felaktig användning av stora/små bokstäver eller indrag.\n\nMålet är att texten ska vara idiomatiskt korrekt, lättläst, begriplig och professionell på svenska. När du presenterar de föreslagna ändringarna kan du antingen visa den fullständigt korrigerade texten eller lista specifika ändringar med en kort förklaring för varje justering, exempelvis "Original: \'dom\' -> Korrigerat: \'de\' - grammatikfel, personligt pronomen". Sträva efter att bevara författarens ursprungliga stil och ton så långt det är möjligt, samtidigt som språkriktigheten garanteras.',
};

const writingForMap = {
    'Kund': 'Vi skriver denna text för en av våra kunder som skall publiceras på något vis på deras webbplats.',
    'Vår blogg': 'Vi skriver denna text för en av våra bloggar. Dessa bloggar har som syfte att bidra med informativ information kring ämne i denna text. Men även ha ett syfte av att inkludera viktiga externlänkar.'
}


function PageContent() {
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const { toast } = useToast();
    const { handleSubmit } = useFormContext<FormValues>();

    const onGenerate = (data: FormValues) => {
        const rules: string[] = [];
        if (data.rules.avoidSuperlatives) rules.push('Undvik superlativ');
        if (data.rules.avoidPraise) rules.push('Undvik lovord');
        if (data.rules.avoidAcclaim) rules.push('Undvik beröm.');
        if (data.rules.isInformative) rules.push('Texten skall vara informativ med fokus på att ge läsaren kunskap för ämnet');
        if (data.rules.useWeForm) rules.push('Skriv i vi-form, som att vi är företaget.');
        if (data.rules.addressReaderAsYou) rules.push('Läsaren skall benämnas som ni.');
        if (data.rules.avoidWords.enabled && data.rules.avoidWords.words.length > 0) {
            rules.push(`Texten får aldrig innehålla orden: ${data.rules.avoidWords.words.join(', ')}`);
        }
        if (data.rules.avoidXYPhrase) rules.push('skriv aldrig en mening som liknar eller är i närheten av detta “...i en X värld/industri/område är “sökordet” värdefullt för Y anledning”');
        if (data.rules.customRules) {
            rules.push(...data.rules.customRules.split('\n').filter(rule => rule.trim() !== ''));
        }

        const taskType = data.taskTypeRadio === 'custom' ? data.taskTypeCustom : taskTypeMap[data.taskTypeRadio as keyof typeof taskTypeMap];
        const writingFor = data.writingForRadio === 'custom' ? data.writingForCustom : writingForMap[data.writingForRadio as keyof typeof writingForMap];
        
        const payload: GenerateInitialPromptInput = {
            topicGuideline: data.topicGuideline,
            aiRole: data.aiRole,
            taskType: taskType!,
            tonality: data.tonality,
            textLength: data.textLength ? parseInt(data.textLength, 10) : undefined,
            numberOfLists: data.excludeLists ? undefined : (data.numberOfLists ? parseInt(data.numberOfLists, 10) : undefined),
            language: data.language,
            writingFor: writingFor,
            rules: rules,
            links: data.links?.filter(link => link.url && link.anchorText),
            primaryKeyword: data.primaryKeyword,
            author: data.author,
            topicInformation: data.topicInformation,
        };

        const result = generateInitialPrompt(payload);
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
