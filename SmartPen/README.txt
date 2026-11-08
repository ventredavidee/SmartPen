SMARTPEN – QUADERNO TECNICO (prototipo 0.1)

CONTENUTO
- Quaderno a quadretti, righe, bianco e isometrico
- Penna, gomma, linea
- Pagine multiple
- Salvataggio locale nel browser
- Esportazione tramite stampa in PDF
- Filtro mano sperimentale

IMPORTANTE SUL PALM REJECTION
iPad Air 2 non supporta Apple Pencil e non fornisce necessariamente all'app dati
sufficienti per distinguere una penna capacitiva attiva da un dito o dal palmo.
Il filtro usa larghezza/altezza del contatto quando il browser le rende disponibili.
Se Safari non espone tali misure, non può filtrare il palmo in modo affidabile.
Non è un palm rejection hardware e non può essere garantito.

INSTALLAZIONE SU IPAD AIR 2
Una PWA deve essere servita da un sito HTTPS (oppure localhost). Aprire index.html
come file locale non basta per installare correttamente la PWA e attivare il service worker.

Metodo semplice con GitHub Pages:
1. Da un PC, accedi o crea un account GitHub.
2. Crea un nuovo repository pubblico chiamato smartpen.
3. Carica TUTTI i file contenuti in questa cartella, mantenendo i nomi.
4. Nelle impostazioni del repository, apri Pages.
5. Seleziona Deploy from a branch, branch main, folder /(root), salva.
6. Attendi la pubblicazione e apri l'indirizzo HTTPS fornito da GitHub Pages su Safari dell'iPad.
7. Premi Condividi > Aggiungi alla schermata Home.

USO
- Tocca Penna/Gomma/Linea per scegliere lo strumento.
- Scegli colore e spessore.
- Cambia il tipo di foglio.
- Usa le frecce per cambiare pagina.
- Salva periodicamente: i dati restano nel browser di questo iPad.
- Esporta PDF apre la finestra di stampa: scegli Condividi o Salva su File.

LIMITI DEL PROTOTIPO
- I dati sono salvati localmente e non sincronizzati tra dispositivi.
- Il PDF esporta la pagina visibile.
- Lo strumento "Sposta" è solo predisposto nell'interfaccia e non implementa ancora il trascinamento.
- Non è un CAD e non sostituisce AutoCAD.
