"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export function SettingsDashboard() {
  const { toast } = useToast()

  // General settings
  const [shopName, setShopName] = useState("Můj E-shop")
  const [shopDescription, setShopDescription] = useState("Nejlepší e-shop na světě!")
  const [shopEmail, setShopEmail] = useState("info@mujeshop.cz")

  // Payment settings
  const [stripeEnabled, setStripeEnabled] = useState(true)
  const [paypalEnabled, setPaypalEnabled] = useState(false)

  // Shipping settings
  const [packetaEnabled, setPacketaEnabled] = useState(true)
  const [flatRateShipping, setFlatRateShipping] = useState("89")

  // Integration settings
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("UA-XXXXX-Y")
  const [facebookPixelId, setFacebookPixelId] = useState("XXXXX")

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [passwordChangeDate, setPasswordChangeDate] = useState("2023-10-01")

  const handleSaveGeneral = () => {
    toast({
      title: "Nastavení uloženo",
      description: "Obecné nastavení bylo úspěšně aktualizováno.",
    })
  }

  const handleSavePayments = () => {
    toast({
      title: "Nastavení uloženo",
      description: "Nastavení plateb bylo úspěšně aktualizováno.",
    })
  }

  const handleSaveShipping = () => {
    toast({
      title: "Nastavení uloženo",
      description: "Nastavení dopravy bylo úspěšně aktualizováno.",
    })
  }

  const handleSaveIntegrations = () => {
    toast({
      title: "Nastavení uloženo",
      description: "Nastavení integrací bylo úspěšně aktualizováno.",
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: "Nastavení uloženo",
      description: "Nastavení oznámení bylo úspěšně aktualizováno.",
    })
  }

  const handleSaveSecurity = () => {
    toast({
      title: "Nastavení uloženo",
      description: "Nastavení zabezpečení bylo úspěšně aktualizováno.",
    })
  }

  return (
    <div className="grid gap-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Obecné nastavení</CardTitle>
          <CardDescription>Spravujte základní informace o vašem e-shopu.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="shopName">Název e-shopu</Label>
            <Input id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shopDescription">Popis e-shopu</Label>
            <Textarea
              id="shopDescription"
              value={shopDescription}
              onChange={(e) => setShopDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shopEmail">Kontaktní email</Label>
            <Input id="shopEmail" type="email" value={shopEmail} onChange={(e) => setShopEmail(e.target.value)} />
          </div>
          <Button onClick={handleSaveGeneral}>Uložit obecné nastavení</Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Platební metody</CardTitle>
          <CardDescription>Konfigurujte dostupné platební brány.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="stripeEnabled">Povolit Stripe</Label>
            <Switch id="stripeEnabled" checked={stripeEnabled} onCheckedChange={setStripeEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="paypalEnabled">Povolit PayPal</Label>
            <Switch id="paypalEnabled" checked={paypalEnabled} onCheckedChange={setPaypalEnabled} />
          </div>
          <Button onClick={handleSavePayments}>Uložit platební nastavení</Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Doprava</CardTitle>
          <CardDescription>Nastavte možnosti dopravy pro vaše objednávky.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="packetaEnabled">Povolit Zásilkovnu</Label>
            <Switch id="packetaEnabled" checked={packetaEnabled} onCheckedChange={setPacketaEnabled} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="flatRateShipping">Paušální sazba dopravy (Kč)</Label>
            <Input
              id="flatRateShipping"
              type="number"
              value={flatRateShipping}
              onChange={(e) => setFlatRateShipping(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveShipping}>Uložit nastavení dopravy</Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Integrations Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integrace</CardTitle>
          <CardDescription>Připojte externí služby pro rozšíření funkcionality.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
            <Input
              id="googleAnalyticsId"
              value={googleAnalyticsId}
              onChange={(e) => setGoogleAnalyticsId(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
            <Input id="facebookPixelId" value={facebookPixelId} onChange={(e) => setFacebookPixelId(e.target.value)} />
          </div>
          <Button onClick={handleSaveIntegrations}>Uložit nastavení integrací</Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Oznámení</CardTitle>
          <CardDescription>Spravujte, jak a kdy budete dostávat oznámení.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications">Emailová oznámení</Label>
            <Switch id="emailNotifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="smsNotifications">SMS oznámení</Label>
            <Switch id="smsNotifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
          </div>
          <Button onClick={handleSaveNotifications}>Uložit nastavení oznámení</Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Zabezpečení</CardTitle>
          <CardDescription>Nastavte bezpečnostní prvky pro váš účet.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="twoFactorAuth">Dvoufaktorové ověřování</Label>
            <Switch id="twoFactorAuth" checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="passwordChangeDate">Poslední změna hesla</Label>
            <Input
              id="passwordChangeDate"
              type="date"
              value={passwordChangeDate}
              onChange={(e) => setPasswordChangeDate(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveSecurity}>Uložit nastavení zabezpečení</Button>
        </CardContent>
      </Card>
    </div>
  )
}
