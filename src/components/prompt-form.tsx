
"use client";

import React from 'react';
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
import { X, Plus, Trash2, Info } from "lucide-react"
import { FormSection } from './form-section';
import { cn } from '@/lib/utils';

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

export const copywritingStyles = [
    {
        id: 'AIDA',
        label: 'AIDA-modellen'
    },
    {
        id: 'Fyra P',
        label: 'Fyra P-modellen'
    },
    {
        id: 'Före-Efter-Bro',
        label: 'Före-efter-bro-modellen'
    },
    {
        id: 'PAS',
        label: 'PAS-modellen'
    },
    {
        id: 'Star-Story-Solution',
        label: 'Star Story Solution-modellen'
    },
];


export const formSchema = z.object({
  topicGuideline: z.string().min(1, 'Detta fält är obligatoriskt.'),
  aiRole: z.enum([
    'Copywriter', 'SEO expert', 'Skribent för bloggar', 'Korrekturläsare', 'Programmerare för HTML, CSS och Javascript', 'Researcher'
  ]),
  taskTypeRadio: z.enum(['Artikel', 'Seo onpage text', 'Korrekturläsning', 'custom']),
  taskTypeCustom: z.string().optional(),
  
  copywritingStyle: z.string().optional(),
  copywritingStyle_disabled: z.boolean().default(false),
  
  tonality: z.array(z.string()).optional(),
  tonality_disabled: z.boolean().default(false),
  
  textLength: z.string().optional(),
  textLength_disabled: z.boolean().default(false),
  
  numberOfLists: z.string().optional(),
  excludeLists: z.boolean().default(false),
  lists_disabled: z.boolean().default(false),
  
  language: z.enum(['Engelska', 'Svenska']),
  
  writingForRadio: z.enum(['Kund', 'Vår blogg', 'custom']),
  writingForCustom: z.string().optional(),
  writingFor_disabled: z.boolean().default(false),

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
  rules_disabled: z.boolean().default(false),
  
  links: z.array(z.object({ url: z.string().url("Invalid URL format"), anchorText: z.string().min(1, "Anchor text is required") })).optional(),
  links_disabled: z.boolean().default(false),

  primaryKeyword: z.string().optional(),
  primaryKeyword_disabled: z.boolean().default(false),
  
  author: z.string().optional(),
  author_disabled: z.boolean().default(false),

}).superRefine((data, ctx) => {
    if (data.taskTypeRadio === 'custom' && (!data.taskTypeCustom || data.taskTypeCustom.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Beskrivning av texttyp är obligatoriskt när 'Annan...' är valt.",
        path: ['taskTypeCustom'],
      });
    }
    if (data.writingForRadio === 'custom' && (!data.writingForCustom || data.writingForCustom.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Detta fält är obligatoriskt när 'Annan...' är valt.",
        path: ['writingForCustom'],
      });
    }
  });

export type FormValues = z.infer<typeof formSchema>;

export const defaultValues: Partial<FormValues> = {
  topicGuideline: '',
  aiRole: 'Copywriter',
  taskTypeRadio: 'Artikel',
  taskTypeCustom: '',
  copywritingStyle: 'none',
  copywritingStyle_disabled: false,
  tonality: [],
  tonality_disabled: false,
  textLength: '',
  textLength_disabled: false,
  numberOfLists: '',
  excludeLists: false,
  lists_disabled: false,
  language: 'Svenska',
  writingForRadio: 'Kund',
  writingForCustom: '',
  writingFor_disabled: false,
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
  rules_disabled: false,
  links: [],
  links_disabled: false,
  primaryKeyword: '',
  primaryKeyword_disabled: false,
  author: '',
  author_disabled: false,
};

export function PromptForm() {
    const { control, setValue, getValues } = useFormContext<FormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "links",
    });
    
    const values = useWatch({ control });

    const toggleDisabled = (fieldName: keyof FormValues) => {
        const currentVal = getValues(fieldName);
        setValue(fieldName, !currentVal, { shouldValidate: true, shouldDirty: true });
    }
    
    const writingForRadio = useWatch({ control, name: "writingForRadio" });
    const avoidWordsEnabled = useWatch({ control, name: "rules.avoidWords.enabled" });
    const taskType = useWatch({ control, name: "taskTypeRadio" });

    return (
        <div className="space-y-6">
            <FormSection title="Förklara vad texten skall handla om" required>
                <FormField
                    control={control}
                    name="topicGuideline"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea placeholder="All information som AI:n behöver för att kunna skriva texten..." {...field} rows={6} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </FormSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                      className="grid grid-cols-1 gap-4"
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
                <FormSection title="Vilken typ av text som skall produceras" required>
                  <Controller
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
                                      {taskTypeRadioOptions.map((task) => (
                                          <FormItem key={task} className="flex items-center space-x-3 space-y-0">
                                              <FormControl>
                                                  <RadioGroupItem value={task} />
                                              </FormControl>
                                              <FormLabel className="font-normal">{task}</FormLabel>
                                          </FormItem>
                                      ))}
                                      <FormItem className="flex items-center space-x-3 space-y-0">
                                          <FormControl>
                                              <RadioGroupItem value="custom" />
                                          </FormControl>
                                          <FormLabel className="font-normal">Annan...</FormLabel>
                                      </FormItem>
                                  </RadioGroup>
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  {taskType === 'custom' && (
                      <FormField
                          control={control}
                          name="taskTypeCustom"
                          render={({ field }) => (
                              <FormItem className="mt-4">
                                  <FormControl>
                                      <Textarea placeholder="Beskriv typen av text..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  )}
                </FormSection>
            </div>

            <FormSection title="Copywriting-stil?" description="Om någon, vilken copywriting-stil skall texten ha" onToggle={() => toggleDisabled('copywritingStyle_disabled')} isDisabled={values.copywritingStyle_disabled}>
                <FormField
                    control={control}
                    name="copywritingStyle"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="none" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Ingen specifik stil</FormLabel>
                                    </FormItem>
                                    {copywritingStyles.map((style) => (
                                        <FormItem key={style.id} className="flex items-center space-x-3 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value={style.id} />
                                            </FormControl>
                                            <FormLabel className="font-normal">{style.label}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </FormSection>


            <FormSection title="Vilken tonalitet ska texten ha?" onToggle={() => toggleDisabled('tonality_disabled')} isDisabled={values.tonality_disabled}>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSection title="Längd på texten" onToggle={() => toggleDisabled('textLength_disabled')} isDisabled={values.textLength_disabled}>
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
                
                <FormSection title="Antal listor" onToggle={() => toggleDisabled('lists_disabled')} isDisabled={values.lists_disabled}>
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
            </div>

            <FormSection title="Språk">
                <FormField
                    control={control}
                    name="language"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel className={cn(field.value === 'Svenska' ? 'text-foreground' : 'text-muted-foreground', 'transition-colors')}>Svenska</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value === 'Engelska'}
                                    onCheckedChange={(checked) => field.onChange(checked ? 'Engelska' : 'Svenska')}
                                />
                            </FormControl>
                            <FormLabel className={cn(field.value === 'Engelska' ? 'text-foreground' : 'text-muted-foreground', 'transition-colors')}>Engelska</FormLabel>
                        </FormItem>
                    )}
                />
            </FormSection>

            <FormSection title="Vilka skriver vi för?" onToggle={() => toggleDisabled('writingFor_disabled')} isDisabled={values.writingFor_disabled}>
                <FormField
                    control={control}
                    name="writingForRadio"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                 <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                                    {writingForRadioOptions.map((item) => (
                                        <FormItem key={item} className="flex items-center space-x-3 space-y-0">
                                            <FormControl><RadioGroupItem value={item} /></FormControl>
                                            <FormLabel className="font-normal">{item}</FormLabel>
                                        </FormItem>
                                    ))}
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="custom" /></FormControl>
                                        <FormLabel className="font-normal">Annan...</FormLabel>
                                    </FormItem>
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
                            <FormItem className="mt-4"><FormControl><Textarea placeholder="Beskriv målgruppen..." {...field} /></FormControl><FormMessage/></FormItem>
                        )}
                    />
                )}
            </FormSection>

            <FormSection title="Regler på texten" onToggle={() => toggleDisabled('rules_disabled')} isDisabled={values.rules_disabled}>
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

            <FormSection title="Länkar att inkludera" onToggle={() => toggleDisabled('links_disabled')} isDisabled={values.links_disabled}>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSection title="Primärt sökord/sökfras" onToggle={() => toggleDisabled('primaryKeyword_disabled')} isDisabled={values.primaryKeyword_disabled}>
                    <FormField control={control} name="primaryKeyword" render={({ field }) => (<FormItem><FormControl><Input placeholder="t.ex. bästa SEO-tipsen" {...field} /></FormControl></FormItem>)} />
                </FormSection>

                <FormSection title="Vem skriver texten?" onToggle={() => toggleDisabled('author_disabled')} isDisabled={values.author_disabled}>
                    <FormField control={control} name="author" render={({ field }) => (<FormItem><FormControl><Input placeholder="Ditt namn eller företagsnamn" {...field} /></FormControl></FormItem>)} />
                </FormSection>
            </div>
        </div>
    );
}
