export function getAllTags(array, tagName) {
  const tags = [];
  for (const item of array) {
    if (item[0] === `${tagName}`) {
      tags.push(item);
    }
  }
  return tags;
}
