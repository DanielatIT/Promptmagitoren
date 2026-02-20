"use client";

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Code, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { CodeForm } from './code-form';
import { PromptPreview } from './prompt-preview';
import { generateCodePrompt, CodeFormValues } from '@/lib/code-generator';

const codeFormSchema = z.object({
  whatToCreate: z.string().min(1, 'Beskrivning är obligatorisk'),
  implementationPlace: z.enum(['Elementor', 'Wordpress', 'CMS', 'IDE', 'Other']).optional(),
  implementationOther: z.string().optional(),
  languages: z.array(z.string()).optional(),
  colors: z.array(z.object({ value: z.string() })).default([{ value: "#2c3e50" }]),
  font: z.string().optional(),
  schemas: z.array(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.implementationPlace === 'Other' && (!data.implementationOther || data.implementationOther.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Beskriv var koden ska implementeras",
      path: ['implementationOther'],
    });
  }
});

export function CodeMagitorenTab() {
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const { toast } = useToast();

  const methods = useForm<CodeFormValues>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: {
      whatToCreate: '',
      implementationPlace: 'Elementor',
      implementationOther: '',
      languages: [],
      colors: [{ value: "#223b53" }],
      font: '',
      schemas: [],
    }
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
        title: "Fel vid generering",
        description: "Ett fel uppstod när kodprompten skulle genereras.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onGenerate)} className="w-full">
        <CodeForm />
        <Button type="submit" className="w-full mt-6 h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all bg-red-900 hover:bg-red-800 text-white" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Code className="h-5 w-5 mr-2" />}
          Magitera kod-prompt
          {!isLoading && <Code className="h-5 w-5 ml-2" />}
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
