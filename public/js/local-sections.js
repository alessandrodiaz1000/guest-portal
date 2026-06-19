/* Restaurants & directions — rendered by app.js */
window.GUEST_LOCAL = {
  it: {
    directions: {
      title: "Come arrivare",
      lead: "Viale Monte Nero 19 · Porta Romana",
      routes: [
        {
          id: "linate",
          label: "Da Linate",
          from: "Aeroporto di Linate",
          steps: [
            { type: "metro", line: "M4", name: "Metropolitana blu", detail: "Partenza direttamente in aeroporto", direction: "San Cristoforo" },
            { type: "stop", name: "Tricolore", detail: "Scendete a questa fermata" },
            { type: "tram", line: "9", name: "Tram 9", detail: "Prendete il tram in superficie", direction: "Porta Genova" },
            { type: "arrive", name: "Viale Monte Nero–Via Pier Lombardo", detail: "Fermata davanti all'appartamento" },
          ],
        },
        {
          id: "malpensa",
          label: "Da Malpensa",
          from: "Aeroporto di Malpensa",
          steps: [
            { type: "train", name: "Malpensa Express", detail: "Fino alla Stazione Centrale · ~€15 a persona" },
            { type: "metro", line: "M3", name: "Metropolitana gialla", detail: "Dalla Stazione Centrale", direction: "San Donato" },
            { type: "stop", name: "Porta Romana", detail: "Scendete qui" },
            { type: "walk", name: "5 min a piedi", detail: "Fino a Viale Monte Nero 19" },
          ],
        },
        {
          id: "bergamo",
          label: "Da Bergamo",
          from: "Aeroporto Orio al Serio (Bergamo)",
          steps: [
            { type: "bus", name: "Navetta per Milano", detail: "Terravision, Orio Shuttle o simili · ~€10 a persona · Stazione Centrale" },
            { type: "metro", line: "M3", name: "Metropolitana gialla", detail: "Dalla Stazione Centrale", direction: "San Donato" },
            { type: "stop", name: "Porta Romana", detail: "Scendete qui" },
            { type: "walk", name: "5 min a piedi", detail: "Fino a Viale Monte Nero 19" },
          ],
        },
      ],
    },
    restaurants: {
      title: "Ristoranti consigliati",
      lead: "Nel quartiere trovate di tutto. Uscendo dall'edificio, girate a sinistra: la maggior parte dei locali è sulla stessa strada.",
      toggle: "Vedi i ristoranti consigliati",
      tip: "Berberè è l'unico un po' più lontano (~5 min a piedi). Cueva Maya è proprio davanti casa.",
      items: [
        { name: "EmiPiace", tag: "Emiliano", desc: "Pasta fresca, lasagne e specialità locali" },
        { name: "Due Forni", tag: "Pizza", desc: "Un po' più caro, ma qualità superiore" },
        { name: "Berberè", tag: "Pizza artigianale", desc: "Molto popolare · ~5 min a piedi" },
        { name: "Panino Giusto", tag: "Panini", desc: "Catena milanese molto conosciuta" },
        { name: "Pescherie Riunite", tag: "Pesce", desc: "Prezzo alto, ottima qualità" },
        { name: "Cueva Maya", tag: "Messicano", desc: "Proprio davanti casa · ottimo", highlight: true },
      ],
    },
  },
  en: {
    directions: {
      title: "Getting here",
      lead: "Viale Monte Nero 19 · Porta Romana",
      routes: [
        {
          id: "linate",
          label: "From Linate",
          from: "Linate Airport",
          steps: [
            { type: "metro", line: "M4", name: "Blue metro line", detail: "Departs inside the airport", direction: "San Cristoforo" },
            { type: "stop", name: "Tricolore", detail: "Get off here" },
            { type: "tram", line: "9", name: "Tram 9", detail: "Take the tram at street level", direction: "Porta Genova" },
            { type: "arrive", name: "Viale Monte Nero–Via Pier Lombardo", detail: "Stop right in front of the apartment" },
          ],
        },
        {
          id: "malpensa",
          label: "From Malpensa",
          from: "Malpensa Airport",
          steps: [
            { type: "train", name: "Malpensa Express", detail: "To Milano Centrale · ~€15 per person" },
            { type: "metro", line: "M3", name: "Yellow metro line", detail: "From Centrale", direction: "San Donato" },
            { type: "stop", name: "Porta Romana", detail: "Get off here" },
            { type: "walk", name: "5 min walk", detail: "To Viale Monte Nero 19" },
          ],
        },
        {
          id: "bergamo",
          label: "From Bergamo",
          from: "Orio al Serio Airport (Bergamo)",
          steps: [
            { type: "bus", name: "Shuttle to Milan", detail: "Terravision, Orio Shuttle or similar · ~€10 per person · Centrale station" },
            { type: "metro", line: "M3", name: "Yellow metro line", detail: "From Centrale", direction: "San Donato" },
            { type: "stop", name: "Porta Romana", detail: "Get off here" },
            { type: "walk", name: "5 min walk", detail: "To Viale Monte Nero 19" },
          ],
        },
      ],
    },
    restaurants: {
      title: "Suggested restaurants",
      lead: "The neighbourhood has plenty of options. Exit the building, turn left — most places are on the same street.",
      toggle: "Show suggested restaurants",
      tip: "Berberè is the only one slightly farther (~5 min walk). Cueva Maya is right in front of the apartment.",
      items: [
        { name: "EmiPiace", tag: "Emilian", desc: "Fresh pasta, lasagna, and local specialties" },
        { name: "Due Forni", tag: "Pizza", desc: "A bit pricier, but better quality" },
        { name: "Berberè", tag: "Artisan pizza", desc: "Very popular · ~5 min walk" },
        { name: "Panino Giusto", tag: "Sandwiches", desc: "One of Milan's best-known chains" },
        { name: "Pescherie Riunite", tag: "Fish", desc: "Pricey, excellent quality" },
        { name: "Cueva Maya", tag: "Mexican", desc: "Right in front of the apartment · excellent", highlight: true },
      ],
    },
  },
};
