"use client";

import { useFormContext, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { X, Plus, Trash2 } from "lucide-react"
import { FormSection } from './form-section';

const aiRoleOptions = [
    'Copywriter', 'SEO expert', 'Skribent för bloggar', 'Korrekturläsare', 'Programmerare för HTML, CSS och Javascript', 'Researcher'
] as const;

const taskTypeRadioOptions = ['Artikel', 'Seo onpage text', 'Korrekturläsning'] as const;

const tonalityOptions = [
    { id: 'professional', label: 'Professionell/Formell' },
    { id: 'friendly', label: 'Vänlig/Tillgänglig' },
    { id: 'informative', label: 'Informativ/Faktapresenterande' },
    { id: 'persuasive', label: 'Övertygande/Säljande' },
] as const;

const writingForRadioOptions = ['Kund', 'Vår blogg'] as const;

const avoidWordsOptions = [
    { id: 'Upptäck', label: 'Upptäck' },
    { id: 'Utforska', label: 'Utforska' },
    { id: 'Oumbärligt', label: 'Oumbärligt' },
    { id: 'Särskiljt', label: 'Särskiljt' },
    { id: 'idealiskt', label: 'idealiskt (och dess böjningsformer)' },
];

export const formSchema = z.object({
  aiRole: z.enum(aiRoleOptions),
  taskTypeRadio: z.enum([...taskTypeRadioOptions, 'custom']),
  taskTypeCustom: z.string().optional(),
  tonality: z.array(z.string()).optional(),
  textLength: z.string().optional(),
  numberOfLists: z.string().optional(),
  excludeLists: z.boolean().default(false),
  language: z.enum(['Engelska', 'Svenska']),
  writingForRadio: z.enum([...writingForRadioOptions, 'custom']),
  writingForCustom: z.string().optional(),
  rules: z.object({
    avoidSuperlatives: z.boolean().default(true),
    avoidPraise: z.boolean().default(true),
    avoidAcclaim: z.boolean().default(true),
    isInformative: z.boolean().default(true),
    useWeForm: z.boolean().default(true),
    addressReaderAsYou: z.boolean().default(true),
    avoidWords: z.object({
        enabled: z.boolean().default(true),
        words: z.array(z.string()).default(['Upptäck', 'Utforska', 'Oumbärligt', 'Särskiljt', 'idealiskt']),
    }),
    avoidXYPhrase: z.boolean().default(true),
    customRules: z.string().optional(),
  }),
  links: z.array(z.object({ url: z.string().url("Invalid URL format"), anchorText: z.string().min(1, "Anchor text is required") })).optional(),
  primaryKeyword: z.string().optional(),
  author: z.string().optional(),
  topicInformation: z.string().min(1, 'This field is required.'),
});

export type FormValues = z.infer<typeof formSchema>;

export const defaultValues: Partial<FormValues> = {
  aiRole: 'Copywriter',
  taskTypeRadio: 'Artikel',
  taskTypeCustom: '',
  tonality: [],
  textLength: '',
  numberOfLists: '',
  excludeLists: false,
  language: 'Svenska',
  writingForRadio: 'Kund',
  writingForCustom: '',
  rules: {
    avoidSuperlatives: true,
    avoidPraise: true,
    avoidAcclaim: true,
    isInformative: true,
    useWeForm: true,
    addressReaderAsYou: true,
    avoidWords: {
        enabled: true,
        words: ['Upptäck', 'Utforska', 'Oumbärligt', 'Särskiljt', 'idealiskt'],
    },
    avoidXYPhrase: true,
    customRules: '',
  },
  links: [],
  primaryKeyword: '',
  author: '',
  topicInformation: '',
};

function TaskTypeSection() {
    const { control } = useFormContext<FormValues>();
    const taskTypeRadio = useWatch({ control, name: 'taskTypeRadio' });
    
    return (
        <FormSection title="Vad skall AIn aggera som?" required>
            <FormField
                control={control}
                name="aiRole"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {aiRoleOptions.map((role) => (
                                    <FormItem key={role} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value={role} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{role}</FormLabel>
                                    </FormItem>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </FormSection>
    )
}

function AIActionSection() {
    const { control } = useFormContext<FormValues>();
    const taskTypeRadio = useWatch({ control, name: "taskTypeRadio" });
    
    return (
         <FormSection title="Va för uppgift skall utföras?" required>
            <FormField
                control={control}
                name="taskTypeRadio"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormControl>
                             <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-2"
                            >
                                {[...taskTypeRadioOptions, 'custom'].map((task) => (
                                    <FormItem key={task} className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value={task} />
                                        </FormControl>
                                        <FormLabel className="font-normal">{task === 'custom' ? 'Annan uppgift...' : task}</FormLabel>
                                    </FormItem>
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {taskTypeRadio === 'custom' && (
                <FormField
                    control={control}
                    name="taskTypeCustom"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                            <FormControl>
                                <Textarea placeholder="Beskriv uppgiften..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </FormSection>
    )
}

export function PromptForm() {
    const { control, setValue, getValues } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "links",
    });
    
    const writingForRadio = useWatch({ control, name: "writingForRadio" });
    const avoidWordsEnabled = useWatch({ control, name: "rules.avoidWords.enabled" });

    return (
        <div className="space-y-6">
            <TaskTypeSection />
            <AIActionSection />

            <FormSection title="Vilken tonalitet ska texten ha?" onReset={() => setValue('tonality', [])}>
                <FormField
                    control={control}
                    name="tonality"
                    render={() => (
                        <FormItem className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tonalityOptions.map((item) => (
                                <FormField
                                    key={item.id}
                                    control={control}
                                    name="tonality"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.label)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item.label])
                                                            : field.onChange(field.value?.filter((value) => value !== item.label));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </FormItem>
                    )}
                />
            </FormSection>

            <FormSection title="Längd på texten" onReset={() => setValue('textLength', '')}>
                <FormField
                    control={control}
                    name="textLength"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maximalt antal ord</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="t.ex. 500" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </FormSection>
            
            <FormSection title="Antal listor" onReset={() => { setValue('numberOfLists', ''); setValue('excludeLists', false); }}>
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="numberOfLists"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximalt antal listor</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="t.ex. 2" {...field} disabled={getValues('excludeLists')} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="excludeLists"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Exkludera listor helt</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </FormSection>

            <FormSection title="Språk">
                <FormField
                    control={control}
                    name="language"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel className={field.value === 'Svenska' ? 'text-foreground' : 'text-muted-foreground'}>Svenska</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value === 'Engelska'}
                                    onCheckedChange={(checked) => field.onChange(checked ? 'Engelska' : 'Svenska')}
                                />
                            </FormControl>
                            <FormLabel className={field.value === 'Engelska' ? 'text-foreground' : 'text-muted-foreground'}>Engelska</FormLabel>
                        </FormItem>
                    )}
                />
            </FormSection>

            <FormSection title="Vilka skriver vi för?" onReset={() => { setValue('writingForRadio', 'custom'); setValue('writingForCustom', ''); }}>
                <FormField
                    control={control}
                    name="writingForRadio"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                 <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                    {[...writingForRadioOptions, 'custom'].map((item) => (
                                        <FormItem key={item} className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value={item} /></FormControl>
                                            <FormLabel className="font-normal">{item === 'custom' ? 'Annan...' : item}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )}
                />
                {writingForRadio === 'custom' && (
                    <FormField
                        control={control}
                        name="writingForCustom"
                        render={({ field }) => (
                            <FormItem className="mt-4"><FormControl><Textarea placeholder="Beskriv målgruppen..." {...field} /></FormControl></FormItem>
                        )}
                    />
                )}
            </FormSection>

            <FormSection title="Regler på texten" onReset={() => setValue('rules', defaultValues.rules!)}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={control} name="rules.avoidSuperlatives" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik superlativ</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidPraise" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik lovord</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidAcclaim" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik beröm</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.isInformative" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Informativ text</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.useWeForm" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Skriv i vi-form</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.addressReaderAsYou" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Benämn läsaren som "ni"</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidXYPhrase" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik "i en X är Y värdefullt..."</FormLabel></FormItem>)} />
                    </div>
                    <div>
                        <FormField control={control} name="rules.avoidWords.enabled" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Undvik specifika ord</FormLabel></FormItem>)} />
                        {avoidWordsEnabled && (
                            <div className="pl-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <Controller
                                    name="rules.avoidWords.words"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                        {avoidWordsOptions.map(word => (
                                            <FormItem key={word.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(word.id)}
                                                    onCheckedChange={checked => {
                                                        const newValue = checked
                                                            ? [...(field.value || []), word.id]
                                                            : (field.value || []).filter(v => v !== word.id);
                                                        field.onChange(newValue);
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">{word.label}</FormLabel>
                                            </FormItem>
                                        ))}
                                        </>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                    <FormField control={control} name="rules.customRules" render={({ field }) => (<FormItem><FormLabel>Fler regler</FormLabel><FormControl><Textarea placeholder="Lägg till egna regler, en per rad..." {...field} /></FormControl></FormItem>)} />
                </div>
            </FormSection>

            <FormSection title="Länkar att inkludera" onReset={() => setValue('links', [])}>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                            <FormField control={control} name={`links.${index}.url`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>URL</FormLabel><FormControl><Input {...field} placeholder="https://example.com" /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={control} name={`links.${index}.anchorText`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Sökord</FormLabel><FormControl><Input {...field} placeholder="Sökord att länka" /></FormControl><FormMessage /></FormItem>)} />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ url: '', anchorText: '' })}><Plus className="mr-2 h-4 w-4" /> Lägg till länk</Button>
                </div>
            </FormSection>
            
            <FormSection title="Primärt sökord/sökfras" onReset={() => setValue('primaryKeyword', '')}>
                <FormField control={control} name="primaryKeyword" render={({ field }) => (<FormItem><FormControl><Input placeholder="t.ex. bästa SEO-tipsen" {...field} /></FormControl></FormItem>)} />
            </FormSection>

            <FormSection title="Vem skriver texten?" onReset={() => setValue('author', '')}>
                <FormField control={control} name="author" render={({ field }) => (<FormItem><FormControl><Input placeholder="Ditt namn eller företagsnamn" {...field} /></FormControl></FormItem>)} />
            </FormSection>

            <FormSection title="Information kring ämnet" required>
                <FormField control={control} name="topicInformation" render={({ field }) => (<FormItem><FormControl><Textarea placeholder="All information som AI:n behöver för att kunna skriva texten..." {...field} rows={6} /></FormControl><FormMessage /></FormItem>)} />
            </FormSection>

        </div>
    );
}
