"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HomepageModeToggle() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Režim homepage</CardTitle>
        <CardDescription>Přepínání mezi normálním a maintenance režimem</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline">Normální režim</Button>
      </CardContent>
    </Card>
  );
}
