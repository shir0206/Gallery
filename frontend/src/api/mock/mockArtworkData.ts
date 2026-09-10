import type { Artwork } from "../../types/artwork";

type ArtworkMockInput = Omit<
  Artwork,
  | "purchaseUrl"
  | "price"
  | "salePrice"
  | "availability"
  | "commerce"
  | "detailImages"
  | "interiorImageUrl"
> &
  Partial<
    Pick<
      Artwork,
      | "purchaseUrl"
      | "price"
      | "salePrice"
      | "availability"
      | "commerce"
      | "detailImages"
      | "interiorImageUrl"
    >
  >;

/**
 * Dev-only stand-in for the real backend. Shaped exactly like a real
 * Firestore-derived `Artwork`, so swapping data sources never requires
 * changing consumers.
 */
const MOCK_ARTWORK_DATA: ArtworkMockInput[] = [
  {
    id: "0",
    title: "Butterflies",
    artist: "Shir Zabolotny",
    year: 2011,
    month: 1,
    day: 22,
    medium: "Photoshop",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Photoshop", "Woman", "Butterflies", "Color"],
    status: "published",
    description: {
      materials:
        "Rough pigments painted on textured ground.",
      visual:
        "Glowing colors silhouette the central figure.",
      inspiration:
        "Private hope glows against the surrounding darkness.",
    },
    imageUrl: "https://i.imgur.com/c2PPnGg.jpg",
    orientation: "landscape",

    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    purchaseUrl: "https://example.com/purchase/butterflies",
    price: 320,
    salePrice: 240,
    availability: "available",
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "1",
    title: "Girl With Pearl Earring",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 4,
    day: 19,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Couple", "Movie"],
    status: "published",
    description: {
      materials:
        "Fine pencil shading on pale paper.",
      visual:
        "A quiet face emerges with intimacy.",
      inspiration:
        "A quiet gaze balances intimacy with fragile distance.",
    },
    imageUrl: "https://i.imgur.com/QL4Qi5k.jpg",
    orientation: "portrait",
    palette: {
      id: "P2",
      name: "Paper & Blush",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "2",
    title: "Wind",
    artist: "Shir Zabolotny",
    year: 2012,
    month: 12,
    day: 3,
    medium: "Pencil, Color",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Pencil", "Woman", "Color"],
    status: "published",
    description: {
      materials:
        "Pencil and watercolor on smooth paper.",
      visual:
        "Pastel colors flow through windswept hair.",
      inspiration:
        "The wind transforms restless thoughts into quiet freedom.",
    },
    imageUrl: "https://i.imgur.com/gaVudbq.jpg",
    orientation: "landscape",
    palette: {
      id: "P4",
      name: "Garden & Sky",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "4",
    title: "Sunrise",
    artist: "Shir Zabolotny",
    year: 2009,
    month: 3,
    day: 1,
    medium: "Acrylic",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Woman", "Ballerina"],
    status: "published",
    description: {
      materials:
        "Acrylic brushwork layered across matte ground.",
      visual:
        "Muted coral and charcoal evoke theater.",
      inspiration:
        "A dancer holds her breath before movement begins.",
    },
    imageUrl: "https://i.imgur.com/urdO7iP.jpg",
    orientation: "landscape",
    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    purchaseUrl: "https://example.com/purchase/sunrise",
    price: 280,
    availability: "sold",
    commerce: { currency: "USD", signed: true },
  },
  {
    id: "8",
    title: "Cheers",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 2,
    day: 28,
    medium: "Pen",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Pen", "Black & White", "Wine"],
    status: "published",
    description: {
      materials:
        "Metal form rests on granular ground.",
      visual:
        "Warm earth tones shape quiet stillness.",
      inspiration:
        "A simple toast celebrates the pleasure of togetherness.",
    },
    imageUrl: "https://i.imgur.com/xOLQxNe.jpg",
    orientation: "landscape",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "9",
    title: "Colorful sky",
    artist: "Shir Zabolotny",
    year: 2013,
    month: 2,
    day: 3,
    medium: "Acrylic",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Acrylic", "Sunrise"],
    status: "published",
    description: {
      materials:
        "Layered acrylic sweeps across painted surface.",
      visual:
        "Luminous color bands dwarf one figure.",
      inspiration:
        "An immense evening sky turns solitude into possibility.",
    },
    imageUrl: "https://i.imgur.com/op3kZVC.jpg",
    orientation: "landscape",
    palette: {
      id: "P4",
      name: "Garden & Sky",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "10",
    title: "Twilight",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 3,
    day: 1,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Man", "Movie"],
    status: "published",
    description: {
      materials:
        "Grainy mixed media with golden strokes.",
      visual:
        "Darkness surrounds a softly glowing figure.",
      inspiration:
        "Twilight holds a figure between hope and loss.",
    },
    imageUrl: "https://i.imgur.com/JYb0ry6.jpg",
    orientation: "portrait",
    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "11",
    title: "Music of The Night",
    artist: "Shir Zabolotny",
    year: 2009,
    month: 9,
    day: 12,
    medium: "Acrylic on Canvas",
    dimensions: {
      width: 60,
      height: 90,
      unit: "cm",
    },
    category: ["Dance", "Couple", "Music", "Canvas"],
    status: "published",
    description: {
      materials:
        "Loose acrylic strokes cross painted ground.",
      visual:
        "Dancers twist beneath falling musical sparks.",
      inspiration:
        "A couple finds fleeting unity through shared rhythm.",
    },
    imageUrl: "https://i.imgur.com/ofTHpUw.jpg",
    orientation: "landscape",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    purchaseUrl: "https://example.com/purchase/music-of-the-night",
    price: 450,
    salePrice: 375,
    availability: "available",
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "12",
    title: "Tree Lovers",
    artist: "Shir Zabolotny",
    year: 2009,
    month: 9,
    day: 15,
    medium: "Newspaper, Glue",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Tree", "Couple", "Newspaper", "Glue"],
    status: "published",
    description: {
      materials:
        "Pencil and ochre layer on paper.",
      visual:
        "Earth tones suggest forgotten notebook fragments.",
      inspiration:
        "Love grows through care, passed gently between hands.",
    },
    imageUrl: "https://i.imgur.com/t59EX6E.jpg",
    orientation: "portrait",
    palette: {
      id: "P4",
      name: "Garden & Sky",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "13",
    title: "Home",
    artist: "Shir Zabolotny",
    year: 2009,
    month: 9,
    day: 12,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Woman", "Home"],
    status: "published",
    description: {
      materials:
        "Graphite and erasure shape grainy paper.",
      visual:
        "Smoky shadows make home feel distant.",
      inspiration:
        "Memory preserves home even after we change.",
    },
    imageUrl: "https://i.imgur.com/dLJMtMO.jpg",
    orientation: "portrait",
    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "15",
    title: "Turbulence",
    artist: "Shir Zabolotny",
    year: 2012,
    month: 4,
    day: 20,
    medium: "Acrylic on Canvas",
    dimensions: {
      width: 60,
      height: 90,
      unit: "cm",
    },
    category: ["Red", "Woman", "Acrylic", "Canvas"],
    status: "published",
    description: {
      materials:
        "Broad crimson acrylic strokes slash ground.",
      visual:
        "Vivid red dominates with expressive edges.",
      inspiration:
        "Crimson energy reveals passion that refuses containment.",
    },
    imageUrl: "https://i.imgur.com/QwqEp5T.jpg",
    orientation: "portrait",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    purchaseUrl: "https://example.com/purchase/turbulence",
    price: 260,
    availability: "reserved",
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "16",
    title: "Sugar",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 4,
    day: 14,
    medium: "Pencil, Glue",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Pencil", "Glue"],
    status: "published",
    description: {
      materials:
        "Rough graphite crosses a granular field.",
      visual:
        "Pale textures contrast darker pencil marks.",
      inspiration:
        "Avoidance offers temporary shelter from an uncomfortable world.",
    },
    imageUrl: "https://i.imgur.com/KHkZ05H.jpg",
    orientation: "portrait",
    palette: {
      id: "P2",
      name: "Paper & Blush",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "18",
    title: "Guitar Girl",
    artist: "Shir Zabolotny",
    year: 2009,
    month: 9,
    day: 12,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Woman", "Music", "Guitar", "Pencil", "Black & White"],
    status: "published",
    description: {
      materials:
        "Expressive graphite layered on textured paper.",
      visual:
        "Monochrome shadows evoke a midnight song.",
      inspiration:
        "Her posture reveals complete surrender to the music.",
    },
    imageUrl: "https://i.imgur.com/MgjqLrQ.jpg",
    orientation: "portrait",
    palette: {
      id: "P2",
      name: "Paper & Blush",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "19",
    title: "Voice",
    artist: "Shir Zabolotny",
    year: 2019,
    month: 8,
    day: 24,
    medium: "Pen, Watercolor",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Woman", "Pen", "WaterColor"],
    status: "published",
    description: {
      materials:
        "Watercolor washes meet sharp pen contours.",
      visual:
        "Red lips punctuate warm facial tones.",
      inspiration:
        "A silent confession waits behind closed lips.",
    },
    imageUrl: "https://i.imgur.com/qJjjWwZ.jpg",
    orientation: "portrait",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "20",
    title: "Friendship",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 7,
    day: 19,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Color", "Pencil"],
    status: "published",
    description: {
      materials:
        "Colored pencil outlines hands on paper.",
      visual:
        "Warm colors gather around meeting hands.",
      inspiration:
        "Friendship offers the quiet reassurance of someone staying.",
    },
    imageUrl: "https://i.imgur.com/zLgY5fT.jpg",
    orientation: "portrait",
    palette: {
      id: "P4",
      name: "Garden & Sky",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "21",
    title: "Marilyn Monroe",
    artist: "Shir Zabolotny",
    year: 2013,
    month: 1,
    day: 10,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Pencil", "Black & White", "Woman"],
    status: "published",
    description: {
      materials:
        "Fine graphite shades subtly grainy paper.",
      visual:
        "Smoky monochrome frames a glamorous expression.",
      inspiration:
        "A fleeting human moment emerges behind the familiar icon.",
    },
    imageUrl: "https://i.imgur.com/wmnY0YQ.jpg",
    orientation: "portrait",
    palette: {
      id: "P2",
      name: "Paper & Blush",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "22",
    title: "Fan",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 10,
    day: 15,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Japan", "Blossom", "Flower", "Woman"],
    status: "published",
    description: {
      materials:
        "Watercolor and pencil decorate folded paper.",
      visual:
        "Coral panels carry delicate floral details.",
      inspiration:
        "Beauty unfolds briefly before being gently hidden again.",
    },
    imageUrl: "https://i.imgur.com/DcB3fUR.jpg",
    orientation: "portrait",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "23",
    title: "Lights",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 10,
    day: 29,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: [
      "Guitar",
      "Birds",
      "Sunrise",
      "Black & White",
      "Tree",
      "Pencil",
      "Music",
      "Sky",
    ],
    status: "published",
    description: {
      materials:
        "Pencil and mixed media build silhouettes.",
      visual:
        "Sunset tones mingle with nostalgic shadows.",
      inspiration:
        "Music carries the fading landscape gently into night.",
    },
    imageUrl: "https://i.imgur.com/oKakklF.jpg",
    orientation: "portrait",
    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "24",
    title: "Fly",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 12,
    day: 25,
    medium: "Acrylic",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Birds", "Sunset", "Acrylic"],
    status: "published",
    description: {
      materials:
        "Rough acrylic strokes paint natural forms.",
      visual:
        "Golden sunset meets a dark foreground.",
      inspiration:
        "Departing birds turn freedom into a direction, not a destination.",
    },
    imageUrl: "https://i.imgur.com/yZuGKjS.jpg",
    orientation: "portrait",
    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    purchaseUrl: "https://example.com/purchase/fly",
    price: 480,
    availability: "available",
    commerce: {
      currency: "EUR",
      signed: true,
      certificateIncluded: true,
      reservationDays: 7,
      shipping: { worldwide: true, insured: true, estimatedBusinessDays: { min: 3, max: 7 } },
    },
  },
  {
    id: "25",
    title: "Ring",
    artist: "Shir Zabolotny",
    year: 2017,
    month: 12,
    day: 18,
    medium: "Soldering",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Ring", "Jewelery", "Soldering"],
    status: "published",
    description: {
      materials:
        "Handmade metal rests on sandy ground.",
      visual:
        "Bronze and cream create restrained stillness.",
      inspiration:
        "A new ring waits for someone to give it meaning.",
    },
    imageUrl: "https://i.imgur.com/P90lhor.jpg",
    orientation: "portrait",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "28",
    title: "Fairy",
    artist: "Shir Zabolotny",
    year: 2009,
    month: 9,
    day: 12,
    medium: "Acrylic on Canvas",
    dimensions: {
      width: 60,
      height: 90,
      unit: "cm",
    },
    category: ["Fairy", "Books", "Acrylic", "Canvas"],
    status: "published",
    description: {
      materials:
        "Thick acrylic covers books and background.",
      visual:
        "Mauve shadows suspend a weightless fairy.",
      inspiration:
        "Imagination transforms forgotten books into a fairy-guarded kingdom.",
    },
    imageUrl: "https://i.imgur.com/KRfV9Sf.jpg",
    orientation: "portrait",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "29",
    title: "End Game",
    artist: "Shir Zabolotny",
    year: 2019,
    month: 10,
    day: 3,
    medium: "Acrylic",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Movie", "Shoes", "Acrylic"],
    status: "published",
    description: {
      materials:
        "Bright acrylic designs cover white shoes.",
      visual:
        "Vivid colors transform everyday footwear playfully.",
      inspiration:
        "Personal marks transform ordinary objects into expressions of identity.",
    },
    imageUrl: "https://i.imgur.com/xUxMxTT.jpg",
    orientation: "portrait",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "30",
    title: "Crying",
    artist: "Shir Zabolotny",
    year: 2013,
    month: 12,
    day: 15,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Sad", "Baby", "Black & White", "Pencil"],
    status: "published",
    description: {
      materials:
        "Delicate graphite shades clean white paper.",
      visual:
        "Monochrome isolates the child's vulnerable expression.",
      inspiration:
        "A child reveals feelings too overwhelming to hide.",
    },
    imageUrl: "https://i.imgur.com/livCoeh.jpg",
    orientation: "portrait",
    palette: {
      id: "P2",
      name: "Paper & Blush",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "31",
    title: "Lady in red",
    artist: "Shir Zabolotny",
    year: 2010,
    month: 5,
    day: 27,
    medium: "Pencil, Glue",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Woman", "Glue", "Pencil"],
    status: "published",
    description: {
      materials:
        "Pencil and dense pigment shape fabric.",
      visual:
        "Crimson folds command the delicate sketch.",
      inspiration:
        "She carries confidence, danger, and beauty through silence.",
    },
    imageUrl: "https://i.imgur.com/DHNwDKy.jpg",
    orientation: "portrait",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "32",
    title: "Salt & Sand",
    artist: "Shir Zabolotny",
    year: 2019,
    month: 7,
    day: 17,
    medium: "Pencil, Glue, Sand",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Glue", "Sand", "Pencil"],
    status: "published",
    description: {
      materials:
        "Pencil meets rough sandlike paper texture.",
      visual:
        "Earthy tones create a dry tactility.",
      inspiration:
        "A hand grasps at love, impermanence, and lingering traces.",
    },
    imageUrl: "https://i.imgur.com/pYTlSx0.jpg",
    orientation: "portrait",
    palette: {
      id: "P2",
      name: "Paper & Blush",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "33",
    title: "Wolfs",
    artist: "Shir Zabolotny",
    year: 2015,
    month: 4,
    day: 30,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Wolfs", "Black & White", "Pencil"],
    status: "published",
    description: {
      materials:
        "Layered graphite builds fur and shadows.",
      visual:
        "Monochrome wolves inhabit quiet winter stillness.",
      inspiration:
        "Protective wolves share warmth against a cold world.",
    },
    imageUrl: "https://i.imgur.com/DMaWcNS.jpg",
    orientation: "portrait",
    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "34",
    title: "Flower Buds",
    artist: "Shir Zabolotny",
    year: 2019,
    month: 5,
    day: 18,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Cherry", "Flower", "Movie", "Pencil"],
    status: "published",
    description: {
      materials:
        "Delicate pencil accents bloom across paper.",
      visual:
        "Gentle colors suggest a botanical spring.",
      inspiration:
        "A tiny beginning holds quiet promise before unfolding.",
    },
    imageUrl: "https://i.imgur.com/LQmaVzC.jpg",
    orientation: "portrait",
    palette: {
      id: "P4",
      name: "Garden & Sky",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "35",
    title: "Breath",
    artist: "Shir Zabolotny",
    year: 2018,
    month: 9,
    day: 25,
    medium: "Pen",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Couple", "Heart", "Pen"],
    status: "published",
    description: {
      materials:
        "Pen and color sketch anatomical forms.",
      visual:
        "Overlapping lines blend emotion with anatomy.",
      inspiration:
        "One fragile organ carries breath, love, and survival.",
    },
    imageUrl: "https://i.imgur.com/YpuQ2ey.jpg",
    orientation: "portrait",
    palette: {
      id: "P3",
      name: "Red & Ember",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
  {
    id: "36",
    title: "Onward",
    artist: "Shir Zabolotny",
    year: 2013,
    month: 5,
    day: 20,
    medium: "Pencil",
    dimensions: {
      width: 21,
      height: 29.7,
      unit: "cm",
    },
    category: ["Hourse", "Woman", "Black & White", "Pencil"],
    status: "published",
    description: {
      materials:
        "Broad graphite shapes figures on paper.",
      visual:
        "Muted figures advance through cinematic space.",
      inspiration:
        "An uncertain road demands the quiet courage to continue.",
    },
    imageUrl: "https://i.imgur.com/Q4VEHmZ.jpg",
    orientation: "portrait",
    palette: {
      id: "P1",
      name: "Midnight & Gold",
    },
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      shipping: { worldwide: true, insured: true },
    },
  },
];

export const MOCK_ARTWORKS: Artwork[] = MOCK_ARTWORK_DATA.map((artwork) => {
  const price = artwork.price ?? 300;

  return {
    ...artwork,
    purchaseUrl:
      artwork.purchaseUrl ?? `https://example.com/purchase/${artwork.id}`,
    price,
    salePrice: artwork.salePrice ?? price,
    availability: artwork.availability ?? "available",
    commerce: {
      currency: "USD",
      offerLabel: "Studio offer",
      signed: true,
      certificateIncluded: true,
      ...artwork.commerce,
      shipping: {
        worldwide: true,
        insured: true,
        estimatedBusinessDays: { min: 3, max: 7 },
        ...artwork.commerce?.shipping,
      },
    },
    detailImages: artwork.detailImages ?? [
      {
        id: `${artwork.id}-detail-1`,
        imageUrl: artwork.imageUrl,
        alt: `${artwork.title} detail`,
      },
    ],
    ...(artwork.interiorImageUrl ? { interiorImageUrl: artwork.interiorImageUrl } : {}),
  };
});
