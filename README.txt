SMARTPEN v2
Caricamento GitHub Pages:
- Estrai lo ZIP.
- Carica TUTTI i file contenuti direttamente nella cartella principale del repository (root), non dentro una sottocartella.
- Sovrascrivi index.html, app.js, style.css, manifest.webmanifest e sw.js quando GitHub lo chiede.
- Commit changes e attendi la pubblicazione.
- Su iPad Safari, ricarica il sito. Se appare ancora la vecchia versione, chiudi la scheda e riapri il link.

Modifiche:
- La gomma usa compositing sul solo canvas dell'inchiostro: il foglio (quadretti/righe) non viene cancellato.
- Griglia disegnata come sfondo separato.
- Eventi Pointer gestiti su canvas con touch-action:none.
- Il filtro dei tocchi grandi è disattivato inizialmente perché Safari su iPad Air 2 può non fornire dimensioni touch affidabili. È sperimentale e non garantisce palm rejection.
- Pagine e tratti salvati localmente nel browser.
- PDF tramite stampa.
Nota: la penna capacitiva è interpretata dall'iPad come un dito; il palm rejection hardware non è disponibile su iPad Air 2.
