import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, toInt, withLengthStrategy, withMinMaxCount } from "../helpers";

/**
 * Grammar and lorem ipsum variables:
 * $randomNoun, $randomVerb, $randomIngverb, $randomAdjective, $randomWord, $randomWords, $randomPhrase,
 * $randomLoremWord, $randomLoremWords, $randomLoremSentence, $randomLoremSentences,
 * $randomLoremParagraph, $randomLoremParagraphs, $randomLoremText, $randomLoremSlug, $randomLoremLines
 */
export const createWordVariables: CategoryCreator = (faker) => [
  // Grammar
  createDynamicVariable("$randomNoun", "A random noun", "network", (...args: unknown[]) =>
    withLengthStrategy((opts) => faker.word.noun(opts), args)
  ),
  createDynamicVariable("$randomVerb", "A random verb", "generate", (...args: unknown[]) =>
    withLengthStrategy((opts) => faker.word.verb(opts), args)
  ),
  createDynamicVariable(
    "$randomIngverb",
    "A random verb ending in -ing",
    "processing",
    () => faker.word.verb() + "ing"
  ),
  createDynamicVariable("$randomAdjective", "A random adjective", "efficient", (...args: unknown[]) =>
    withLengthStrategy((opts) => faker.word.adjective(opts), args)
  ),
  createDynamicVariable("$randomWord", "A random word", "system", (...args: unknown[]) =>
    withLengthStrategy((opts) => faker.word.sample(opts), args)
  ),
  createDynamicVariable("$randomWords", "Some random words", "quick brown fox jumps high", (...args: unknown[]) => {
    if (args[0] == null) return faker.word.words(5);
    if (args[1] == null) return faker.word.words(toInt(args[0]));
    const count = { min: toInt(args[0]), max: toInt(args[1]) };
    return faker.word.words({ count });
  }),
  createDynamicVariable(
    "$randomPhrase",
    "A random phrase",
    "Try to compress the TCP protocol, maybe it will override the wireless array!",
    () => faker.hacker.phrase()
  ),

  // Lorem ipsum
  createDynamicVariable("$randomLoremWord", "A random word of lorem ipsum text", "ipsum", (...args: unknown[]) =>
    withLengthStrategy((opts) => faker.lorem.word(opts), args)
  ),
  createDynamicVariable(
    "$randomLoremWords",
    "Some random words of lorem ipsum text",
    "dolor sit amet",
    (...args: unknown[]) => withMinMaxCount((c) => faker.lorem.words(c), args, 3)
  ),
  createDynamicVariable(
    "$randomLoremSentence",
    "A random sentence of lorem ipsum text",
    "Sed ut perspiciatis unde omnis iste natus.",
    (...args: unknown[]) => withMinMaxCount((c) => faker.lorem.sentence(c), args)
  ),
  createDynamicVariable(
    "$randomLoremSentences",
    "A random 2 to 10 sentences of lorem ipsum text",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur. Ut enim ad minima veniam quis nostrum. Quis autem vel eum iure reprehenderit.",
    (...args: unknown[]) => {
      if (!args[0]) return faker.lorem.sentences({ min: 2, max: 6 });
      if (!args[1]) return faker.lorem.sentences(toInt(args[0]));
      if (!args[2]) return faker.lorem.sentences({ min: toInt(args[0]), max: toInt(args[1]) });
      return faker.lorem.sentences({ min: toInt(args[0]), max: toInt(args[1]) }, String(args[2]));
    }
  ),
  createDynamicVariable(
    "$randomLoremParagraph",
    "A random paragraph of lorem ipsum text",
    "Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    (...args: unknown[]) => withMinMaxCount((c) => faker.lorem.paragraph(c), args)
  ),
  createDynamicVariable(
    "$randomLoremParagraphs",
    "3 random paragraphs of lorem ipsum text",
    `Voluptatem rem magnam aliquam ab id aut quaerat. Placeat provident possimus voluptatibus dicta velit non aut quasi. Mollitia et aliquam expedita sunt dolores nam consequuntur.  Nobis labore labore recusandae ipsam quo.\n
Voluptatem occaecati omnis debitis eum libero. Veniam et cum unde. Nisi facere repudiandae error aperiam expedita optio quae consequatur qui. Libero voluptatem eius occaecati ad sint voluptatibus laborum provident iure.\n
Autem est sequi ut tenetur omnis enim. Fuga nisi dolor expedita. Numquam optio magnam omnis architecto non. Est cumque laboriosam quibusdam eos voluptatibus velit omnis. Voluptatem officiis nulla omnis ratione excepturi.`,
    (...args: unknown[]) => {
      if (!args[0]) return faker.lorem.paragraphs(3, "\n");
      if (!args[1]) return faker.lorem.paragraphs(toInt(args[0]), "\n");
      if (!args[2]) return faker.lorem.paragraphs({ min: toInt(args[0]), max: toInt(args[1]) }, "\n");
      return faker.lorem.paragraphs({ min: toInt(args[0]), max: toInt(args[1]) }, String(args[2]));
    }
  ),
  createDynamicVariable(
    "$randomLoremText",
    "A random amount of lorem ipsum text",
    "Temporibus autem quibusdam et aut officiis debitis. Aut rerum necessitatibus saepe eveniet ut et voluptates.",
    () => faker.lorem.text()
  ),
  createDynamicVariable(
    "$randomLoremSlug",
    "A random lorem ipsum URL slug",
    "lorem-ipsum-dolor",
    (...args: unknown[]) => withMinMaxCount((c) => faker.lorem.slug(c), args, 3)
  ),
  createDynamicVariable(
    "$randomLoremLines",
    "1 to 7 random lines of lorem ipsum",
    "Sed ut perspiciatis unde.\nOmnis iste natus error.\nSit voluptatem accusantium.",
    (...args: unknown[]) => {
      if (args[1]) {
        return faker.lorem.lines({ min: toInt(args[0]), max: toInt(args[1]) });
      }
      return args[0] ? faker.lorem.lines(toInt(args[0])) : faker.lorem.lines({ min: 1, max: 7 });
    }
  ),
];
