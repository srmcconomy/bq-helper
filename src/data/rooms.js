const rooms = [{
  name: "Link's House",
  description: '',
  id: 0,
}, {
  name: 'Kokiri Forest',
  description: '',
  id: 1,
}, {
  name: "Mido's House",
  description: '4 chests',
  id: 2,
}, {
  name: "Know-it-All Bros' House",
  description: '2 pots and fire pit',
  id: 3,
}, {
  name: 'Kokiri Shop',
  description: '',
  id: 4,
}, {
  name: "Saria's House",
  description: '4 hearts',
  id: 5,
}, {
  name: "Twins' House",
  description: '2 pots and stairs',
  id: 6,
}, {
  name: 'Hyrule Field',
  description: '',
  id: 7,
}, {
  name: 'Lost Woods',
  description: '',
  id: 8,
}, {
  name: 'Sacred Forest Meadow',
  description: '',
  id: 9,
}, {
  name: "Zora's River",
  description: '',
  id: 10,
}, {
  name: "Zora's Domain",
  description: '',
  id: 11,
}, {
  name: 'Zora Shop',
  description: '',
  id: 12,
}, {
  name: "Zora's Fountain",
  description: '',
  id: 13,
}, {
  name: 'Goron City',
  description: '',
  id: 14,
}, {
  name: 'Goron Shop',
  description: '',
  id: 15,
}, {
  name: 'Death Mountain Trail',
  description: '',
  id: 16,
}, {
  name: 'Death Mountain Crater',
  description: '',
  id: 17,
}, {
  name: 'Kakariko Village',
  description: '',
  id: 18,
}, {
  name: 'Archery Game',
  description: '',
  id: 19,
}, {
  name: 'Kakariko Bazaar',
  description: '',
  id: 20,
}, {
  name: 'Kakariko Potion Shop',
  description: 'with back exit',
  id: 21,
}, {
  name: 'Potion Lab',
  description: '',
  id: 22,
}, {
  name: "Windmill/Dampé's Grave",
  description: '',
  id: 23,
}, {
  name: 'Skulltula House',
  description: '',
  id: 24,
}, {
  name: "Impa's House",
  description: 'with cow and bookshelf',
  id: 25,
}, {
  name: 'Party House',
  description: '3 fake pots on wall to the left and table to the right',
  id: 26,
}, {
  name: 'Graveyard',
  description: '',
  id: 27,
}, {
  name: 'Shield Grave',
  description: '',
  id: 28,
}, {
  name: "Sun's Song Grave",
  description: '',
  id: 29,
}, {
  name: 'Redead Grave',
  description: '',
  id: 30,
}, {
  name: "Dampé's House",
  description: '',
  id: 31,
}, {
  name: 'Market Entry',
  description: 'with drawbridge',
  id: 32,
}, {
  name: 'Guard House',
  description: 'lots o pots',
  id: 33,
}, {
  name: 'Market',
  description: '',
  id: 34,
}, {
  name: 'Bombchu Bowling',
  description: '',
  id: 35,
}, {
  name: 'Slingshot Game',
  description: '',
  id: 36,
}, {
  name: 'Happy Mask Shop',
  description: '',
  id: 37,
}, {
  name: 'Market Bazaar',
  description: '',
  id: 38,
}, {
  name: 'Market Potion Shop',
  description: '',
  id: 39,
}, {
  name: 'Chest Game',
  description: '',
  id: 40,
}, {
  name: 'Back Alley',
  description: '',
  id: 41,
}, {
  name: 'Back Alley House',
  description: 'with bed the the left',
  id: 42,
}, {
  name: 'Dog House',
  description: 'with crate the the left',
  id: 43,
}, {
  name: 'Bombchu Shop',
  description: '',
  id: 44,
}, {
  name: 'Temple of Time Entry',
  description: '',
  id: 45,
}, {
  name: 'Temple of Time',
  description: '',
  id: 46,
}, {
  name: 'Hyrule Castle Exterior',
  description: '',
  id: 47,
}, {
  name: 'Hyrule Castle Interior',
  description: '',
  id: 48,
}, {
  name: "Zelda's Room",
  description: '',
  id: 49,
}, {
  name: 'Lake Hylia',
  description: '',
  id: 50,
}, {
  name: 'Laboratory',
  description: '',
  id: 51,
}, {
  name: 'Fishing Pond',
  description: '',
  id: 52,
}, {
  name: 'Lon-Lon Ranch',
  description: '',
  id: 53,
}, {
  name: "Talon's House",
  description: 'milk house',
  id: 54,
}, {
  name: 'Barn',
  description: '',
  id: 55,
}, {
  name: 'Silo',
  description: 'crates and HP',
  id: 56,
}, {
  name: 'Gerudo Valley',
  description: '',
  id: 57,
}, {
  name: "Carpenters' Tent",
  description: '',
  id: 58,
}, {
  name: 'Gerudo Fortress Exterior',
  description: '',
  id: 59,
}, {
  name: 'Gerudo Fortress Interior 1',
  description: 'Carpenter, no ramps',
  id: 60,
}, {
  name: 'Gerudo Fortress Interior 2',
  description: 'Hallway with 2 ramps and room with table and 2 ramps',
  id: 61,
}, {
  name: 'Gerudo Fortress Interior 3',
  description: 'Carpenter, both ramps go down towards middle',
  id: 62,
}, {
  name: 'Gerudo Fortress Interior 4',
  description: 'Carpenter, one ramp goes up and one goes down',
  id: 63,
}, {
  name: 'Gerudo Fortress Interior 5',
  description: 'Table and tall ramp',
  id: 64,
}, {
  name: 'Gerudo Fortress Interior 6',
  description: 'Carpenter, long hallway with guard',
  id: 65,
}, {
  name: 'Haunted Wasteland',
  description: '',
  id: 66,
}, {
  name: 'Desert Colossus',
  description: '',
  id: 67,
}, {
  name: 'Bottom of the Well',
  description: '',
  id: 68,
}, {
  name: 'Ice Cavern',
  description: '',
  id: 69,
}, {
  name: 'Gerudo Training Ground',
  description: '',
  id: 70,
}, {
  name: 'Deku Tree',
  description: '',
  id: 71,
}, {
  name: "Dodongo's Cavern",
  description: '',
  id: 72,
}, {
  name: "Jabu-Jabu's Belly",
  description: '',
  id: 73,
}, {
  name: 'Forest Temple',
  description: '',
  id: 74,
}, {
  name: 'Fire Temple',
  description: '',
  id: 75,
}, {
  name: 'Water Temple',
  description: '',
  id: 76,
}, {
  name: 'Shadow Temple',
  description: '',
  id: 77,
}, {
  name: 'Spirit Temple',
  description: '',
  id: 78,
}, {
  name: "Gohma's Room",
  description: '',
  id: 79,
}, {
  name: "King Dodongo's Room",
  description: '',
  id: 80,
}, {
  name: "Barinade's Room",
  description: '',
  id: 81,
}, {
  name: "Phantom Ganon's Room",
  description: '',
  id: 82,
}, {
  name: "Volvagia's Room",
  description: '',
  id: 83,
}, {
  name: "Morpha's Room",
  description: '',
  id: 84,
}, {
  name: "Bongo Bongo's Room",
  description: '',
  id: 85,
}, {
  name: "Twinrova's Room",
  description: '',
  id: 86,
}, {
  name: "Ganon's Castle",
  description: 'Trials',
  id: 87,
}, {
  name: "Ganon's Castle Tower",
  description: '',
  id: 88,
}, {
  name: "Ganondorf's Room",
  description: '',
  id: 89,
}, {
  name: 'Collapse Roof',
  description: '',
  id: 90,
}, {
  name: 'Collapse Interior 1',
  description: 'Pillar in middle',
  id: 91,
}, {
  name: 'Collapse Interior 2',
  description: 'Red carpet',
  id: 92,
}, {
  name: 'Collapse Interior 3',
  description: 'Stalfos and only 1 rock',
  id: 93,
}, {
  name: 'Collapse Interior 4',
  description: 'No carpet, lots of rocks, staircase',
  id: 94,
}, {
  name: 'Collapse Bridge',
  description: '',
  id: 95,
}, {
  name: 'Collapse Exterior 1',
  description: '2 gaps',
  id: 96,
}, {
  name: 'Collapse Exterior 2',
  description: '0 gaps',
  id: 97,
}, {
  name: 'Collapse Exterior 3',
  description: '1 gap',
  id: 98,
}, {
  name: 'Ganon Fight',
  description: '',
  id: 99,
}, {
  name: 'Magic',
  description: '',
  id: 100,
}, {
  name: 'Double Magic',
  description: '',
  id: 101,
}, {
  name: 'Double Defence',
  description: '',
  id: 102,
}, {
  name: "Din's Fire",
  description: '',
  id: 103,
}, {
  name: "Farore's Wind",
  description: '',
  id: 104,
}, {
  name: "Nayru's Love",
  description: '',
  id: 105,
}, {
  name: 'Cow and Puddles Grotto',
  description: '',
  id: 106,
}, {
  name: 'Three Deku Scrub Grotto 1',
  description: '',
  id: 107,
}, {
  name: 'Three Deku Scrub Grotto 2',
  description: '',
  id: 108,
}, {
  name: 'Three Deku Scrub Grotto 3',
  description: '',
  id: 109,
}, {
  name: 'Two Deku Scrub Grotto 1',
  description: '',
  id: 110,
}, {
  name: 'Two Deku Scrub Grotto 2',
  description: '',
  id: 111,
}, {
  name: 'Two Deku Scrub Grotto 3',
  description: '',
  id: 112,
}, {
  name: 'Two Deku Scrub Grotto 4',
  description: '',
  id: 113,
}, {
  name: 'Three Bombable Wall Grotto',
  description: 'Market skull',
  id: 114,
}, {
  name: 'Skulltula and GS Grotto',
  description: 'Hyrule Field skull',
  id: 115,
}, {
  name: 'Blue Tektite Grotto',
  description: '',
  id: 116,
}, {
  name: 'Three Webs Grotto',
  description: 'Hyrule Field skull',
  id: 117,
}, {
  name: 'HP Deku Scrub Grotto',
  description: '',
  id: 118,
}, {
  name: 'Deku Nut Scrub Grotto',
  description: '',
  id: 119,
}, {
  name: 'Redead Grotto',
  description: '',
  id: 120,
}, {
  name: 'Trippy Grotto',
  description: '',
  id: 121,
}, {
  name: 'Octorok Grotto',
  description: '',
  id: 122,
}, {
  name: 'Forest Stage',
  description: '',
  id: 123,
}, {
  name: 'Sky Temple',
  description: '',
  id: 124,
}, {
  name: "Ganon's Castle Exterior",
  description: '',
  id: 125,
}];
export default rooms;
