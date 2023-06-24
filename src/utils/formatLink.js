export const strWithLinks = (str) => {
  const urlRegex =
    /((?:http|ftp|https):\/\/(?:[\w+?.\w+])+(?:[a-zA-Z0-9~!@#$%^&*()_\-=+\\/?.:;',]*)?(?:[-A-Za-z0-9+&@#/%=~_|]))/i;
  return str.split(urlRegex).map((a, index) => {
    if (a.match(/^https?:\/\//)) {
      return (
        <a
          key={index}
          target="_blank"
          rel="noopener noreferrer nofollow"
          href={a}
        >
          {a}
        </a>
      );
    }
    return a;
  });
};
