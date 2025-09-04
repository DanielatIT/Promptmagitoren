
"use client";

import React from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from './form-section';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const allLanguages = ["HTML, CSS & Javascript", "HTML", "Javascript", "CSS", "C#", "Python"] as const;

export const codeFormSchema = z.object({
  language: z.string().min(1, "Välj minst ett språk."),
  inlineHtml: z.boolean().default(false),
  description: z.string().min(1, "Beskrivning är obligatorisk."),
});

export type CodeFormValues = z.infer<typeof codeFormSchema>;

export const defaultCodeValues: CodeFormValues = {
  language: '',
  inlineHtml: false,
  description: '',
};

export function CodeForm() {
    const { control, setValue } = useFormContext<CodeFormValues>();
    const selectedLanguage = useWatch({ control, name: 'language', defaultValue: '' });
    
    const handleLanguageChange = (language: string) => {
        setValue('language', language, { shouldValidate: true });
        if (language !== 'HTML' && language !== 'HTML, CSS & Javascript') {
            setValue('inlineHtml', false);
        }
    }

    return (
        <div className="space-y-6">
            <FormSection title="Vilket kodspråk skall vi använda?" required>
                <FormField
                    control={control}
                    name="language"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                             <FormControl>
                                <RadioGroup
                                    onValueChange={handleLanguageChange}
                                    value={field.value}
                                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                                >
                                    {allLanguages.map((item) => (
                                        <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={item} />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            {(selectedLanguage === 'HTML' || selectedLanguage === 'HTML, CSS & Javascript') && (
                                <div className="pl-6 pt-2">
                                     <FormField
                                        control={control}
                                        name="inlineHtml"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">Bara inline kod?</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </FormItem>
                    )}
                />
            </FormSection>

            <FormSection title="Beskriv vad koden skall göra" required>
                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea placeholder="Beskriv i detalj funktionaliteten, syftet och eventuella krav för koden..." {...field} rows={6} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </FormSection>
        </div>
    );
}
