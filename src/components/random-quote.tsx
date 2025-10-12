
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { quotes } from '@/lib/quotes';
import { Bot } from 'lucide-react';

interface Quote {
    quote: string;
    source: string;
}

export function RandomQuote() {
    const [randomQuote, setRandomQuote] = useState<Quote | null>(null);

    useEffect(() => {
        // This ensures the code only runs on the client, avoiding hydration mismatches.
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setRandomQuote(quotes[randomIndex]);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Dagens Visdom
                </CardTitle>
            </CardHeader>
            <CardContent>
                {randomQuote ? (
                    <div className="space-y-3">
                        <p className="text-sm font-medium leading-relaxed">"{randomQuote.quote}"</p>
                        <p className="text-xs text-muted-foreground text-right">— {randomQuote.source}</p>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Laddar visdom...</p>
                )}
            </CardContent>
        </Card>
    );
}
