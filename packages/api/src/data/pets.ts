import { PetListSchema, type Pet } from '@org/contracts';

/**
 * In-memory adoption catalog. Images live in ../assets/images and are served
 * by the API at /images/<file>, so `imageUrl` is an origin-relative path.
 */
export const pets: Pet[] = [
  {
    id: 'biscuit',
    name: 'Biscuit',
    species: 'dog',
    breed: 'Golden Retriever',
    ageYears: 0.5,
    gender: 'male',
    size: 'large',
    tagline: 'A hopeless romantic who brings you flowers.',
    description:
      "Biscuit is a sweet golden pup who greets everyone with a wag and, occasionally, a tulip in his mouth. He's still learning his manners but already knows that cuddles fix everything. He'd thrive in an active home with a yard to bound around in.",
    traits: ['Affectionate', 'Playful', 'Quick learner'],
    goodWith: ['Kids', 'Other dogs'],
    location: 'Portland, OR',
    imageUrl: '/images/dog-biscuit.jpg',
    status: 'available',
  },
  {
    id: 'ziggy',
    name: 'Ziggy',
    species: 'dog',
    breed: 'Australian Shepherd',
    ageYears: 0.4,
    gender: 'female',
    size: 'medium',
    tagline: 'Brilliant, bright-eyed, and ready to learn tricks.',
    description:
      'Ziggy is a striking Aussie pup with one blue eye and a brain that never stops. She loves puzzles, fetch, and being your shadow. A patient owner who can give her a job to do will be rewarded with a devoted, whip-smart companion.',
    traits: ['Intelligent', 'Energetic', 'Loyal'],
    goodWith: ['Older kids', 'Active families'],
    location: 'Boulder, CO',
    imageUrl: '/images/dog-ziggy.jpg',
    status: 'available',
  },
  {
    id: 'coco',
    name: 'Coco',
    species: 'dog',
    breed: 'French Bulldog',
    ageYears: 1,
    gender: 'male',
    size: 'small',
    tagline: 'Small dog, big wardrobe, bigger personality.',
    description:
      "Coco is a dapper little Frenchie who never met a sofa he didn't like. He's a low-energy charmer happiest snoozing in your lap or strutting his stuff on a short walk. Perfect for apartment living and anyone who appreciates a stylish sidekick.",
    traits: ['Cuddly', 'Easygoing', 'Charming'],
    goodWith: ['Apartments', 'First-time owners'],
    location: 'Brooklyn, NY',
    imageUrl: '/images/dog-coco.jpg',
    status: 'pending',
  },
  {
    id: 'peanut',
    name: 'Peanut',
    species: 'dog',
    breed: 'Long-haired Chihuahua',
    ageYears: 3,
    gender: 'male',
    size: 'small',
    tagline: 'Tiny in size, enormous in devotion.',
    description:
      'Peanut is a pint-sized gentleman with a luxurious coat and a heart of gold. He bonds deeply with his person and loves being carried around like royalty. He prefers a calm household where he can be the center of attention.',
    traits: ['Devoted', 'Gentle', 'Lap dog'],
    goodWith: ['Seniors', 'Quiet homes'],
    location: 'Austin, TX',
    imageUrl: '/images/dog-peanut.jpg',
    status: 'available',
  },
  {
    id: 'mango',
    name: 'Mango',
    species: 'cat',
    breed: 'Maine Coon',
    ageYears: 2,
    gender: 'male',
    size: 'large',
    tagline: 'A majestic ginger gentleman with a fluffy tail.',
    description:
      'Mango is a magnificent Maine Coon with a thick orange coat and an even bigger purr. Despite his regal looks he is a total softie who follows you room to room and chirps for attention. He gets along with everyone he meets.',
    traits: ['Affectionate', 'Talkative', 'Mellow'],
    goodWith: ['Kids', 'Other cats', 'Dogs'],
    location: 'Seattle, WA',
    imageUrl: '/images/cat-mango.jpg',
    status: 'available',
  },
  {
    id: 'willow',
    name: 'Willow',
    species: 'cat',
    breed: 'Domestic Longhair',
    ageYears: 4,
    gender: 'female',
    size: 'medium',
    tagline: 'Curious, independent, and quietly affectionate.',
    description:
      'Willow is a beautiful tabby who likes to survey her kingdom from the top of the stairs. She is independent and self-assured, but warms up to a slow blink and a sunny windowsill. A calm adult home would suit her perfectly.',
    traits: ['Independent', 'Curious', 'Calm'],
    goodWith: ['Adults', 'Quiet homes'],
    location: 'Minneapolis, MN',
    imageUrl: '/images/cat-willow.jpg',
    status: 'available',
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    species: 'cat',
    breed: 'Tabby Kitten',
    ageYears: 0.3,
    gender: 'female',
    size: 'small',
    tagline: 'A pocket-sized bundle of mischief and zoomies.',
    description:
      'Pumpkin is a tiny tabby kitten with enormous eyes and endless energy. She will chase a feather toy until she flops over, then curl up in your hand to recharge. She would love a playmate or a patient family to grow up with.',
    traits: ['Playful', 'Curious', 'Snuggly'],
    goodWith: ['Kids', 'Other cats'],
    location: 'Chicago, IL',
    imageUrl: '/images/cat-pumpkin.jpg',
    status: 'available',
  },
];

// Validate the seed data at module load so bad data fails fast in dev.
PetListSchema.parse(pets);

export function getPets(species?: 'dog' | 'cat'): Pet[] {
  return species ? pets.filter((p) => p.species === species) : pets;
}

export function getPetById(id: string): Pet | undefined {
  return pets.find((p) => p.id === id);
}
