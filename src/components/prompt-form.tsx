
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
import { X, Plus, Trash2 } from "lucide-react"
import { FormSection } from './form-section';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const aiRoleOptions = [
    'SEO expert', 'Skribent för bloggar'
] as const;

const taskTypeRadioOptions = ['SEO on-page text', 'Artikel'] as const;

const tonalityOptions = [
    { id: 'professional', label: 'Professionell/Formell' },
    { id: 'friendly', label: 'Vänlig/Tillgänglig' },
    { id: 'informative', label: 'Informativ/Faktapresenterande' },
    { id: 'persuasive', label: 'Övertygande/Säljande' },
] as const;

const avoidWordsOptions = [
    { id: 'upptäck', label: '"Upptäck"' },
    { id: 'utforska', label: '"Utforska"' },
    { id: 'oumbärligt', label: '"Oumbärligt"' },
    { id: 'särskiljt', label: '"Särskiljt"' },
    { id: 'idealiskt', label: '"idealiskt"' },
    { id: 'central-del-av', label: '"central del av"' },
];

const paragraphTypes = ['Ingress', 'Brödtext & underrubrik', 'Fristående text', 'CTA', 'Titel'];

export const formSchema = z.object({
  topicGuideline: z.string().min(1, 'Detta fält är obligatoriskt.'),
  aiRole: z.enum([...aiRoleOptions, 'custom']),
  aiRoleCustom: z.string().optional(),
  taskTypeRadio: z.enum([...taskTypeRadioOptions, 'custom']).optional(),
  taskTypeCustom: z.string().optional(),
  
  tonality: z.array(z.string()).optional(),
  tonalityCustom: z.string().optional(),
  tonality_disabled: z.boolean().default(false),
  
  textLength: z.string().optional(),
  textLength_disabled: z.boolean().default(false),
  
  numberOfLists: z.string().optional(),
  excludeLists: z.boolean().default(false),
  lists_disabled: z.boolean().default(false),
  
  language: z.enum(['Engelska', 'Svenska']),

  websiteUrl: z.string().optional(),
  websiteUrl_disabled: z.boolean().default(false),
  
  rules: z.object({
    avoidSuperlatives: z.boolean().default(true),
    avoidPraise: z.boolean().default(true),
    avoidAcclaim: z.boolean().default(true),
    isInformative: z.boolean().default(true),
    isTechnical: z.boolean().default(true),
    useWeForm: z.boolean().default(true),
    addressReaderAsYou: z.boolean().default(true),
    avoidWords: z.object({
        enabled: z.boolean().default(true),
        words: z.array(z.string()).optional(),
    }),
    avoidPhrases: z.object({
        enabled: z.boolean().default(true),
        avoidXYPhrase: z.boolean().default(true),
        avoidVilket: z.boolean().default(true),
        avoidKeywordAsSubject: z.boolean().default(true),
    }),
    avoidEmDash: z.boolean().default(true),
    customRules: z.string().optional(),
  }).optional(),
  rules_disabled: z.boolean().default(false),
  
  links: z.array(z.object({ url: z.string().url("Invalid URL format"), anchorText: z.string().min(1, "Anchor text is required") })).optional(),
  links_disabled: z.boolean().default(false),

  primaryKeywords: z.array(z.object({ value: z.string() })).max(3).optional(),
  primaryKeywords_disabled: z.boolean().default(false),
  
  author: z.string().optional(),
  author_disabled: z.boolean().default(false),

  structure: z.array(z.object({
    type: z.string().min(1, "Styckestyp är obligatoriskt"),
    topic: z.string().optional(),
  })).optional(),
  structure_disabled: z.boolean().default(false),

}).superRefine((data, ctx) => {
    if (data.taskTypeRadio === 'custom' && (!data.taskTypeCustom || data.taskTypeCustom.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Beskrivning av texttyp är obligatoriskt när 'Annan...' är valt.",
        path: ['taskTypeCustom'],
      });
    }
    if (data.aiRole === 'custom' && (!data.aiRoleCustom || data.aiRoleCustom.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Beskrivning av AI-roll är obligatoriskt när 'Annan...' är valt.",
        path: ['aiRoleCustom'],
      });
    }
});


export type FormValues = z.infer<typeof formSchema>;

export const defaultValues: Partial<FormValues> = {
  topicGuideline: '',
  aiRole: 'SEO expert',
  aiRoleCustom: '',
  taskTypeRadio: 'SEO on-page text',
  taskTypeCustom: '',
  tonality: [],
  tonalityCustom: '',
  tonality_disabled: false,
  textLength: '',
  textLength_disabled: false,
  numberOfLists: '',
  excludeLists: false,
  lists_disabled: false,
  language: 'Svenska',
  websiteUrl: '',
  websiteUrl_disabled: false,
  rules: {
    avoidSuperlatives: true,
    avoidPraise: true,
    avoidAcclaim: true,
    isInformative: true,
    isTechnical: true,
    useWeForm: true,
    addressReaderAsYou: true,
    avoidWords: {
        enabled: true,
        words: ['upptäck', 'utforska', 'oumbärligt', 'särskiljt', 'idealiskt', 'central-del-av'],
    },
    avoidPhrases: {
        enabled: true,
        avoidXYPhrase: true,
        avoidVilket: true,
        avoidKeywordAsSubject: true,
    },
    avoidEmDash: true,
    customRules: '',
  },
  rules_disabled: false,
  links: [],
  links_disabled: false,
  primaryKeywords: [{ value: '' }],
  primaryKeywords_disabled: false,
  author: '',
  author_disabled: false,
  structure: [],
  structure_disabled: false,
};

export function PromptForm() {
    const { control, setValue, getValues } = useFormContext<FormValues>();

    const linkFields = useFieldArray({ control, name: "links" });
    const keywordFields = useFieldArray({ control, name: "primaryKeywords" });
    const structureFields = useFieldArray({ control, name: "structure" });
    
    const values = useWatch({ control });

    const toggleDisabled = (fieldName: keyof FormValues | `${string}_disabled`) => {
        const currentVal = getValues(fieldName as any);
        setValue(fieldName as any, !currentVal, { shouldValidate: true, shouldDirty: true });
    }
    
    const avoidWordsEnabled = useWatch({ control, name: "rules.avoidWords.enabled" });
    const avoidPhrasesEnabled = useWatch({ control, name: "rules.avoidPhrases.enabled" });
    const taskType = useWatch({ control, name: "taskTypeRadio" });
    const aiRole = useWatch({ control, name: "aiRole" });


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSection title="Vad skall AIn agera som?" required>
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
                   {aiRole === 'custom' && (
                      <FormField
                          control={control}
                          name="aiRoleCustom"
                          render={({ field }) => (
                              <FormItem className="mt-4">
                                  <FormControl>
                                      <Textarea placeholder="Beskriv AI:ns roll..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                  )}
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

            <FormSection title="Lägg in information" required>
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
                 <div className="space-y-6">
                    <FormSection title="Vilken tonalitet ska texten ha?" onToggle={() => toggleDisabled('tonality_disabled')} isDisabled={values.tonality_disabled}>
                        <div className="space-y-4">
                            <FormField
                                control={control}
                                name="tonality"
                                render={() => (
                                    <FormItem className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                        <FormLabel className="font-normal">
                                                            {item.label.split('/').map((part, index) => (
                                                                <React.Fragment key={index}>
                                                                    {part}
                                                                    {index === 0 && item.label.includes('/') && <br />}
                                                                </React.Fragment>
                                                            ))}
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="tonalityCustom"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Annan tonalitet..." {...field} />
                                        </FormControl>
                                        <FormMessage />
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
                                <FormItem>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex items-center space-x-4 rounded-lg border p-3 shadow-sm"
                                        >
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="Svenska" id="svenska" />
                                                </FormControl>
                                                <FormLabel htmlFor="svenska" className="font-normal">Svenska</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="Engelska" id="engelska" />
                                                </FormControl>
                                                <FormLabel htmlFor="engelska" className="font-normal">Engelska</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </FormSection>
                </div>
                <div className="space-y-6">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormSection title="Vem skriver texten?" onToggle={() => toggleDisabled('author_disabled')} isDisabled={values.author_disabled}>
                    <FormField control={control} name="author" render={({ field }) => (<FormItem><FormControl><Input placeholder="Ditt namn eller företagsnamn" {...field} /></FormControl></FormItem>)} />
                </FormSection>
                <FormSection title="Plats?" description="Vilken webbplats skall texten befinna sig på?" onToggle={() => toggleDisabled('websiteUrl_disabled')} isDisabled={values.websiteUrl_disabled}>
                    <FormField
                        control={control}
                        name="websiteUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="https://exempel.se/sida" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </FormSection>
            </div>

            <FormSection
                title="Regler på texten"
                description="Alla ibockade regler gäller, bocka av om du inte vill använda regel."
                onToggle={() => toggleDisabled('rules_disabled')}
                isDisabled={values.rules_disabled}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-4">
                        <h4 className="font-medium text-foreground">Undvik...</h4>
                        <FormField control={control} name="rules.avoidSuperlatives" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Superlativ</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidPraise" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Lovord</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidAcclaim" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Beröm</FormLabel></FormItem>)} />
                        <FormField control={control} name="rules.avoidEmDash" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Em-tecken (—)</FormLabel></FormItem>)} />
                        
                        <div>
                            <FormField control={control} name="rules.avoidWords.enabled" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Specifika ord</FormLabel></FormItem>)} />
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

                         <div>
                            <FormField control={control} name="rules.avoidPhrases.enabled" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Fraser</FormLabel></FormItem>)} />
                             {avoidPhrasesEnabled && (
                                <div className="pl-6 pt-2 space-y-2">
                                    <FormField control={control} name="rules.avoidPhrases.avoidXYPhrase" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-sm">Frasen "i en X är Y värdefullt..."</FormLabel></FormItem>)} />
                                    <FormField control={control} name="rules.avoidPhrases.avoidVilket" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-sm">", vilket..."</FormLabel></FormItem>)} />
                                    <FormField control={control} name="rules.avoidPhrases.avoidKeywordAsSubject" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal text-sm">Frasen "[sökordet] är avgörande/viktig/betydlig för..."</FormLabel></FormItem>)} />
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="space-y-4">
                         <h4 className="font-medium text-foreground">Övrigt (Texten skall vara...)</h4>
                         <FormField control={control} name="rules.isInformative" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Informativ text</FormLabel></FormItem>)} />
                         <FormField control={control} name="rules.isTechnical" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Tekniskt skriven text</FormLabel></FormItem>)} />
                         <FormField control={control} name="rules.useWeForm" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Skriv i vi-form</FormLabel></FormItem>)} />
                         <FormField control={control} name="rules.addressReaderAsYou" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel className="font-normal">Benämn läsaren som "ni"</FormLabel></FormItem>)} />
                         <FormField control={control} name="rules.customRules" render={({ field }) => (<FormItem><FormLabel>Fler regler</FormLabel><FormControl><Textarea placeholder="Lägg till egna regler, en per rad..." {...field} /></FormControl></FormItem>)} />
                    </div>
                </div>
            </FormSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormSection title="Struktur" description="Ange struktur på texten." onToggle={() => toggleDisabled('structure_disabled')} isDisabled={values.structure_disabled}>
                    <div className="space-y-4">
                        {structureFields.fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md bg-background/50">
                                 <FormField
                                    control={control}
                                    name={`structure.${index}.type`}
                                    render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Styckestyp</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Välj en typ" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {paragraphTypes.map(type => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`structure.${index}.topic`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Ämne (frivilligt)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Beskriv ämnet..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="icon" onClick={() => structureFields.remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => structureFields.append({ type: '', topic: '' })}>
                            <Plus className="mr-2 h-4 w-4" /> Lägg till stycke
                        </Button>
                    </div>
                </FormSection>

                <FormSection title="Länkar att inkludera" onToggle={() => toggleDisabled('links_disabled')} isDisabled={values.links_disabled}>
                    <div className="space-y-4">
                        {linkFields.fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                                <FormField control={control} name={`links.${index}.url`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>URL</FormLabel><FormControl><Input {...field} placeholder="https://example.com" /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={control} name={`links.${index}.anchorText`} render={({ field }) => (<FormItem className="flex-1"><FormLabel>Sökord</FormLabel><FormControl><Input {...field} placeholder="Sökord att länka" /></FormControl><FormMessage /></FormItem>)} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => linkFields.remove(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => linkFields.append({ url: '', anchorText: '' })}><Plus className="mr-2 h-4 w-4" /> Lägg till länk</Button>
                    </div>
                </FormSection>
            </div>
            
            <FormSection title="Primärt sökord/sökfras" onToggle={() => toggleDisabled('primaryKeywords_disabled')} isDisabled={values.primaryKeywords_disabled}>
                 <div className="space-y-4">
                    {keywordFields.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <FormField
                                control={control}
                                name={`primaryKeywords.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder={`Sökord ${index + 1}`} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {keywordFields.fields.length > 1 && (
                                <Button type="button" variant="destructive" size="icon" onClick={() => keywordFields.remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    {keywordFields.fields.length < 3 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => keywordFields.append({ value: '' })}>
                            <Plus className="mr-2 h-4 w-4" /> Lägg till sökord
                        </Button>
                    )}
                </div>
            </FormSection>
        </div>
    );
}

    
    

    