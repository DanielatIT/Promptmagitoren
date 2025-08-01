
"use client";

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clipboard, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { PromptForm, formSchema, defaultValues, type FormValues } from './prompt-form';
import { adaptivePromptGeneration } from '@/ai/flows/adaptive-prompt-generation';

const copywritingStyleInfo: Record<string, any> = {
    'AIDA': {
        title: 'AIDA-modellen',
        description: 'AIDA kommer från de engelska orden Attention, Interest, Desire och Action. Med AIDA lär du dig skriva på ett klassiskt vis med en beprövad struktur.',
        steps: [
            { title: 'Attention (uppmärksamhet)', text: 'Fånga dina läsares uppmärksamhet med en intressant introduktion.' },
            { title: 'Interest (intresse)', text: 'Berätta varför läsaren borde fortsätta läsa.' },
            { title: 'Desire (begär)', text: 'Skapa ett begär hos läsaren att göra något. Det kan till exempel vara att följa din sida, köpa en produkt eller prenumerera på ett nyhetsbrev.' },
            { title: 'Action (handling)', text: 'Nu kan du använda en CTA-knapp för att dra nytta av läsarens intresse.' }
        ],
        pros: ['Enkel att komma ihåg och jobba med.', 'Fångar läsarens intresse.', 'Gör det tydligt för läsaren vilken handling de ska göra.'],
        cons: ['Kan vara svår att använda för nyanserad kommunikation.', 'Kan vara ineffektiv vid mer komplex kommunikation.']
    },
    'Fyra P': {
        title: 'Fyra P-modellen',
        description: 'Här kommer ännu en klassisk skrivmodell! Fyra P används på flera sätt inom marknadsföring. Fyra P kan dels handla om en modell för marknadsföringsmix men i detta fallet pratar vi om Fyra P för copywriting. Dessa Fyra P är engelskans: Picture, Promise, Prove och Push.',
        steps: [
            { title: 'Picture (föreställ)', text: 'Du börjar med att skapa en bild av ett positivt resultat eller en bra framtid för ett nuvarande problem.' },
            { title: 'Promise (utlova)', text: 'Du fortsätter genom att berätta hur din produkt eller tjänst kan ge det positiva resultat som läsaren föreställer sig.' },
            { title: 'Prove (bevisa)', text: 'Bevisa att ditt löfte stämmer. Presentera konkreta bevis på att du kan uppfylla dina löften och att din produkt eller tjänst kan leverera det du lovar.' },
            { title: 'Push (driv)', text: 'Använd en CTA för att ta läsaren till handling.' }
        ],
        pros: ['Det är enkelt för läsaren att snabbt se fördelarna med något.', 'Sociala bevis fungerar bra för att skapa varumärkesförtroende.', 'Kan användas för både texter och videor.'],
        cons: ['Kräver att du vet något om målgrupper.', 'Fungerar bäst för etablerade företag som redan har sociala bevis.']
    },
    'Före-Efter-Bro': {
        title: 'Före – efter – bro',
        description: 'Med denna skrivmodell är det enkelt att skriva och den kan vara mycket effektiv. Namnet ”Före – efter – bro” kommer av att skribenten presenterar ett problem, visar hur bra livet blir efter lösningen och berättar sedan hur läsaren kan ta del av lösningen.',
        steps: [
            { title: 'Före', text: 'Beskriv läsarens nuvarande verklighet och de problem som hen har.' },
            { title: 'Efter', text: 'Berätta hur bra framtiden kan vara när problemet är löst.' },
            { title: 'Bro', text: 'Berätta hur din produkt eller tjänst kan ta läsaren till en ljus framtid.' }
        ],
        pros: ['Enkelt för copywritern.', 'Läsaren får läsa om ett problem som de kan relatera till.', 'Det är enkelt för läsaren att förstå.'],
        cons: ['Inte särskilt anpassningsbart.']
    },
    'PAS': {
        title: 'PAS-modellen',
        description: 'PAS står för engelskans Pain, Agitation och Solution. Detta är en skrivmodell som används flitigt inom marknadsföring.',
        steps: [
            { title: 'Pain (smärta)', text: 'Du börjar med att beskriva din målgrupps största och viktigaste problem.' },
            { title: 'Agitation (reta)', text: 'Du fortsätter med att konkretisera problemet genom att använda ord som associeras med problemet för läsaren. Det ökar behovet av en lösning.' },
            { title: 'Solution (lösning)', text: 'Slutligen presenteras lösningen. Berätta hur din produkt eller tjänst löser deras problem och hur ”smärtan” kan försvinna.' }
        ],
        pros: ['Modellen gör det enkelt att vara konkret.', 'Lösningen är mer tillfredsställande när problemet känns större.', 'Kan användas för många olika situationer.'],
        cons: ['Ett stort fokus på problem kan överskugga fördelarna med en lösning.']
    },
    'Star-Story-Solution': {
        title: 'Star Story Solution',
        description: 'Star Story Solution är en skrivmodell som gör det enkelt att skapa texter som fokuserar på storytelling. Det är detta fokus som gör denna skrivmodell så bra.',
        steps: [
            { title: 'Star (stjärna)', text: 'Introducera stjärnan i berättelsen. Det kan vara en verklig person eller påhittad karaktär som har ett problem som läsaren kan känna igen sig i.' },
            { title: 'Story (berättelse)', text: 'En berättelse presenteras, med stjärnan i centrum.' },
            { title: 'Solution (lösning)', text: 'Här är ditt mål att visa hur stjärnan löser sitt problem med hjälp av en produkt eller tjänst.' }
        ],
        pros: ['Personen i berättelsen får texten att kännas mer personlig.', 'Storytelling fångar läsarens uppmärksamhet.', 'Det är enkelt att skapa en mer nyanserad berättelse.'],
        cons: ['Passar inte lika bra för korta texter.', 'Valet av person kan ha stor betydelse för målgruppen.']
    }
};

const FormattedCopywritingInfo = ({ styleId }: { styleId: string }) => {
    const info = copywritingStyleInfo[styleId];
    if (!info) return null;

    return (
        <div className="text-sm whitespace-pre-wrap font-body leading-relaxed">
            <h3 className="text-xl font-bold font-headline mb-2">{info.title}</h3>
            <p className="mb-4 text-muted-foreground">{info.description}</p>
            <div className="space-y-3 mb-4">
                {info.steps.map((step: any, index: number) => (
                    <div key={index}>
                        <h4 className="font-semibold">{step.title}</h4>
                        <p>{step.text}</p>
                    </div>
                ))}
            </div>
            {info.pros && info.pros.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold mb-2">Fördelar</h4>
                    <ul className="space-y-1.5">
                        {info.pros.map((pro: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                <span>{pro}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {info.cons && info.cons.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-2">Nackdelar</h4>
                    <ul className="space-y-1.5">
                        {info.cons.map((con: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <span>{con}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const PageContent = () => {
    const [generatedContent, setGeneratedContent] = useState<React.ReactNode>('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
        mode: 'onSubmit'
    });
    
    const copywritingStyle = useWatch({ control: methods.control, name: 'copywritingStyle' });

    useEffect(() => {
        if (copywritingStyle && copywritingStyle !== 'none') {
            setGeneratedContent(<FormattedCopywritingInfo styleId={copywritingStyle} />);
        } else {
             setGeneratedContent(
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Your generated content will appear here.</p>
                </div>
            );
        }
    }, [copywritingStyle]);


    const onGenerate = async (data: FormValues) => {
        setIsLoading(true);
        setGeneratedContent('');
        try {
            const result = await adaptivePromptGeneration(data);
            setGeneratedContent(<pre className="text-sm whitespace-pre-wrap font-body leading-relaxed">{result.prompt}</pre>);
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
        let textToCopy = '';
        if (typeof generatedContent === 'string') {
            textToCopy = generatedContent;
        } else if (generatedContent && typeof generatedContent === 'object' && 'props' in generatedContent) {
             // This is a rough way to extract text from the React element.
             // It works for the current structure but might need adjustment if the structure changes.
             if(generatedContent.props.children?.props?.styleId){
                 const info = copywritingStyleInfo[generatedContent.props.children.props.styleId];
                 toast({
                    title: "Cannot copy info",
                    description: "Please generate content before copying.",
                    variant: "destructive"
                 });
                 return;
             }
             const preElement = (generatedContent as React.ReactElement)?.props?.children;
             if (typeof preElement === 'string') {
                 textToCopy = preElement;
             }
        }
        
        if (!textToCopy) {
            toast({
                title: "Nothing to copy",
                description: "Please generate content first.",
                variant: "destructive"
            })
            return;
        }

        navigator.clipboard.writeText(textToCopy);
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
                                    {isLoading ? (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                        </div>
                                    ) : (
                                        generatedContent
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

export default function PromptSmithPage() {
    return <PageContent />;
}
