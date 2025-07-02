import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { X } from "lucide-react";

interface FormSectionProps {
    title: ReactNode;
    description?: string;
    onReset?: () => void;
    children: ReactNode;
    required?: boolean;
}

export function FormSection({ title, description, onReset, children, required }: FormSectionProps) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <CardTitle className="font-headline text-lg">
                            {title}
                            {required && <span className="text-destructive ml-1">*</span>}
                        </CardTitle>
                        {description && <CardDescription className="mt-1">{description}</CardDescription>}
                    </div>
                    {onReset && (
                        <Button variant="ghost" size="icon" onClick={onReset} type="button" aria-label="Reset field" className="text-muted-foreground hover:text-foreground -mt-1 -mr-2 shrink-0">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}
