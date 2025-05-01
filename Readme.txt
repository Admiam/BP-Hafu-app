Adresářová struktura projektu:

1. Aplikace_a_knihovny
   ├── android               # Android-specifické soubory aplikace
   ├── app                   # Hlavní zdrojový kód aplikace
   │   ├── (auth)            # Obrazovky a komponenty související s autentizací
   │   ├── (drawer)          # Navigace typu drawer (boční menu)
   │   │   └── (tabs)        # Vnořená navigace typu tabs
   │   ├── (modals)          # Modální okna aplikace
   │   └── context           # Kontextové API a globální stav aplikace
   ├── assets                # Statické zdroje aplikace
   │   ├── data              # Datové soubory (např. JSON)
   │   ├── fonts             # Fonty aplikace
   │   └── images            # Obrázky aplikace
   ├── components            # Znovupoužitelné komponenty aplikace
   │   ├── __mocks__         # Mocky pro testování komponent
   │   ├── __tests__         # Testovací soubory komponent
   │   │   └── __snapshots__ # Snapshoty pro testování UI
   │   ├── buttons           # Komponenty tlačítek
   │   ├── cards             # Komponenty karet
   │   ├── forms             # Formulářové komponenty
   │   └── navigation        # Navigační komponenty
   ├── constants             # Konstanty používané v aplikaci
   ├── hooks                 # Vlastní React hooks
   ├── ios                   # iOS-specifické soubory aplikace
   ├── lib                   # Externí knihovny nebo pomocné moduly
   ├── scripts               # Skripty pro sestavení a správu projektu
   └── utils                 # Pomocné funkce a utility aplikace

2. Text_prace
   ├── img                   # Obrázky související s textovou prací
   ├── img-bp                # Obrázky pro bakalářskou práci
   └── texmf                 # Konfigurační soubory a definice pro LaTeX

3. Vstupni_data               # Datové soubory pro vstupní data aplikace
