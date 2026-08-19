# CityMapLaser

Genereert een stratenkaart van een plaats of adres, als **SVG** om te laseren
(getest met LaserGRBL) of als **STL** om te 3D-printen. Draait volledig lokaal in
de browser; kaartdata komt live van OpenStreetMap.

## Gebruik

Dubbelklik `start-citymap.cmd`. Die start een lokale webserver op
<http://localhost:8800/> en opent de browser. Laat het venster open tijdens gebruik.

> Open `citymap.html` niet rechtstreeks via dubbelklikken: vanaf een `file://`-pagina
> blokkeert de browser de aanvragen naar OpenStreetMap.

Vereist [Node.js](https://nodejs.org) (alleen voor het lokale servertje).

## Mogelijkheden

- Zoeken op plaats, dorp of volledig adres (via Nominatim)
- Instelbaar formaat in mm, breedte × hoogte (bv. 145 × 330 voor een plank)
- Lagen: kleine straten/paden, spoorlijnen, water
- Ronde uitsnede of rechthoekig; optionele kaderlijn als snijlijn
- Symbool op het adres: huisje, sterretje of hartje, met arcering zodat het massief graveert
- Straten omkeren onder het symbool (symbool zwart, straten blijven wit zichtbaar)
- Onderschrift met plaatsnaam/eigen tekst en coördinaten, met vrijgemaakte tekst

Met **Korte stukjes weglaten** filter je stompjes en losse fragmenten onder een
instelbare lengte weg — die lezen op deze schaal als artefact in plaats van als straat.
Dat geldt voor zowel de SVG als de STL.

## Laser-specifieke keuzes

Een laser volgt lijnen en negeert SVG-`fill`. Daar is de uitvoer op afgestemd:

- **Massieve symbolen** worden met dicht op elkaar liggende lijnen gearceerd,
  niet met een `fill`.
- **Geen kader in de export.** De achtergrondvorm zit alleen in de preview; een
  fill-only vorm zou anders alsnog als kaderlijn worden getraceerd.
- **Geometrisch afgeknipt** op de rand in plaats van via `clipPath`, zodat er nooit
  lijnen buiten de plank in het bestand staan.
- **Transportbewegingen geoptimaliseerd.** OSM levert wegen in willekeurige volgorde;
  herordenen scheelt in de praktijk 86–95% loze verplaatsing.

## 3D printen

De STL-export maakt een grondplaat met de straten, het symbool en het onderschrift
als verhoogd reliëf. Straten zijn doorlopende linten met verstekhoeken en ronde
uiteinden; wegen die op de plaatrand worden afgekapt houden een recht einde. Instelbaar: dikte grondplaat, hoogte van het reliëf en de
breedte van de dunste straat (houd die minstens ~2× je nozzle, anders print hij niet).

Met **Uitstekende plaatrand** groeit alleen de grondplaat met de ingestelde breedte
(standaard 3 mm) aan alle kanten. De kaart houdt exact het formaat dat je invult:
vul je 200 x 200 in, dan is de stratenkaart 200 x 200 en de plaat 206 x 206. Die
uitstekende rand valt in de sleuf van een lijst.

### Twee kleuren (AMS)

Zet **2 kleuren** aan en gebruik **3MF downloaden**. Een STL bevat geen positie:
elke slicer centreert het model en legt het op het bed, dus twee losse STL-bestanden
lijnen na import nooit meer uit. 3MF bewaart de transformaties en zet beide delen
als onderdelen in één object.

In Bambu Studio: open het 3MF. Het komt binnen als één object *Kaart* met de
onderdelen *Plaat* (filament 1) en *Straten* (filament 2), al toegewezen.

Gebruik **niet** “Splitsen naar objecten”: het reliëf bestaat uit duizenden losse
shells (een balkje per wegsegment), dus dat maakt er duizenden objecten van.

De losse STL-knoppen staan er nog voor workflows die dat willen, maar dan moet je
de delen zelf positioneren.

Straten worden als één doorlopend lint per weg gebouwd, met verstek bij de knopen,
en de lijn wordt eerst afgerond (**Bochten afronden**, 0–3). Dat vervangt de oude
aanpak van een los doosje per wegsegment, waarbij de verlengde uiteinden bij elke
bocht uitstaken.

De onderdelen zijn losse gesloten volumes die elkaar overlappen; slicers voegen die
vanzelf samen. Het reliëf zakt 0,2 mm in de plaat zodat er altijd overlap is, en
uitsteeksels worden op de plaat teruggeklemd zodat er niets in de lucht hangt.

## Data

Kaartdata © OpenStreetMap-bijdragers, [ODbL](https://www.openstreetmap.org/copyright),
opgehaald via de Overpass API.
