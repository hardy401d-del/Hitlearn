import { SongAnalysis } from "./types";

export const PRESET_SONGS: SongAnalysis[] = [
  {
    title: "Imagine",
    artist: "John Lennon",
    genre: "Classic Rock / Pop",
    difficulty: "Beginner",
    summary: "Cette chanson légendaire invite l'auditeur à imaginer un monde en paix, sans frontières, sans religions et sans possessions matérielles, uni dans une fraternité humaine.",
    lyricsSections: [
      {
        sectionType: "Verse 1",
        lines: [
          { english: "Imagine there's no heaven", french: "Imagine qu'il n'y ait pas de paradis" },
          { english: "It's easy if you try", french: "C'est facile si tu essaies" },
          { english: "No hell below us", french: "Pas d'enfer en dessous de nous" },
          { english: "Above us, only sky", french: "Au-dessus de nous, seulement le ciel" },
          { english: "Imagine all the people", french: "Imagine tous les gens" },
          { english: "Living for today", french: "Vivant pour le moment présent" }
        ]
      },
      {
        sectionType: "Verse 2",
        lines: [
          { english: "Imagine there's no countries", french: "Imagine qu'il n'y ait pas de pays" },
          { english: "It's not hard to do", french: "Ce n'est pas difficile à faire" },
          { english: "Nothing to kill or die for", french: "Rien pour quoi tuer ou mourir" },
          { english: "And no religion, too", french: "Et pas de religion non plus" },
          { english: "Imagine all the people", french: "Imagine tous les gens" },
          { english: "Living life in peace", french: "Vivant leur vie en paix" }
        ]
      },
      {
        sectionType: "Chorus",
        lines: [
          { english: "You may say I'm a dreamer", french: "Tu te dis peut-être que je suis un rêveur" },
          { english: "But I'm not the only one", french: "Mais je ne suis pas le seul" },
          { english: "I hope someday you'll join us", french: "J'espère qu'un jour tu nous rejoindras" },
          { english: "And the world will be as one", french: "Et que le monde ne fera plus qu'un" }
        ]
      }
    ],
    explanations: [
      {
        term: "easy if you try",
        meaningFr: "facile si tu essaies",
        explanation: "La structure 'easy if you [verb]' exprime une condition simple. En anglais parlé, on omet souvent le 'it is' au début d'une phrase d'évaluation.",
        type: "grammar",
        example: "It's simple if you listen."
      },
      {
        term: "heaven",
        meaningFr: "paradis",
        explanation: "Se réfère au paradis céleste/spirituel. Pour désigner un endroit paradisiaque sur Terre (un lieu magnifique), on préférera le mot 'paradise'.",
        type: "vocabulary",
        example: "The beautiful beach was absolute paradise."
      },
      {
        term: "above",
        meaningFr: "au-dessus",
        explanation: "Préposition signifiant 'au-dessus de' sans contact physique direct. Son opposé est 'below' (en-dessous).",
        type: "vocabulary",
        example: "The stars are shining above the mountains."
      },
      {
        term: "may",
        meaningFr: "pouvoir / se peut que",
        explanation: "Un verbe modal utilisé pour exprimer la possibilité ou la concession. Ici, 'you may say' concède que l'auditeur a le droit de le penser.",
        type: "grammar",
        example: "You may think this is funny, but it's not."
      },
      {
        term: "someday",
        meaningFr: "un jour",
        explanation: "Adverbe désignant un moment indéterminé dans le futur. S'écrit en un seul mot, à ne pas confondre avec 'some days' (certains jours).",
        type: "vocabulary",
        example: "I want to visit Tokyo someday."
      },
      {
        term: "as one",
        meaningFr: "ne faire qu'un / uni",
        explanation: "Une expression idiomatique très forte signifiant agir ou être en harmonie absolue, comme une seule entité.",
        type: "idiom",
        example: "The singers sang their final note as one."
      }
    ],
    liveComments: [
      {
        lineIndexGlobal: 0,
        term: "Imagine",
        comment: "John Lennon utilise le mode impératif 'Imagine' pour engager directement l'auditeur. C'est l'un des verbes de pensée les plus puissants en anglais.",
        type: "culture"
      },
      {
        lineIndexGlobal: 1,
        term: "It's easy if...",
        comment: "Note l'élision de 'It is' en 'It's'. En anglais quotidien, les contractions sont indispensables pour une intonation fluide.",
        type: "grammar"
      },
      {
        lineIndexGlobal: 4,
        term: "all the people",
        comment: "Rappelle-toi que 'people' est le pluriel irrégulier de 'person'. On l'accorde toujours au pluriel, par exemple : 'people are' (et non 'people is').",
        type: "grammar"
      },
      {
        lineIndexGlobal: 8,
        term: "to kill or die for",
        comment: "La structure se termine par une préposition ('for'). C'est typique de l'anglais naturel d'associer le verbe et la préposition en fin de proposition.",
        type: "grammar"
      },
      {
        lineIndexGlobal: 12,
        term: "You may say",
        comment: "'may' exprime ici une concession polie, c'est une façon élégante de dire 'Je sais que tu penses cela'.",
        type: "grammar"
      },
      {
        lineIndexGlobal: 15,
        term: "as one",
        comment: "Magnifique message d'unité ! L'expression 'as one' symbolise le but ultime de la paix mondiale partagée.",
        type: "culture"
      }
    ],
    quizQuestions: [
      {
        question: "Que signifie la préposition 'above' utilisée par John Lennon ?",
        options: [
          "En-dessous de",
          "À côté de",
          "Au-dessus de",
          "Derrière"
        ],
        correctAnswer: "Au-dessus de",
        explanation: " 'Above us, only sky' signifie 'Au-dessus de nous, seulement le ciel'. Son opposé est 'below' (en-dessous de)."
      },
      {
        question: "Quel verbe modal est utilisé pour concéder une possibilité ('Tu te dis peut-être...') ?",
        options: [
          "must",
          "should",
          "may",
          "will"
        ],
        correctAnswer: "may",
        explanation: "John Lennon chante 'You may say I'm a dreamer'. 'May' exprime ici une probabilité ou une concession douce."
      },
      {
        question: "Complétez la ligne : 'And the world will be ______'",
        options: [
          "as one",
          "as two",
          "at all",
          "by now"
        ],
        correctAnswer: "as one",
        explanation: "La phrase finale du refrain est 'And the world will be as one', ce qui signifie que le monde sera uni, ne faisant plus qu'un."
      },
      {
        question: "Quel est le pluriel du mot 'person' en anglais ?",
        options: [
          "persons",
          "people",
          "peoples",
          "persones"
        ],
        correctAnswer: "people",
        explanation: "'People' est le pluriel irrégulier standard de 'person'. En chanson comme en vie courante, on dit 'all the people living for today'."
      },
      {
        question: "Quel est le thème principal d'Imagine ?",
        options: [
          "La poursuite de la richesse matérielle",
          "L'unité, la paix et la fraternité humaine",
          "Les voyages interstellaires",
          "L'histoire des religions médiévales"
        ],
        correctAnswer: "L'unité, la paix et la fraternité humaine",
        explanation: "Imagine invite à transcender les divisions matérielles et géopolitiques pour vivre unis en harmonie."
      }
    ]
  },
  {
    title: "Someone Like You",
    artist: "Adele",
    genre: "Pop / Soul",
    difficulty: "Intermediate",
    summary: "Cette puissante ballade relate l'acceptation douloureuse d'une rupture amoureuse. Adele y exprime son chagrin tout en souhaitant le bonheur à son ancien partenaire qui a refait sa vie.",
    lyricsSections: [
      {
        sectionType: "Verse 1",
        lines: [
          { english: "I heard that you're settled down", french: "J'ai appris que tu t'étais posé" },
          { english: "That you found a girl and you're married now", french: "Que tu avais trouvé une fille et que tu étais marié maintenant" },
          { english: "I heard that your dreams came true", french: "J'ai appris que tes rêves s'étaient réalisés" },
          { english: "Guess she gave you things I didn't give to you", french: "J'imagine qu'elle t'a donné ce que je ne t'ai pas donné" }
        ]
      },
      {
        sectionType: "Pre-Chorus",
        lines: [
          { english: "Old friend, why are you so shy?", french: "Mon vieil ami, pourquoi es-tu si timide ?" },
          { english: "Ain't like you to hold back or hide from the light", french: "Ce n'est pas ton genre de te retenir ou de te cacher de la lumière" }
        ]
      },
      {
        sectionType: "Chorus",
        lines: [
          { english: "Never mind, I'll find someone like you", french: "Tant pis, je trouverai quelqu'un comme toi" },
          { english: "I wish nothing but the best for you, too", french: "Je ne vous souhaite rien d'autre que le meilleur, à toi aussi" },
          { english: "Don't forget me, I beg, I remember you said", french: "Ne m'oublie pas, je t'en prie, je me rappelle que tu disais" },
          { english: "Sometimes it lasts in love, but sometimes it hurts instead", french: "Parfois l'amour dure, mais parfois à la place il fait mal" }
        ]
      }
    ],
    explanations: [
      {
        term: "settle down",
        meaningFr: "se poser / s'installer",
        explanation: "Un phrasal verb très commun qui signifie s'établir de façon stable, souvent en achetant une maison, en se mariant ou en fondant une famille.",
        type: "phrasal_verb",
        example: "They want to travel the world before they settle down."
      },
      {
        term: "dreams came true",
        meaningFr: "rêves se sont réalisés",
        explanation: "L'expression 'come true' s'applique aux rêves, prédictions ou vœux qui se matérialisent dans la réalité.",
        type: "idiom",
        example: "Her dream of becoming a doctor finally came true."
      },
      {
        term: "Ain't",
        meaningFr: "Ce n'est pas / N'est pas",
        explanation: "Une contraction argotique très répandue en anglais parlé. Elle remplace 'am not', 'is not', 'are not', 'has not' ou 'have not'. Bien qu'utilisée en chanson, elle est considérée comme familière.",
        type: "slang",
        example: "Ain't no mountain high enough."
      },
      {
        term: "hold back",
        meaningFr: "se retenir / hésiter",
        explanation: "Phrasal verb signifiant retenir ses émotions, ses actions ou hésiter à s'exprimer pleinement.",
        type: "phrasal_verb",
        example: "Don't hold back, tell me what you really think."
      },
      {
        term: "Never mind",
        meaningFr: "Tant pis / Laisse tomber / Peu importe",
        explanation: "Une locution indispensable en anglais quotidien servant à dire que quelque chose n'est pas grave, ou pour changer de sujet en disant de ne pas s'en soucier.",
        type: "idiom",
        example: "If you can't find the keys, never mind, I have a spare set."
      },
      {
        term: "I wish nothing but...",
        meaningFr: "Je ne souhaite rien d'autre que...",
        explanation: "La structure 'nothing but' signifie 'seulement' ou 'uniquement'. C'est une façon poétique et intense d'exclure tout le reste.",
        type: "grammar",
        example: "He eats nothing but vegetables."
      }
    ],
    liveComments: [
      {
        lineIndexGlobal: 0,
        term: "settled down",
        comment: "Adele commence fort avec le phrasal verb 'settle down'. C'est le terme idéal pour dire 's'installer en couple durablement'.",
        type: "vocabulary"
      },
      {
        lineIndexGlobal: 3,
        term: "Guess she...",
        comment: "Ici, Adele omet le pronom 'I' devant 'Guess'. En anglais familier parlé, on laisse souvent tomber le sujet quand il est évident.",
        type: "grammar"
      },
      {
        lineIndexGlobal: 5,
        term: "Ain't like you",
        comment: "Écoute bien : 'Ain't' est de l'argot pour 'It is not' ici. Évite-le à l'écrit formel, mais retiens-le pour comprendre le langage parlé !",
        type: "culture"
      },
      {
        lineIndexGlobal: 6,
        term: "Never mind",
        comment: "'Never mind' est parfait pour clore un sujet avec élégance. C'est l'équivalent de notre 'Tant pis' ou 'Laisse tomber'.",
        type: "vocabulary"
      },
      {
        lineIndexGlobal: 7,
        term: "nothing but",
        comment: "La tournure 'nothing but' correspond à une restriction en français : 'ne... rien d'autre que' ou 'uniquement'. C'est très chaleureux.",
        type: "grammar"
      },
      {
        lineIndexGlobal: 9,
        term: "hurts instead",
        comment: "'instead' se traduit par 'à la place' ou 'plutôt'. En anglais, il se place très souvent en toute fin de phrase.",
        type: "grammar"
      }
    ],
    quizQuestions: [
      {
        question: "Que signifie l'expression idiomatique 'settle down' ?",
        options: [
          "Tomber malade",
          "Se poser, s'établir de façon stable",
          "Se disputer violemment",
          "Déménager à l'étranger"
        ],
        correctAnswer: "Se poser, s'établir de façon stable",
        explanation: " 'Settle down' signifie s'installer durablement, souvent se marier ou acheter un logement."
      },
      {
        question: "Quel terme familier utilise Adele pour dire 'Ce n'est pas' (It is not) ?",
        options: [
          "Ain't",
          "Isn't",
          "Aren't",
          "Won't"
        ],
        correctAnswer: "Ain't",
        explanation: "Adele chante 'Ain't like you to hold back'. 'Ain't' est de l'argot très répandu pour remplacer n'importe quelle forme négative de 'be' ou 'have'."
      },
      {
        question: "Que signifie 'Never mind' dans le refrain ?",
        options: [
          "Rappelle-toi",
          "Tant pis / Laisse tomber",
          "Ne sois pas stupide",
          "Prends soin de toi"
        ],
        correctAnswer: "Tant pis / Laisse tomber",
        explanation: " 'Never mind, I'll find someone like you' se traduit par 'Tant pis, je trouverai quelqu'un comme toi'. C'est une locution d'acceptation."
      },
      {
        question: "Dans la phrase 'I wish nothing but the best', quelle est la traduction de 'nothing but' ?",
        options: [
          "Rien sauf",
          "Tout sauf",
          "Rien d'autre que",
          "Absolument tout"
        ],
        correctAnswer: "Rien d'autre que",
        explanation: "La structure restrictive 'nothing but' équivaut à 'ne... rien d'autre que' ou 'uniquement'. 'Je ne te souhaite rien d'autre que le meilleur'."
      },
      {
        question: "Quel phrasal verb correspond à 'se retenir / réprimer ses émotions' ?",
        options: [
          "hold back",
          "settle down",
          "come true",
          "hide from"
        ],
        correctAnswer: "hold back",
        explanation: " 'Hold back' signifie se retenir, hésiter ou garder ses émotions pour soi."
      }
    ]
  }
];
