import type { CategoryCreator } from "../helpers";
import { createDynamicVariable, toInt, generateImageLink } from "../helpers";

/**
 * Image variables:
 * $randomAvatarImage, $randomImageUrl, $randomAbstractImage, $randomAnimalsImage,
 * $randomBusinessImage, $randomCatsImage, $randomCityImage, $randomFoodImage,
 * $randomNightlifeImage, $randomFashionImage, $randomPeopleImage, $randomNatureImage,
 * $randomSportsImage, $randomTransportImage, $randomImageDataUri
 */
export const createImageVariables: CategoryCreator = (faker) => [
  createDynamicVariable("$randomAvatarImage", "A random avatar image", "https://example.com/avatar/512x512", () =>
    faker.image.avatar()
  ),
  createDynamicVariable(
    "$randomImageUrl",
    "A URL of a random image",
    "https://example.com/images/640/480",
    (...args: unknown[]) => {
      const width = args[0] ? toInt(args[0]) : undefined;
      const height = args[1] ? toInt(args[1]) : undefined;
      return faker.image.url({ width, height });
    }
  ),
  createDynamicVariable(
    "$randomAbstractImage",
    "A URL of a random abstract image",
    "https://loremflickr.com/640/480/abstract",
    () => generateImageLink("abstract")
  ),
  createDynamicVariable(
    "$randomAnimalsImage",
    "A URL of a random animal image",
    "https://loremflickr.com/640/480/animals",
    () => generateImageLink("animals")
  ),
  createDynamicVariable(
    "$randomBusinessImage",
    "A URL of a random stock business image",
    "https://loremflickr.com/640/480/business",
    () => generateImageLink("business")
  ),
  createDynamicVariable(
    "$randomCatsImage",
    "A URL of a random cats image",
    "https://loremflickr.com/640/480/cats",
    () => generateImageLink("cats")
  ),
  createDynamicVariable(
    "$randomCityImage",
    "A URL of a random city image",
    "https://loremflickr.com/640/480/city",
    () => generateImageLink("city")
  ),
  createDynamicVariable(
    "$randomFoodImage",
    "A URL of a random food image",
    "https://loremflickr.com/640/480/food",
    () => generateImageLink("food")
  ),
  createDynamicVariable(
    "$randomNightlifeImage",
    "A URL of a random nightlife image",
    "https://loremflickr.com/640/480/nightlife",
    () => generateImageLink("nightlife")
  ),
  createDynamicVariable(
    "$randomFashionImage",
    "A URL of a random fashion image",
    "https://loremflickr.com/640/480/fashion",
    () => generateImageLink("fashion")
  ),
  createDynamicVariable(
    "$randomPeopleImage",
    "A URL of a random image of a person",
    "https://loremflickr.com/640/480/people",
    () => generateImageLink("people")
  ),
  createDynamicVariable(
    "$randomNatureImage",
    "A URL of a random nature image",
    "https://loremflickr.com/640/480/nature",
    () => generateImageLink("nature")
  ),
  createDynamicVariable(
    "$randomSportsImage",
    "A URL of a random sports image",
    "https://loremflickr.com/640/480/sports",
    () => generateImageLink("sports")
  ),
  createDynamicVariable(
    "$randomTransportImage",
    "A URL of a random transportation image",
    "https://loremflickr.com/640/480/transport",
    () => generateImageLink("transport")
  ),
  createDynamicVariable(
    "$randomImageDataUri",
    "A random image data URI",
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F...",
    (...args: unknown[]) => {
      const width = args[0] ? toInt(args[0]) : undefined;
      const height = args[1] ? toInt(args[1]) : undefined;
      const color = args[2] ? String(args[2]) : undefined;
      const type = args[3] as "svg-uri" | "svg-base64" | undefined;
      return faker.image.dataUri({ width, height, color, type });
    }
  ),
];
