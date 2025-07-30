'use server';

/**
 * @fileOverview This file defines a Genkit flow for SEO content structure analysis.
 *
 * - seoAnalysis - A function that analyzes a keyword and generates an SEO-optimized content structure.
 * - SeoAnalysisInput - The input type for the seoAnalysis function.
 * - SeoAnalysisOutput - The return type for the seoAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SeoAnalysisInputSchema = z.object({
  keyword: z.string().describe('The keyword to analyze.'),
});
export type SeoAnalysisInput = z.infer<typeof SeoAnalysisInputSchema>;

const SeoAnalysisOutputSchema = z.object({
  analysis: z.string().describe('The generated SEO content structure analysis.'),
});
export type SeoAnalysisOutput = z.infer<typeof SeoAnalysisOutputSchema>;

export async function seoAnalysis(input: SeoAnalysisInput): Promise<SeoAnalysisOutput> {
  return seoAnalysisFlow(input);
}

const seoAnalysisFlow = ai.defineFlow(
  {
    name: 'seoAnalysisFlow',
    inputSchema: SeoAnalysisInputSchema,
    outputSchema: SeoAnalysisOutputSchema,
  },
  async ({ keyword }) => {
    
    const prompt = `
Du är en AI-specialist inom användarbeteende och SEO-optimering för den svenska industrin. Din uppgift är att analysera användarbeteendet när de söker efter "${keyword}" på Google och skapa en SEO-optimerad innehållsstruktur baserad på H-taggar från toppresultaten.

H-taggar från toppresultat:

Nr1:
Nr2:
Nr3:
Uppgifter:

Analysera sökfrågan "${keyword}":
Bestäm användarens intention och motiv bakom sökningen.
Avgör om sökordet är brett eller specifikt och hur det påverkar sökintentionen.
Till exempel:
Generiska termer som ”fräsning”, ”svarvning” eller ”3D-print” tenderar att vara informativa, där användaren söker allmän information.
Specifika termer som ”fräsa aluminium Stockholm”, ”svarva rostfritt Göteborg” eller ”3D-print on demand Stockholm” är mer transaktionella, vilket indikerar att användaren är nära ett köp eller en specifik handling.
Analysera toppresultatens H-taggar:
Undersök hur H1, H2 och H3 används för att organisera innehållet.
Identifiera vilka nyckelord som förekommer i rubrikerna.
Notera strukturen och djupet i innehållet baserat på rubriknivåer.
Identifiera viktiga mönster eller strukturer i användningen av H-taggar.
Identifiera användarens köpresa:
Bestäm var i köpresan användaren befinner sig genom att analysera rubrikstrukturen.
Medvetenhet: Är innehållet utformat för att informera om ett problem eller behov?
Övervägande: Fokuserar det på att jämföra lösningar eller produkter?
Beslut: Innehåller det rubriker som uppmanar till handling eller köp?
Samla relevanta sökord och fraser:
Lista relaterade sökord och fraser som förekommer i toppresultatens rubriker och som är relevanta för "${keyword}".
Utforma en optimal innehållsstruktur:
Föreslå en hierarkisk innehållsförteckning med H1, H2 och H3 som speglar användarens intentioner och täcker relevanta ämnen.
Exempel:
H1: Övergripande rubrik som representerar huvudämnet.
H2: Sektioner som bryter ner ämnet i specifika kategorier eller frågor.
H3: Undersektioner som ger detaljerad information eller exempel.
Integrera EEAT-principerna (Erfarenhet, Expertis, Auktoritet, Trovärdighet) i rubrikerna för att stärka sidans trovärdighet.
Exempel: Använd H2-rubriker för att introducera expertutlåtanden eller referenser till vetenskapliga studier, samt rubriker som betonar företagets erfarenhet inom området.
Mål:

Utveckla en SEO-optimerad innehållsstruktur baserad på analysen av H-taggar i toppresultaten för "${keyword}", med fokus på att möta användarens behov inom den svenska industrin. Innehållet ska vara konkret och detaljerat för att effektivt adressera sökintentionen och förbättra sidans rankning på Google.
    `;

    const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: prompt,
    });
    
    return { analysis: text || '' };
  }
);
