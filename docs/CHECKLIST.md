# Hermadata — Checklist implementazioni

Gestionale canile · aggiornare con `- [x]` per marcare i punti completati.

---

## 🐛 Bug da correggere

- [x] Sovrapposizione bottone 'Aggiungi documento' e 'Nuova uscita' `alta`
- [x] Bug creazione adottante `alta`
- [ ] Bug giorno indietro in 'Sposta in rifugio' `media`
- [x] Correggere nome/cognome nella creazione utente `media`
- [ ] Verificare comportamento tasto indietro del browser `media`

---

## 🏗️ Gestione strutture

- [x] Struttura attiva diventa filtro della lista animali (non è più un contesto globale) `alta`
- [x] Possibilità di non filtrare per struttura (vista tutte le strutture) `alta`
- [x] Aggiungere selezione struttura nell'inserimento di un nuovo animale `alta`
- [x] Vincolo: animali non in sanitario non possono essere inseriti in una struttura sanitaria (es. i recuperi sono forzatamente in sanitario) `alta`
- [x] Spostamento in rifugio diventa spostamento di struttura: selezionare struttura destinazione `alta`

---

## 🐾 Scheda animale

- [x] Aggiungere campo sesso in 'Caratteristiche fisiche' `alta`
- [x] Aggiungere comune di ingresso in 'Generali' e mostrare tutti gli ingressi `alta`
- [x] Implementare cancellazione animale (soft delete) `alta`
- [x] Rappresentazione età con anni e mesi (es. '2 anni e 3 mesi') ovunque: scheda, lista, documenti stampati `alta`
- [x] Aggiungere ingresso senza chip: flag + data chippatura `media`
- [ ] Aggiungere numero gabbia `media`
- [ ] Reminder chip mancante con link diretto alla modifica `media`
- [x] Iniziare a gestire le foto degli animali `media`
- [ ] Evidenziare righe con colore diverso per cani e gatti `bassa`

---

## 🖥️ UX & navigazione

- [x] Mantenere i filtri attivi per sessione utente (non resettare al cambio pagina) `alta`
- [x] Tasto stampa nella lista animali: genera PDF a tabella con gli animali presenti secondo i filtri attivi `alta`

---

## 🔖 Ingresso & chip

- [x] Gestione ingresso completo: chip obbligatorio o flag 'senza chip' `alta`
- [ ] Solo conferimenti possono entrare direttamente nel rifugio (vincolo logico) [chiedere a Luca] `alta`
- [ ] Documento di ingresso → 'mail di attivazione', generato su richiesta (non automatico) [chiedere Luca] `media`

---

## 🔄 Stadi & movimenti

- [ ] Data di passaggio da sanitario a rifugio con relativo documento [chiedere a Luca] `alta`
- [x] Filtro vista per stadio: sanitario / rifugio `media`
- [ ] Riportare stadio di provenienza (sanitario o rifugio) nel documento di variazione [chiedere a Luca] `media`
- [x] Se stadio = sanitario → denominazione 'Canile Chiodo' `media`

---

## 🤝 Adozione & affido

- [x] Bloccare avvio adozione se dati incompleti, con messaggio esplicito su cosa manca `alta`
- [x] In adozione e variazione: tutti i dati adottante (residenza, CF, n. documento, età, firma operatore) `alta`
- [x] Aggiungere flag 'adozione temporanea' `alta`
- [x] Affido confermato → genera documento adozione definitiva (senza 'temporaneo', data scelta) `alta`
- [x] Affido non confermato → nuovo ingresso di tipo 'rientro' con comune originale `alta`
- [x] Restituzione al proprietario = adozione (ricerca/inserimento proprietario) `media`
- [x] Mantenere in memoria dati uscita nel frontend `media`

---

## 📄 Documenti autogenerati

- [x] Documento di variazione generato da template per tipo uscita (configurabile) `alta`
- [ ] Aggiungere taglia nel modulo di variazione definitivo `alta`
- [x] Aggiungere firma operatore nel modulo adozione `alta`
- [ ] Modulo delega `media`
- [ ] Documenti autogenerati non devono apparire nel menu 'Carica nuovo documento' `media`
- [x] Titoli e date dei documenti modificabili negli affidi `media`
- [x] Usare date in italiano in tutte le stampe `media`

---

## 🩺 Veterinari & atti medici

- [ ] Anagrafica veterinario: ragione sociale, P.IVA/CF (chiave), nome, cognome `alta`
- [ ] Atti medici (n:m veterinari–animali): causale, veterinario, prezzo `alta`
- [ ] Caricamento scansione fattura negli atti medici `bassa`

---

## 💶 Costi

- [ ] Costo totale per animale (tutti i veterinari, dall'ultimo ingresso) `alta`
- [ ] Costo per veterinario (totale e per periodo) `alta`
- [ ] Costo totale per comune e per veterinario (per periodo) `media`

---

## 📊 Statistiche & report

- [ ] Giorni cane per comune nel periodo selezionato (inizio escluso dal calcolo) `alta`
- [ ] Stampa riepilogo: nome, chip, entrata, uscita, tot. giorni per cane, somma in fondo `alta`
- [ ] Report ingressi per periodo e comune (divisione per tipo), esportabile `alta`
- [ ] Report uscite per periodo e comune (divisione per tipo), esportabile `alta`
- [ ] Inserire date ingresso e uscita nel report giorni `media`
- [ ] Giorni cane filtrabile per tipo animale `media`
- [ ] Indice di rotazione: data ingresso → adozione, per comune `media`
- [ ] Sanitario: estrazione PDF in ZIP filtrabili per zona/animale `bassa`

---

## 📋 Dashboard

- [ ] Contatori animali presenti: cane/gatto × sanitario/rifugio `alta`
- [ ] Ultimi ingressi per comune `media`

---

## 🔐 Permessi & utenti

- [ ] Ruolo 'solo gatti': accesso limitato agli animali felini `alta`
- [ ] Ruolo 'con estrazioni': abilitare export e generazione documenti `alta`
- [ ] Utenti con comuni di competenza: bloccare tutte le azioni (scrittura, estrazioni, report) su animali di comuni non assegnati `alta`
- [x] Lista comuni e province nei selettori filtrata ai soli comuni di competenza dell'utente loggato `alta`
- [x] Verifica lato server: i vincoli di competenza devono essere enforced anche sulle API, non solo sul frontend `alta`
- [ ] Superuser: visualizzazione eventi con utente associato `media`

---

## 🗒️ Foglio presenze

- [ ] Foglio presenze: chip, nome, comune, data ingresso, razza, età, sesso, sterilizzazione `media`

---

_Totale: 65 attività · aggiornato 01/05/2025_
