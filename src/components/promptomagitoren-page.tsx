
"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextPromptTab } from './text-prompt-tab';
import { CodePromptTab } from './code-prompt-tab';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Info } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function PromptomagitorenPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 lg:p-12">
            <header className="relative text-center mb-8">
                 <div className="flex justify-center items-center gap-2">
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
                                    <h3 className="font-bold font-headline mb-2">Version 0.4</h3>
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
                <Tabs defaultValue="text-prompt">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="text-prompt">Prompta text</TabsTrigger>
                        <TabsTrigger value="code-prompt">Skapa kod</TabsTrigger>
                        <TabsTrigger value="image-prompt">Skapa en bild</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text-prompt">
                        <TextPromptTab />
                    </TabsContent>
                    <TabsContent value="code-prompt">
                        <CodePromptTab />
                    </TabsContent>
                    <TabsContent value="image-prompt">
                        <Card>
                            <CardHeader>
                                <CardTitle>Skapa en bild</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>UNDER KONSTRUKTION</p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
