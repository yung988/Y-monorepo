# 🛠️ Seznam úkolů – Oprava admin dashboardu e-shopu (Next.js App Router)

## Kontext
- **Tech stack:** Next.js App Router, pnpm, TypeScript, Supabase, Stripe, Resend, Packeta API  
- **Problém:** Frontend pro zákazníky funguje, ale admin dashboard obsahuje chyby (UI, API, integrace Packeta).
- **Cíl:** Admin musí bezchybně spravovat produkty, objednávky, zákazníky a zásilky.

---

## 1️⃣ Kontrola a oprava admin sekce
- [ ] Projít všechny stránky:  
  - `/orders`  
  - `/products`  
  - `/customers`  
  - `/report`  
  - `/settings`  
- [ ] Otestovat API endpointy pro každou stránku.  
- [ ] U každého bugu zjistit:  
  - [ ] zda je problém v **UI**, **server action** nebo **API route**  
  - [ ] navrhnout a implementovat opravu  
  - [ ] zapsat cestu k souboru + popis změny  

---

## 2️⃣ Integrace Packeta
- [ ] **`/api/packeta/create-shipment`**  
  - [ ] Brát správná data z objednávky (rozměry, hmotnost, pickup point ID).
- [ ] **`/api/packeta/generate-labels`** a **`/api/admin/packeta/print-label`**  
  - [ ] Vracet správně PDF štítky.
- [ ] **`/api/admin/orders/:id/packeta/send-tracking`**  
  - [ ] Posílat e-mail s tracking number (Resend).  
- [ ] Přidat error handling do všech Packeta volání + zobrazit chybu v UI.

---

## 3️⃣ Produkty
- [ ] Opravit formuláře, aby posílaly všechna povinná pole do  
  **`POST /api/admin/products`** a **`PATCH /api/admin/products`**.  
- [ ] Ověřit, že upload a mazání obrázků funguje (**`POST /images`**, **`DELETE /images`**).

---

## 4️⃣ Autorizace
- [ ] Zkontrolovat, že **`requireAdminOrEditor()`** je aplikováno na všechny:
  - Admin stránky  
  - API endpointy

---

## 5️⃣ Revalidace dat
- [ ] Po každém **PATCH / POST / DELETE** přidat:  
  - **`revalidateTag`** nebo  
  - **`router.refresh()`**  
  aby se UI vždy aktualizovalo.

---

## 6️⃣ Optimalizace
- [ ] Odstranit duplicity API volání.
- [ ] Nastavit **`cache: 'no-store'`** tam, kde je potřeba vždy čerstvá data.

---

## 📦 Výstup pro dokumentaci
Po dokončení:
1. **Seznam provedených změn:**  
   - Cesta k souboru + stručný popis úpravy
2. **Popis chyb, které byly opraveny**
3. **Doporučení pro další úpravy**, pokud něco zůstalo nevyřešeno.
