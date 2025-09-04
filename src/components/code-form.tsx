
"use client";

import React, { useEffect } from 'react';
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

const webLanguages = ["HTML", "Javascript", "CSS"] as const;
const exclusiveLanguages = ["C#", "Python"] as const;

export const codeFormSchema = z.object({
  languages: z.array(z.string()).nonempty("Välj minst ett språk."),
  inlineHtml: z.boolean().default(false),
  description: z.string().min(1, "Beskrivning är obligatorisk."),
});

export type CodeFormValues = z.infer<typeof codeFormSchema>;

export const defaultCodeValues: CodeFormValues = {
  languages: [],
  inlineHtml: false,
  description: '',
};

export function CodeForm() {
    const { control, setValue, getValues } = useFormContext<CodeFormValues>();
    const selectedLanguages = useWatch({ control, name: 'languages', defaultValue: [] });

    useEffect(() => {
        const languages = getValues('languages');
        const lastSelected = languages[languages.length - 1];

        if (exclusiveLanguages.includes(lastSelected as any)) {
            // If an exclusive language is selected, deselect all others
            setValue('languages', [lastSelected]);
        } else if (webLanguages.includes(lastSelected as any)) {
            // If a web language is selected, deselect any exclusive language
            const filtered = languages.filter(lang => !exclusiveLanguages.includes(lang as any));
            setValue('languages', filtered);
        }

        // If HTML is not selected, uncheck inlineHtml
        if (!languages.includes('HTML')) {
            setValue('inlineHtml', false);
        }

    }, [selectedLanguages, setValue, getValues]);

    return (
        <div className="space-y-6">
            <FormSection title="Vilket kodspråk skall vi använda?" required>
                <FormField
                    control={control}
                    name="languages"
                    render={() => (
                        <FormItem className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[...webLanguages, ...exclusiveLanguages].map((item) => (
                                    <FormField
                                        key={item}
                                        control={control}
                                        name="languages"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item)}
                                                        onCheckedChange={(checked) => {
                                                            const currentValues = field.value || [];
                                                            return checked
                                                                ? field.onChange([...currentValues, item])
                                                                : field.onChange(currentValues.filter((value) => value !== item));
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">{item}</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                            {selectedLanguages.includes('HTML') && (
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
