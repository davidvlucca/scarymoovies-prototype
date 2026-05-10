export type Answer = {
  id: string
  text: string
  tags: string[] // genre/mood tags used for scoring
}

export type Question = {
  id: string
  text: string
  answers: Answer[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'What keeps you up at night?',
    answers: [
      {
        id: 'a',
        text: 'Something lurking just beyond the light',
        tags: ['supernatural', 'atmospheric'],
      },
      {
        id: 'b',
        text: 'A killer who never runs — just walks',
        tags: ['slasher'],
      },
      {
        id: 'c',
        text: 'The creeping suspicion you can\'t trust your own mind',
        tags: ['psychological', 'thriller'],
      },
      {
        id: 'd',
        text: 'The vast, indifferent darkness between the stars',
        tags: ['cosmic', 'atmospheric'],
      },
    ],
  },
  {
    id: 'q2',
    text: 'Pick your nightmare setting.',
    answers: [
      {
        id: 'a',
        text: 'An abandoned asylum at 3 AM',
        tags: ['supernatural', 'atmospheric'],
      },
      {
        id: 'b',
        text: 'A summer camp where counselors keep disappearing',
        tags: ['slasher', 'gore'],
      },
      {
        id: 'c',
        text: 'A perfect suburb where nothing adds up',
        tags: ['psychological', 'thriller'],
      },
      {
        id: 'd',
        text: 'A research station at the edge of the known universe',
        tags: ['cosmic', 'atmospheric'],
      },
    ],
  },
  {
    id: 'q3',
    text: 'How do you want your scares delivered?',
    answers: [
      {
        id: 'a',
        text: 'Slow dread — the horror that builds in silence',
        tags: ['atmospheric', 'psychological'],
      },
      {
        id: 'b',
        text: 'Raw, visceral — don\'t hold back on the carnage',
        tags: ['gore', 'slasher'],
      },
      {
        id: 'c',
        text: 'Paranoia that makes you distrust every character',
        tags: ['psychological', 'thriller'],
      },
      {
        id: 'd',
        text: 'Entity horror — things that shouldn\'t exist, do',
        tags: ['supernatural', 'cosmic'],
      },
    ],
  },
  {
    id: 'q4',
    text: 'Which ending leaves you most shattered?',
    answers: [
      {
        id: 'a',
        text: 'The monster was real and it\'s still out there',
        tags: ['supernatural', 'atmospheric'],
      },
      {
        id: 'b',
        text: 'Only one survivor — barely',
        tags: ['slasher', 'gore'],
      },
      {
        id: 'c',
        text: 'The protagonist was the villain all along',
        tags: ['psychological', 'thriller'],
      },
      {
        id: 'd',
        text: 'Humanity was never significant to begin with',
        tags: ['cosmic'],
      },
    ],
  },
]
