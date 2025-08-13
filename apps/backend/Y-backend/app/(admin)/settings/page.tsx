"use client";

import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

type SettingsMap = Record<string, any>;


export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/api/admin/settings");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        if (!payload?.success) throw new Error(payload?.error || "Chyba načítání nastavení");
        setSettings(payload.data || {});
      } catch (e: any) {
        toast.error(e?.message || "Chyba načítání nastavení");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateField = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async (updates: SettingsMap, category?: string) => {
    try {
      const res = await apiClient.put("/api/admin/settings", { updates, category });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      const payload = await res.json();
      if (!payload?.success) {
        throw new Error(payload?.error || "Chyba při ukládání nastavení");
      }
      setSettings((prev) => ({ ...prev, ...(payload.data || {}) }));
      toast.success("Nastavení uloženo");
    } catch (e: any) {
      toast.error(e?.message || "Chyba při ukládání nastavení");
    }
  };

  const handleSaveGeneral = async () => {
    await saveSettings(
      {
        shop_name: settings.shop_name ?? "",
        shop_email: settings.shop_email ?? "",
        shop_description: settings.shop_description ?? "",
        shop_phone: settings.shop_phone ?? "",
        shop_address: settings.shop_address ?? "",
      },
      "general",
    );
  };

  const handleSaveShipping = async () => {
    await saveSettings(
      {
        shipping_ceska_posta_price: Number(settings.shipping_ceska_posta_price || 0),
        shipping_ceska_posta_enabled: !!settings.shipping_ceska_posta_enabled,
        shipping_ppl_price: Number(settings.shipping_ppl_price || 0),
        shipping_ppl_enabled: !!settings.shipping_ppl_enabled,
        shipping_pickup_price: Number(settings.shipping_pickup_price || 0),
        shipping_pickup_enabled: !!settings.shipping_pickup_enabled,
      },
      "shipping",
    );
  };

  const handleSavePayments = async () => {
    await saveSettings(
      {
        payment_bank_transfer_enabled: !!settings.payment_bank_transfer_enabled,
        payment_card_enabled: !!settings.payment_card_enabled,
        payment_cod_enabled: !!settings.payment_cod_enabled,
      },
      "payments",
    );
  };

  const handleSaveEmails = async () => {
    await saveSettings(
      {
        email_template_type: settings.email_template_type ?? "order-confirmation",
        email_subject: settings.email_subject ?? "",
        email_content: settings.email_content ?? "",
      },
      "emails",
    );
  };

  return (
    <>
      <AdminHeader
        title="Nastavení"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Nastavení" }]}
      />
      <div className="flex flex-1 flex-col gap-6 p-4">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Obecné</TabsTrigger>
            <TabsTrigger value="shipping">Doprava</TabsTrigger>
            <TabsTrigger value="payments">Platby</TabsTrigger>
            <TabsTrigger value="emails">Emaily</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Základní informace o e-shopu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shop-name">Název e-shopu</Label>
                    <Input id="shop-name" value={settings.shop_name || ""} onChange={(e) => updateField("shop_name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shop-email">Kontaktní email</Label>
                    <Input id="shop-email" type="email" value={settings.shop_email || ""} onChange={(e) => updateField("shop_email", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-description">Popis e-shopu</Label>
                  <Textarea
                    id="shop-description"
                    value={settings.shop_description || ""}
                    onChange={(e) => updateField("shop_description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shop-phone">Telefon</Label>
                    <Input id="shop-phone" value={settings.shop_phone || ""} onChange={(e) => updateField("shop_phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shop-address">Adresa</Label>
                    <Input id="shop-address" value={settings.shop_address || ""} onChange={(e) => updateField("shop_address", e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleSaveGeneral} disabled={loading}>Uložit změny</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nastavení dopravy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Česká pošta</Label>
                      <p className="text-sm text-muted-foreground">Standardní doručení</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input className="w-24" type="number" value={settings.shipping_ceska_posta_price ?? 99} onChange={(e) => updateField("shipping_ceska_posta_price", e.target.value)} />
                      <span>Kč</span>
                      <Switch checked={!!settings.shipping_ceska_posta_enabled} onCheckedChange={(v) => updateField("shipping_ceska_posta_enabled", v)} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>PPL</Label>
                      <p className="text-sm text-muted-foreground">Rychlé doručení</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input className="w-24" defaultValue="149" />
                      <span>Kč</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Osobní odběr</Label>
                      <p className="text-sm text-muted-foreground">Zdarma</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Input className="w-24" defaultValue="0" />
                      <span>Kč</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                <Button>Uložit nastavení dopravy</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platební metody</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Bankovní převod</Label>
                      <p className="text-sm text-muted-foreground">Platba předem</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Platební karta</Label>
                      <p className="text-sm text-muted-foreground">Online platba</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dobírka</Label>
                      <p className="text-sm text-muted-foreground">Platba při doručení</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <Button>Uložit platební metody</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email šablony</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-template">Typ šablony</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte šablonu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order-confirmation">Potvrzení objednávky</SelectItem>
                      <SelectItem value="order-shipped">Objednávka odeslána</SelectItem>
                      <SelectItem value="order-delivered">Objednávka doručena</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Předmět emailu</Label>
                  <Input id="email-subject" defaultValue="Potvrzení vaší objednávky" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-content">Obsah emailu</Label>
                  <Textarea
                    id="email-content"
                    rows={8}
                    defaultValue="Děkujeme za vaši objednávku. Vaše objednávka byla úspěšně přijata a bude zpracována v nejbližší době."
                  />
                </div>
                <Button>Uložit šablonu</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
