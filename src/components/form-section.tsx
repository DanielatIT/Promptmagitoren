import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
    title: ReactNode;
    description?: string;
    onToggle?: () => void;
    children: ReactNode;
    required?: boolean;
    isDisabled?: boolean;
}

export function FormSection({ title, description, onToggle, children, required, isDisabled }: FormSectionProps) {
    return (
        <Card className={cn("bg-card/80 backdrop-blur-sm transition-opacity", isDisabled && "opacity-50")}>
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className={cn(isDisabled && "line-through")}>
                        <CardTitle className="font-headline text-lg">
                            {title}
                            {required && <span className="text-destructive ml-1">*</span>}
                        </CardTitle>
                        {description && <CardDescription className="mt-1">{description}</CardDescription>}
                    </div>
                    {onToggle && (
                        <Button variant="ghost" size="icon" onClick={onToggle} type="button" aria-label="Toggle field" className="text-muted-foreground hover:text-foreground -mt-1 -mr-2 shrink-0">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <fieldset disabled={isDisabled} className="space-y-4">
                 {children}
                </fieldset>
            </CardContent>
        </Card>
    );
}
