"use client";

import React from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { FormSection } from './form-section';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { webLanguages, otherLanguages, schemaTypes } from '@/lib/code-data';
import { CodeFormValues } from '@/lib/code-generator';

export function CodeForm() {
  const { control, setValue } = useFormContext<CodeFormValues>();
  
  const { fields: colorFields, append: appendColor, remove: removeColor } = useFieldArray({
    control,
    name: "colors"
  });

  const selectedLangs = useWatch({ control, name: "languages" }) || [];
  const implementationPlace = useWatch({ control, name: "implementationPlace" });
  
  const isWebSelected = selectedLangs.some(l => webLanguages.includes(l as any));
  const isOtherSelected = selectedLangs.some(l => otherLanguages.includes(l as any));

  const toggleLanguage = (lang: string, disabled: boolean) => {
    if (disabled) return;
    const current = selectedLangs;
    const next = current.includes(lang) 
      ? current.filter(l => l !== lang)
      : [...current, lang];
    setValue("languages", next);
  };

  return (
    <div className="space-y-6">
      <FormSection title="1. Vad skall vi skapa?" required description="Beskriv den kod eller funktion du vill skapa med prompten.">
        <FormField
          control={control}
          name="whatToCreate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Beskriv funktionen här..." {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-6 space-y-4">
          <FormLabel className="text-base font-bold">Vart skall koden implementeras?</FormLabel>
          <FormField
            control={control}
            name="implementationPlace"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/5 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="Elementor" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Elementor HTML widget</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/5 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="Wordpress" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Wordpress övrig HTML widget</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/5 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="CMS" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Övrig CMS HTML</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/5 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="IDE" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">IDE</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/5 transition-colors">
                      <FormControl>
                        <RadioGroupItem value="Other" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Övrigt</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {implementationPlace === 'Other' && (
            <FormField
              control={control}
              name="implementationOther"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Beskriv implementeringsplats..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </FormSection>

      <FormSection title="2. Vilket programmeringsspråk?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 border rounded-lg bg-background/50">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Webbkod</h4>
            <div className="space-y-2">
              {webLanguages.map(lang => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox 
                    id={lang} 
                    checked={selectedLangs.includes(lang)}
                    onCheckedChange={() => toggleLanguage(lang, isOtherSelected)}
                    disabled={isOtherSelected}
                  />
                  <label htmlFor={lang} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isOtherSelected ? 'opacity-50' : ''}`}>
                    {lang}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 p-4 border rounded-lg bg-background/50">
            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Fristående</h4>
            <div className="space-y-2">
              {otherLanguages.map(lang => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox 
                    id={lang} 
                    checked={selectedLangs.includes(lang)}
                    onCheckedChange={() => toggleLanguage(lang, isWebSelected)}
                    disabled={isWebSelected}
                  />
                  <label htmlFor={lang} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isWebSelected ? 'opacity-50' : ''}`}>
                    {lang}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="3. Grafisk" description="Välj era specifika färger och fonter">
        <div className="space-y-6">
          <div className="space-y-4">
            <FormLabel>Färger</FormLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {colorFields.map((field, index) => (
                <div key={field.id} className="relative group">
                  <FormField
                    control={control}
                    name={`colors.${index}.value`}
                    render={({ field }) => (
                      <FormControl>
                        <div className="flex flex-col items-center gap-2">
                          <input 
                            type="color" 
                            {...field} 
                            className="h-12 w-12 cursor-pointer rounded-md border-2 border-border"
                          />
                          <span className="text-[10px] font-mono uppercase">{field.value}</span>
                        </div>
                      </FormControl>
                    )}
                  />
                  {colorFields.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeColor(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 w-12 border-dashed"
                onClick={() => appendColor({ value: "#000000" })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <FormField
            control={control}
            name="font"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typsnitt (Font)</FormLabel>
                <FormControl>
                  <Input placeholder="t.ex. 'Inter', sans-serif" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="4. Markup schema / Rich snippet">
        <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3" />
          <span>Referens: </span>
          <a href="https://schema.org/docs/schemas.html" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            schema.org/docs/schemas.html
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {schemaTypes.map(type => (
            <FormField
              key={type.id}
              control={control}
              name="schemas"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md hover:bg-accent/5 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(type.id)}
                      onCheckedChange={(checked) => {
                        const current = field.value || [];
                        const next = checked ? [...current, type.id] : current.filter(v => v !== type.id);
                        field.onChange(next);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-bold cursor-pointer">{type.label}</FormLabel>
                    <p className="text-[10px] text-muted-foreground">{type.description}</p>
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>
      </FormSection>
    </div>
  );
}
