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
als verhoogd reliëf. Instelbaar: dikte grondplaat, hoogte van het reliëf en de
breedte van de dunste straat (houd die minstens ~2× je nozzle, anders print hij niet).

### Twee kleuren (AMS)

Zet **2 kleuren** aan en gebruik **3MF downloaden**. Een STL bevat geen positie:
elke slicer centreert het model en legt het op het bed, dus twee losse STL-bestanden
lijnen na import nooit meer uit. 3MF bewaart de transformaties en zet beide delen
als onderdelen in één object.

In Bambu Studio: open het 3MF, en wijs in de objectenlijst per onderdeel
(*Plaat* en *Straten*) een filament toe.

De losse STL-knoppen staan er nog voor workflows die dat willen, maar dan moet je
de delen zelf positioneren.

De onderdelen zijn losse gesloten volumes die elkaar overlappen; slicers voegen die
vanzelf samen. Het reliëf zakt 0,2 mm in de plaat zodat er altijd overlap is, en
uitsteeksels worden op de plaat teruggeklemd zodat er niets in de lucht hangt.

## Data

Kaartdata © OpenStreetMap-bijdragers, [ODbL](https://www.openstreetmap.org/copyright),
opgehaald via de Overpass API.
