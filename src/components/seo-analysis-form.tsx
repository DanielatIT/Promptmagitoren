"use client";

import { useFormContext, FormProvider, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FormSection } from './form-section';

export const formSchema = z.object({
  keyword: z.string().min(1, 'Sökord är obligatoriskt.'),
});

export type FormValues = z.infer<typeof formSchema>;

export const defaultValues: Partial<FormValues> = {
  keyword: '',
};

export function SeoAnalysisForm() {
    const { control } = useFormContext<FormValues>();

    return (
        <div className="space-y-6">
            <FormSection title="Sökordsanalys" description="Ange det sökord du vill analysera för att få en SEO-optimerad innehållsstruktur." required>
                <FormField
                    control={control}
                    name="keyword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sökord att analysera</FormLabel>
                            <FormControl>
                                <Input placeholder="t.ex. fräsning, 3D-print on demand..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </FormSection>
        </div>
    );
}

export default function SeoAnalysisPage() {
    const methods = useFormContext<FormValues>();

    return (
        <FormProvider {...methods}>
            <SeoAnalysisForm />
        </FormProvider>
    );
}
